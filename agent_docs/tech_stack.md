# Tech Stack & Tools — Bite Coach

> Every library, version, setup command, example pattern, and rationale. Extracted from TDD v1.0.

---

## Stack Summary

| Layer | Tool | Version | Setup Command | Cost |
|-------|------|---------|---------------|------|
| Frontend | Next.js (App Router) | 14.x | `npx create-next-app@latest bite-coach` | Free |
| Styling | Tailwind CSS | 3.x | Included in create-next-app | Free |
| AI / Food Recognition | Google Gemini API (Flash) | gemini-2.0-flash | `npm install @google/generative-ai` | Free (1,000 req/day) |
| Database | Supabase (PostgreSQL) | Latest | `npm install @supabase/supabase-js` | Free (500MB, 50K MAU) |
| Auth | Supabase Auth | Latest | `npm install @supabase/ssr` | Free |
| Storage | Supabase Storage | Latest | Included with Supabase | Free (1GB) |
| Deployment | Vercel | Latest | Connect GitHub repo | Free (100GB bandwidth) |
| Language | JavaScript (ES2022+) | — | — | — |
| Package Manager | npm | 9.x+ | Included with Node.js | — |
| Version Control | Git + GitHub | — | `git init` | Free |
| Calorie Formula | Mifflin-St Jeor | — | Pure code (lib/calories.js) | Free |

---

## Project Initialization (Exact Commands)
```bash
# Step 1: Create the project
npx create-next-app@latest bite-coach
# When prompted:
#   ✗ TypeScript?          → No
#   ✓ ESLint?              → Yes
#   ✓ Tailwind CSS?        → Yes
#   ✗ src/ directory?      → No
#   ✓ App Router?          → Yes
#   ✓ Turbopack?           → Yes
#   ✗ Custom import alias? → No

# Step 2: Enter the project folder
cd bite-coach

# Step 3: Install project dependencies
npm install @supabase/supabase-js @supabase/ssr @google/generative-ai

# Step 4: Create environment file
touch .env.local
# Add these 4 keys (get values from Supabase + Google AI Studio):
# NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
# SUPABASE_SERVICE_ROLE_KEY=eyJ...
# GEMINI_API_KEY=AI...

# Step 5: Start dev server
npm run dev
# Open http://localhost:3000 — you should see the Next.js welcome page

# Step 6: Initialize Git + push to GitHub
git init
git add .
git commit -m "feat: initial project setup"
git remote add origin https://github.com/YOUR-USERNAME/bite-coach.git
git push -u origin main
```

---

## Frontend: Next.js 14 (App Router) + Tailwind CSS

### What is Next.js?
A framework built on React. React lets you build interactive pages with reusable "components" (like LEGO blocks). Next.js adds page routing, server-side rendering, and API routes on top — so you never need a separate backend server.

### Why Next.js?
- **Built-in API routes** = no separate backend server needed
- **File-based routing** = each file in `/app` becomes a URL automatically
- **Built by Vercel** = deploy with one click, zero config
- **Largest React community** = most tutorials, Stack Overflow answers, AI training data
- **Claude excels at writing Next.js code**

### Why Tailwind CSS?
- Style with utility classes directly on elements — no separate CSS files
- Claude generates complete Tailwind layouts instantly
- Fastest way to style without deep CSS knowledge
- Mobile-first responsive design built in (`sm:`, `md:`, `lg:` prefixes)

### Key Concepts (Plain English)
| Concept | What It Means | Example |
|---------|--------------|---------|
| App Router | Folder = URL path | `app/dashboard/page.js` → `/dashboard` |
| Server Component | Renders on server (default). Can fetch data. Can't use useState. | Page that loads meals from DB |
| Client Component | Renders in browser. Add `'use client'` at top. Can use hooks. | Photo upload, form inputs |
| API Route | Server-side function. Safe for secrets. | `app/api/meals/analyze/route.js` |
| Middleware | Runs BEFORE every page load. | Auth redirect if not logged in |
| Layout | Wraps all child pages. Good for navbars, footers. | `app/layout.js` |

### Example: Complete Page Component

