# Validate-and-Find-Customers Product: Plan, Positioning and Business Model

This covers the conversation from the pivot to "a space to validate an idea and find customers" through the business model and open decisions. All prices and market claims come from vendor sites and search results and change often. Anything marked **assumption** or **hypothesis** is my estimate, not a sourced fact.

Related files already delivered: `dashboard-pages.md`, `001_app_schema.sql` (Express) and `002_ai_schema.sql` (FastAPI and harness).

---

## 1. The pivot: a space to validate an idea and find customers

**What already exists (from search results)**

- Guides and tools for finding customers on Reddit and LinkedIn aimed at indie founders.
- GummySearch for Reddit listening and interview recruiting (I could not confirm it is still operating).
- AI validation tools that pull Reddit, G2 and app-store complaints. One reviewer's tool called an idea promising even though similar products existed.
- Outreach automation tools, plus manual founder outreach with mixed Reddit results.

**Concept: an evidence loop, not a lead list**

1. **Idea intake:** turn the idea into testable hypotheses.
2. **Demand-signal discovery:** find real posts describing the problem on Reddit, Hacker News, Indie Hackers and X.
3. **Honest scoring:** rate pain, frequency, complaints about existing solutions and willingness-to-pay signals, linked to the posts. Make it adversarial so it can say "kill" or "pivot."
4. **Outreach copilot:** draft messages from the person's actual post. The user reviews and sends.
5. **Interview ledger:** log conversations, extract quotes and update the verdict as evidence accumulates.

**Constraints**

- Do not auto-send or scrape LinkedIn. Platforms restrict automation and communities punish spam. Check current terms for each platform. Safer design: find and draft, the human sends.
- These channels suit software and creator ideas, not truckers or lab owners, who are on WhatsApp and in person.

**MVP (about 2-3 weeks):** web app with login and idea form, Reddit through the official API plus Hacker News search, an evidence view with score breakdown, a draft generator, a status board (contacted, replied, interviewed) and a verdict page. Skip auto-sending, teams and analytics.

---

## 2. The myjobb pattern applied to social media

**What myjobb does (from its own site)**

- Watches many job boards and application systems, matches roles, tailors the resume, applies and follows up.
- The user approves. It also runs on WhatsApp ("want me to apply?").
- First 20 applications are free, then ₹999 per month, cancel when hired.
- Claims 1M users and 400K applications. I could not verify those.

**The same loop for getting customers**

| myjobb | Social media version |
|---|---|
| 15+ job boards and applicant systems | Reddit, X, Hacker News, Indie Hackers, LinkedIn posts |
| Match jobs to resume | Match posts where someone describes your problem |
| Tailor resume per role | Personalize a reply or DM to that post |
| Apply for you | Send after approval, or open the post with the draft ready |
| Follow-ups, inbox tracking | Reply tracking and follow-up reminders |
| WhatsApp "want me to apply?" | WhatsApp "this person is asking for X, send this reply?" |
| Free first 20, then monthly | Free first 20 actions, then flat monthly |

**Design rules:** keep a human in the final step, favor relevance over volume (five tailored replies beat fifty generic ones), and use official APIs where they allow it, with draft-only mode elsewhere.

---

## 3. Onboarding flow, end to end

**Principle:** onboard by intent, not persona. Ask "what do you want to get done?" The output of the flow is a **mission**: goal, who to find, where, what the agent drafts and what it never does.

1. **Intent screen:** free-text plus chips (get customers, validate an idea, grow audience, find a job or internship, find collaborators, something else). An LLM maps text to a mission template.
2. **Short interview:** 3-5 skippable questions, one at a time, paste a URL where possible.
   - Founder or builder: what you're building, who it is for, stage, one competitor.
   - Content writer: niche, goal, three past posts for voice.
   - Student: field, skills, internship, projects, mentors or collaborators.
   - Job seeker: target role and location, optional resume.
   - Anyone: the agent restates your goal and you correct it.
3. **Preview before signup:** run a quick public scan and show 3 real matches with drafts, then ask for signup.
4. **Mission card:** the agent reflects what it understood, the user edits it.
5. **Connect WhatsApp, then channels:** WhatsApp first as the approval inbox, with a web inbox fallback. Connect X, Reddit and LinkedIn only where an official connection exists, otherwise "draft here, post yourself."
6. **Voice and guardrails:** tone, nothing sends without approval, daily cap, quiet hours, blocked topics.
7. **First run and first approval:** the first 5 opportunities within minutes. **Activation = first approved action.**
8. **Daily loop:** WhatsApp morning message with 3-5 opportunities (approve, edit, skip) and a weekly summary. Validators get an evidence-based verdict.
9. **Learning:** after about 10 skips and edits, the agent proposes mission updates.
10. **Paywall:** first 20 approved actions free, a warning at 15, then a flat monthly plan with pause and cancel.

**One engine, different missions**

