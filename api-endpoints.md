# API Design: Express (public) and FastAPI (AI) Endpoints

Companion to `dashboard-pages.md`, `001_app_schema.sql` and `002_ai_schema.sql`. Every endpoint below maps to a dashboard page or a schema table. Priorities follow the page map: **P0** = needed for the first usable version, **P1** = next, **P2** = later. Numbers marked as starting values are my assumptions to tune, not measured limits.

---

## 1. Architecture and rules

```
Browser / WhatsApp / payment providers
            |
            v
   Express  (public API: auth, history, billing, notifications)      owns app.*
     |   ^
     |   |  FastAPI writes back through /internal/v1 on Express
     v   |
   FastAPI  (AI jobs and agent harness)                              owns ai.*
     |
     v
   Platform APIs (Reddit, Hacker News, X, ...) and LLM providers
```

**Decisions baked into this design (change any of them before building)**

1. **Express is the only public API.** The browser never calls FastAPI. Express proxies AI-owned data (opportunities, drafts, verdicts) and merges in what it owns (approvals, quota).
2. **FastAPI is internal.** Only Express calls `/internal/v1`. The admin console calls `/admin/v1` behind admin SSO and an IP allowlist.
3. **Sending is event-driven.** Approving a draft returns immediately. Express writes the approval and action in one transaction, and the outbox event `action.queued` triggers the harness. This survives restarts and retries safely.
4. **FastAPI writes to `app.*` only through Express internal endpoints.** It may read `app.*` through its read-only database role for bulk reads.
5. **Failed or cancelled actions refund the user's quota.** Blocked-by-policy actions do too.
6. **One payment provider at launch.** Razorpay fits India. Add Stripe when you sell globally.
7. **Redis (or equivalent) is assumed** for OAuth state, rate limits, SSE fan-out and the job queue. Object storage with presigned uploads is assumed for assets.

**Conventions**

- **Paths:** public `/v1/...`, internal `/internal/v1/...`, admin `/admin/v1/...`. JSON in and out, `snake_case`, UUID ids, ISO-8601 UTC timestamps.
- **Auth modes:** `user` (session cookie, httpOnly), `anon` (`X-Onboarding-Token`, onboarding only), `internal` (short-lived service token plus `X-User-Id` and `X-Request-Id`), `webhook` (provider signature), `admin` (SSO role). Every route is `user` unless its section says otherwise.
- **Ownership:** the user id always comes from the session, never from the request. Every query filters on `user_id`. FastAPI trusts `X-User-Id` only on a valid service token.
- **Pagination:** `?limit=` (default 25, max 100) and `?cursor=`. Responses carry `next_cursor`.
- **Idempotency:** `Idempotency-Key` is required on `approve`, `approve-batch`, `checkout` and `retry`. FastAPI tool calls carry their own key so a retried send cannot post twice.
- **Async work:** AI operations return `202` with a `run_id`. Poll `GET /v1/activity/{run_id}` or listen on the event stream.
- **Streaming:** SSE for the onboarding interview and draft rewrite. Express proxies the stream from FastAPI.
- **Errors:** one envelope (section 10) with a stable `code`.

---

## 2. Express public API [express-public]

### 2.1 Auth

| Method | Path | What it does | P |
|---|---|---|---|
| POST | `/v1/auth/oauth/{provider}/start` | Begin Google or GitHub sign-in, returns the redirect URL (`anon` or `user`) | 0 |
| GET | `/v1/auth/oauth/{provider}/callback` | Finish sign-in, set the session cookie, create the user on first login | 0 |
| POST | `/v1/auth/email-otp/request` | Send a one-time code to an email | 0 |
| POST | `/v1/auth/email-otp/verify` | Verify the code and start a session | 0 |
| POST | `/v1/auth/logout` | Revoke the current session | 0 |
| GET | `/v1/me/sessions` | List active sessions | 1 |
| DELETE | `/v1/me/sessions/{session_id}` | Revoke one session | 1 |

### 2.2 Account and settings

| Method | Path | What it does | P |
|---|---|---|---|
| GET | `/v1/me` | Profile, onboarding status, plan summary and quota left | 0 |
| PATCH | `/v1/me` | Update name, timezone, locale, country | 0 |
| DELETE | `/v1/me` | Start account deletion (soft delete, then `user.deleted` purges AI data) | 1 |
| GET | `/v1/me/settings` | Agent learning on or off and other toggles | 1 |
| PATCH | `/v1/me/settings` | Change those toggles | 1 |
| GET | `/v1/me/notification-prefs` | Digest time, size, weekly summary, email fallback | 1 |
| PUT | `/v1/me/notification-prefs` | Replace the preferences | 1 |
| POST | `/v1/me/exports` | Request a data export | 2 |
| GET | `/v1/me/exports/{export_id}` | Export status and download link | 2 |
| GET | `/v1/me/audit-log` | The user's own account audit log | 2 |
| POST | `/v1/feedback` | Send a bug, idea or rating from the app | 1 |

### 2.3 Onboarding (`anon` until the session is claimed)

