# Code Patterns — Bite Coach

> Code style, naming conventions, and patterns to follow. Level A explanations included.

---

## Project Structure

```
bite-coach/
├── app/                          ← Pages + API routes (Next.js App Router)
│   ├── layout.js                  ← Root layout (wraps all pages)
│   ├── page.js                    ← Landing page (/)
│   ├── login/page.js              ← Login page (/login)
│   ├── signup/page.js             ← Signup page (/signup)
│   ├── onboarding/page.js         ← Onboarding form (/onboarding)
│   ├── dashboard/page.js          ← Main dashboard (/dashboard)
│   ├── log-meal/page.js           ← Photo upload + results (/log-meal)
│   ├── profile/page.js            ← Profile settings (/profile)
│   └── api/                       ← Backend API routes (run on server)
│       ├── profile/
│       │   └── route.js            ← GET/POST/PUT profile & targets
│       ├── meals/
│       │   ├── analyze/route.js    ← POST: photo → Gemini → results
│       │   ├── log/route.js        ← POST: save meal to database
│       │   └── route.js            ← GET: fetch meals by date
│       ├── dashboard/route.js      ← GET: daily summary + totals
│       └── feedback/route.js       ← GET: generate coaching nudge
├── components/                    ← Reusable UI building blocks
│   ├── ui/                        ← Generic UI (Button, Card, ProgressBar, Input)
│   ├── CalorieRing.js             ← Circular progress for calories
│   ├── MacroBar.js                ← Horizontal progress bar for macros
│   ├── MealCard.js                ← Individual meal entry display
│   ├── CoachingNudge.js           ← Feedback message card
│   ├── PhotoUpload.js             ← Camera / file upload component
│   ├── OnboardingForm.js          ← Multi-step onboarding form
│   └── Navbar.js                  ← Navigation bar
├── lib/                           ← Shared logic and utilities
│   ├── supabase-client.js         ← Supabase browser client
│   ├── supabase-server.js         ← Supabase server client
│   ├── gemini.js                  ← Gemini API helper
│   ├── calories.js                ← Mifflin-St Jeor calculator
│   ├── feedback.js                ← Coaching nudge logic
│   └── constants.js               ← Activity multipliers, macro ratios
├── middleware.js                  ← Auth check: redirect if not logged in
├── .env.local                     ← Secret keys (NEVER in Git)
├── AGENTS.md                      ← Master plan (this system)
├── CLAUDE.md                      ← Claude tool config
└── agent_docs/                    ← Detailed documentation files
```

### File Placement Rules
- **New page?** → Create `app/[page-name]/page.js`
- **New API endpoint?** → Create `app/api/[endpoint]/route.js`
- **New reusable UI piece?** → Create `components/[ComponentName].js`
- **New shared logic?** → Create `lib/[name].js`
- **New constant/config value?** → Add to `lib/constants.js`

---

## Naming Conventions

| Thing | Convention | Example |
|-------|-----------|---------|
| Page files | `page.js` (lowercase, inside named folder) | `app/dashboard/page.js` |
| API route files | `route.js` (lowercase, inside named folder) | `app/api/meals/route.js` |
| Components | PascalCase | `CalorieRing.js`, `MealCard.js` |
| Lib/utility files | camelCase | `supabase-client.js`, `calories.js` |
| Variables | camelCase | `dailyCalorieTarget`, `totalProtein` |
| Constants | UPPER_SNAKE_CASE | `ACTIVITY_MULTIPLIERS`, `MIN_CALORIES_FEMALE` |
| Database columns | snake_case | `daily_calorie_target`, `goal_weight_kg` |
| CSS classes | Tailwind utility classes | `className="bg-green-500 text-white p-4"` |
| Git branches | kebab-case | `feature/photo-upload`, `fix/login-redirect` |
| Commit messages | `type: description` | `feat: add onboarding form` |

---

## Component Pattern

Every React component follows this structure:

```javascript
// components/MealCard.js

// 'use client' tells Next.js this component runs in the browser
// (needed if you use useState, useEffect, onClick, etc.)
'use client';

import { useState } from 'react';

// What is this component?
// A card that displays one logged meal with its calories and macros.
// Used on the dashboard page in the meal list.

export default function MealCard({ meal, onDelete }) {
  const [isDeleting, setIsDeleting] = useState(false);

  // Handle meal deletion
  // Why: User needs to remove incorrectly logged meals
  async function handleDelete() {
    setIsDeleting(true);
    try {
      await onDelete(meal.id);
    } catch (error) {
      console.error('Failed to delete meal:', error);
      setIsDeleting(false);
    }
  }

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-gray-900">{meal.food_name}</h3>
          <p className="text-sm text-gray-500">{meal.meal_type}</p>
        </div>
        <span className="text-lg font-bold text-green-600">
          {meal.calories} cal
        </span>
      </div>

      {/* Macro breakdown */}
      <div className="flex gap-4 mt-2 text-sm text-gray-600">
        <span>P: {meal.protein_g}g</span>
        <span>C: {meal.carbs_g}g</span>
        <span>F: {meal.fiber_g}g</span>
      </div>

      {/* Delete button */}
      <button
        onClick={handleDelete}
        disabled={isDeleting}
        className="mt-2 text-sm text-red-500 hover:text-red-700"
      >
        {isDeleting ? 'Removing...' : 'Remove'}
      </button>
    </div>
  );
}
```

