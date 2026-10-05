-- =====================================================================
-- 002_ai_schema.sql   (PostgreSQL 15+ with pgvector)
-- Owner: FastAPI service. Holds everything the agent finds, drafts and
-- decides, plus the harness layer (runs, tool permissions, policies,
-- evals, memory, cost).
--
-- Rules
--   * FastAPI is the only writer to ai.*. Express gets a read-only role
--     and reads through FastAPI endpoints where possible.
--   * No foreign keys cross schemas. user_id, mission_id, asset_id and
--     connection ids are soft references into app.* and are validated
--     in the API layer.
--   * ai.signals is shared across users (public posts, stored once).
--     Everything per user lives in opportunities, drafts and memory.
--   * Embedding size (1536) must match your embedding model. Change it
--     before the first migration if you choose a different one.
-- =====================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS vector;

CREATE SCHEMA IF NOT EXISTS ai;

CREATE OR REPLACE FUNCTION ai.set_updated_at() RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================================
-- HARNESS: prompts, tools, policies
-- =====================================================================

CREATE TABLE ai.prompt_versions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,                 -- e.g. 'score_opportunity', 'draft_reply'
  version     integer NOT NULL,
  template    text NOT NULL,
  model       text NOT NULL,
  params      jsonb NOT NULL DEFAULT '{}'::jsonb,
  status      text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'retired')),
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (name, version)
);
CREATE UNIQUE INDEX uq_prompt_one_active ON ai.prompt_versions (name) WHERE status = 'active';