| Method | Path | What it does | P |
|---|---|---|---|
| POST | `/v1/onboarding/sessions` | Start a session, returns its id and anon token (IP rate-limited, captcha) | 0 |
| GET | `/v1/onboarding/sessions/{session_id}` | Resume where the user left off | 0 |
| PUT | `/v1/onboarding/sessions/{session_id}/intent` | Set the intent from a chip or free text (free text is classified by AI) | 0 |
| POST | `/v1/onboarding/sessions/{session_id}/messages` | Send an interview answer, stream the next question (SSE), save extracted answers | 0 |
| POST | `/v1/onboarding/sessions/{session_id}/preview` | Start the pre-signup preview scan, returns 202 | 0 |
| GET | `/v1/onboarding/sessions/{session_id}/preview` | Poll for the 3 real matches with drafts | 0 |
| POST | `/v1/onboarding/sessions/{session_id}/claim` | Attach the session to the user after signup (`user`) | 0 |
| GET | `/v1/onboarding/sessions/{session_id}/mission-card` | The AI-drafted mission card to review | 0 |
| POST | `/v1/onboarding/sessions/{session_id}/mission-card/confirm` | Create the mission from the edited card | 0 |
| POST | `/v1/onboarding/sessions/{session_id}/complete` | Finish after channels and guardrails, set onboarding status completed | 0 |

### 2.4 Missions

| Method | Path | What it does | P |
|---|---|---|---|
| GET | `/v1/missions` | List missions with status | 0 |
| POST | `/v1/missions` | Create a mission (a new intent re-enters the interview) | 0 |
| GET | `/v1/missions/{mission_id}` | Mission card and current status | 0 |
| PATCH | `/v1/missions/{mission_id}` | Edit title, goal or spec, writes a new `mission_versions` row | 0 |
| POST | `/v1/missions/{mission_id}/activate` | Draft to active, emits `mission.activated` | 0 |
| POST | `/v1/missions/{mission_id}/pause` | Stop scanning and drafting | 0 |
| POST | `/v1/missions/{mission_id}/resume` | Resume a paused mission | 0 |
| POST | `/v1/missions/{mission_id}/complete` | Mark the goal reached | 1 |
| POST | `/v1/missions/{mission_id}/archive` | Archive and expire open opportunities | 1 |
| POST | `/v1/missions/{mission_id}/duplicate` | Copy a mission as a draft | 2 |
| GET | `/v1/missions/{mission_id}/versions` | Version history with who changed what | 1 |
| POST | `/v1/missions/{mission_id}/versions/{version}/restore` | Restore an older spec as a new version | 1 |
| POST | `/v1/missions/{mission_id}/scan` | Scan now (rate-limited) | 1 |
| GET | `/v1/missions/{mission_id}/suggestions` | Updates the agent proposes after learning from skips and edits | 2 |
| POST | `/v1/missions/{mission_id}/suggestions/{suggestion_id}/accept` | Apply a suggestion as a new mission version | 2 |
| POST | `/v1/missions/{mission_id}/suggestions/{suggestion_id}/dismiss` | Dismiss it | 2 |

### 2.5 Today and opportunities

| Method | Path | What it does | P |
|---|---|---|---|
| GET | `/v1/today` | Home: items awaiting approval with drafts, quota, agent status (`?mission_id=`) | 0 |
| GET | `/v1/opportunities` | List with filters: `mission_id`, `status`, `platform`, `min_score`, `q`, date | 0 |
| GET | `/v1/opportunities/{opportunity_id}` | Detail with the signal, score breakdown and drafts | 0 |
| POST | `/v1/opportunities/{opportunity_id}/skip` | Skip with an optional reason, records an approval row | 0 |
| POST | `/v1/opportunities/{opportunity_id}/bad-match` | Mark as a bad match with a reason, trains matching | 0 |
| POST | `/v1/opportunities/{opportunity_id}/snooze` | Hide until a given time | 1 |
| POST | `/v1/opportunities/bulk-skip` | Skip many ids at once | 1 |
| GET | `/v1/opportunities/{opportunity_id}/drafts` | All draft versions for this opportunity | 0 |
| POST | `/v1/opportunities/{opportunity_id}/drafts` | Generate a new draft, optionally with instructions and a voice | 0 |

### 2.6 Drafts and approvals

| Method | Path | What it does | P |
|---|---|---|---|
| GET | `/v1/drafts/{draft_id}` | One draft with quality checks | 0 |
| POST | `/v1/drafts/{draft_id}/versions` | Save the user's edit as a new version | 0 |
| POST | `/v1/drafts/{draft_id}/rewrite` | AI rewrite from an instruction, streams the result (SSE) | 1 |
| POST | `/v1/drafts/{draft_id}/check` | Live check for length, tone match, spam risk and policy | 1 |
| POST | `/v1/drafts/{draft_id}/approve` | Approve, optionally with an edited body, returns 202 and an action (needs `Idempotency-Key`) | 0 |
| POST | `/v1/drafts/approve-batch` | Approve several drafts when autonomy allows batch | 1 |
| POST | `/v1/drafts/{draft_id}/reject` | Reject a draft and ask for another | 1 |
| GET | `/v1/approvals` | History of decisions | 1 |

