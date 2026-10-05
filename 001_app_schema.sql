-- =====================================================================
-- 001_app_schema.sql   (PostgreSQL 15+)
-- Owner: Express service. Holds user data, missions, history, billing.
--
-- Rules
--   * Express is the only writer to app.*. FastAPI gets a read-only role
--     on app.* and writes back through Express internal endpoints.
--   * No foreign keys cross schemas. Ids that point into the ai schema
--     (draft_id, opportunity_id, ...) are soft references, validated in
--     the API layer.
--   * Every user-owned table has user_id. Filter on it in every query.
--   * Secrets (OAuth tokens) are never stored here. Keep them in a
--     secret manager and store only a reference in credentials_ref.
-- =====================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS citext;

CREATE SCHEMA IF NOT EXISTS app;

CREATE OR REPLACE FUNCTION app.set_updated_at() RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ---------------------------------------------------------------------
-- Identity
-- ---------------------------------------------------------------------

CREATE TABLE app.users (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email                 citext UNIQUE,
  name                  text,
  avatar_url            text,
  timezone              text NOT NULL DEFAULT 'UTC',
  locale                text NOT NULL DEFAULT 'en',
  country               text,
  whatsapp_number       text UNIQUE,
  whatsapp_verified_at  timestamptz,
  onboarding_status     text NOT NULL DEFAULT 'not_started'
                        CHECK (onboarding_status IN ('not_started', 'in_progress', 'completed')),
  onboarding_completed_at timestamptz,
  status                text NOT NULL DEFAULT 'active'
                        CHECK (status IN ('active', 'suspended', 'deleted')),
  deleted_at            timestamptz,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_users_updated BEFORE UPDATE ON app.users
  FOR EACH ROW EXECUTE FUNCTION app.set_updated_at();

CREATE TABLE app.auth_identities (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           uuid NOT NULL REFERENCES app.users(id) ON DELETE CASCADE,
  provider          text NOT NULL CHECK (provider IN ('google', 'github', 'email_otp', 'whatsapp_otp')),
  provider_user_id  text NOT NULL,
  created_at        timestamptz NOT NULL DEFAULT now(),
  UNIQUE (provider, provider_user_id)
);
CREATE INDEX idx_auth_identities_user ON app.auth_identities (user_id);

CREATE TABLE app.sessions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES app.users(id) ON DELETE CASCADE,
  token_hash  text NOT NULL UNIQUE,
  user_agent  text,
  ip          inet,
  expires_at  timestamptz NOT NULL,
  revoked_at  timestamptz,
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_sessions_user ON app.sessions (user_id) WHERE revoked_at IS NULL;

-- ---------------------------------------------------------------------
-- Onboarding (supports the preview before signup)
-- ---------------------------------------------------------------------

CREATE TABLE app.onboarding_sessions (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid REFERENCES app.users(id) ON DELETE CASCADE,  -- null until signup
  anon_token_hash     text UNIQUE,
  intent              text CHECK (intent IN ('get_customers', 'validate_idea', 'grow_audience',
                                             'find_job', 'find_collaborators', 'other')),
  raw_intent_text     text,
  current_step        text NOT NULL DEFAULT 'intent',
  answers             jsonb NOT NULL DEFAULT '{}'::jsonb,
  preview_payload     jsonb,          -- the 3 preview matches shown before signup
  completed_at        timestamptz,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_onboarding_user ON app.onboarding_sessions (user_id);
CREATE TRIGGER trg_onboarding_updated BEFORE UPDATE ON app.onboarding_sessions
  FOR EACH ROW EXECUTE FUNCTION app.set_updated_at();

-- ---------------------------------------------------------------------
-- Missions
-- ---------------------------------------------------------------------

CREATE TABLE app.missions (
  id                     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                uuid NOT NULL REFERENCES app.users(id) ON DELETE CASCADE,
  onboarding_session_id  uuid REFERENCES app.onboarding_sessions(id) ON DELETE SET NULL,
  intent                 text NOT NULL CHECK (intent IN ('get_customers', 'validate_idea', 'grow_audience',
                                                         'find_job', 'find_collaborators', 'other')),
  title                  text NOT NULL,
  goal_text              text,
  status                 text NOT NULL DEFAULT 'draft'
                         CHECK (status IN ('draft', 'active', 'paused', 'completed', 'archived')),
  -- The mission card: audience, product context, hypotheses, channels,
  -- what the agent will and will not do. Shape is versioned in the app.
  spec                   jsonb NOT NULL DEFAULT '{}'::jsonb,
  spec_version           integer NOT NULL DEFAULT 1,
  started_at             timestamptz,
  completed_at           timestamptz,
  created_at             timestamptz NOT NULL DEFAULT now(),
  updated_at             timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_missions_user_status ON app.missions (user_id, status);
CREATE TRIGGER trg_missions_updated BEFORE UPDATE ON app.missions
  FOR EACH ROW EXECUTE FUNCTION app.set_updated_at();

CREATE TABLE app.mission_versions (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id   uuid NOT NULL REFERENCES app.missions(id) ON DELETE CASCADE,
  version      integer NOT NULL,
  spec         jsonb NOT NULL,
  changed_by   text NOT NULL CHECK (changed_by IN ('user', 'agent', 'system')),
  change_note  text,
  created_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (mission_id, version)
);

-- ---------------------------------------------------------------------
-- Library, voice, channels, guardrails, notifications
-- ---------------------------------------------------------------------

CREATE TABLE app.assets (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES app.users(id) ON DELETE CASCADE,
  mission_id    uuid REFERENCES app.missions(id) ON DELETE SET NULL,
  kind          text NOT NULL CHECK (kind IN ('resume', 'product_url', 'document', 'sample_post', 'link')),
  title         text,
  source_url    text,
  storage_key   text,
  mime_type     text,
  size_bytes    bigint,
  ingest_status text NOT NULL DEFAULT 'pending'
                CHECK (ingest_status IN ('pending', 'processing', 'ready', 'failed')),
  ingest_error  text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_assets_user ON app.assets (user_id, kind);
CREATE TRIGGER trg_assets_updated BEFORE UPDATE ON app.assets
  FOR EACH ROW EXECUTE FUNCTION app.set_updated_at();

CREATE TABLE app.voice_profiles (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES app.users(id) ON DELETE CASCADE,
  name         text NOT NULL,
  tone_preset  text NOT NULL DEFAULT 'friendly'
               CHECK (tone_preset IN ('friendly', 'direct', 'professional', 'casual', 'custom')),
  do_rules     text[] NOT NULL DEFAULT '{}',
  dont_rules   text[] NOT NULL DEFAULT '{}',
  sample_asset_ids uuid[] NOT NULL DEFAULT '{}',
  is_default   boolean NOT NULL DEFAULT false,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX uq_voice_default_per_user ON app.voice_profiles (user_id) WHERE is_default;
CREATE TRIGGER trg_voice_updated BEFORE UPDATE ON app.voice_profiles
  FOR EACH ROW EXECUTE FUNCTION app.set_updated_at();

CREATE TABLE app.channel_connections (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              uuid NOT NULL REFERENCES app.users(id) ON DELETE CASCADE,
  platform             text NOT NULL CHECK (platform IN ('whatsapp', 'x', 'reddit', 'linkedin',
                                                         'hackernews', 'email')),
  mode                 text NOT NULL DEFAULT 'draft_only'
                       CHECK (mode IN ('official_api', 'draft_only', 'read_only')),
  external_account_id  text NOT NULL,
  handle               text,
  status               text NOT NULL DEFAULT 'connected'
                       CHECK (status IN ('connected', 'needs_reauth', 'revoked', 'error')),
  scopes               text[] NOT NULL DEFAULT '{}',
  credentials_ref      text,           -- pointer into the secret manager, never the token
  last_checked_at      timestamptz,
  last_error           text,
  connected_at         timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, platform, external_account_id)
);
CREATE TRIGGER trg_channels_updated BEFORE UPDATE ON app.channel_connections
  FOR EACH ROW EXECUTE FUNCTION app.set_updated_at();

CREATE TABLE app.guardrails (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid NOT NULL REFERENCES app.users(id) ON DELETE CASCADE,
  mission_id       uuid REFERENCES app.missions(id) ON DELETE CASCADE,  -- null = applies to all missions
  autonomy_level   text NOT NULL DEFAULT 'approve_each'
                   CHECK (autonomy_level IN ('draft_only', 'approve_each', 'approve_batch')),
  daily_action_cap integer NOT NULL DEFAULT 10 CHECK (daily_action_cap >= 0),
  platform_caps    jsonb NOT NULL DEFAULT '{}'::jsonb,
  quiet_hours_start time,
  quiet_hours_end   time,
  blocked_topics   text[] NOT NULL DEFAULT '{}',
  blocked_accounts text[] NOT NULL DEFAULT '{}',
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX uq_guardrails_scope ON app.guardrails
  (user_id, COALESCE(mission_id, '00000000-0000-0000-0000-000000000000'::uuid));
CREATE TRIGGER trg_guardrails_updated BEFORE UPDATE ON app.guardrails
  FOR EACH ROW EXECUTE FUNCTION app.set_updated_at();

CREATE TABLE app.notification_prefs (
  user_id                 uuid PRIMARY KEY REFERENCES app.users(id) ON DELETE CASCADE,
  whatsapp_digest_enabled boolean NOT NULL DEFAULT true,
  digest_time             time NOT NULL DEFAULT '09:00',
  digest_max_items        integer NOT NULL DEFAULT 5 CHECK (digest_max_items BETWEEN 1 AND 20),
  weekly_summary_enabled  boolean NOT NULL DEFAULT true,
  weekly_summary_dow      smallint NOT NULL DEFAULT 1 CHECK (weekly_summary_dow BETWEEN 0 AND 6),
  email_fallback_enabled  boolean NOT NULL DEFAULT true,
  updated_at              timestamptz NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_notif_prefs_updated BEFORE UPDATE ON app.notification_prefs
  FOR EACH ROW EXECUTE FUNCTION app.set_updated_at();

CREATE TABLE app.notifications (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               uuid NOT NULL REFERENCES app.users(id) ON DELETE CASCADE,
  kind                  text NOT NULL CHECK (kind IN ('daily_digest', 'weekly_summary', 'approval_request',
                                                      'reply_received', 'channel_issue', 'quota_warning', 'system')),
  channel               text NOT NULL CHECK (channel IN ('whatsapp', 'email', 'in_app')),
  payload               jsonb NOT NULL DEFAULT '{}'::jsonb,
  status                text NOT NULL DEFAULT 'queued'
                        CHECK (status IN ('queued', 'sent', 'delivered', 'read', 'failed')),
  provider_message_id   text,
  sent_at               timestamptz,
  read_at               timestamptz,
  created_at            timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_notifications_user ON app.notifications (user_id, created_at DESC);

-- ---------------------------------------------------------------------
-- History: decisions, actions, conversations, outcomes
-- ---------------------------------------------------------------------

CREATE TABLE app.approvals (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES app.users(id) ON DELETE CASCADE,
  mission_id      uuid NOT NULL REFERENCES app.missions(id) ON DELETE CASCADE,
  draft_id        uuid NOT NULL,          -- soft ref: ai.drafts.id
  opportunity_id  uuid,                   -- soft ref: ai.opportunities.id
  decision        text NOT NULL CHECK (decision IN ('approved', 'edited_approved', 'skipped', 'bad_match')),
  edited_body     text,
  reason_code     text,
  source          text NOT NULL CHECK (source IN ('whatsapp', 'web')),
  decided_at      timestamptz NOT NULL DEFAULT now(),
  created_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_approvals_user ON app.approvals (user_id, decided_at DESC);
CREATE INDEX idx_approvals_draft ON app.approvals (draft_id);

CREATE TABLE app.actions (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        uuid NOT NULL REFERENCES app.users(id) ON DELETE CASCADE,
  mission_id     uuid NOT NULL REFERENCES app.missions(id) ON DELETE CASCADE,
  approval_id    uuid NOT NULL REFERENCES app.approvals(id) ON DELETE RESTRICT,
  platform       text NOT NULL,
  action_type    text NOT NULL CHECK (action_type IN ('reply', 'dm', 'post', 'comment',
                                                      'connection_request', 'email')),
  target_url     text,
  body           text NOT NULL,
  external_id    text,
  status         text NOT NULL DEFAULT 'queued'
                 CHECK (status IN ('queued', 'manual_pending', 'sent', 'failed', 'cancelled')),
  error          text,
  sent_at        timestamptz,
  created_at     timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_actions_user ON app.actions (user_id, created_at DESC);
CREATE INDEX idx_actions_mission_status ON app.actions (mission_id, status);

CREATE TABLE app.contacts (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES app.users(id) ON DELETE CASCADE,
  platform        text NOT NULL,
  handle          text NOT NULL,
  display_name    text,
  profile_url     text,
  notes           text,
  tags            text[] NOT NULL DEFAULT '{}',
  first_seen_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, platform, handle)
);

CREATE TABLE app.threads (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            uuid NOT NULL REFERENCES app.users(id) ON DELETE CASCADE,
  mission_id         uuid NOT NULL REFERENCES app.missions(id) ON DELETE CASCADE,
  contact_id         uuid NOT NULL REFERENCES app.contacts(id) ON DELETE CASCADE,
  platform           text NOT NULL,
  external_thread_id text,
  stage              text NOT NULL DEFAULT 'contacted'
                     CHECK (stage IN ('contacted', 'replied', 'interested', 'interview_scheduled',
                                      'interviewed', 'converted', 'closed_lost', 'not_a_fit')),
  last_message_at    timestamptz,
  next_followup_at   timestamptz,
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_threads_mission_stage ON app.threads (mission_id, stage);
CREATE INDEX idx_threads_followup ON app.threads (next_followup_at) WHERE next_followup_at IS NOT NULL;
CREATE TRIGGER trg_threads_updated BEFORE UPDATE ON app.threads
  FOR EACH ROW EXECUTE FUNCTION app.set_updated_at();

CREATE TABLE app.thread_messages (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id    uuid NOT NULL REFERENCES app.threads(id) ON DELETE CASCADE,
  direction    text NOT NULL CHECK (direction IN ('outbound', 'inbound')),
  body         text NOT NULL,
  external_id  text,
  action_id    uuid REFERENCES app.actions(id) ON DELETE SET NULL,
  sent_at      timestamptz NOT NULL DEFAULT now(),
  created_at   timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_thread_messages_thread ON app.thread_messages (thread_id, sent_at);

CREATE TABLE app.outcomes (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        uuid NOT NULL REFERENCES app.users(id) ON DELETE CASCADE,
  mission_id     uuid NOT NULL REFERENCES app.missions(id) ON DELETE CASCADE,
  thread_id      uuid REFERENCES app.threads(id) ON DELETE SET NULL,
  kind           text NOT NULL CHECK (kind IN ('customer', 'interview', 'referral', 'job_offer',
                                               'feedback_received', 'follower_milestone', 'other')),
  value_numeric  numeric,
  note           text,
  occurred_at    timestamptz NOT NULL DEFAULT now(),
  created_at     timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_outcomes_mission ON app.outcomes (mission_id, occurred_at DESC);

CREATE TABLE app.interview_notes (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid NOT NULL REFERENCES app.users(id) ON DELETE CASCADE,
  mission_id          uuid NOT NULL REFERENCES app.missions(id) ON DELETE CASCADE,
  thread_id           uuid REFERENCES app.threads(id) ON DELETE SET NULL,
  contact_id          uuid REFERENCES app.contacts(id) ON DELETE SET NULL,
  raw_note            text NOT NULL,
  key_quotes          jsonb NOT NULL DEFAULT '[]'::jsonb,
  pain_score          smallint CHECK (pain_score BETWEEN 1 AND 5),
  willingness_to_pay  text CHECK (willingness_to_pay IN ('none', 'maybe', 'yes')),
  created_at          timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_interview_notes_mission ON app.interview_notes (mission_id, created_at DESC);

-- ---------------------------------------------------------------------
-- Billing and usage
-- ---------------------------------------------------------------------

CREATE TABLE app.plans (
  id                     text PRIMARY KEY,         -- 'free', 'pro', ...
  name                   text NOT NULL,
  price_monthly_minor    integer NOT NULL DEFAULT 0,  -- smallest currency unit
  currency               text NOT NULL DEFAULT 'INR',
  included_actions       integer,                  -- null = unlimited
  limits                 jsonb NOT NULL DEFAULT '{}'::jsonb,
  active                 boolean NOT NULL DEFAULT true
);

CREATE TABLE app.subscriptions (
  id                        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                   uuid NOT NULL REFERENCES app.users(id) ON DELETE CASCADE,
  plan_id                   text NOT NULL REFERENCES app.plans(id),
  status                    text NOT NULL DEFAULT 'active'
                            CHECK (status IN ('trialing', 'active', 'past_due', 'paused', 'canceled')),
  provider                  text CHECK (provider IN ('razorpay', 'stripe')),
  provider_subscription_id  text UNIQUE,
  current_period_start      timestamptz,
  current_period_end        timestamptz,
  cancel_at_period_end      boolean NOT NULL DEFAULT false,
  canceled_at               timestamptz,
  created_at                timestamptz NOT NULL DEFAULT now(),
  updated_at                timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_subscriptions_user ON app.subscriptions (user_id, status);
CREATE TRIGGER trg_subscriptions_updated BEFORE UPDATE ON app.subscriptions
  FOR EACH ROW EXECUTE FUNCTION app.set_updated_at();

-- scope 'lifetime' uses period_start = '1970-01-01' (for the free first-N actions).
CREATE TABLE app.usage_counters (
  user_id            uuid NOT NULL REFERENCES app.users(id) ON DELETE CASCADE,
  scope              text NOT NULL CHECK (scope IN ('lifetime', 'month')),
  period_start       date NOT NULL,
  actions_used       integer NOT NULL DEFAULT 0,
  opportunities_shown integer NOT NULL DEFAULT 0,
  ai_cost_micros     bigint NOT NULL DEFAULT 0,
  updated_at         timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, scope, period_start)
);

-- ---------------------------------------------------------------------
-- Platform plumbing
-- ---------------------------------------------------------------------

-- Transactional outbox: Express writes an event in the same transaction
-- as the change; a relay hands it to the FastAPI job queue.
CREATE TABLE app.outbox_events (
  id             bigserial PRIMARY KEY,
  topic          text NOT NULL,          -- e.g. 'mission.activated', 'approval.created'
  payload        jsonb NOT NULL,
  status         text NOT NULL DEFAULT 'pending'
                 CHECK (status IN ('pending', 'processing', 'done', 'failed')),
  attempts       integer NOT NULL DEFAULT 0,
  available_at   timestamptz NOT NULL DEFAULT now(),
  processed_at   timestamptz,
  last_error     text,
  created_at     timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_outbox_pending ON app.outbox_events (available_at) WHERE status = 'pending';

CREATE TABLE app.audit_log (
  id           bigserial PRIMARY KEY,
  user_id      uuid REFERENCES app.users(id) ON DELETE SET NULL,
  actor        text NOT NULL CHECK (actor IN ('user', 'system', 'agent', 'admin')),
  event        text NOT NULL,
  entity_type  text,
  entity_id    uuid,
  metadata     jsonb NOT NULL DEFAULT '{}'::jsonb,
  ip           inet,
  created_at   timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_audit_user ON app.audit_log (user_id, created_at DESC);

CREATE TABLE app.feedback (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid REFERENCES app.users(id) ON DELETE SET NULL,
  kind        text NOT NULL CHECK (kind IN ('bug', 'idea', 'rating', 'other')),
  page        text,
  body        text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- Seed plans (adjust prices once you decide them)
INSERT INTO app.plans (id, name, price_monthly_minor, currency, included_actions, limits) VALUES
  ('free', 'Free', 0, 'INR', 20, '{"free_actions_lifetime": 20}'::jsonb),
  ('pro',  'Pro',  0, 'INR', NULL, '{}'::jsonb)
ON CONFLICT (id) DO NOTHING;
