# MVP Plan: Fastest Path to Real Users

This cuts the full design (`dashboard-pages.md`, `001_app_schema.sql`, `002_ai_schema.sql`, `api-endpoints.md`) down to the smallest thing that tests the business. Timelines and thresholds are my estimates, not measured. The product name is still open, so it appears as [product].

---

## 1. The MVP in one sentence

A founder describes what they're building, the agent finds public posts where people are asking for it, drafts a reply for each, and the founder copies, posts, and marks what happened. **Nothing is ever sent by the product.**

## 2. What the MVP must prove

Set these gates before launch so you don't rationalize the results later (thresholds are my suggestions).

- [ ] **Activation:** at least 50% of new users approve one draft within 24 hours.
- [ ] **Match quality:** at least 60% of shown opportunities are not marked "bad match."
- [ ] **Outcome:** at least 3 replies to sent drafts across your first 10 users in two weeks.
- [ ] **Willingness to pay:** at least 2 of those 10 pay or commit through a payment link.

If activation or match quality fails, fix matching before building anything else. Matching quality is the product.

---

## 3. Scope

### In

- [ ] One user type: founders and builders getting customers or validating an idea
- [ ] Google login (off-the-shelf, no custom sessions or OTP)
- [ ] Mission form: product in one line, product URL, who it's for, how you write (one text box)
- [ ] Sources: Hacker News plus Reddit (see section 5 for the Reddit access risk)
- [ ] Scan job, relevance scoring, reply drafting
- [ ] Today screen with an opportunity drawer and draft editor
- [ ] Approve = "copy and open the post," then "I sent it," then reply status
- [ ] Daily email digest
- [ ] Verdict card generated on demand
- [ ] Free for the first 20 approved actions, then a payment link (upgrade by hand)
- [ ] Thin harness: one wrapper for every LLM call that logs tokens and cost, named prompts, per-user daily caps, an eval script

### Out (and when to add it)

| Cut | Why it can wait | Add when |
|---|---|---|
| Express service | Your stack is already Next.js, FastAPI and Postgres, and one backend is faster | Once you need the public/internal split or a second client |
| WhatsApp digest and approvals | Business onboarding and message templates take time | First thing after the MVP proves activation |
| Auto-send and posting OAuth | Platform rules and policy checks are the slowest part | After users ask for it and you have checked each platform's terms |
| LinkedIn and X | Automation limits, paid APIs | Later |
| AI onboarding interview and preview-before-signup | A form works and adds no anonymous-session logic | When signup drop-off is the problem |
| Guardrails UI and policy engine | Hardcode: draft only, 10 drafts a day | When you add sending |
| Sources, library, voice screens | One text box covers voice | When users ask |
| Conversations pipeline, contacts, interview notes | Reply status on the action is enough | When reply volume justifies it |
| Embeddings and memory/learning | Small volume can go straight to the LLM | When cost or scale needs it |
| Billing integration | A payment link tests willingness to pay | After 10+ payers |
| Admin console, SSE stream, shareable verdict card | Not needed to learn | Later |

---

## 4. Fastest proof: script mode first (days 1-4)

Before any UI, run the pipeline as a command-line script and email the results to 5 founders (yourself included). That tests the one thing that matters, whether the matches and drafts are good, in about four days.

1. Input: a short JSON for each founder (product line, audience, voice note).
2. Output: an email with the top 10 posts, a draft for each, and links.
3. Ask each founder to reply with which ones they would actually send.

If they say yes to at least a few per founder, build the UI. If not, tune the prompts first.

---

## 5. Data sources and the main risk

- **Hacker News:** the search service by Algolia is public and suits developer and founder audiences. Check its terms before launch.
- **Reddit:** this is the risk. One third-party article (from a company that sells a Reddit API alternative, so treat it as biased) says Reddit's free tier is for personal, non-commercial use only, that any monetized product needs a negotiated agreement, and that approval can take weeks or longer. I could not verify this against Reddit's own terms.
- [ ] **Day 0, blocking:** read Reddit's current Data API terms and apply for access if needed.
- [ ] If Reddit access isn't resolved, launch the MVP on Hacker News first and add Reddit when approved, or use a paid managed data provider and include its per-call cost in your pricing.
- Draft-only means the product never posts, which keeps you away from automation rules. It does not change the data-access question.

---

## 6. Stack

- **Frontend:** Next.js.
- **Backend:** one FastAPI service.
- **Database:** PostgreSQL. Use two schemas, `app` and `ai`, exactly as in the SQL files, so splitting out Express later is easy.
- **LLMs:** one provider behind a thin wrapper. Use a cheap model for scoring and a stronger one for drafts.
- **Jobs:** a cron-triggered worker. No queue yet.
- **Email:** any transactional provider (SES works since you already use AWS).
- **Hosting:** whatever you can ship on fastest.

---

## 7. Screens (six)

- [ ] Landing page and Google login
- [ ] Create mission (the form, then "scanning...")
- [ ] **Today:** the queue of opportunities with score, why-match line and draft preview
- [ ] **Opportunity drawer:** original post, draft editor, regenerate with an instruction, "Copy and open," skip, bad match
- [ ] **Sent:** what you sent, with reply status (no reply, replied, interested)
- [ ] **Verdict card:** demand level, linked evidence, counter-argument, what to test next

---

## 8. API (16 endpoints, same paths as the full design)