### 2.7 Actions

| Method | Path | What it does | P |
|---|---|---|---|
| GET | `/v1/actions` | List actions by mission and status | 0 |
| GET | `/v1/actions/{action_id}` | One action with status, error and the run that handled it | 0 |
| POST | `/v1/actions/{action_id}/mark-sent` | Confirm the user posted it manually (draft-only channels) | 0 |
| POST | `/v1/actions/{action_id}/cancel` | Cancel a queued action | 1 |
| POST | `/v1/actions/{action_id}/retry` | Retry a failed action (needs `Idempotency-Key`) | 1 |

### 2.8 Conversations, contacts, outcomes, interviews

| Method | Path | What it does | P |
|---|---|---|---|
| GET | `/v1/threads` | Pipeline list, filter by mission, stage, search | 0 |
| POST | `/v1/threads` | Log a conversation that started off-platform | 0 |
| GET | `/v1/threads/{thread_id}` | Thread with contact and stage | 0 |
| PATCH | `/v1/threads/{thread_id}` | Change stage or next follow-up date | 0 |
| GET | `/v1/threads/{thread_id}/messages` | Messages in order | 0 |
| POST | `/v1/threads/{thread_id}/messages` | Log an inbound or outbound message by hand | 0 |
| POST | `/v1/threads/{thread_id}/followup-draft` | AI follow-up draft for this thread | 1 |
| GET | `/v1/contacts` | List contacts | 1 |
| POST | `/v1/contacts` | Add a contact | 1 |
| GET | `/v1/contacts/{contact_id}` | One contact | 1 |
| PATCH | `/v1/contacts/{contact_id}` | Edit notes and tags | 1 |
| DELETE | `/v1/contacts/{contact_id}` | Delete a contact | 1 |
| GET | `/v1/outcomes` | List outcomes (customers, interviews, referrals, offers) | 1 |
| POST | `/v1/outcomes` | Record an outcome | 1 |
| DELETE | `/v1/outcomes/{outcome_id}` | Remove a mistaken outcome | 1 |
| GET | `/v1/interview-notes` | List interview notes | 1 |
| POST | `/v1/interview-notes` | Save a note, optionally extract quotes, pain score and willingness to pay | 1 |
| GET | `/v1/interview-notes/{note_id}` | One note | 1 |
| PATCH | `/v1/interview-notes/{note_id}` | Edit a note | 1 |
| DELETE | `/v1/interview-notes/{note_id}` | Delete a note | 1 |

### 2.9 Progress and verdict

| Method | Path | What it does | P |
|---|---|---|---|
| GET | `/v1/missions/{mission_id}/progress` | Funnel, goal tracker, weekly trend, best sources | 1 |
| GET | `/v1/missions/{mission_id}/verdict` | Latest verdict with evidence, counter-arguments, next tests | 1 |
| GET | `/v1/missions/{mission_id}/verdicts` | Verdict history | 2 |
| POST | `/v1/missions/{mission_id}/verdict/recompute` | Recompute now, returns 202 (rate-limited) | 1 |
| POST | `/v1/missions/{mission_id}/verdict/share` | Create a public share link for the verdict card | 2 |
| DELETE | `/v1/missions/{mission_id}/verdict/share` | Revoke the link | 2 |
| GET | `/v1/public/verdicts/{share_token}` | Public redacted verdict card (no auth) | 2 |

### 2.10 Sources, library, voice

| Method | Path | What it does | P |
|---|---|---|---|
| GET | `/v1/missions/{mission_id}/sources` | The watchlist with yield per source | 1 |
| POST | `/v1/missions/{mission_id}/sources` | Add a subreddit, keyword, account or query | 1 |
| POST | `/v1/missions/{mission_id}/sources/suggest` | Ask the agent for more sources, returns 202 | 1 |
| PATCH | `/v1/sources/{source_id}` | Accept, reject or pause a source | 1 |
| DELETE | `/v1/sources/{source_id}` | Remove a source | 1 |
| GET | `/v1/sources/{source_id}/stats` | Matches found and approval rate | 2 |
| GET | `/v1/assets` | Library items with ingest status | 1 |
| POST | `/v1/assets` | Add a link, product URL or pasted text | 1 |
| POST | `/v1/assets/upload-url` | Get a presigned URL for a file upload | 1 |
| POST | `/v1/assets/{asset_id}/complete` | Tell the server the upload finished, starts ingest | 1 |
| GET | `/v1/assets/{asset_id}` | One asset with status and what the agent extracted | 1 |
| POST | `/v1/assets/{asset_id}/reingest` | Process the asset again | 2 |
| DELETE | `/v1/assets/{asset_id}` | Delete the asset and its chunks | 1 |
| GET | `/v1/voice-profiles` | List voices | 1 |
| POST | `/v1/voice-profiles` | Create a voice | 1 |
| PATCH | `/v1/voice-profiles/{voice_profile_id}` | Edit tone, do and don't rules, samples | 1 |
| DELETE | `/v1/voice-profiles/{voice_profile_id}` | Delete a voice | 1 |
| POST | `/v1/voice-profiles/{voice_profile_id}/default` | Make it the default voice | 1 |
| POST | `/v1/voice-profiles/{voice_profile_id}/preview` | Rewrite a sample text in this voice | 2 |
| POST | `/v1/voice-profiles/infer` | Infer a voice from sample posts | 2 |

