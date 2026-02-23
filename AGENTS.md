# AGENTS.md — Master Plan for Bite Coach

## Project Overview

**App:** Bite Coach
**Goal:** Help people lose weight by turning food photos into personalized daily coaching — not just calorie numbers.
**Stack:** Next.js 14 (App Router) + Tailwind CSS · Supabase (PostgreSQL + Auth + Storage) · Google Gemini API (Flash) · Vercel
**Builder Level:** A (Vibe-coder) — No prior dev experience. Wants to understand what's built, not just copy-paste.
**Current Phase:** Phase 1 — Foundation

---

## How I Should Think

1. **Understand Intent First**: Before answering, identify what the builder actually needs. They're learning — explain the "why" behind each step.
2. **Ask If Unsure**: If critical information is missing, ask before proceeding. Don't guess on database schemas, API keys, or security decisions.
3. **Plan Before Coding**: Propose a brief plan, ask for approval, then implement. The builder wants to understand before you build.
4. **Verify After Changes**: Run `npm run dev` or manual checks after each change. Confirm the app still works before moving on.
5. **Explain Trade-offs**: When recommending something, mention alternatives briefly. The builder chose this stack deliberately (see `agent_docs/tech_stack.md`).

---

## Plan → Execute → Verify

1. **Plan:** Outline what you're about to build in 3-5 bullet points. Ask: "Does this plan look good?"
2. **Plan Mode:** If the tool supports Plan/Reflect mode, use it for this step.
3. **Execute:** Implement one feature at a time. Write complete, working code — not pseudocode.
4. **Verify:** After each feature, confirm it works:
   - `npm run dev` — does the app start without errors?
   - Open browser — does the page render correctly?
   - Test the feature — does it do what it should?
   - Fix any issues before moving to the next feature.

---

## Builder Context (Critical)

This builder has **zero prior dev experience**. When writing code or explaining concepts:
- Use plain English comments in every file explaining what each section does
- Explain new concepts the first time they appear (e.g., "middleware is code that runs before every page load")
- Show exact terminal commands — don't assume they know CLI shortcuts
- When something breaks, explain WHY it broke, not just how to fix it
- Never use jargon without defining it first

---

## Context & Memory

- Treat `AGENTS.md` and `agent_docs/` as **living docs** — update them as work progresses.
- Use persistent tool configs (`CLAUDE.md`, `.cursorrules`) for project rules that should be checked every session.
- Update these files as the project scales (new commands, conventions, constraints).
- When resuming work, **always read `AGENTS.md` first** to check current state.

---

## Optional Roles (If Supported)

- **Explorer:** Scan codebase or docs in parallel for relevant info before coding.
- **Builder:** Implement features based on the approved plan.
- **Tester:** Run `npm run dev`, check browser, and report failures.

---

## Testing & Verification

- Follow `agent_docs/testing.md` for the full test checklist.
- Minimum check after every change: `npm run dev` starts without errors + page renders in browser.
- If no automated tests exist yet, do manual browser checks before proceeding.
- **Do not move forward when verification fails.** Fix first, then continue.

---

## Checkpoints & Pre-Commit Hooks

- Create a git commit after completing each Phase milestone.
- Commit message format: `feat: [Phase X] [what was built]` (e.g., `feat: [Phase 1] signup and login pages`)
- Run `npm run build` before pushing to catch build errors early.
- Push to GitHub after each day's work — Vercel auto-deploys from `main`.

---

## Context Files

Refer to these for details (**load only when needed** to save context window):

| File | What's Inside | When to Load |
|------|--------------|--------------|
| `agent_docs/tech_stack.md` | Tech stack, libraries, versions, why each was chosen | When making technology decisions or installing packages |
| `agent_docs/code_patterns.md` | Code style, file structure, naming conventions, code examples | When writing new files or components |
| `agent_docs/project_brief.md` | Project rules, constraints, budget, timeline, builder profile | When making architectural or scope decisions |
| `agent_docs/product_requirements.md` | Full PRD: features, user stories, success metrics, UI/UX | When building features or making product decisions |
| `agent_docs/testing.md` | Test checklist, verification commands, what to check | Before marking any feature as "done" |
| `agent_docs/database_schema.md` | All 3 tables, columns, types, RLS policies, SQL scripts | When writing database queries or API routes |
| `agent_docs/api_routes.md` | All 9 API endpoints, request/response formats, error handling | When building backend routes |
| `agent_docs/gemini_integration.md` | Gemini prompt, validation logic, error handling, photo flow | When building the photo analysis feature |
| `agent_docs/feedback_engine.md` | 7 coaching rules, priority logic, safety constraints | When building the smart feedback feature |

---

## Current State (Update This!)

**Last Updated:** 2026-02-22
**Working On:** Phase 2 — Authentication (ready to test after Supabase setup)
**Recently Completed:** Full MVP code generation — all phases scaffolded, build ✅, lint ✅
**Blocked By:** Supabase project + tables not yet created · .env.local keys not yet filled in