```javascript
// app/dashboard/page.js
// What: The main dashboard showing today's calorie/macro progress.
// This is a SERVER component (no 'use client') — data is fetched before rendering.

import CalorieRing from '@/components/CalorieRing';
import MacroBar from '@/components/MacroBar';
import MealList from '@/components/MealList';
import CoachingNudge from '@/components/CoachingNudge';

export default async function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header — white bar at top */}
      <header className="bg-white shadow-sm p-4">
        <h1 className="text-xl font-bold text-gray-900">Today's Progress</h1>
        <p className="text-sm text-gray-500">February 21, 2026</p>
      </header>

      {/* Main content — centered, max width on big screens */}
      <main className="max-w-lg mx-auto p-4 space-y-6">
        {/* Calorie ring — big circular progress */}
        <CalorieRing consumed={780} target={1650} />

        {/* Macro bars — horizontal progress */}
        <div className="space-y-3">
          <MacroBar label="Protein" current={28} target={124} unit="g" color="blue" />
          <MacroBar label="Carbs" current={105} target={186} unit="g" color="amber" />
          <MacroBar label="Fiber" current={9} target={23} unit="g" color="green" />
        </div>

        {/* Coaching nudge — our differentiator! */}
        <CoachingNudge />

        {/* List of today's logged meals */}
        <MealList />
      </main>
    </div>
  );
}
```

### Example: Client Component with State

```javascript
// components/PhotoUpload.js
// What: Camera/file upload button for food photos.
// Why 'use client': Needs useState for preview + onChange event handler.

'use client';

import { useState } from 'react';

export default function PhotoUpload({ onPhotoSelected }) {
  const [preview, setPreview] = useState(null);

  function handleFileChange(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Show the user a preview of their selected photo
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(file);

    // Pass the raw file up to parent for uploading
    onPhotoSelected(file);
  }

  return (
    <div className="space-y-4">
      {preview && (
        <img src={preview} alt="Food preview" className="w-full rounded-xl shadow-md" />
      )}

      <label className="block w-full bg-green-500 text-white text-center py-4 rounded-xl font-semibold cursor-pointer hover:bg-green-600 transition-colors">
        {preview ? '📸 Change Photo' : '📸 Snap Your Meal'}
        <input
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          className="hidden"
        />
      </label>
    </div>
  );
}
```

### Alternatives Considered
| Option | Why NOT |
|--------|---------|
| Plain React (CRA) | No routing or API routes. Needs separate backend. |
| Vue.js / Svelte | Smaller communities. Less AI training data. |
| Bubble / Webflow | Can't integrate Gemini API. Vendor lock-in. |

---

## AI: Google Gemini API (Flash Model)

### What is it?
Google's multimodal AI. Send a food photo + text prompt → get structured calorie/macro JSON back.

### Why Gemini Flash?
- **Free tier:** 1,000 requests/day (~300 users × 3 meals)
- **Fast:** Under 3 seconds typical response
- **Multimodal:** Understands images natively
- **Builder has Google Pro:** Possibly higher rate limits

### Setup + Example

```bash
npm install @google/generative-ai
```

```javascript
// lib/gemini.js — Core Gemini helper
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

export async function analyzeFoodPhoto(base64Image, mimeType = "image/jpeg") {
  const prompt = `You are a nutrition analysis expert...`; // See gemini_integration.md
  const imagePart = { inlineData: { data: base64Image, mimeType } };

  const result = await model.generateContent([prompt, imagePart]);
  return parseAndValidate(result.response.text());
}
```

---

## Database + Auth + Storage: Supabase

### What is it?
All-in-one: PostgreSQL database + Auth + file storage. Open-source Firebase alternative.

### Setup + Example

```bash
npm install @supabase/supabase-js @supabase/ssr
```

```javascript
// lib/supabase-client.js — Browser client (uses anon key, respects RLS)
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
```

```javascript
// lib/supabase-server.js — Server client (reads cookies for auth)
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );
}
```

```javascript
// Example database query — fetch today's meals
const { data: meals, error } = await supabase
  .from('meals')
  .select('*')
  .eq('user_id', user.id)
  .gte('logged_at', todayStart)
  .lt('logged_at', tomorrowStart)
  .order('logged_at', { ascending: true });
```

---

## Deployment: Vercel

**Process:** Code change → `git push` → Vercel auto-builds → live in ~60 seconds.

---

## Error Handling Patterns

### Frontend: Loading + Error States on Every Async Action

