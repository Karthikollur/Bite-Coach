# API Routes — Bite Coach

> All 9 backend endpoints. Each runs as a serverless function on Vercel.

---

## Route Map

| Method | Route | Purpose | Phase |
|--------|-------|---------|-------|
| POST | `/api/profile/setup` | Save onboarding data, calculate targets | 3 |
| GET | `/api/profile` | Return current user's profile + targets | 3 |
| PUT | `/api/profile` | Update profile, recalculate if needed | 7 |
| POST | `/api/meals/analyze` | Photo → Gemini → calorie estimate | 4 |
| POST | `/api/meals/log` | Save confirmed meal to database | 5 |
| GET | `/api/meals?date=YYYY-MM-DD` | Fetch all meals for a date | 5 |
| DELETE | `/api/meals/[id]` | Delete a meal, recalculate daily totals | 5 |
| GET | `/api/dashboard?date=YYYY-MM-DD` | Daily summary: totals, targets, remaining | 5 |
| GET | `/api/feedback?date=YYYY-MM-DD` | Generate coaching nudge | 6 |

---

## Authentication Pattern (Every Route)

Every API route MUST check authentication first:

```javascript
import { createClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    // ... route logic here (user.id is the authenticated user's ID)
    
  } catch (error) {
    console.error('Route error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
```

---

## POST `/api/profile/setup`

**When called:** User finishes onboarding form.
**What it does:** Saves user data, runs Mifflin-St Jeor, stores calculated targets.

**Request body:**
```json
{
  "gender": "female",
  "age": 29,
  "height_cm": 165,
  "current_weight_kg": 76,
  "goal_weight_kg": 68,
  "activity_level": "sedentary",
  "name": "Priya"
}
```

**Response (201):**
```json
{
  "profile": {
    "daily_calorie_target": 1650,
    "daily_protein_target_g": 124,
    "daily_carbs_target_g": 186,
    "daily_fiber_target_g": 23,
    "estimated_weeks_to_goal": 16
  }
}
```

**Logic:**
1. Validate all required fields
2. Calculate BMR using Mifflin-St Jeor (see lib/calories.js)
3. Apply activity multiplier → TDEE
4. Subtract 500 cal → daily target (with safety floor)
5. Calculate macro targets
6. Calculate weeks to goal
7. Insert into profiles table with onboarding_completed = true
8. Return calculated targets

---

## POST `/api/meals/analyze`

**When called:** User uploads a food photo.
**What it does:** Sends photo to Gemini API, returns structured calorie/macro estimate.

**Request:** FormData with image file
```javascript
const formData = new FormData();
formData.append('image', file); // The photo file
formData.append('meal_type', 'lunch'); // Optional context
```

**Response (200):**
```json
{
  "foods": [
    {
      "name": "Dal Tadka",
      "portion": "1 cup (200g)",
      "calories": 210,
      "protein_g": 12,
      "carbs_g": 28,
      "fiber_g": 6
    },
    {
      "name": "Steamed Rice",
      "portion": "1 cup (180g)",
      "calories": 240,
      "protein_g": 4,
      "carbs_g": 53,
      "fiber_g": 1
    }
  ],
  "total": {
    "calories": 450,
    "protein_g": 16,
    "carbs_g": 81,
    "fiber_g": 7
  },
  "confidence": "high",
  "notes": "Estimated dal with standard tadka preparation including ghee."
}
```

**Logic:**
1. Parse image from FormData
2. Convert to base64
3. Send to Gemini with carefully crafted prompt (see agent_docs/gemini_integration.md)
4. Parse JSON response
5. Validate: is valid JSON? All fields present? Numbers reasonable?
6. If validation fails → retry once with stricter prompt
7. Return structured result

**Error responses:**
- `{ error: "Analysis failed. Try again or use a clearer photo." }` (500)
- `{ error: "Our AI is busy right now. Try again in a few minutes." }` (429)
- `{ error: "We couldn't find food in this photo." }` (400)

---

## POST `/api/meals/log`

**When called:** User taps "Save to Log" after reviewing analysis results.
**What it does:** Saves meal to database + updates daily_logs totals.

**Request body:**
```json
{
  "food_name": "Dal Tadka + Rice",
  "calories": 450,
  "protein_g": 16,
  "carbs_g": 81,
  "fiber_g": 7,
  "meal_type": "lunch",
  "photo_url": "https://xxx.supabase.co/storage/v1/...",
  "ai_original_calories": 450
}
```

**Response (201):**
```json
{
  "meal": { "id": "uuid", "food_name": "Dal Tadka + Rice", "calories": 450, "..." : "..." },
  "daily_totals": { "total_calories": 780, "meals_count": 2, "..." : "..." }
}
```

**Logic:**
1. Validate required fields (food_name, calories)
2. Insert into meals table
3. Upsert daily_logs: if today's row exists → update totals, if not → create with this meal's values
4. Return saved meal + updated daily totals

---

## GET `/api/meals?date=YYYY-MM-DD`

**Response (200):**
```json
{
  "meals": [
    { "id": "uuid", "food_name": "Oats + Banana", "calories": 320, "..." : "..." },
    { "id": "uuid", "food_name": "Dal Tadka + Rice", "calories": 450, "..." : "..." }
  ]
}
```

---

## DELETE `/api/meals/[id]`

**Route file:** `app/api/meals/[id]/route.js`

**Response (200):**
```json
{
  "message": "Meal deleted",
  "daily_totals": { "total_calories": 320, "meals_count": 1, "..." : "..." }
}
```

**Logic:**
1. Verify meal belongs to authenticated user
2. Delete from meals table
3. Recalculate daily_logs totals (subtract deleted meal's values)
4. Return updated totals

---

## GET `/api/dashboard?date=YYYY-MM-DD`

**Response (200):**
```json
{
  "profile": {
    "daily_calorie_target": 1650,
    "daily_protein_target_g": 124,
    "daily_carbs_target_g": 186,
    "daily_fiber_target_g": 23
  },
  "today": {
    "total_calories": 780,
    "total_protein_g": 28,
    "total_carbs_g": 105,
    "total_fiber_g": 9,
    "meals_count": 2,
    "remaining_calories": 870,
    "remaining_protein_g": 96,
    "remaining_carbs_g": 81,
    "remaining_fiber_g": 14
  },
  "meals": [ "..." ],
  "feedback": "Protein is running low today (28g of 124g). Try adding eggs, paneer, or yogurt to your next meal!"
}
```

---

## GET `/api/feedback?date=YYYY-MM-DD`

**Response (200):**
```json
{
  "nudge": "Protein is running low today (28g of 124g). Try adding eggs, paneer, chicken, yogurt, or lentils to your next meal!",
  "priority": 2,
  "type": "protein_low"
}
```

See `agent_docs/feedback_engine.md` for the full priority logic.