| Intent | Where it looks | What it drafts | Success metric |
|---|---|---|---|
| Founder or builder | Reddit, X, HN, communities | Replies, DMs, interview requests | Conversations, interviews, verdict |
| Content writer | Niche threads, trending topics | Posts, replies to bigger accounts | Followers, inbound leads |
| Student | Hiring posts, mentor communities | Intros, feedback requests | Internship leads, mentors |
| Job seeker | "We're hiring" posts, hiring managers | Referral and intro messages | Interviews |
| Anyone | Decided from the stated goal | Depends | The goal itself |

**Common drop-off points:** asking for channel access before showing value, too many questions, a required resume upload, and requiring WhatsApp.

**Recommendation:** launch with the founder and builder mission only and add other missions as templates later.

---

## 4. Dashboard pages (full detail in `dashboard-pages.md`)

Priority: P0 = first usable version, P1 = next, P2 = later.

- **Work:** Today (P0, the approval queue and home), Opportunities (P0, list plus detail drawer), Conversations (P0 thin, pipeline board and threads).
- **Setup:** Mission (P0), Sources (P1), Library (P1), Voice (P1).
- **Insights:** Progress (P1), Evidence and Verdict (P1, validator missions only).
- **Agent:** Activity (P1, plain-language log and "why was this blocked"), Memory (P2), Guardrails (P0, minimal).
- **Account:** Channels (P0), Notifications (P1), Billing and usage (P0 minimal), Settings (P1), Help (P2).
- **Operator console (separate internal app):** runs and traces, evals, prompt versions, policies, cost monitor, platform health, user lookup.
- **Suggested P0 cut:** onboarding, Today, Opportunities, Conversations (simple), Mission, Guardrails, Channels, Billing and usage.
- **Edge states to design once:** no mission, no channel connected, first scan running, mission paused, quota used up, channel needs reauth, rate limit hit, agent blocked an action.

---

## 5. Backend split and schemas

**Split:** Express owns user data, missions and history. FastAPI owns the AI jobs and the agent harness layer. Both use Postgres, and each service writes only its own schema.

**`001_app_schema.sql` (Express, schema `app`):** users, auth identities, sessions, onboarding sessions, missions and mission versions, assets, voice profiles, channel connections, guardrails, notification prefs and notifications, approvals, actions, contacts, threads and thread messages, outcomes, interview notes, plans, subscriptions, usage counters, outbox events, audit log and feedback.

**`002_ai_schema.sql` (FastAPI, schema `ai`, needs pgvector):**

- **Harness:** prompt versions, tool registry (marks which tools write externally), policies, agent runs, run steps, tool calls (with idempotency keys), policy evaluations, cost ledger, platform usage, and eval sets, cases, runs and results.
- **Discovery and matching:** sources, signals (public posts stored once and shared across users), asset chunks, opportunities, drafts, digests and mission verdicts.
- **Learning:** feedback events, user memory and interview turns.

**Rules and decisions**

- No foreign keys across schemas. Cross-schema ids are soft references checked in the API layer.
- OAuth tokens are never stored in the database, only a secret-manager reference.
- External writes need an approval and carry an idempotency key so a retry cannot post twice.
- Embedding size is set to 1536 and must match the chosen model.
- Plan prices in the seed data are placeholders.
- Both files parse cleanly. I could not run them on a live Postgres in this environment, so test them on a real instance with pgvector.

---

## 6. Positioning versus Gojiberry

**Gojiberry (from its own site, so marketing)**

- AI outbound for founders and sales teams who already know who they sell to. It tracks buying signals (its site says 15+, a review says 30+), scores prospects against an ideal customer profile and runs personalized outreach, autonomous or reviewed.
- Pro plan is $99 per month for 2 AI agents and up to 1,800 prospects contacted per month, with HubSpot and Pipedrive integrations. Claims Y Combinator backing and 2,000+ teams, which I could not verify.
- A competitor's review says it is LinkedIn only with no email. That conflicts with Gojiberry's own site, and the reviewer is a rival vendor, so treat it as unconfirmed.

**The core difference**

| | Gojiberry | This product |
|---|---|---|
| User starts with | A known ICP and something to sell | An idea, or no customers yet |
| Question answered | "Who should I contact?" | "Is anyone asking for this, and should I build it?" |
| Where it looks | LinkedIn profiles and activity | Public posts where people describe the problem |
| Motion | Outbound to a target list | Reply to people already stating the need |
| Output | Booked demos | Evidence, a verdict, interviews, then customers |
| Buyer | Sales teams, agencies | Solo founders, builders, later other personas |
| Price anchor | $99 per month | Open, test lower for solo pre-revenue users |

**Positioning statement (draft):** For founders who don't have customers yet, [product] finds people already complaining about the problem in public communities, tells you honestly whether the demand is real, and helps you start the conversations. You approve everything on WhatsApp.

**Category:** "demand validation and first-customer finder," not "AI SDR."