**What was built:**
- Full Next.js 14 project setup (package.json, Tailwind, PostCSS, ESLint)
- lib/: constants.js, calories.js (Mifflin-St Jeor), supabase-client.js, supabase-server.js, gemini.js, feedback.js
- middleware.js (auth + onboarding gate)
- app/: layout, landing page, signup, login, onboarding, dashboard, log-meal, profile
- app/api/: profile/setup, profile (GET/PUT), meals/analyze, meals/log, meals (GET), meals/[id] (DELETE), dashboard, feedback
- components/: Navbar, CalorieRing, MacroBar, MealCard, CoachingNudge, PhotoUpload

**Next steps for the builder:**
1. Create Supabase project at supabase.com
2. Run SQL from agent_docs/database_schema.md (3 tables + RLS + storage bucket)
3. Get keys from Supabase + Google AI Studio → create .env.local
4. Run `npm run dev` → test signup → onboarding → dashboard flow

---

## Roadmap

### Phase 1: Foundation (Day 1)
- [ ] Create accounts (GitHub, Supabase, Vercel, Google AI Studio)
- [ ] Install tools (Node.js, VS Code, Git)
- [ ] Initialize Next.js project with Tailwind
- [ ] Install dependencies (@supabase/supabase-js, @supabase/ssr, @google/generative-ai)
- [ ] Set up .env.local with API keys
- [ ] Create Supabase project + tables (profiles, meals, daily_logs)
- [ ] Enable Row Level Security on all tables
- [ ] Deploy to Vercel (initial deploy)
- [ ] Set up pre-commit: `npm run build` before push

### Phase 2: Authentication (Day 1-2)
- [ ] Set up Supabase Auth client (lib/supabase-client.js, lib/supabase-server.js)
- [ ] Build signup page (/signup)
- [ ] Build login page (/login)
- [ ] Build middleware.js (route protection)
- [ ] Test: signup → login → redirect → logout flow works

### Phase 3: Onboarding + Calculator (Day 2)
- [ ] Build onboarding form (/onboarding) — gender, age, height, weight, goal, activity
- [ ] Implement Mifflin-St Jeor calculator (lib/calories.js)
- [ ] Build POST /api/profile/setup route
- [ ] Display personalized targets + timeline on completion
- [ ] Test: new user can onboard and see calorie/macro targets

### Phase 4: Photo → Calorie Analysis (Day 3)
- [ ] Build photo upload component (camera + file picker)
- [ ] Implement client-side image compression (Canvas API)
- [ ] Set up Gemini API helper (lib/gemini.js)
- [ ] Build POST /api/meals/analyze route with prompt engineering
- [ ] Display results card with food names, calories, macros, edit controls
- [ ] Test: snap photo → see AI estimates in <5 seconds

### Phase 5: Meal Logging + Dashboard (Day 4)
- [ ] Build POST /api/meals/log (save meal + update daily_logs)
- [ ] Build GET /api/dashboard (fetch daily summary)
- [ ] Build dashboard page — calorie ring, macro bars, meal list
- [ ] Add edit controls to meal result card
- [ ] Build DELETE /api/meals/[id] with daily_logs recalculation
- [ ] Test: full flow — photo → results → save → dashboard updates

### Phase 6: Smart Feedback Engine (Day 5)
- [ ] Implement feedback logic (lib/feedback.js) with 7 priority rules
- [ ] Build GET /api/feedback route
- [ ] Create CoachingNudge component
- [ ] Integrate nudges into dashboard (after meal log + on load)
- [ ] Add health safety rules (calorie floors, positive-only language)
- [ ] Test: app gives correct coaching after each meal

### Phase 7: Polish + Profile (Day 6)
- [ ] Build profile/settings page (/profile)
- [ ] Mobile-responsive polish (test on phone browser)
- [ ] Loading states, error messages, empty states
- [ ] Color coding for progress bars (green/yellow/red)
- [ ] Test: app feels complete and polished on mobile

### Phase 8: Deploy + Test + Launch (Day 7)
- [ ] Vercel production deploy with all env vars
- [ ] End-to-end testing (full checklist in agent_docs/testing.md)
- [ ] Test on multiple devices (phone + desktop, Chrome + Safari)
- [ ] Fix all bugs
- [ ] Share with 5-10 friends/family for feedback
- [ ] **Bite Coach is LIVE** 🎉

---

## What NOT To Do

- Do NOT delete files without explicit confirmation from the builder
- Do NOT modify database schemas without explaining the change and having a rollback plan
- Do NOT add features not in the current phase — use the V2 parking lot
- Do NOT skip verification for "simple" changes — always run `npm run dev`
- Do NOT bypass failing builds or errors — fix them before continuing
- Do NOT use deprecated libraries or patterns
- Do NOT install new packages without checking if an existing one already does the job
- Do NOT use TypeScript — this project uses plain JavaScript (builder's choice for simplicity)
- Do NOT store API keys in client-side code — server-side only (except NEXT_PUBLIC_ vars)
- Do NOT skip RLS policies on any Supabase table
- Do NOT use shaming language in coaching nudges (no "bad", "cheat", "guilty", "fat", "failure")
- Do NOT suggest calorie targets below 1,200 (women) or 1,500 (men)