# Testing Strategy — Bite Coach

> How to verify every feature works. Level A approach: manual browser testing + build checks + structured checklists. Automated testing in V2.

---

## Testing Philosophy

**MVP approach:** Manual testing with structured checklists. The builder is solo and learning — automated test suites would add complexity without proportional value at this stage.

**Rule:** Never mark a feature "done" without running the verification loop below.

---

## Unit Tests

**Tool (MVP):** None — manual verification via browser.
**Tool (V2):** Jest + React Testing Library for component tests.
**Tool (V2):** Vitest as a faster alternative if project grows.

### What Would Be Unit Tested (V2)
| Module | What to Test |
|--------|-------------|
| `lib/calories.js` | BMR calculation for male/female, safety floor enforcement, macro splits |
| `lib/feedback.js` | All 7 priority rules, safety checks, banned word absence |
| `lib/gemini.js` | JSON parsing, validation, error handling for bad responses |
| Components | CalorieRing renders correct percentages, MacroBar color thresholds |

### MVP Alternative (Manual Unit Checks)
After building each `lib/` function, test it by adding a temporary console.log in the API route:
```javascript
// Temporary test — remove after verifying
console.log('BMR test (male, 80kg, 175cm, 30yo):', calculateBMR('male', 80, 175, 30));
// Expected: ~1,780. If wildly different, check the formula.
```

---

## E2E Tests

**Tool (MVP):** None — manual browser walkthroughs.
**Tool (V2):** Playwright (recommended for Next.js).
**Why Playwright for V2:** Cross-browser testing, visual regression, network mocking. See `agent_docs/resources.md` for docs.

### What Would Be E2E Tested (V2)
| Flow | Steps |
|------|-------|
| Signup → Dashboard | Create account → complete onboarding → land on dashboard |
| Meal Logging | Upload photo → review results → save → see on dashboard |
| Feedback | Log 2+ meals → see correct coaching nudge |
| Auth Protection | Visit /dashboard without login → redirected to /login |

### MVP Alternative (Manual E2E Walkthroughs)
Follow the Phase-by-Phase Checklist below. Each phase has a complete manual walkthrough.

---

## Manual Checks (Primary Testing Method for MVP)

### Quick Smoke Test (Run After Every Code Change)
```bash
# 1. Does the app start?
npm run dev
# → Open http://localhost:3000 — should load without blank screen

# 2. Check browser console
# → Press F12 → Console tab → NO red errors

# 3. Check terminal
# → Where npm run dev is running → NO red errors
```

### How to Test on Mobile
1. Open Chrome DevTools (F12)
2. Click the "Toggle device toolbar" icon (phone/tablet icon, top-left of DevTools)
3. Select "iPhone 14 Pro" or "Pixel 7" from dropdown
4. OR: Find your computer's local IP (`ipconfig` on Windows / `ifconfig` on Mac) and open `http://YOUR-IP:3000` on your actual phone

---

## Pre-Commit Hooks

### MVP Approach (Manual)
Run these commands before every `git push`:
```bash
npm run build    # Must pass — catches errors dev mode misses
npm run lint     # Must have no errors — warnings OK for now
```

### V2 Approach (Automated with Husky)
```bash
# Install Husky for automated pre-commit hooks
npm install --save-dev husky lint-staged
npx husky init

# .husky/pre-commit
npm run lint
npm run build
```

```json
// package.json addition for V2
{
  "lint-staged": {
    "*.{js,jsx}": ["eslint --fix", "prettier --write"]
  }
}
```

---

## Verification Loop (Required After Every Feature)

```
┌─────────────────────────────────────────┐
│  1. Code Change Complete                 │
│  ↓                                       │
│  2. npm run dev → starts without errors? │
│  ↓ YES                    ↓ NO           │
│  3. Manual browser test   → Fix errors   │
│  ↓ PASS                   ↓ FAIL         │
│  4. npm run build         → Fix issues   │
│  ↓ PASS                   ↓ FAIL         │
│  5. npm run lint           → Fix issues  │
│  ↓ PASS                                  │
│  6. git commit + push                    │
│  ↓                                       │
│  7. Check Vercel deploy                  │
│  ↓ SUCCESS                               │
│  ✅ Feature DONE — move to next          │
└─────────────────────────────────────────┘
```

