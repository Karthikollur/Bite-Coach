# Project Brief (Persistent) — Bite Coach

> Persistent project rules, conventions, and workflow expectations. This is the "constitution" of the project — check it before making any architectural or scope decisions. Keep this updated as the project scales.

---

## Product Vision

**One-liner:** Helps people lose weight by turning food photos into personalized daily coaching — not just calorie numbers.

**Core Insight:** 55% of people quit calorie tracking apps within 2 weeks. The #1 reason? Tracking feels like homework with no guidance. Bite Coach replaces the homework with a photo and replaces the silence with a coach.

**The Differentiator:** Most apps stop at "you ate 450 calories." Bite Coach says "Protein is low — try adding eggs, paneer, or lentils to your next meal!" Active coaching, not passive tracking.

---

## Builder Profile

- **Experience Level:** Level A (Vibe-coder) — No prior dev experience
- **Working Style:** Claude Pro writes all code. Builder reviews, tests, learns, and ships.
- **Learning Goal:** Understand what's built, not just copy-paste. Wants to become a builder.
- **Top Concerns:** Wrong tech choices, security holes, getting stuck, breaking things accidentally

### How AI Agents Should Help This Builder
- Explain concepts in plain English with analogies (e.g., "middleware is like a security guard at a door")
- Add "why" comments in code, not just "what" comments
- Show exact terminal commands — never assume CLI knowledge
- When something breaks, explain WHY it broke before showing the fix
- Use encouraging tone — celebrate small wins, don't gloss over them
- Default to the simplest approach. Introduce complexity only when justified.

---

## Coding Conventions

### Language & Framework
- **JavaScript only** (NOT TypeScript) — chosen for simplicity at Level A
- **ES2022+ features OK:** async/await, optional chaining (`?.`), nullish coalescing (`??`)
- **Next.js 14 App Router** — file-based routing, server/client components, built-in API routes
- **Tailwind CSS only** — no separate CSS files, no CSS-in-JS, no styled-components

### File Naming
| Type | Convention | Example |
|------|-----------|---------|
| Pages | `page.js` in named folder | `app/dashboard/page.js` |
| API routes | `route.js` in named folder | `app/api/meals/route.js` |
| Components | PascalCase | `CalorieRing.js`, `MealCard.js` |
| Utilities | camelCase / kebab-case | `supabase-client.js`, `calories.js` |
| Constants | camelCase file, UPPER_SNAKE values | `constants.js` → `MIN_CALORIES_FEMALE` |

### Code Naming
| Type | Convention | Example |
|------|-----------|---------|
| Variables | camelCase | `dailyCalorieTarget` |
| Functions | camelCase | `calculateBMR()` |
| Components | PascalCase | `<CalorieRing />` |
| Constants | UPPER_SNAKE_CASE | `ACTIVITY_MULTIPLIERS` |
| DB columns | snake_case | `daily_calorie_target` |

### Architecture Rules
- Pages in `app/[name]/page.js` — one page per URL
- API routes in `app/api/[name]/route.js` — server-side only
- Reusable UI in `components/` — PascalCase filenames
- Shared logic in `lib/` — pure functions, no UI
- Constants in `lib/constants.js` — single source of truth for magic numbers
- `'use client'` ONLY when the component needs hooks (useState, useEffect) or event handlers (onClick)
- Import alias: `@/` = project root (e.g., `import { createClient } from '@/lib/supabase-client'`)

### Comment Style
```javascript
// ✅ GOOD: Explain WHY
// Calculate BMR using Mifflin-St Jeor — more accurate for modern populations than Harris-Benedict.
const bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * age) + (gender === 'male' ? 5 : -161);

// ❌ BAD: Just restate the code
// Multiply 10 by weight
const bmr = 10 * weightKg;
```

---

## Quality Gates

### Before Marking Any Feature "Done"
1. `npm run dev` — app starts without console errors
2. Manual browser test — feature works as expected (see `agent_docs/testing.md`)
3. `npm run build` — build succeeds with no errors (warnings OK for now)
4. `npm run lint` — no linting errors

### Before Every Git Push
```bash
npm run build       # Catches errors that dev mode misses
npm run lint        # Catches code issues
# Quick manual test of the feature in browser
git add .
git commit -m "feat: [description]"
git push origin main
# Vercel auto-deploys → check live site
```

### Pre-Commit Discipline
- MVP approach: manual `npm run build` before push
- V2 upgrade: add Husky + lint-staged for automated pre-commit hooks
- Never push code that fails `npm run build`

### Code Review (Solo Builder)
Since this is a solo project, "code review" means:
1. Read through the code Claude generated — do you understand what each part does?
2. If something is unclear, ask Claude to explain it
3. Test the feature manually in the browser
4. Check the browser console (F12) for any warnings or errors

---

## Key Commands

| Command | What It Does | When to Run |
|---------|-------------|-------------|
| `npm run dev` | Start local development server at localhost:3000 | Every coding session |
| `npm run build` | Build for production (catches more errors) | Before every git push |
| `npm run lint` | Check code for issues | Before every git push |
| `npm start` | Run production build locally | Only for final testing |
| `git add . && git commit -m "feat: ..."` | Save your work | After each feature |
| `git push origin main` | Deploy to Vercel | After each feature |

---

