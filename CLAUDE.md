# CLAUDE.md — Claude Code Configuration for Bite Coach

## Project Context

**App:** Bite Coach
**One-liner:** Helps people lose weight by turning food photos into personalized daily coaching — not just calorie numbers.
**Stack:** Next.js 14 (App Router) + Tailwind CSS · Supabase (PostgreSQL + Auth + Storage) · Google Gemini Flash API · Vercel
**Stage:** MVP Development (7-day sprint)
**User Level:** Level A (Vibe-coder) — No prior dev experience. Learning by building. Wants to understand the "why" behind every decision.

---

## Directives

1. **Master Plan:** Always read `AGENTS.md` first. It contains the current phase, active tasks, blockers, and roadmap. Update its "Current State" section after completing work.

2. **Documentation:** Refer to `agent_docs/` for implementation details. Load only the file you need — don't load all docs at once. Key files:
   - `agent_docs/tech_stack.md` → Stack, libraries, setup commands, code examples
   - `agent_docs/code_patterns.md` → File structure, naming, component/API patterns
   - `agent_docs/product_requirements.md` → Features, user stories, acceptance criteria
   - `agent_docs/project_brief.md` → Budget, timeline, scope, security, safety rules
   - `agent_docs/database_schema.md` → 3 tables, SQL scripts, RLS policies
   - `agent_docs/api_routes.md` → All 9 endpoints with request/response formats
   - `agent_docs/gemini_integration.md` → Photo analysis prompt, validation, retry logic
   - `agent_docs/feedback_engine.md` → 7 coaching rules, priority logic, safety constraints
   - `agent_docs/testing.md` → Phase-by-phase manual test checklist
   - `agent_docs/resources.md` → External docs, repos, troubleshooting links

3. **Plan-First:** Propose a brief plan (3-5 bullet points) and wait for approval before writing code. For complex features, break the plan into numbered steps. Ask: "Does this plan look good?"

4. **Incremental Build:** Build one small feature at a time. After each piece, verify it works before moving to the next. Never stack multiple untested changes.

5. **Pre-Commit:** Run `npm run build` and `npm run lint` before every commit. If either fails, fix the issue before committing. Do not bypass or skip failing checks.

6. **No Linting:** Do not manually act as a linter or formatter. Use `npm run lint` to surface issues. Focus on logic, architecture, and user-facing behavior.

7. **Communication:** Be concise. Explain concepts simply since the builder is Level A. Add "why" comments in code. When something breaks, explain WHY it broke before showing the fix. Ask one clarifying question at a time — don't overwhelm.

---

## Commands

```bash
npm run dev      # Start local dev server (http://localhost:3000)
npm run build    # Build for production — run before every commit
npm run lint     # Check code style — run before every commit
npm start        # Run production build locally (for final testing only)
```

---

## Architecture Rules

- **Pages:** `app/[name]/page.js` — one file per route
- **API routes:** `app/api/[name]/route.js` — server-side only, safe for secrets
- **Components:** `components/ComponentName.js` — PascalCase, reusable UI
- **Logic/utils:** `lib/name.js` — pure functions, shared business logic
- **Constants:** `lib/constants.js` — single source of truth for magic numbers
- **Client directive:** Add `'use client'` ONLY when using hooks (useState, useEffect) or event handlers (onClick, onChange)
- **Imports:** Use `@/` alias for project root (e.g., `import { createClient } from '@/lib/supabase-client'`)
- **Language:** JavaScript only. Do NOT use TypeScript.
- **Styling:** Tailwind CSS utility classes only. No separate CSS files. No CSS-in-JS.

---

## API Route Pattern

Every API route MUST follow this structure:

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

    // 2. Parse + validate input
    // 3. Business logic + database operations
    // 4. Return success: { data } with status 200 or 201

  } catch (error) {
    console.error('Route error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
```

---

## Security (Non-Negotiable)

- RLS enabled on ALL Supabase tables — users can only read/write their own data
- `GEMINI_API_KEY` and `SUPABASE_SERVICE_ROLE_KEY` are **server-side only** — never in browser code
- Auth check on EVERY API route before any database operation
- `.env.local` is in `.gitignore` — never commit secrets to Git
- Photo storage bucket is private — owner-only access policies

---

## Health Safety (Non-Negotiable)

- Never suggest below 1,200 cal/day (women) or 1,500 cal/day (men)
- Never use these words in coaching nudges: "bad", "cheat", "guilty", "fat", "failure"
- Always frame feedback as "here's what you can do" — never "here's what you did wrong"
- Always label calorie estimates as approximate
- If <1,000 cal/day logged for 3+ days → show professional consultation warning

---

## What NOT To Do

- Do NOT delete files without explicit confirmation from the builder
- Do NOT modify database schemas without explaining the change and having a rollback plan
- Do NOT add features not in the current phase — say "Parking for V2"
- Do NOT skip verification for "simple" changes — always run `npm run dev` + browser check
- Do NOT bypass failing builds or lint errors — fix them first
- Do NOT use deprecated libraries or patterns
- Do NOT install new packages without first checking `package.json` for existing solutions
- Do NOT use TypeScript — this project uses JavaScript only
- Do NOT put API keys or service role keys in client-side code
- Do NOT skip RLS policies on any Supabase table
- Do NOT apologize for errors — fix them immediately
- Do NOT generate filler text before providing solutions
- Do NOT ask more than one clarifying question at a time