### 2.11 Channels

| Method | Path | What it does | P |
|---|---|---|---|
| GET | `/v1/channels` | Connections with status and mode | 0 |
| POST | `/v1/channels/{platform}/connect/start` | Begin an OAuth connection, returns the redirect URL | 0 |
| GET | `/v1/channels/{platform}/connect/callback` | Finish the connection and store a secret reference | 0 |
| PATCH | `/v1/channels/{channel_id}` | Change mode: official API, draft only, read only | 0 |
| POST | `/v1/channels/{channel_id}/reauth` | Start re-authorization | 1 |
| POST | `/v1/channels/{channel_id}/test` | Check the connection works | 1 |
| DELETE | `/v1/channels/{channel_id}` | Disconnect | 0 |
| POST | `/v1/channels/whatsapp/verify/request` | Send a code to the user's WhatsApp number | 0 |
| POST | `/v1/channels/whatsapp/verify/confirm` | Confirm the code and save the number | 0 |
| POST | `/v1/channels/whatsapp/test-message` | Send a test message | 1 |

### 2.12 Guardrails

| Method | Path | What it does | P |
|---|---|---|---|
| GET | `/v1/guardrails` | Effective rules, optionally for one mission (`?mission_id=`) | 0 |
| PUT | `/v1/guardrails` | Create or replace rules for the user or one mission, emits `guardrails.updated` | 0 |
| DELETE | `/v1/guardrails/{guardrail_id}` | Remove a mission override | 1 |

### 2.13 Notifications and realtime

| Method | Path | What it does | P |
|---|---|---|---|
| GET | `/v1/events/stream` | SSE stream of live updates for the dashboard | 0 |
| GET | `/v1/notifications` | In-app notification list (`?unread=true`) | 1 |
| POST | `/v1/notifications/{notification_id}/read` | Mark one read | 1 |
| POST | `/v1/notifications/read-all` | Mark all read | 1 |

### 2.14 Billing and usage

| Method | Path | What it does | P |
|---|---|---|---|
| GET | `/v1/billing/plans` | Plans and limits | 0 |
| GET | `/v1/billing/subscription` | Current plan and status | 0 |
| GET | `/v1/billing/usage` | Actions used against the free and monthly limits | 0 |
| POST | `/v1/billing/checkout` | Start checkout, returns the provider URL (needs `Idempotency-Key`) | 0 |
| POST | `/v1/billing/portal` | Link to the provider's customer portal, which also holds invoices | 1 |
| POST | `/v1/billing/subscription/pause` | Pause the subscription | 1 |
| POST | `/v1/billing/subscription/resume` | Resume it | 1 |
| POST | `/v1/billing/subscription/cancel` | Cancel at period end | 1 |

### 2.15 Agent transparency

| Method | Path | What it does | P |
|---|---|---|---|
| GET | `/v1/activity` | Plain-language timeline of agent runs (`?mission_id=&kind=&status=`) | 1 |
| GET | `/v1/activity/{run_id}` | One run: simplified steps and why anything was blocked | 1 |
| GET | `/v1/memory` | What the agent learned, with confidence | 2 |
| POST | `/v1/memory` | Add a rule yourself, such as "never mention pricing" | 2 |
| PATCH | `/v1/memory/{memory_id}` | Edit or switch off one item | 2 |
| DELETE | `/v1/memory/{memory_id}` | Delete one item | 2 |

### 2.16 Webhooks and health (`webhook` or no auth)

| Method | Path | What it does | P |
|---|---|---|---|
| GET | `/v1/webhooks/whatsapp` | Provider verification challenge | 0 |
| POST | `/v1/webhooks/whatsapp` | Inbound messages, button replies and delivery statuses | 0 |
| POST | `/v1/webhooks/razorpay` | Subscription and payment events | 0 |
| POST | `/v1/webhooks/stripe` | Same for Stripe, add when you go global | 2 |
| GET | `/healthz` | Liveness | 0 |
| GET | `/readyz` | Readiness, checks database and FastAPI | 0 |

---

## 3. Express internal API [express-internal]

Called only by FastAPI, with a service token. These are the only ways FastAPI changes `app.*`.