## Budget Constraints

| Constraint | Detail |
|-----------|--------|
| Monthly spend | **$0** beyond existing Claude Pro ($20/mo) + Google Pro subscriptions |
| No paid APIs | Until 100+ daily active users |
| No paid services | All tools must have free tiers that cover MVP needs |
| Domain name | Optional ($10-15/yr). Use `bite-coach.vercel.app` for launch. |

### Cost Watchlist
| Service | Free Limit | Danger Zone | Action If Hit |
|---------|-----------|-------------|---------------|
| Gemini API | 1,000 req/day | >800 req/day consistently | Monitor Google AI Studio dashboard |
| Supabase DB | 500MB | >400MB | Audit stored data, consider photo cleanup |
| Supabase Storage | 1GB | >800MB | Compress photos more aggressively |
| Vercel Bandwidth | 100GB/mo | >80GB/mo | Optimize image sizes, add caching |

---

## Timeline

**7-Day Sprint:**
| Day | Focus | Deliverable | Phase |
|-----|-------|-------------|-------|
| 1 | Environment + Auth | Working signup/login flow | 1-2 |
| 2 | Onboarding + Calculator | Personalized calorie targets | 3 |
| 3 | Photo + Gemini | AI food analysis working | 4 |
| 4 | Meal Logging + Dashboard | Full tracking flow | 5 |
| 5 | Feedback Engine | Smart coaching nudges | 6 |
| 6 | Polish + Profile | Mobile-ready, polished UI | 7 |
| 7 | Deploy + Test + Launch | Live app, tested, shared | 8 |

---

## Scope Management

### In Scope (MVP — Build This)
- Smart onboarding with Mifflin-St Jeor calorie calculator
- Photo → calorie + macro estimation (Gemini Flash)
- Daily dashboard with calorie ring + macro bars
- Smart coaching nudges (7 priority rules)
- Email/password authentication (Supabase Auth)
- Profile page with weight update + target recalculation

### Out of Scope (V2 Parking Lot — Don't Build Yet)
Barcode scanning · Weekly/monthly reports · Meal re-logging · Water tracking · Social features · Wearable integration · Native mobile app · Dark mode · Multi-language · Micronutrient tracking · Meal planning · Human nutritionist review

### Scope Creep Protocol
If the builder or AI suggests a feature not in the MVP list:
1. Check if it's in the V2 list → "Great idea — parking that for V2."
2. Check if it blocks the core flow → If yes, discuss priority.
3. Otherwise → Decline and stay focused on the current phase.

**Core Priority Rule:** The Photo → Coaching flow must work perfectly. Everything else is secondary to: (1) Take photo → get estimate, (2) Save to log → see dashboard, (3) Get coaching nudge → know what to fix.

---

## Security Requirements (Non-Negotiable)

These are NOT optional. Every feature must follow all of these:

1. **Row Level Security (RLS)** on ALL Supabase tables — users can only access their own data
2. **API keys server-side only** — `GEMINI_API_KEY` and `SUPABASE_SERVICE_ROLE_KEY` never in browser code
3. **Auth check on every API route** — verify user is logged in before any database operation
4. **Private photo storage** — Supabase Storage bucket with owner-only access policies
5. **HTTPS everywhere** — Vercel provides this automatically
6. **No health data sharing** — never send user data to third parties (Gemini analysis doesn't store data)
7. **`.env.local` in `.gitignore`** — secrets never committed to Git

---

## Health & Safety Rules (Non-Negotiable)

1. **NEVER** suggest eating below 1,200 cal/day (women) or 1,500 cal/day (men)
2. **NEVER** use words: "bad", "cheat", "guilty", "fat", "failure" in coaching nudges
3. **ALWAYS** frame feedback as "here's what you can do" not "here's what you did wrong"
4. **ALWAYS** label calorie estimates as "approximate" or "estimated"
5. **ALWAYS** include health disclaimer: "This app provides estimates. Consult a healthcare professional for personalized nutrition advice."
6. **IF** user logs <1,000 cal/day for 3+ consecutive days → show professional consultation warning
7. **Let users edit** AI estimates — they know their food better than any AI

---

## Git Workflow

### Commit Message Format
```
type: short description of what changed
```

| Type | When to Use | Example |
|------|-----------|---------|
| `feat` | New feature | `feat: add onboarding form with calorie calculator` |
| `fix` | Bug fix | `fix: correct protein calculation rounding error` |
| `style` | UI/visual change | `style: improve dashboard mobile layout` |
| `refactor` | Code cleanup (no behavior change) | `refactor: extract feedback logic to lib/feedback.js` |
| `docs` | Documentation | `docs: update AGENTS.md with Phase 3 status` |

### Branch Strategy (MVP)
- Work directly on `main` — solo builder, no merge conflicts
- V2: Switch to `feature/` branches when collaborating with others

---

## Update Cadence

### When to Update This Brief
- After completing each Phase → update conventions if new patterns emerged
- After hitting a limitation → add it to constraints
- After a significant architectural decision → document it here
- After launch → revise timeline for V2 planning

### When to Update AGENTS.md
- **Every session:** Update "Current State" section (working on, recently completed, blockers)
- **Every Phase completion:** Check off roadmap items, move to next phase
- **When blocked:** Document the blocker so the next session can pick up instantly