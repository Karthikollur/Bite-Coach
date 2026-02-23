# Product Requirements — Bite Coach

> Core requirements, user stories, acceptance criteria, and success metrics. Extracted from PRD v2.0 (February 21, 2026). This is the authoritative source for "what to build."

---

## Product Identity

| Field | Value |
|-------|-------|
| **Name** | Bite Coach |
| **One-liner** | Helps people lose weight by turning food photos into personalized daily coaching — not just calorie numbers. |
| **Platform** | Web app (mobile-responsive). Native mobile app in V2. |
| **Launch Goal** | Learn to build a working MVP, learn deployment, ship a real product. |
| **Differentiator** | Active coaching nudges after every meal — not passive number tracking. |

---

## Target User Persona: "Priya"

**Demographics:** 25-40 year old working professional, desk job, gained 5-15kg over 1-3 years.
**Tech level:** Moderately tech-savvy (uses smartphone apps daily, not a developer).
**Diet history:** Has tried and quit tracking apps 2-3 times. Eats home-cooked and ethnic meals (Indian, Asian) that are hard to find in food databases.

### Primary User Story
> "As Priya, I want to take a photo of my food and get instant calorie + macro estimates with personalized coaching that tells me what to fix — so I can lose weight without the friction of manual food logging."

### User Pains (What We're Solving)
1. Searching food databases feels like homework — kills motivation
2. Guessing portion sizes makes tracking feel pointless and inaccurate
3. No guidance on what to FIX — just numbers with no action items
4. Hidden pricing / surprise paywalls after investing time in onboarding
5. Tracking feels like a chore, not a habit — no positive reinforcement

### User Needs (What We're Delivering)
1. Snap a photo → instant calorie + macro breakdown (no searching)
2. Real-time daily tracking status at a glance (not buried in menus)
3. Actionable coaching: what to eat next, what to adjust
4. Realistic timeline for reaching goal weight (hope, not just numbers)
5. Encouraging, supportive tone — a friend, not a clinical tool

---

## User Journey (4 Phases)

### Phase A: Discovery
**Trigger:** Priya sees the app shared by a friend or on social media.
**Action:** Opens the web app on her phone.
**Outcome:** Sees a clean landing page explaining the value prop. Taps "Get Started."

### Phase B: Onboarding (2 minutes)
**Action:** Enters gender, age, height, weight, goal weight, activity level.
**Outcome:** Sees personalized daily targets (calories, protein, carbs, fiber) and estimated weeks to goal. Feels "this is made for me."

### Phase C: Core Loop (Daily)
**Action:** Takes a photo of her meal → reviews AI estimate → adjusts if needed → saves to log.
**Outcome:** Dashboard updates with progress. Coaching nudge tells her what to do next.

### Phase D: Success (Ongoing)
**Action:** Checks dashboard daily. Gets positive reinforcement for on-track days. Gets specific suggestions for off-track days.
**Outcome:** Develops a sustainable eating pattern. Reaches goal weight over weeks/months.

---

## Must-Have Features (MVP — P0 Critical)

### Feature 1: Smart Onboarding + Calorie Calculator

**User Story:** "As a new user, I want to enter my details and get personalized daily targets so I know exactly what to aim for."

**Implementation:** Mifflin-St Jeor equation → TDEE → 500 cal/day deficit → macro split.

**Acceptance Criteria:**
- [ ] Form collects: gender, age, height (cm), weight (kg), goal weight (kg), activity level
- [ ] Activity levels: sedentary (1.2), light (1.375), moderate (1.55), active (1.725), very active (1.9)
- [ ] Calculates BMR using Mifflin-St Jeor:
  - Male: `(10 × weight_kg) + (6.25 × height_cm) − (5 × age) + 5`
  - Female: `(10 × weight_kg) + (6.25 × height_cm) − (5 × age) − 161`
- [ ] TDEE = BMR × activity multiplier
- [ ] Daily target = TDEE − 500 (for ~0.5kg/week loss)
- [ ] Safety floors enforced: 1,200 cal/day (women), 1,500 cal/day (men)
- [ ] Macro targets: 30% protein, 45% carbs, 14g fiber per 1,000 cal
- [ ] Displays estimated weeks to goal: `(current_weight - goal_weight) / 0.5`
- [ ] Saves all calculated data to `profiles` table
- [ ] Sets `onboarding_completed = true`
- [ ] Redirects to /dashboard on completion

