# Dashboard map: every page, what it holds, what it reads

Priority: **P0** = needed for the first usable version, **P1** = next, **P2** = later.
Table names point to the schema files (`app.*` = Express, `ai.*` = FastAPI).

## Navigation

- **Work:** Today, Opportunities, Conversations
- **Setup:** Mission, Sources, Library, Voice
- **Insights:** Progress (includes Evidence and Verdict)
- **Agent:** Activity, Memory, Guardrails
- **Account:** Channels, Notifications, Billing, Settings

Global elements on every page: mission switcher, free-actions meter, agent status pill ("scanning, last run 12m ago"), command search, feedback button.

---

## Work

### 1. Today (P0), home
The approval queue. This is the page people open every morning, and the same actions exist on WhatsApp.
- **Components:** mission header with goal progress strip; opportunity cards (post excerpt, why-match line, score, draft preview); agent status; quota meter.
- **Actions:** approve, edit then approve, skip, "bad match" with a reason, snooze.
- **Reads:** `ai.opportunities`, `ai.drafts`, `app.approvals`, `app.usage_counters`.
- **States:** nothing waiting, first scan running, paused, quota used up, channel disconnected.

### 2. Opportunities (P0)
Everything the agent found, not only today's.
- **List:** table or board with filters (score, platform, status, mission, date), bulk skip, saved views.
- **Detail drawer:** the original post with context, score breakdown (pain intensity, fit, recency, willingness-to-pay signal), draft versions, editor with live checks (length, tone match, spam risk), approve/edit/skip, "open original" link for draft-only channels.
- **Reads:** `ai.opportunities`, `ai.signals`, `ai.drafts`.

### 3. Conversations (P0, thin version)
What happened after you reached out.
- **Pipeline board:** contacted, replied, interested, converted, closed. Each stage is a column.
- **Thread view:** messages, contact card, suggested follow-up with a draft, quick "log interview note."
- **Reads:** `app.threads`, `app.thread_messages`, `app.contacts`, `app.interview_notes`, `app.outcomes`.

---

## Setup

### 4. Mission (P0)
The mission card from onboarding, editable.
- **Components:** goal, audience, channels, what the agent will and won't do, status switch (active/paused), version history with diff.
- **Actions:** edit, pause/resume, duplicate, archive, new mission (re-enters the onboarding interview).
- **Reads:** `app.missions`, `app.mission_versions`.

### 5. Sources (P1)
Where the agent looks.
- **Components:** watchlist (subreddits, keywords, accounts, queries), agent-suggested sources with accept/reject, per-source yield (matches found, approval rate).
- **Reads:** `ai.sources`, `ai.opportunities` for yield.

### 6. Library (P1)
Material the agent uses to personalize: resume, product URL or docs, sample posts, links.
- **Components:** upload and URL add, ingestion status, "what the agent extracted" preview.
- **Reads:** `app.assets`, `ai.asset_chunks` status.

### 7. Voice (P1)
How drafts sound.
- **Components:** tone presets, do/don't rules, sample posts, live rewrite preview, multiple voices with a default.
- **Reads:** `app.voice_profiles`, `ai.user_memory` (voice traits).

---

## Insights

### 8. Progress (P1)
Whether the mission is working.
- **Funnel:** found, approved, sent, replied, outcome.
- **Goal tracker:** customers, interviews, followers, referrals, depending on mission type.
- **Trend:** weekly view, best sources, best message styles.
- **Reads:** `app.actions`, `app.threads`, `app.outcomes`, `ai.opportunities`.

### 9. Evidence and Verdict (P1, validator missions only)
- **Verdict card:** strong demand, some demand, weak, pivot, kill, or not enough data, with confidence.
- **Evidence list:** linked posts and interview quotes, each with a weight.
- **Counter-arguments:** the agent's case against the idea, and what to test next.
- **Reads:** `ai.mission_verdicts`, `app.interview_notes`.

---

## Agent (the transparency and control layer)

### 10. Activity (P1)
Plain-language log of what the agent did.
- **Components:** timeline (scanned 3 sources, found 12, drafted 4, blocked 2 because of the daily cap), "why was this blocked" explanations, run detail with simplified steps, export.
- **Reads:** `ai.agent_runs`, `ai.run_steps`, `ai.policy_evaluations`.

### 11. Memory (P2)
What the agent has learned about you.
- **Components:** learned rules and preferences with confidence, edit or delete each, switch learning off.
- **Reads:** `ai.user_memory`.

### 12. Guardrails (P0, minimal)
- **Components:** autonomy level (draft only, approve each, approve batch), daily cap, per-platform caps, quiet hours, blocked topics and accounts, per-mission overrides.
- **Reads/writes:** `app.guardrails` (the harness enforces these through `ai.policies`).

---

## Account

### 13. Channels (P0)
- **Components:** connection list with status (connected, needs reauth, error), mode per platform (official API, draft only, read only), WhatsApp verify and test message, reconnect, disconnect.
- **Reads:** `app.channel_connections`.

### 14. Notifications (P1)
- **Components:** digest time and size, weekly summary day, email fallback, message history.
- **Reads:** `app.notification_prefs`, `app.notifications`.

### 15. Billing and usage (P0, minimal)
- **Components:** current plan, free actions left, usage this period, upgrade, invoices (link to the payment provider portal), pause or cancel.
- **Reads:** `app.subscriptions`, `app.plans`, `app.usage_counters`.

### 16. Settings (P1)
- **Components:** profile, timezone and language, security and sessions, data export, delete account, account audit log.
- **Reads:** `app.users`, `app.sessions`, `app.audit_log`.

### 17. Help and feedback (P2)
- **Components:** short guides, contact, in-app feedback.
- **Reads:** `app.feedback`.

---

## How each mission type changes the same pages

| Page | Founder / builder | Content writer | Student | Job seeker |
|---|---|---|---|---|
| Today | demand posts + draft replies | trending threads + draft replies | hiring posts, mentor threads | "we're hiring" posts + intro drafts |
| Library | product URL, docs | sample posts | projects, skills | resume |
| Progress | conversations, interviews | followers, inbound leads | internship leads | interviews |
| Evidence and Verdict | yes | no | no | no |

## Operator console (separate internal app, for you)

- **Runs and traces:** every agent run with steps, tokens, cost, errors.
- **Evals:** eval sets, results by prompt version and model.
- **Prompt versions:** draft, activate, retire.
- **Policies:** global and per-plan rules.
- **Cost monitor:** spend per user, per mission, per model.
- **Platform health:** rate limits hit, failing connections, queue depth.
- **User lookup:** support view of a user's missions and recent runs.

## Suggested P0 cut

Onboarding, Today, Opportunities (list + drawer), Conversations (simple), Mission, Guardrails, Channels, Billing and usage. Everything else can follow once real users have approved real actions.

## Edge states to design once and reuse

No mission yet, no channel connected, first scan running, mission paused, quota used up, channel needs reauth, platform rate limit hit, agent blocked an action (show why).