| Method | Path | Purpose |
|---|---|---|
| GET | `/v1/me` | Profile and usage |
| POST | `/v1/missions` | Create a mission from the form and queue the first scan |
| GET | `/v1/missions/{mission_id}` | Mission and status |
| PATCH | `/v1/missions/{mission_id}` | Edit the mission |
| POST | `/v1/missions/{mission_id}/scan` | Scan now (rate-limited) |
| GET | `/v1/today` | The queue |
| GET | `/v1/opportunities/{opportunity_id}` | Post, score breakdown, drafts |
| POST | `/v1/opportunities/{opportunity_id}/skip` | Skip |
| POST | `/v1/opportunities/{opportunity_id}/bad-match` | Mark bad match with a reason |
| POST | `/v1/opportunities/{opportunity_id}/drafts` | Regenerate with an instruction |
| POST | `/v1/drafts/{draft_id}/versions` | Save the user's edit |
| POST | `/v1/drafts/{draft_id}/approve` | Record approval, return `open_url` and text (needs `Idempotency-Key`) |
| POST | `/v1/actions/{action_id}/mark-sent` | User confirms they posted it |
| PATCH | `/v1/actions/{action_id}` | Set reply status (replaces the threads pipeline for now) |
| GET | `/v1/missions/{mission_id}/verdict` | Compute on demand if missing or older than a day |
| GET | `/v1/billing/usage` | Actions used against the free 20 |

**Jobs:** `scan_due_missions` (every few hours per active mission) and `send_daily_digest` (email).

**Hardcoded limits (assumptions):** 200 posts scored a day, 10 drafts a day, 20 free approved actions per user.

---

## 9. Tables

Run a subset of the SQL you already have. That's 12 of the 48 tables in the two files:

- `app`: `users`, `missions`, `approvals`, `actions`, `usage_counters`
- `ai`: `sources`, `signals`, `opportunities`, `drafts`, `agent_runs`, `mission_verdicts`, `prompt_versions`

**Edits to make when you trim the DDL**

- Delete columns that point at skipped tables: `app.missions.onboarding_session_id`, and `prompt_version_id` on `ai.drafts` and `ai.agent_runs` if you skip `prompt_versions`.
- Add `app.actions.reply_status text` (no reply, replied, interested).
- Add `app.users.plan text default 'free'`, upgraded by hand.
- Store the generated search queries as `ai.sources` rows of kind `query`.
- Every approval writes one `app.approvals` row and one `app.actions` row (`manual_pending`, then `sent` after "I sent it").

---

## 10. The core pipeline

1. **Mission to queries:** the LLM turns the form into 10-15 search queries, candidate communities and a scoring rubric (pain, fit, recency, willingness to pay).
2. **Scan:** search each source for recent posts, dedupe on platform and external id, store in `ai.signals`.
3. **Prefilter:** cheap rules first (age, length, language), then batch LLM scoring with the small model. Keep the top 10 a day.
4. **Draft:** one draft per top opportunity from the mission context and voice note, with rule-based checks (no link unless asked, length, no pitch in the first sentence).
5. **Log:** every LLM call goes through the wrapper into `ai.agent_runs` with tokens and cost.

**Eval before UI:** hand-label about 40 posts as relevant or not for 2-3 sample missions, then measure how many of the top 10 are relevant. Use this to tune the scoring prompt until it clears the 60% gate.

---

## 11. Ten-day plan (estimate, assumes full-time solo work)

- [ ] **Day 0:** confirm Reddit and Hacker News data access, set up the repo
- [ ] **Day 1:** deploy skeleton (Next.js, FastAPI, Postgres), Google login, trimmed SQL
- [ ] **Day 2:** Hacker News fetcher, Reddit route you chose, signals stored and deduped
- [ ] **Day 3:** query-generation prompt and the scan job (command line first)
- [ ] **Day 4:** scoring prompt, 40-post eval, draft prompt. **Run script mode for 5 founders and email results**
- [ ] **Day 5:** mission form, mission endpoints, scan trigger
- [ ] **Day 6:** Today screen and opportunity drawer
- [ ] **Day 7:** draft editor, approve with copy and open, mark sent, reply status
- [ ] **Day 8:** daily email digest, usage limit, payment link for upgrades
- [ ] **Day 9:** verdict card, landing page
- [ ] **Day 10:** onboard 5-10 founders personally, watch them use it, fix the top three problems

**If you slip, cut in this order:** verdict card, then email digest, then draft versions (regenerate only), then the Sent screen (use a spreadsheet).

---

## 12. Launch and pricing for the MVP

- **First users:** your own network, founder communities and build-in-public posts on X and Indie Hackers. Use [product] on your own idea first and post what it found.
- **Pricing:** free for the first 20 approved actions, then a payment link at your Builder price hypothesis (about $19 a month, around ₹999 in India). Flip `users.plan` by hand after payment.
- **Do not build** subscriptions, invoices or plan limits in code yet.

---

## 13. Decisions for day one

- [ ] Reddit access route (see section 5)
- [ ] Name and domain (shortlist is Overheard or Hunch, neither checked for domains or trademarks)
- [ ] Which LLMs for scoring and drafting, and a daily cost cap per user
- [ ] How long to keep unreferenced posts (the schema suggests a retention job)

---

## 14. After the MVP, in order

1. WhatsApp digest and approvals
2. Guardrails and the Express split
3. Conversations pipeline with outcomes
4. Auto-send through official APIs, only where each platform's terms allow
5. More sources
6. Memory and learning from skips and edits
7. Subscriptions or credits
8. Full harness: eval console, policies and admin tools