| Method | Path | What it does | P |
|---|---|---|---|
| POST | `/internal/v1/notifications/send` | Ask Express to deliver a digest or alert over WhatsApp, email or in-app, and store it | 0 |
| PATCH | `/internal/v1/actions/{action_id}` | Report the send result: sent, failed, cancelled or manual pending, with external id, error and run id | 0 |
| POST | `/internal/v1/channels/{channel_id}/status` | Mark a connection needs reauth or error | 0 |
| GET | `/internal/v1/users/{user_id}/entitlements` | Plan, quota left, caps, so quota logic lives in one place | 0 |
| POST | `/internal/v1/threads/{thread_id}/messages` | Record a reply the agent detected, moves the stage to replied | 1 |
| PATCH | `/internal/v1/assets/{asset_id}` | Report ingest status ready or failed with an error | 1 |
| POST | `/internal/v1/usage/ai-cost` | Add batched AI cost to usage counters | 1 |
| POST | `/internal/v1/audit-events` | Record agent decisions worth auditing | 1 |

---

## 4. FastAPI internal API [fastapi-internal]

Called only by Express. Each request carries a service token, `X-User-Id` and `X-Request-Id`.

### 4.1 Events and runs

| Method | Path | What it does | P |
|---|---|---|---|
| POST | `/internal/v1/events` | Receive an outbox event (idempotent on `X-Event-Id`), see section 6 | 0 |
| GET | `/internal/v1/runs` | List runs for a user or mission | 1 |
| GET | `/internal/v1/runs/{run_id}` | Run status and simplified steps, used to poll async work | 0 |
| GET | `/internal/v1/runs/{run_id}/policy-evaluations` | Why something was blocked or warned | 1 |
| POST | `/internal/v1/runs/{run_id}/cancel` | Cancel a queued or running job | 2 |
| GET | `/healthz` | Liveness | 0 |

### 4.2 Onboarding AI

| Method | Path | What it does | P |
|---|---|---|---|
| POST | `/internal/v1/onboarding/intent/classify` | Map free text to an intent and mission template | 0 |
| POST | `/internal/v1/onboarding/interview/turn` | Next interview question as an SSE stream, with extracted fields | 0 |
| POST | `/internal/v1/onboarding/preview` | Run the limited preview scan, returns 202 and a run id | 0 |
| POST | `/internal/v1/onboarding/mission-card` | Turn the answers into a mission card draft | 0 |

### 4.3 Missions

| Method | Path | What it does | P |
|---|---|---|---|
| POST | `/internal/v1/missions/{mission_id}/hypotheses` | Turn the idea into testable hypotheses | 1 |
| POST | `/internal/v1/missions/{mission_id}/scan` | Scan this mission's sources now | 1 |
| GET | `/internal/v1/missions/{mission_id}/stats` | Counts for progress: found, shown, drafted, skipped | 1 |
| POST | `/internal/v1/missions/{mission_id}/verdict/compute` | Compute a verdict, returns 202 | 1 |
| GET | `/internal/v1/missions/{mission_id}/verdict` | Latest verdict | 1 |
| GET | `/internal/v1/missions/{mission_id}/verdicts` | Verdict history | 2 |
| POST | `/internal/v1/missions/{mission_id}/sources/suggest` | Discover sources, returns 202 | 1 |
| GET | `/internal/v1/missions/{mission_id}/suggestions` | Proposed mission updates | 2 |
| POST | `/internal/v1/missions/{mission_id}/suggestions/{suggestion_id}/resolve` | Mark accepted or dismissed | 2 |

### 4.4 Sources

| Method | Path | What it does | P |
|---|---|---|---|
| GET | `/internal/v1/sources` | List sources for a mission | 1 |
| POST | `/internal/v1/sources` | Add a source | 1 |
| PATCH | `/internal/v1/sources/{source_id}` | Change status | 1 |
| DELETE | `/internal/v1/sources/{source_id}` | Remove a source | 1 |
| GET | `/internal/v1/sources/{source_id}/stats` | Yield and approval rate | 2 |

### 4.5 Opportunities and drafts

| Method | Path | What it does | P |
|---|---|---|---|
| GET | `/internal/v1/today` | Composite for the Today page | 0 |
| GET | `/internal/v1/opportunities` | List with filters | 0 |
| GET | `/internal/v1/opportunities/{opportunity_id}` | Detail with signal and score breakdown | 0 |
| PATCH | `/internal/v1/opportunities/{opportunity_id}` | Update status or snooze time | 0 |
| POST | `/internal/v1/opportunities/bulk-update` | Update many at once | 1 |
| GET | `/internal/v1/opportunities/{opportunity_id}/drafts` | Draft versions | 0 |
| POST | `/internal/v1/opportunities/{opportunity_id}/drafts` | Generate a draft, returns 202 | 0 |
| GET | `/internal/v1/drafts/{draft_id}` | One draft with quality checks | 0 |
| POST | `/internal/v1/drafts/{draft_id}/versions` | Store a user edit as a new version and log the feedback | 0 |
| POST | `/internal/v1/drafts/{draft_id}/rewrite` | Rewrite from an instruction (SSE) | 1 |
| POST | `/internal/v1/drafts/{draft_id}/check` | Spam, tone and policy check | 1 |
| POST | `/internal/v1/threads/{thread_id}/followup-draft` | Follow-up draft from thread context | 1 |
| POST | `/internal/v1/interviews/extract` | Extract quotes, pain score and willingness to pay from a note | 1 |