CREATE TABLE ai.tool_registry (
  name              text PRIMARY KEY,        -- e.g. 'reddit.search', 'x.post_reply'
  description       text NOT NULL,
  side_effect       text NOT NULL CHECK (side_effect IN ('read', 'write_internal', 'write_external')),
  requires_approval boolean NOT NULL DEFAULT true,
  platforms         text[] NOT NULL DEFAULT '{}',
  input_schema      jsonb NOT NULL DEFAULT '{}'::jsonb,
  rate_limit        jsonb NOT NULL DEFAULT '{}'::jsonb,
  enabled           boolean NOT NULL DEFAULT true,
  created_at        timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE ai.policies (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scope       text NOT NULL CHECK (scope IN ('global', 'plan', 'user', 'mission')),
  scope_id    text,                          -- plan id, or user/mission uuid as text; null for global
  name        text NOT NULL,
  kind        text NOT NULL CHECK (kind IN ('rate_cap', 'quiet_hours', 'relevance_threshold', 'spam_guard',
                                            'platform_rule', 'blocklist', 'approval_required', 'budget')),
  config      jsonb NOT NULL DEFAULT '{}'::jsonb,
  severity    text NOT NULL DEFAULT 'block' CHECK (severity IN ('block', 'warn')),
  enabled     boolean NOT NULL DEFAULT true,
  version     integer NOT NULL DEFAULT 1,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_policies_scope ON ai.policies (scope, scope_id) WHERE enabled;
CREATE TRIGGER trg_policies_updated BEFORE UPDATE ON ai.policies
  FOR EACH ROW EXECUTE FUNCTION ai.set_updated_at();

-- =====================================================================
-- HARNESS: runs, steps, tool calls, policy checks, cost
-- =====================================================================

CREATE TABLE ai.agent_runs (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            uuid,                   -- soft ref app.users.id (null for system runs)
  mission_id         uuid,                   -- soft ref app.missions.id
  parent_run_id      uuid REFERENCES ai.agent_runs(id) ON DELETE SET NULL,
  kind               text NOT NULL CHECK (kind IN ('onboarding_interview', 'source_discovery', 'scan', 'score',
                                                   'draft', 'digest', 'verdict', 'reply_poll',
                                                   'execute_action', 'asset_ingest', 'eval')),
  trigger_type       text NOT NULL CHECK (trigger_type IN ('schedule', 'user', 'event', 'system')),
  status             text NOT NULL DEFAULT 'queued'
                     CHECK (status IN ('queued', 'running', 'succeeded', 'failed', 'cancelled', 'blocked')),
  input              jsonb NOT NULL DEFAULT '{}'::jsonb,
  output             jsonb,
  error              text,
  prompt_version_id  uuid REFERENCES ai.prompt_versions(id) ON DELETE SET NULL,
  tokens_in          integer NOT NULL DEFAULT 0,
  tokens_out         integer NOT NULL DEFAULT 0,
  cost_micros        bigint NOT NULL DEFAULT 0,
  started_at         timestamptz,
  finished_at        timestamptz,
  created_at         timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_runs_user ON ai.agent_runs (user_id, created_at DESC);
CREATE INDEX idx_runs_mission_kind ON ai.agent_runs (mission_id, kind, created_at DESC);
CREATE INDEX idx_runs_status ON ai.agent_runs (status) WHERE status IN ('queued', 'running');

CREATE TABLE ai.run_steps (
  id           bigserial PRIMARY KEY,
  run_id       uuid NOT NULL REFERENCES ai.agent_runs(id) ON DELETE CASCADE,
  seq          integer NOT NULL,
  step_type    text NOT NULL CHECK (step_type IN ('llm_call', 'tool_call', 'retrieval',
                                                  'policy_check', 'human_wait', 'decision')),
  name         text NOT NULL,
  input        jsonb,
  output       jsonb,
  status       text NOT NULL DEFAULT 'succeeded' CHECK (status IN ('succeeded', 'failed', 'skipped', 'blocked')),
  latency_ms   integer,
  tokens_in    integer NOT NULL DEFAULT 0,
  tokens_out   integer NOT NULL DEFAULT 0,
  cost_micros  bigint NOT NULL DEFAULT 0,
  error        text,
  created_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (run_id, seq)
);

CREATE TABLE ai.tool_calls (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id           uuid NOT NULL REFERENCES ai.agent_runs(id) ON DELETE CASCADE,
  step_id          bigint REFERENCES ai.run_steps(id) ON DELETE SET NULL,
  tool_name        text NOT NULL REFERENCES ai.tool_registry(name),
  args             jsonb NOT NULL DEFAULT '{}'::jsonb,
  result           jsonb,
  side_effect      text NOT NULL CHECK (side_effect IN ('read', 'write_internal', 'write_external')),
  approval_id      uuid,                      -- soft ref app.approvals.id, required for external writes
  idempotency_key  text UNIQUE,               -- stops a retry from posting twice
  status           text NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending', 'succeeded', 'failed', 'blocked')),
  error            text,
  created_at       timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_tool_calls_run ON ai.tool_calls (run_id);

CREATE TABLE ai.policy_evaluations (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id        uuid REFERENCES ai.agent_runs(id) ON DELETE CASCADE,
  step_id       bigint REFERENCES ai.run_steps(id) ON DELETE SET NULL,
  policy_id     uuid REFERENCES ai.policies(id) ON DELETE SET NULL,
  subject_type  text NOT NULL CHECK (subject_type IN ('opportunity', 'draft', 'action', 'run')),
  subject_id    uuid NOT NULL,
  outcome       text NOT NULL CHECK (outcome IN ('pass', 'warn', 'block')),
  reason        text,
  details       jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at    timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_policy_eval_subject ON ai.policy_evaluations (subject_type, subject_id);
CREATE INDEX idx_policy_eval_blocks ON ai.policy_evaluations (run_id) WHERE outcome = 'block';

CREATE TABLE ai.cost_ledger (
  id           bigserial PRIMARY KEY,
  user_id      uuid,
  run_id       uuid REFERENCES ai.agent_runs(id) ON DELETE SET NULL,
  provider     text NOT NULL,
  model        text,
  kind         text NOT NULL CHECK (kind IN ('llm', 'embedding', 'api_call', 'other')),
  tokens_in    integer NOT NULL DEFAULT 0,
  tokens_out   integer NOT NULL DEFAULT 0,
  units        numeric,
  cost_micros  bigint NOT NULL DEFAULT 0,
  created_at   timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_cost_user_time ON ai.cost_ledger (user_id, created_at DESC);

-- Per connection, per time window, per action type. Backs the rate-cap policies.
CREATE TABLE ai.platform_usage (
  connection_id  uuid NOT NULL,              -- soft ref app.channel_connections.id
  window_start   timestamptz NOT NULL,
  action_type    text NOT NULL,
  count          integer NOT NULL DEFAULT 0,
  PRIMARY KEY (connection_id, window_start, action_type)
);

-- =====================================================================
-- HARNESS: evals
-- =====================================================================

CREATE TABLE ai.eval_sets (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name         text NOT NULL UNIQUE,
  task         text NOT NULL CHECK (task IN ('relevance_scoring', 'draft_quality', 'spam_detection',
                                             'verdict', 'source_discovery', 'other')),
  description  text,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE ai.eval_cases (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  set_id     uuid NOT NULL REFERENCES ai.eval_sets(id) ON DELETE CASCADE,
  input      jsonb NOT NULL,
  expected   jsonb NOT NULL,
  tags       text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_eval_cases_set ON ai.eval_cases (set_id);

CREATE TABLE ai.eval_runs (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  set_id             uuid NOT NULL REFERENCES ai.eval_sets(id) ON DELETE CASCADE,
  prompt_version_id  uuid REFERENCES ai.prompt_versions(id) ON DELETE SET NULL,
  model              text NOT NULL,
  status             text NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'succeeded', 'failed')),
  summary            jsonb NOT NULL DEFAULT '{}'::jsonb,
  started_at         timestamptz NOT NULL DEFAULT now(),
  finished_at        timestamptz
);
CREATE INDEX idx_eval_runs_set ON ai.eval_runs (set_id, started_at DESC);

CREATE TABLE ai.eval_results (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  eval_run_id  uuid NOT NULL REFERENCES ai.eval_runs(id) ON DELETE CASCADE,
  case_id      uuid NOT NULL REFERENCES ai.eval_cases(id) ON DELETE CASCADE,
  output       jsonb,
  score        numeric(4,3) CHECK (score BETWEEN 0 AND 1),
  passed       boolean,
  judge_notes  text,
  UNIQUE (eval_run_id, case_id)
);

-- =====================================================================
-- DISCOVERY: sources, signals, asset chunks
-- =====================================================================

CREATE TABLE ai.sources (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid NOT NULL,
  mission_id       uuid NOT NULL,
  platform         text NOT NULL,
  kind             text NOT NULL CHECK (kind IN ('subreddit', 'keyword', 'hashtag', 'account',
                                                 'query', 'community', 'feed')),
  value            text NOT NULL,
  config           jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by       text NOT NULL DEFAULT 'agent' CHECK (created_by IN ('agent', 'user')),
  status           text NOT NULL DEFAULT 'suggested'
                   CHECK (status IN ('suggested', 'active', 'rejected', 'paused')),
  scan_cursor      text,
  last_scanned_at  timestamptz,
  created_at       timestamptz NOT NULL DEFAULT now(),
  UNIQUE (mission_id, platform, kind, value)
);
CREATE INDEX idx_sources_due ON ai.sources (last_scanned_at) WHERE status = 'active';

CREATE TABLE ai.signals (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform           text NOT NULL,
  external_id        text NOT NULL,
  url                text NOT NULL,
  author_handle      text,
  author_external_id text,
  title              text,
  body               text,
  language           text,
  posted_at          timestamptz,
  fetched_at         timestamptz NOT NULL DEFAULT now(),
  content_hash       text,
  raw                jsonb,
  embedding          vector(1536),
  UNIQUE (platform, external_id)
);
CREATE INDEX idx_signals_posted ON ai.signals (platform, posted_at DESC);
CREATE INDEX idx_signals_embedding ON ai.signals USING hnsw (embedding vector_cosine_ops);
CREATE INDEX idx_signals_fts ON ai.signals
  USING gin (to_tsvector('english', coalesce(title, '') || ' ' || coalesce(body, '')));

CREATE TABLE ai.asset_chunks (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL,
  asset_id     uuid NOT NULL,                -- soft ref app.assets.id
  chunk_index  integer NOT NULL,
  content      text NOT NULL,
  metadata     jsonb NOT NULL DEFAULT '{}'::jsonb,
  embedding    vector(1536),
  created_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (asset_id, chunk_index)
);
CREATE INDEX idx_asset_chunks_user ON ai.asset_chunks (user_id);
CREATE INDEX idx_asset_chunks_embedding ON ai.asset_chunks USING hnsw (embedding vector_cosine_ops);

-- =====================================================================
-- MATCHING AND DRAFTING
-- =====================================================================

CREATE TABLE ai.opportunities (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid NOT NULL,
  mission_id       uuid NOT NULL,
  signal_id        uuid NOT NULL REFERENCES ai.signals(id) ON DELETE CASCADE,
  source_id        uuid REFERENCES ai.sources(id) ON DELETE SET NULL,
  score            numeric(4,3) NOT NULL CHECK (score BETWEEN 0 AND 1),
  score_breakdown  jsonb NOT NULL DEFAULT '{}'::jsonb,  -- pain, fit, recency, wtp, competitor_complaint
  why_match        text,
  status           text NOT NULL DEFAULT 'new'
                   CHECK (status IN ('new', 'queued_for_digest', 'shown', 'drafted', 'approved',
                                     'sent', 'skipped', 'expired', 'blocked')),
  surfaced_at      timestamptz,
  expires_at       timestamptz,
  run_id           uuid REFERENCES ai.agent_runs(id) ON DELETE SET NULL,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now(),
  UNIQUE (mission_id, signal_id)
);
CREATE INDEX idx_opps_queue ON ai.opportunities (user_id, status, score DESC);
CREATE INDEX idx_opps_mission ON ai.opportunities (mission_id, created_at DESC);
CREATE TRIGGER trg_opps_updated BEFORE UPDATE ON ai.opportunities
  FOR EACH ROW EXECUTE FUNCTION ai.set_updated_at();

CREATE TABLE ai.drafts (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           uuid NOT NULL,
  mission_id        uuid NOT NULL,
  opportunity_id    uuid NOT NULL REFERENCES ai.opportunities(id) ON DELETE CASCADE,
  parent_draft_id   uuid REFERENCES ai.drafts(id) ON DELETE SET NULL,
  version           integer NOT NULL DEFAULT 1,
  kind              text NOT NULL CHECK (kind IN ('reply', 'dm', 'post', 'comment',
                                                  'connection_note', 'email', 'followup')),
  body              text NOT NULL,
  rationale         text,
  status            text NOT NULL DEFAULT 'pending_review'
                    CHECK (status IN ('pending_review', 'approved', 'edited', 'rejected',
                                      'superseded', 'sent')),
  quality_checks    jsonb NOT NULL DEFAULT '{}'::jsonb,  -- spam_score, relevance, tone_match, policy_pass
  model             text,
  prompt_version_id uuid REFERENCES ai.prompt_versions(id) ON DELETE SET NULL,
  run_id            uuid REFERENCES ai.agent_runs(id) ON DELETE SET NULL,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_drafts_opp ON ai.drafts (opportunity_id, version DESC);
CREATE INDEX idx_drafts_review ON ai.drafts (user_id, status) WHERE status = 'pending_review';
CREATE TRIGGER trg_drafts_updated BEFORE UPDATE ON ai.drafts
  FOR EACH ROW EXECUTE FUNCTION ai.set_updated_at();

CREATE TABLE ai.digests (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid NOT NULL,
  mission_id       uuid,
  kind             text NOT NULL CHECK (kind IN ('daily', 'weekly')),
  opportunity_ids  uuid[] NOT NULL DEFAULT '{}',
  summary          text,
  notification_id  uuid,                     -- soft ref app.notifications.id
  generated_at     timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_digests_user ON ai.digests (user_id, generated_at DESC);

CREATE TABLE ai.mission_verdicts (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid NOT NULL,
  mission_id          uuid NOT NULL,
  verdict             text NOT NULL CHECK (verdict IN ('strong_demand', 'some_demand', 'weak_demand',
                                                       'pivot', 'kill', 'insufficient_data')),
  confidence          numeric(4,3) CHECK (confidence BETWEEN 0 AND 1),
  rationale           text,
  evidence            jsonb NOT NULL DEFAULT '[]'::jsonb,         -- [{signal_id|note_id, quote, weight}]
  counter_arguments   jsonb NOT NULL DEFAULT '[]'::jsonb,
  next_tests          jsonb NOT NULL DEFAULT '[]'::jsonb,
  run_id              uuid REFERENCES ai.agent_runs(id) ON DELETE SET NULL,
  computed_at         timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_verdicts_mission ON ai.mission_verdicts (mission_id, computed_at DESC);

-- =====================================================================
-- LEARNING AND MEMORY
-- =====================================================================

-- Learning input. Derived from app.approvals and thread events; kept
-- here so the agent never has to join across services at inference time.
CREATE TABLE ai.feedback_events (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL,
  mission_id      uuid,
  opportunity_id  uuid REFERENCES ai.opportunities(id) ON DELETE SET NULL,
  draft_id        uuid REFERENCES ai.drafts(id) ON DELETE SET NULL,
  signal_type     text NOT NULL CHECK (signal_type IN ('approved', 'edited', 'skipped', 'bad_match',
                                                       'good_match', 'reply_received', 'outcome')),
  payload         jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_feedback_user ON ai.feedback_events (user_id, created_at DESC);

CREATE TABLE ai.user_memory (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           uuid NOT NULL,
  mission_id        uuid,                    -- null = applies to every mission
  kind              text NOT NULL CHECK (kind IN ('preference', 'voice_trait', 'avoid', 'fact', 'learned_rule')),
  content           text NOT NULL,
  confidence        numeric(4,3) NOT NULL DEFAULT 0.5 CHECK (confidence BETWEEN 0 AND 1),
  evidence_count    integer NOT NULL DEFAULT 1,
  source            text NOT NULL CHECK (source IN ('feedback', 'user_edit', 'interview', 'agent')),
  is_active         boolean NOT NULL DEFAULT true,
  last_confirmed_at timestamptz,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_memory_user ON ai.user_memory (user_id, kind) WHERE is_active;
CREATE TRIGGER trg_memory_updated BEFORE UPDATE ON ai.user_memory
  FOR EACH ROW EXECUTE FUNCTION ai.set_updated_at();

-- The onboarding conversation that produces the mission card.
CREATE TABLE ai.interview_turns (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  onboarding_session_id uuid NOT NULL,       -- soft ref app.onboarding_sessions.id
  user_id               uuid,
  turn_index            integer NOT NULL,
  role                  text NOT NULL CHECK (role IN ('agent', 'user')),
  content               text NOT NULL,
  extracted             jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at            timestamptz NOT NULL DEFAULT now(),
  UNIQUE (onboarding_session_id, turn_index)
);

-- Seed: tools the harness knows about. External writes always need approval.
INSERT INTO ai.tool_registry (name, description, side_effect, requires_approval, platforms) VALUES
  ('reddit.search',     'Search Reddit posts and comments',        'read',           false, '{reddit}'),
  ('hn.search',         'Search Hacker News stories and comments', 'read',           false, '{hackernews}'),
  ('x.search',          'Search recent posts on X',                'read',           false, '{x}'),
  ('web.fetch',         'Fetch a public web page',                 'read',           false, '{}'),
  ('draft.save',        'Save a draft for review',                 'write_internal', false, '{}'),
  ('platform.post_reply','Post an approved reply',                 'write_external', true,  '{reddit,x}'),
  ('platform.send_dm',  'Send an approved direct message',         'write_external', true,  '{x,linkedin}')
ON CONFLICT (name) DO NOTHING;