### Feature 2: Photo → Calorie + Macro Estimation

**User Story:** "As a user, I want to take a photo of my food and instantly see calorie and macro estimates."

**Implementation:** Client-side compression → POST to API → Gemini Flash analysis → structured JSON response.

**Acceptance Criteria:**
- [ ] Camera capture (mobile) + file gallery upload (all devices)
- [ ] Client-side compression: max 1024px width, 80% JPEG quality (~200KB output)
- [ ] Gemini Flash API analysis completes in <5 seconds
- [ ] Returns per food item: name, portion estimate, calories, protein (g), carbs (g), fiber (g)
- [ ] Returns totals: combined calories, protein, carbs, fiber
- [ ] Returns confidence level: high / medium / low
- [ ] User can edit ANY value before saving (calories, macros, food name)
- [ ] Handles ethnic/mixed dishes with cuisine-specific prompting
- [ ] Handles errors gracefully: blurry photos, non-food photos, API timeouts
- [ ] Retry logic: on invalid JSON, retry once with stricter prompt

### Feature 3: Daily Dashboard

**User Story:** "As a user, I want to see my daily progress at a glance so I know if I'm on track."

**Implementation:** Fetch profile targets + daily_logs + meals → render visual progress.

**Acceptance Criteria:**
- [ ] Calorie ring: circular progress showing consumed vs target
- [ ] Macro bars: horizontal progress bars for protein, carbs, fiber
- [ ] Color coding: green (≤80%), yellow (80-100%), red (>100% of target)
- [ ] Remaining display: calories and macros left for the day
- [ ] Meal list: all logged meals with name, calories, time
- [ ] Delete meal: with confirmation → auto-recalculates daily totals
- [ ] Correct date displayed
- [ ] Quick "Log a Meal" button prominently placed
- [ ] Loads in <2 seconds

### Feature 4: Smart Daily Feedback / Coaching Nudges ★ DIFFERENTIATOR

**User Story:** "As a user, I want the app to tell me what to fix so I can make better food choices."

**Implementation:** 7 priority-ranked rules in `lib/feedback.js` (see `agent_docs/feedback_engine.md`).

**Acceptance Criteria:**
- [ ] Nudge appears on dashboard after every meal log
- [ ] Nudge refreshes on dashboard load
- [ ] 7 rules checked in priority order — show first match only:
  1. Calories over target (+200) → suggest lighter next meal
  2. Protein below 50% → suggest specific high-protein foods
  3. Carbs over target (+30g) → suggest swaps (rice → salad)
  4. Under-eating after 7pm → warn about metabolism
  5. Perfect balance (all within 10%) → celebrate 🌟
  6. Low logging (≤1 meal after 2pm) → remind to log
  7. Default → warm encouragement with remaining targets
- [ ] Food suggestions are culturally relevant: eggs, paneer, lentils, yogurt, chicken
- [ ] Tone is ALWAYS encouraging — never shaming
- [ ] No banned words: "bad", "cheat", "guilty", "fat", "failure"
- [ ] Safety: never suggests below 1,200/1,500 cal floor
- [ ] Multi-day: warn if <1,000 cal/day for 3+ consecutive days

### Feature 5: Authentication

**User Story:** "As a user, I want my data to persist across sessions so I don't lose my progress."

**Implementation:** Supabase Auth (email/password) + middleware for route protection.

**Acceptance Criteria:**
- [ ] Email + password signup
- [ ] Email + password login
- [ ] Session persistence via cookies (survives browser close)
- [ ] Route protection: unauthenticated → redirect to /login
- [ ] Onboarding check: authenticated but not onboarded → redirect to /onboarding
- [ ] Logout clears session and redirects to /login

---

## Nice-to-Have Features (V2 — Post-MVP)

| Feature | Build Trigger |
|---------|--------------|
| Barcode scanning | Users request it OR >30% meals are packaged foods |
| Weekly/monthly trend reports | Users retained >7 days want trend data |
| Meal history re-logging ("I had this again") | Users log same meals repeatedly |
| Water tracking | User feedback requests it |
| Social / accountability features | After 500+ users, test group challenges |
| Wearable integration (Apple Health, Google Fit) | After native mobile app |
| Native mobile app (iOS/Android) | Web MVP validated with 100+ active users |
| Dark mode | User feedback requests it |
| Multi-language support | International user demand |