### 4.6 Library, voice, digest, WhatsApp, memory

| Method | Path | What it does | P |
|---|---|---|---|
| GET | `/internal/v1/assets/{asset_id}/chunks` | Preview what was extracted | 2 |
| POST | `/internal/v1/voice/preview` | Rewrite a sample in a voice | 2 |
| POST | `/internal/v1/voice/infer` | Infer voice traits from samples | 2 |
| POST | `/internal/v1/digests/build` | Build a digest now (scheduled normally, used for tests) | 1 |
| GET | `/internal/v1/digests/{digest_id}` | One digest | 1 |
| POST | `/internal/v1/whatsapp/interpret` | Turn a free-text WhatsApp reply into an intent using the last digest as context | 0 |
| GET | `/internal/v1/memory` | List learned items | 2 |
| POST | `/internal/v1/memory` | Add a user-written rule | 2 |
| PATCH | `/internal/v1/memory/{memory_id}` | Edit or deactivate an item | 2 |
| DELETE | `/internal/v1/memory/{memory_id}` | Delete an item | 2 |

---

## 5. Admin APIs (operator console, `admin` auth)

### 5.1 FastAPI admin [fastapi-admin]

| Method | Path | What it does | P |
|---|---|---|---|
| GET | `/admin/v1/prompts` | List prompt versions | 1 |
| POST | `/admin/v1/prompts` | Create a draft prompt version | 1 |
| POST | `/admin/v1/prompts/{prompt_id}/activate` | Make it the active version (retires the old one) | 1 |
| POST | `/admin/v1/prompts/{prompt_id}/retire` | Retire a version | 2 |
| GET | `/admin/v1/tools` | Tool registry | 2 |
| PATCH | `/admin/v1/tools/{tool_name}` | Enable or disable, change approval need or rate limit | 2 |
| GET | `/admin/v1/policies` | List policies | 1 |
| POST | `/admin/v1/policies` | Create a policy | 1 |
| PATCH | `/admin/v1/policies/{policy_id}` | Edit or disable a policy | 1 |
| DELETE | `/admin/v1/policies/{policy_id}` | Delete a policy | 2 |
| GET | `/admin/v1/eval-sets` | List eval sets | 1 |
| POST | `/admin/v1/eval-sets` | Create an eval set | 1 |
| POST | `/admin/v1/eval-sets/{set_id}/cases` | Add cases | 1 |
| POST | `/admin/v1/eval-sets/{set_id}/runs` | Run a set against a prompt version and model | 1 |
| GET | `/admin/v1/eval-runs/{eval_run_id}` | Results and summary | 1 |
| GET | `/admin/v1/eval-runs/compare` | Compare two runs (`?a=&b=`) | 2 |
| GET | `/admin/v1/runs` | Search runs across users | 1 |
| GET | `/admin/v1/runs/{run_id}` | Full trace: steps, tool calls, policy evaluations | 1 |
| POST | `/admin/v1/runs/{run_id}/replay` | Replay a run with the current prompt | 2 |
| GET | `/admin/v1/cost` | Spend grouped by user, mission or model (`?group_by=&from=&to=`) | 1 |
| GET | `/admin/v1/platform-health` | Rate limits hit, failing connections, queue depth | 2 |

### 5.2 Express admin [express-admin]

| Method | Path | What it does | P |
|---|---|---|---|
| GET | `/admin/v1/users` | Find users (`?q=`) | 1 |
| GET | `/admin/v1/users/{user_id}` | Support view: missions, plan, recent runs and actions | 1 |
| POST | `/admin/v1/users/{user_id}/suspend` | Suspend an account | 2 |
| POST | `/admin/v1/users/{user_id}/unsuspend` | Restore it | 2 |
| POST | `/admin/v1/users/{user_id}/grant-actions` | Add free actions with a reason, logged in the audit log | 2 |
| GET | `/admin/v1/channels/health` | Connections that need attention | 2 |

---

## 6. Outbox events (Express to FastAPI via `POST /internal/v1/events`)

Delivery is at least once. FastAPI dedupes on the event id.

| Topic | Emitted when | FastAPI does |
|---|---|---|
| `mission.activated` | A mission becomes active | Suggest sources if none, run the first scan, sync guardrails into policies |
| `mission.updated` | The spec changes | Refresh search intents, re-score open opportunities if the audience changed |
| `mission.paused` / `mission.resumed` | Pause or resume | Stop or restart scans and drafting |
| `mission.archived` | Archive | Expire open opportunities, stop everything |
| `approval.recorded` | Any decision: approved, edited, skipped, bad match | Write a feedback event, update opportunity and draft status |
| `action.queued` | An approved action is ready to send | Run policy checks, call the platform tool, report back with `PATCH /internal/v1/actions/{action_id}` |
| `action.cancelled` | The user cancels a queued action | Drop it if it has not run |
| `outcome.recorded` | An outcome is logged | Feedback event, refresh the verdict |
| `interview_note.created` | A note is saved | Refresh the verdict |
| `asset.created` / `asset.reingest_requested` | Upload completes or reingest is requested | Parse, OCR, chunk, embed, then report ingest status |
| `asset.deleted` | Asset removed | Delete its chunks |
| `channel.connected` / `channel.disconnected` | Connection changes | Enable or disable sources on that platform |
| `guardrails.updated` | Rules change | Upsert `ai.policies` for the user or mission scope |
| `quota.exhausted` / `quota.restored` | Quota hits zero or resets | Stop or resume surfacing and drafting to save cost |
| `user.learning_toggled` | Learning on or off | Stop or resume memory updates |
| `user.deleted` | Account deletion | Purge all per-user `ai.*` rows (shared signals stay) |