**Where it can win:** founders without an ICP list, the honest kill-or-pivot verdict, channels where builders actually are, and a lower price point (hypothesis).

**Where not to compete:** sales teams of five or more, agencies, and volume LinkedIn outreach.

**Risks:** Gojiberry could move earlier in the funnel, public replies can look like spam, platform rules limit automation, and too many personas pull the product into crowded markets (myjobb already covers job seekers).

**Test it:** post the one-line statement in founder communities and see whether people say "I want that" or "I already use Gojiberry."

---

## 7. Business model

All figures below are **assumptions** to test, not market data.

**Core logic.** Validation is episodic: a founder gets a verdict, then builds, kills or pivots. A flat subscription alone would churn right after the verdict. So there are two stages:

1. **Validate:** find demand, collect evidence, get a verdict. This is the free hook, with an optional paid sprint later.
2. **Find customers (ongoing):** once the idea survives, keep finding and replying to people who need it. The subscription pays for this stage.

**Pricing**

| Plan | Price (hypothesis) | Includes |
|---|---|---|
| Free | $0 | 20 approved actions for life, 1 mission, verdict preview |
| Builder | About $19 per month globally, around ₹999 in India | 2 missions, about 150 approved actions per month, full evidence and verdict, WhatsApp digest, pause anytime |
| Studio (add later) | About $49 per month | 5 missions, more actions, multiple voices, export |

- Launch with Free and Builder only. Add Studio once users hit Builder limits.
- Price by approved actions, not prospects contacted. Gojiberry's metric rewards volume, and this one rewards quality and matches the daily caps.
- Offer pause. myjobb's ₹999 per month with cancel-when-hired is the benchmark.

**Rough unit economics (assumption)**

Assume about $1 per million tokens for the scoring model and about $5 blended for drafting.

- Scoring: about 200 posts a day at about 600 tokens is roughly 3.6M tokens a month, so about $3.60.
- Drafting: about 5 drafts a day is roughly 345K tokens a month, so about $1.70.
- Total: about $5 per active user per month, plus WhatsApp fees and hosting.

That is roughly 70% gross margin at $19 but thin at a price near ₹999. The fix is a cheaper pipeline: prefilter posts with keywords and embeddings before any LLM call, and reuse the shared signals table so one scored post serves many users. This is unmeasured, so prototype it first.

**What it takes**

- About 10-15 paying users covers early tool and hosting costs, assuming roughly $150 a month.
- 50 paying users at $19 is about $950 MRR. 200 is about $3,800 MRR. These size the effort and are not forecasts.

**Getting customers**

- Use the product on itself and post the evidence in public.
- A shareable verdict card ("my idea scored 7/10 on demand, backed by 14 real posts") carries the product link.
- Build in public on X and Indie Hackers, and use the Gojiberry comparison angle after launch.

**Concierge bridge for early cash.** Sell a manual validation sprint to 5-10 founders for a flat fee. It earns money, proves people pay and produces real cases to train scoring on. Cap it at about 10 sprints so it does not eat all your time.

**Later expansion:** seats for small teams and agencies, an MCP or API option for developers, and mission templates for other personas once founders work well.

**Metrics:** activation (first approved action), reply rate on sent drafts, week-2 return, free-to-paid conversion and AI cost per active user.

**Gate to proceed:** if at least 3 of the first 10 founders pay for a sprint, the demand is real enough to build the self-serve version. If almost none pay, rework the positioning before building more.

---

## 8. Open decisions and next steps

1. **Concierge sprints first, or straight to free-then-paid self-serve?** This decides the next two weeks.
2. **Which user first:** global indie founders, or Indian small-business founders. That decides the first channels.
3. **Confirm the embedding model** (schema assumes 1536 dimensions) and the payment provider.
4. **Test the schemas** on a real Postgres with pgvector.
5. **Possible next builds:** the FastAPI harness skeleton (run loop, policy check in front of every external action, first relevance-scoring eval set), the Express API routes, the mission schema and onboarding conversation script for the founder mission, landing page copy, and a "[product] vs Gojiberry" page.
6. **If returning to transporters:** pick one of the three segments and run 10 operator conversations before building.

---

## Sources

- Validation and customer discovery: [Customer Finder guides](https://redditthreadfinder.onrender.com/guides), [GummySearch validation interviews](https://gummysearch.com/docs/how-to-land-validation-interviews-yyltq), [Indie Hackers validation takeaways](https://www.indiehackers.com/post/my-takeaways-from-one-week-of-trying-to-validate-my-idea-7e0c7c7b33), [Marketing for Founders memo](https://marketingmemos.beehiiv.com/p/marketing-memo-find-talk-customers)
- Reference products: [myjobb AI](https://myjobb.ai/), [Gojiberry AI](https://gojiberry.ai/), [Gojiberry review by Salesforge (a competitor, so biased)](https://www.salesforge.ai/blog/gojiberry-ai-review)