---

## Explicitly NOT in MVP

Do NOT build these. If an AI agent suggests them, respond: "Parking for V2."

- Barcode scanning
- Weekly/monthly trend reports
- Meal history / re-logging / favorites
- Water tracking
- Social / accountability features
- Wearable integration
- Native mobile app
- Dark mode
- Multi-language support
- Micronutrient tracking (vitamins, minerals)
- Meal planning / recipe suggestions
- Human nutritionist review
- In-app purchases / payment processing
- Push notifications (web limitation)
- Offline support

---

## Success Metrics

### Launch Phase (First 30 Days)

| Metric | Target | How to Measure |
|--------|--------|---------------|
| Meals logged per day | 2+ per active user | Count meals per user per day in `meals` table |
| Core flow completion | 100% | Signup → onboard → first meal → dashboard works |
| AI estimate correction rate | <30% of meals edited | `was_edited = true` percentage in `meals` table |
| Critical bugs from testers | 0 | Manual testing with 5-10 friends/family |
| Photo analysis speed | <5 seconds | Measure Gemini API response time |
| Dashboard load time | <2 seconds | Browser DevTools Network tab |

### Growth Phase (Months 2-3)

| Metric | Target | How to Measure |
|--------|--------|---------------|
| Total signups | 50-100 | Count rows in `profiles` table |
| 7-day retention | 40%+ | Users active on day 7 / users signed up |
| Daily active users | 20+ | Unique user_ids with meals logged today |
| Nudge engagement | 50%+ | Users who log another meal after seeing nudge |

---

## UI/UX Requirements

### Design Principles
1. **Clarity over decoration** — Scannable in 2 seconds. White space is a feature.
2. **Progress feels rewarding** — Filling bars, green checkmarks, subtle animations.
3. **Words matter** — Warm copy ("Great job!" not "Target met"). Friend tone.
4. **Food-inspired palette** — Fresh greens, warm accents. Farmers market, not hospital.
5. **Phone-first layout** — One-handed use, big tap targets (44px min), photo capture one tap away.

### Design Vibe Words
Fresh · Clean · Encouraging · Warm · Simple · Approachable · Trustworthy

### Color System
| Role | Color | Hex (approximate) |
|------|-------|-------------------|
| Primary / Success | Fresh green | `#22c55e` (Tailwind `green-500`) |
| Accent / Warning | Warm amber | `#f59e0b` (Tailwind `amber-500`) |
| Danger / Over | Red | `#ef4444` (Tailwind `red-500`) |
| Background | Off-white | `#f9fafb` (Tailwind `gray-50`) |
| Text primary | Dark gray | `#111827` (Tailwind `gray-900`) |
| Text secondary | Medium gray | `#6b7280` (Tailwind `gray-500`) |
| Card background | White | `#ffffff` |

### Mobile-First Responsive Breakpoints
| Screen | Tailwind Prefix | Min Width |
|--------|----------------|-----------|
| Phone (default) | None | 0px |
| Tablet | `md:` | 768px |
| Desktop | `lg:` | 1024px |

---

## Constraints Summary

| Constraint | Detail |
|-----------|--------|
| Budget | $0/month for MVP |
| Timeline | 7-day sprint |
| Performance | Photo analysis <5s, dashboard load <2s |
| Scalability | Free tier supports <100 users |
| Security | RLS, server-only secrets, private storage, HTTPS |
| Health/Safety | Calorie floors, no shaming language, estimates labeled approximate |
| Platform | Web-first (mobile-responsive). Native app in V2. |

---

## Monetization Roadmap (Post-MVP)

| Phase | Trigger | Model |
|-------|---------|-------|
| Phase 1 (Launch) | Day 1 | **100% Free** — grow first, monetize later |
| Phase 2 (Traction) | 500+ users | **Freemium** — Free (3 scans/day) + Premium ($4.99-$7.99/mo) |
| Phase 3 (Scale) | 5,000+ users | Affiliate partnerships, B2B white-label, premium coaching |