---

## 7. Scheduled jobs in FastAPI workers (no HTTP)

| Job | When | What |
|---|---|---|
| `scan_due_sources` | Every few minutes | Pick active sources by last scan, respect `ai.platform_usage` rate limits |
| `score_new_signals` | After each scan | Embed, prefilter by keywords and similarity, then LLM-score only the survivors |
| `draft_top_opportunities` | Before each user's digest time | Make sure the top N have drafts |
| `build_daily_digest` | At each user's digest time in their timezone | Build the digest, call `POST /internal/v1/notifications/send` |
| `build_weekly_summary` | Weekly per user | Progress summary, verdict update |
| `poll_replies` | Frequently for threads with sent actions | Detect replies, call `POST /internal/v1/threads/{thread_id}/messages` |
| `refresh_verdicts` | Daily and on new evidence | Recompute verdicts |
| `consolidate_memory` | Daily | Turn feedback events into memory, propose mission suggestions after about 10 signals |
| `expire_opportunities` | Hourly | Expire past `expires_at` |
| `retention_cleanup` | Daily | Delete old unreferenced signals (the retention period, for example 90 days, is a decision for you) |

---

## 8. Realtime event types

`GET /v1/events/stream` sends small events and the client refetches: `opportunity.created`, `draft.ready`, `action.updated`, `run.updated`, `thread.reply_received`, `notification.created`, `quota.updated`, `channel.status_changed`. Payload is `{type, id, mission_id, at}`. Heartbeat about every 25 seconds, `Last-Event-ID` supported, backed by Redis pub/sub.

---

## 9. Key flows

### A. Approve and send (web)

1. Client calls `POST /v1/drafts/{draft_id}/approve` with an `Idempotency-Key`.
2. Express checks: the draft belongs to the user, it is not already decided (409), quota (402), the autonomy level, channel connected and mode, and the daily cap.
3. One transaction: insert `app.approvals`, insert `app.actions` (`queued`, or `manual_pending` if the channel is draft-only), increment usage, insert outbox events `approval.recorded` and `action.queued`.
4. Express returns `202` with the action. For draft-only channels the response includes `open_url` and the text to paste.
5. FastAPI receives `action.queued`, runs policy checks (rate cap, quiet hours, blocklist, spam guard), writes `ai.policy_evaluations`, then calls the platform tool with an idempotency key.
6. FastAPI calls `PATCH /internal/v1/actions/{action_id}` with the result. On failure or block, Express refunds the quota and notifies the user. The dashboard updates over SSE.
7. On success FastAPI starts reply polling for the thread.

### B. WhatsApp digest and approval

1. At the user's digest time FastAPI builds the digest and calls `POST /internal/v1/notifications/send`.
2. Express sends an interactive message with Approve, Edit and Skip per item and stores the item-number-to-draft mapping in `app.notifications.payload`.
3. A button tap arrives at `POST /v1/webhooks/whatsapp`. Express verifies the signature, dedupes on the provider message id, finds the user by number and runs flow A with source `whatsapp`.
4. Free-text replies go to `POST /internal/v1/whatsapp/interpret`. Ambiguous text never auto-approves, Express asks the user to confirm. A rewrite request returns a new draft version, which is sent back for approval.
5. Business-initiated WhatsApp messages outside the 24-hour customer window generally need pre-approved templates. Design the digest templates early and check your provider's current rules.

### C. Onboarding with preview

1. `POST /v1/onboarding/sessions` returns an anon token. The intent is set, then the interview streams over `/messages`.
2. `POST .../preview` starts a limited scan. The client polls `GET .../preview` for 3 real matches with drafts.
3. The user signs up, then `POST .../claim` links the session to the new user.
4. The mission card is fetched, edited and confirmed, which creates the mission.
5. The user connects WhatsApp and channels, sets guardrails, and `POST .../complete` finishes onboarding.
6. Activating the mission emits `mission.activated` and the first real scan starts.

### D. Reply detected

1. `poll_replies` finds a reply on a platform thread.
2. FastAPI calls `POST /internal/v1/threads/{thread_id}/messages`. Express stores it, moves the stage to `replied`, creates a notification and pushes an SSE event.
3. FastAPI drafts a follow-up and the user sees it in Conversations.

### E. Asset ingest

