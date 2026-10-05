export interface ScoreBreakdown {
  pain: number;
  fit: number;
  recency: number;
  wtp: number;
  competitor_complaint?: number;
}

export interface Signal {
  id: string;
  platform: "reddit" | "x" | "hackernews" | "linkedin" | "email";
  external_id: string;
  url: string;
  author_handle: string;
  author_name?: string;
  title?: string;
  body: string;
  posted_at: string;
  upvotes?: number;
  comments_count?: number;
  subreddit?: string;
}

export interface QualityChecks {
  length: number;
  tone_match: number;
  spam_risk: "low" | "medium" | "high";
  policy_pass: boolean;
}

export interface Draft {
  id: string;
  opportunity_id: string;
  version: number;
  kind: "reply" | "dm" | "post" | "comment" | "connection_note" | "email" | "followup";
  body: string;
  rationale: string;
  status: "pending_review" | "approved" | "edited" | "rejected" | "sent";
  quality_checks: QualityChecks;
}

export interface Opportunity {
  id: string;
  mission_id: string;
  signal: Signal;
  score: number;
  score_breakdown: ScoreBreakdown;
  why_match: string;
  status: "new" | "queued_for_digest" | "shown" | "drafted" | "approved" | "sent" | "skipped" | "bad_match" | "blocked";
  bad_match_reason?: string;
  drafts: Draft[];
  surfaced_at: string;
  category?: string;
}

export interface Message {
  id: string;
  direction: "inbound" | "outbound";
  body: string;
  sent_at: string;
  platform: string;
}

export interface InterviewNote {
  id: string;
  thread_id?: string;
  contact_name: string;
  raw_note: string;
  key_quotes: string[];
  pain_score: number; // 1-5
  willingness_to_pay: "none" | "maybe" | "yes";
  created_at: string;
}

export interface Thread {
  id: string;
  mission_id: string;
  contact: {
    id: string;
    handle: string;
    display_name: string;
    platform: "reddit" | "x" | "hackernews" | "linkedin" | "email";
    avatar_url?: string;
    profile_url: string;
    notes: string;
    tags: string[];
    company?: string;
    role?: string;
  };
  stage: "contacted" | "replied" | "interested" | "interview_scheduled" | "interviewed" | "converted" | "closed_lost";
  last_message_at: string;
  next_followup_at?: string;
  messages: Message[];
  suggested_draft?: {
    body: string;
    rationale: string;
  };
  interview_notes?: InterviewNote[];
}

export interface Mission {
  id: string;
  title: string;
  intent: "get_customers" | "validate_idea" | "grow_audience" | "find_job" | "other";
  goal_text: string;
  target_metric: {
    current: number;
    goal: number;
    unit: string;
  };
  status: "active" | "paused" | "completed" | "archived";
  audience: string;
  channels: string[];
  will_do: string[];
  wont_do: string[];
  spec_version: number;
  created_at: string;
  updated_at: string;
  versions: {
    version: number;
    changed_by: "user" | "agent" | "system";
    change_note: string;
    created_at: string;
  }[];
}

export interface Source {
  id: string;
  platform: "reddit" | "x" | "hackernews" | "linkedin";
  kind: "subreddit" | "keyword" | "hashtag" | "account" | "query";
  value: string;
  created_by: "agent" | "user";
  status: "active" | "suggested" | "rejected" | "paused";
  matches_found: number;
  approved_count: number;
  approval_rate: number;
  last_scanned_at: string;
}

export interface Asset {
  id: string;
  kind: "document" | "product_url" | "resume" | "sample_post" | "link";
  title: string;
  source_url?: string;
  storage_key?: string;
  size_bytes?: number;
  ingest_status: "ready" | "processing" | "pending" | "failed";
  extracted_summary?: string;
  extracted_points?: string[];
  chunk_count?: number;
  created_at: string;
}

export interface VoiceProfile {
  id: string;
  name: string;
  tone_preset: "friendly" | "direct" | "professional" | "casual" | "custom";
  is_default: boolean;
  do_rules: string[];
  dont_rules: string[];
  sample_posts: string[];
}

export interface EvidenceItem {
  id: string;
  source: string;
  platform: "reddit" | "x" | "hackernews" | "interview";
  author: string;
  quote: string;
  sentiment: "positive" | "strong_pain" | "skeptical" | "willing_to_pay";
  weight: number; // 0.0 - 1.0
  created_at: string;
  url?: string;
}

export interface VerdictData {
  verdict: "strong_demand" | "some_demand" | "weak_demand" | "pivot" | "kill" | "insufficient_data";
  verdict_display: string;
  confidence: number;
  rationale: string;
  demand_signal_strength: number; // 0-100
  willingness_to_pay_strength: number; // 0-100
  counter_arguments: {
    point: string;
    risk_level: "high" | "medium" | "low";
    mitigation: string;
  }[];
  next_tests: {
    title: string;
    description: string;
    status: "recommended" | "in_progress" | "done";
  }[];
}

export interface AgentRun {
  id: string;
  kind: "scan" | "score" | "draft" | "digest" | "execute_action" | "reply_poll";
  trigger_type: "schedule" | "user" | "event" | "system";
  status: "succeeded" | "running" | "failed" | "blocked";
  description: string;
  details: string;
  sources_checked?: string[];
  items_found?: number;
  drafts_created?: number;
  blocked_reason?: string;
  policy_triggered?: string;
  tokens_in: number;
  tokens_out: number;
  cost_micros: number;
  latency_ms: number;
  started_at: string;
}

export interface UserMemory {
  id: string;
  kind: "preference" | "voice_trait" | "avoid" | "fact" | "learned_rule";
  content: string;
  confidence: number;
  evidence_count: number;
  source: "feedback" | "user_edit" | "interview" | "agent";
  is_active: boolean;
  created_at: string;
}

export interface Guardrails {
  autonomy_level: "draft_only" | "approve_each" | "approve_batch";
  daily_action_cap: number;
  actions_today: number;
  platform_caps: {
    reddit: number;
    x: number;
    linkedin: number;
    hackernews: number;
  };
  quiet_hours_enabled: boolean;
  quiet_hours_start: string;
  quiet_hours_end: string;
  quiet_hours_tz: string;
  blocked_topics: string[];
  blocked_accounts: string[];
}

export interface ChannelConnection {
  id: string;
  platform: "whatsapp" | "x" | "reddit" | "linkedin" | "hackernews" | "email";
  name: string;
  handle: string;
  mode: "official_api" | "draft_only" | "read_only";
  status: "connected" | "needs_reauth" | "revoked" | "error";
  last_checked: string;
  notes?: string;
}

export interface NotificationPrefs {
  whatsapp_digest_enabled: boolean;
  digest_time: string;
  digest_max_items: number;
  weekly_summary_enabled: boolean;
  weekly_summary_dow: number;
  email_fallback_enabled: boolean;
  fallback_email: string;
}

export interface NotificationItem {
  id: string;
  kind: "daily_digest" | "weekly_summary" | "approval_request" | "reply_received" | "channel_issue" | "quota_warning";
  channel: "whatsapp" | "email" | "in_app";
  title: string;
  body: string;
  status: "delivered" | "read" | "sent";
  sent_at: string;
}

export interface Invoice {
  id: string;
  date: string;
  amount: string;
  status: "paid" | "pending";
  plan: string;
  pdf_url: string;
}

export interface FeedbackSubmission {
  id: string;
  kind: "bug" | "idea" | "rating" | "other";
  page: string;
  rating?: number;
  body: string;
  created_at: string;
}