```javascript
'use client';
import { useState } from 'react';

export default function AnalyzeButton({ photoFile }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  async function handleAnalyze() {
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('image', photoFile);
      const res = await fetch('/api/meals/analyze', { method: 'POST', body: formData });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Analysis failed');
      }
      setResult(await res.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button onClick={handleAnalyze} disabled={loading}
        className="w-full bg-green-500 text-white py-3 rounded-xl font-semibold disabled:opacity-50">
        {loading ? 'Analyzing...' : '✨ Analyze My Meal'}
      </button>
      {error && <p className="mt-2 text-red-500 text-sm text-center">{error}</p>}
    </div>
  );
}
```

### Backend: Try/Catch on Every API Route

```javascript
import { createClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    // 1. Auth check (ALWAYS first)
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    // 2. Parse + validate → 3. Business logic → 4. Return success
    return NextResponse.json({ data: result }, { status: 201 });
  } catch (error) {
    console.error('Route error:', error);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
```

### Error Message Map

| Internal Error | User Sees |
|---------------|-----------|
| Gemini timeout | "Analysis is taking longer than usual. Please try again." |
| Invalid JSON from Gemini | "We couldn't analyze this photo. Try a clearer shot." |
| Rate limit (429) | "Our AI is busy right now. Try again in a few minutes." |
| DB write error | "Couldn't save. Please try again." |
| Non-food photo | "We couldn't find food in this photo." |
| Network error | "Connection issue. Check your internet and try again." |
| Session expired | Redirect to /login automatically |

---

## Naming Conventions

### Files
| Type | Convention | Example |
|------|-----------|---------|
| Page files | `page.js` in named folder | `app/dashboard/page.js` |
| API route files | `route.js` in named folder | `app/api/meals/route.js` |
| Components | PascalCase `.js` | `CalorieRing.js`, `MealCard.js` |
| Lib/utilities | camelCase or kebab-case `.js` | `supabase-client.js`, `calories.js` |
| Constants file | camelCase file, UPPER_SNAKE values | `constants.js` → `MIN_CALORIES_FEMALE` |

### Code
| Type | Convention | Example |
|------|-----------|---------|
| Variables | camelCase | `dailyCalorieTarget`, `totalProtein` |
| Functions | camelCase | `calculateBMR()`, `generateFeedback()` |
| React Components | PascalCase | `<CalorieRing />`, `<MealCard />` |
| Constants | UPPER_SNAKE_CASE | `ACTIVITY_MULTIPLIERS`, `GEMINI_MODEL` |
| Database columns | snake_case | `daily_calorie_target`, `goal_weight_kg` |
| CSS classes | Tailwind utilities | `className="bg-green-500 text-white p-4"` |
| Env vars | UPPER_SNAKE_CASE | `GEMINI_API_KEY` |

### Git
| Type | Convention | Example |
|------|-----------|---------|
| Branches | `type/description` | `feature/photo-upload`, `fix/login-redirect` |
| Commits | `type: description` | `feat: add onboarding form` |
| Types | feat / fix / style / refactor / docs | `fix: correct protein rounding` |

---

## Environment Variables

| Variable | Source | Visibility | Notes |
|----------|--------|-----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API | Browser ✅ | Just the project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API | Browser ✅ | Limited perms, RLS enforced |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API | **Server ONLY** 🔒 | Full DB access |
| `GEMINI_API_KEY` | Google AI Studio | **Server ONLY** 🔒 | Billable |

**Rule:** `NEXT_PUBLIC_` prefix = browser-safe. No prefix = server-only. NEVER commit `.env.local`.

---

## Installed Packages

```json
{
  "dependencies": {
    "next": "^14.x",
    "react": "^18.x",
    "react-dom": "^18.x",
    "@supabase/supabase-js": "^2.x",
    "@supabase/ssr": "^0.x",
    "@google/generative-ai": "^0.x"
  },
  "devDependencies": {
    "eslint": "^8.x",
    "eslint-config-next": "^14.x",
    "postcss": "^8.x",
    "tailwindcss": "^3.x"
  }
}
```

**Package Rule:** Before adding ANY new package, check `package.json` first. Prefer native browser APIs (fetch over axios, Canvas API over sharp). Ask: "Can we do this without a new dependency?"