1. `POST /v1/assets/upload-url`, the client uploads to storage, then `POST /v1/assets/{asset_id}/complete`.
2. Express emits `asset.created`. FastAPI parses, OCRs, chunks and embeds into `ai.asset_chunks`.
3. FastAPI calls `PATCH /internal/v1/assets/{asset_id}` with `ready` or `failed`. The dashboard updates over SSE.

---

## 10. Example payloads

**Error envelope (all services)**

```json
{
  "error": {
    "code": "quota_exceeded",
    "message": "You have used your 20 free actions.",
    "details": { "plan": "free", "used": 20, "limit": 20 },
    "request_id": "req_01J..."
  }
}
```

**`GET /v1/today` (abbreviated)**

```json
{
  "mission": { "id": "uuid", "title": "Find customers for my tool", "status": "active" },
  "agent": { "status": "scanning", "last_run_at": "2026-10-04T09:12:00Z" },
  "quota": { "plan": "free", "actions_used": 7, "actions_limit": 20 },
  "items": [
    {
      "opportunity": {
        "id": "uuid", "score": 0.91, "status": "shown",
        "why_match": "Asks for a tool that does X and complains about Y",
        "signal": { "platform": "reddit", "url": "https://...", "title": "...", "excerpt": "...", "posted_at": "2026-10-04T05:40:00Z" }
      },
      "draft": {
        "id": "uuid", "version": 1, "body": "...",
        "quality_checks": { "spam_score": 0.04, "tone_match": 0.88, "policy_pass": true }
      }
    }
  ],
  "next_cursor": null
}
```

**`POST /v1/drafts/{draft_id}/approve`**

```http
POST /v1/drafts/7d1c.../approve
Idempotency-Key: 3f2b0c9e-...
Content-Type: application/json

{ "edited_body": null, "source": "web" }
```

```json
{
  "approval_id": "uuid",
  "action": { "id": "uuid", "status": "queued", "platform": "reddit" }
}
```

For a draft-only channel the action is `{ "status": "manual_pending", "open_url": "https://...", "text": "..." }`.

**Onboarding message stream (`POST /v1/onboarding/sessions/{id}/messages`)**

```
event: extracted
data: {"fields": {"product": "...", "audience": "..."}}

event: question
data: {"id": "q3", "text": "Who is it for?", "skippable": true}

event: done
data: {}
```

---

## 11. Error codes and limits

| HTTP | Code | When |
|---|---|---|
| 400 | `bad_request` | Malformed request |
| 401 | `auth_required` | No or expired session, bad service token |
| 402 | `quota_exceeded` | Free or monthly action limit reached |
| 403 | `forbidden` | Resource belongs to someone else, or admin only |
| 404 | `not_found` | Missing, or not owned (same response to avoid leaking ids) |
| 409 | `conflict` | Draft already decided, duplicate idempotency key with a different body |
| 422 | `validation_failed` | Field-level errors in `details` |
| 422 | `policy_blocked` | A synchronous pre-check failed, such as the daily cap or quiet hours |
| 429 | `rate_limited` | Too many requests, `Retry-After` header set |
| 502 | `platform_error` | Reddit, X or the WhatsApp provider failed |
| 503 | `ai_unavailable` | FastAPI or the model provider is down, nothing was changed |

**Starting rate limits (assumptions, tune with real traffic)**

- General: 120 requests a minute per user.
- AI-triggering calls (generate, rewrite, check): 20 a minute per user.
- Scan now: 6 an hour per mission. Verdict recompute: 4 a day per mission.
- Email OTP request: 5 an hour per email and per IP.
- Anonymous onboarding preview: 3 an hour per IP, with a captcha.

---

## 12. Schema additions this design needs

These are gaps I found while designing the endpoints. None exist in the current SQL files.

| Needed for | Change |
|---|---|
| Idempotent webhooks (WhatsApp, payments) | `app.webhook_events` with provider, event id (unique per provider), payload, received and processed times |
| Shareable verdict card | `app.shared_verdicts` with mission id, token hash, redaction options, expiry and revoked time |
| Data export | `app.exports` with user id, status, storage key and expiry |
| Learning on or off | A flag such as `learning_enabled` on `app.users` (or a small settings table) |
| Mission suggestions | `ai.mission_suggestions` with kind, proposal, evidence, status and resolved time |
| Snooze | `ai.opportunities.snoozed_until timestamptz` |
| User-written memory rules | Allow `'user'` in the `ai.user_memory.source` check |
| "Why was this blocked" | `app.actions.run_id uuid` (soft reference to `ai.agent_runs`) |

---

## 13. Build order for the first usable version

1. Express: auth, `/v1/me`, sessions.
2. Onboarding endpoints with the FastAPI interview, intent classify, preview and mission-card.
3. Missions plus the `mission.activated` event.
4. FastAPI scan, score and draft jobs, then `/v1/today`, opportunities and drafts.
5. Approve flow, actions, and the harness `action.queued` handler with policy checks.
6. Channels (WhatsApp verify first), the WhatsApp webhook, and the digest job.
7. Guardrails, then billing and usage, then the event stream.

Everything marked P1 or P2 can wait until real users have approved real actions.