**Critical Rule:** If verification fails at ANY step, fix the issue BEFORE moving to the next feature. Don't accumulate broken code.

---

## Phase-by-Phase Test Checklist

### Phase 1: Foundation
- [ ] `npm run dev` starts without errors
- [ ] Landing page (/) loads in browser
- [ ] No red errors in browser console (F12 → Console)
- [ ] `npm run build` succeeds
- [ ] Deployed to Vercel — live URL shows landing page
- [ ] `.env.local` has all 4 environment variables set
- [ ] `.env.local` is NOT in git (`git status` should not show it)

### Phase 2: Authentication
**Signup Flow:**
- [ ] /signup page renders with email + password fields
- [ ] Empty fields → shows validation error
- [ ] Invalid email format → shows error
- [ ] Password too short (<6 chars) → shows error
- [ ] Valid signup → creates account + redirects to /onboarding
- [ ] Duplicate email → shows clear error ("Account already exists")

**Login Flow:**
- [ ] /login page renders
- [ ] Correct credentials → redirects to /dashboard (or /onboarding if not completed)
- [ ] Wrong password → shows "Invalid email or password" (not "wrong password" — security)
- [ ] Non-existent email → same generic error (don't reveal if account exists)

**Session & Protection:**
- [ ] Close browser tab → reopen → still logged in
- [ ] Visit /dashboard when logged out → redirected to /login
- [ ] Visit /login when logged in → redirected to /dashboard
- [ ] Logout button → clears session → redirected to /login
- [ ] After logout → /dashboard redirects to /login

### Phase 3: Onboarding + Calculator
**Form:**
- [ ] /onboarding page renders with all fields
- [ ] All fields required — can't submit with empties
- [ ] Gender: male/female selection works
- [ ] Age: validates range (13-120 reasonable)
- [ ] Height: validates (100-250 cm reasonable)
- [ ] Weight: validates (30-300 kg reasonable)
- [ ] Goal weight: must be less than current weight (for weight loss)
- [ ] Activity: all 5 dropdown options work

**Calculator:**
- [ ] Submit → loading state shown
- [ ] Results screen shows: calorie target, protein, carbs, fiber targets
- [ ] Calorie target is reasonable (typically 1,200-2,500 for weight loss)
- [ ] **Safety test (female):** Enter low values → target never below 1,200
- [ ] **Safety test (male):** Enter low values → target never below 1,500
- [ ] Estimated weeks to goal is shown and reasonable
- [ ] Confirm → redirected to /dashboard
- [ ] Profile saved in Supabase (check Table Editor in dashboard)
- [ ] Revisit /onboarding after completion → redirects to /dashboard

### Phase 4: Photo → Calorie Analysis
**Photo Input:**
- [ ] /log-meal page renders
- [ ] "Take Photo" opens camera (test on mobile or mobile emulator)
- [ ] "Upload Photo" opens file picker
- [ ] Photo preview shows after selection
- [ ] Can change photo before analyzing

**AI Analysis:**
- [ ] Tap "Analyze" → loading state ("Analyzing your meal...")
- [ ] Results appear in <5 seconds (most cases)
- [ ] Shows: food name(s), per-item calories, protein, carbs, fiber
- [ ] Shows: totals for the full meal
- [ ] Shows: confidence indicator (high/medium/low)
- [ ] Can edit any value (tap number → change it)
- [ ] Editing updates total correctly
- [ ] Meal type selector works (breakfast/lunch/dinner/snack)

**Error Cases:**
- [ ] **Blurry photo** → "We couldn't analyze this photo. Try a clearer shot."
- [ ] **Non-food photo** (e.g., cat) → "We couldn't find food in this photo."
- [ ] **No internet** → "Connection issue. Check your internet."
- [ ] **Gemini timeout** → "Analysis is taking longer than usual. Try again."

### Phase 5: Meal Logging + Dashboard
**Saving:**
- [ ] "Save to Log" → saves meal to database
- [ ] Redirected to /dashboard after saving
- [ ] Meal appears in today's meal list

**Dashboard Display:**
- [ ] Today's date shown correctly
- [ ] Calorie ring shows correct ratio (consumed / target)
- [ ] Macro bars update correctly for protein, carbs, fiber
- [ ] Color coding: green (≤80%), yellow (80-100%), red (>100%)
- [ ] "Remaining" values are correct (target − consumed)
- [ ] Second meal → totals add correctly

**Delete:**
- [ ] Delete button on meal → confirmation prompt
- [ ] Confirm delete → meal removed → totals recalculate correctly

**Edge Cases:**
- [ ] No meals logged → "No meals yet" empty state with "Log Your First Meal" button
- [ ] Dashboard loads in <2 seconds (check Network tab)

### Phase 6: Smart Feedback Engine
**Rule Testing (log specific meals to trigger each):**
- [ ] Rule 1: Log high-cal meal → "Consider a lighter next meal"
- [ ] Rule 2: Log 2+ low-protein meals → "Protein is running low... Try eggs, paneer..."
- [ ] Rule 3: Log high-carb meals → "Consider swapping rice for salad"
- [ ] Rule 4: Low calories evening → "You've only had X calories... eat a proper dinner"
- [ ] Rule 5: All macros within 10% → "Amazing balance today! 🌟"
- [ ] Rule 6: 1 meal after 2pm → "Don't forget to log lunch and snacks"
- [ ] Rule 7: Default → Warm encouragement with remaining

**Safety:**
- [ ] No banned words appear: "bad", "cheat", "guilty", "fat", "failure"
- [ ] Tone is ALWAYS encouraging, never shaming
- [ ] Specific food suggestions included when relevant
- [ ] Nudge updates after each new meal log
- [ ] Nudge refreshes on dashboard reload

### Phase 7: Polish + Profile
- [ ] /profile page shows current data (weight, targets, activity)
- [ ] Can update weight → targets recalculate
- [ ] Can update activity level → targets recalculate
- [ ] All pages render well on mobile (320px width minimum)
- [ ] All buttons ≥44px tap target (thumb-friendly)
- [ ] No horizontal scrolling on any page
- [ ] Loading states on all async operations
- [ ] Error messages clear and user-friendly
- [ ] Navigation consistent across all pages

### Phase 8: Deploy + Launch
- [ ] Vercel production deploy succeeds
- [ ] All 4 env vars set in Vercel → Settings → Environment Variables
- [ ] Live URL loads without errors
- [ ] **Full flow test on live:** signup → onboard → photo → log → dashboard → nudge
- [ ] Test on iPhone Safari
- [ ] Test on Android Chrome
- [ ] Test on Desktop Chrome
- [ ] Test on Desktop Firefox
- [ ] Shared with 5 people → collected feedback
- [ ] No critical crashes or data loss bugs

---

## Daily Sanity Checks

Run before ending each day's work session:

```
✅ npm run dev — starts clean, no red errors
✅ npm run build — builds without errors
✅ Day's feature tested manually in browser
✅ Tested on mobile (DevTools device toolbar or real phone)
✅ git commit + push done
✅ Vercel deploy succeeded (check dashboard or live URL)
✅ AGENTS.md "Current State" updated
```

---

## Known Limitations (Expected, Not Bugs)

Don't file these as bugs — they're intentional MVP trade-offs:

| Limitation | Why It's OK |
|-----------|-------------|
| Calorie estimates are approximate | Gemini AI estimation — not a nutritionist database |
| Complex mixed dishes may be less accurate | Industry-wide AI limitation. User can edit values. |
| Very dark/blurry photos may fail | Graceful error message shown. User can retake. |
| No offline support | Web app limitation. Progressive Web App in V2. |
| No push notifications | Web limitation. Native app in V2. |
| Single timezone (user's local browser time) | Sufficient for MVP. Server-side tz handling in V2. |
| No data export | Not needed until users request it. V2 feature. |