### Key Rules
- `'use client'` at top if the component uses hooks (useState, useEffect) or event handlers (onClick)
- Export as `default function ComponentName`
- Add a comment block explaining WHAT the component is and WHERE it's used
- Add comments on non-obvious logic explaining WHY

---

## API Route Pattern

Every API route follows this structure:

```javascript
// app/api/meals/log/route.js

import { createClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

// POST /api/meals/log
// What: Saves a confirmed meal to the database and updates daily totals.
// When: User taps "Save to Log" after reviewing AI analysis results.
export async function POST(request) {
  try {
    // 1. Get the authenticated user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // 2. Parse the request body
    const body = await request.json();
    const { food_name, calories, protein_g, carbs_g, fiber_g, meal_type, photo_url, ai_original_calories } = body;

    // 3. Validate required fields
    if (!food_name || !calories) {
      return NextResponse.json(
        { error: 'Food name and calories are required' },
        { status: 400 }
      );
    }

    // 4. Save the meal
    const { data: meal, error: mealError } = await supabase
      .from('meals')
      .insert({
        user_id: user.id,
        food_name,
        calories,
        protein_g: protein_g || 0,
        carbs_g: carbs_g || 0,
        fiber_g: fiber_g || 0,
        meal_type: meal_type || 'snack',
        photo_url,
        ai_original_calories,
        was_edited: ai_original_calories !== calories,
      })
      .select()
      .single();

    if (mealError) throw mealError;

    // 5. Update daily_logs (upsert = create if doesn't exist, update if it does)
    // ... (daily log update logic here)

    // 6. Return success
    return NextResponse.json({ meal }, { status: 201 });

  } catch (error) {
    console.error('POST /api/meals/log error:', error);
    return NextResponse.json(
      { error: 'Failed to save meal. Please try again.' },
      { status: 500 }
    );
  }
}
```

### Key Rules
- Every route wrapped in try/catch
- Always check authentication first
- Validate inputs before database operations
- Return user-friendly error messages (not raw errors)
- Log errors to console for debugging
- Use proper HTTP status codes: 200 (ok), 201 (created), 400 (bad input), 401 (not logged in), 500 (server error)

---

## Data Flow Pattern

```
User Action → Frontend Component → fetch('/api/...') → API Route → Supabase → Response → Update UI
```

Example: Logging a meal
```
User taps "Save" → MealCard onClick → fetch POST /api/meals/log → route.js inserts to DB → returns meal → Dashboard updates
```

### Fetch Pattern (Frontend → API)
```javascript
// How to call your own API routes from frontend components
async function saveMeal(mealData) {
  const response = await fetch('/api/meals/log', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(mealData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to save meal');
  }

  return response.json();
}
```

---

## Error Handling Pattern

### Frontend: Every async operation gets loading + error states
```javascript
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);

async function handleSubmit() {
  setLoading(true);
  setError(null);
  try {
    await doSomething();
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
}
```

### User-Facing Error Messages
| Internal Error | User Sees |
|---------------|-----------|
| Gemini API timeout | "Analysis is taking longer than usual. Please try again." |
| Invalid JSON from Gemini | "We couldn't analyze this photo. Try a clearer shot." |
| Rate limit hit | "Our AI is busy right now. Try again in a few minutes." |
| Supabase write error | "Couldn't save. Please try again." |
| Not food photo | "We couldn't find food in this photo. Try taking a photo of your meal." |
| Network error | "Connection issue. Check your internet and try again." |

---

## Comment Style

```javascript
// ✅ GOOD: Explain WHY, not WHAT
// Calculate BMR using Mifflin-St Jeor — the industry standard formula.
// We use this instead of Harris-Benedict because it's more accurate for modern populations.
const bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * age) + (gender === 'male' ? 5 : -161);

// ❌ BAD: Just restating the code
// Multiply 10 by weight
const bmr = 10 * weightKg;
```

---

## Import Aliases

Next.js is configured with `@/` pointing to project root:
```javascript
// Instead of: import { createClient } from '../../../lib/supabase-client'
// Use:
import { createClient } from '@/lib/supabase-client';
import MealCard from '@/components/MealCard';
```