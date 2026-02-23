# GEMINI.md — Bite Coach

## Project
Bite Coach — AI nutrition coach. Next.js 14 + Tailwind, Supabase, Gemini Flash, Vercel. JavaScript only.

## Read First
- `AGENTS.md` for current state and roadmap
- `agent_docs/` for detailed docs (load only what's needed)

## Builder Context
Level A vibe-coder. No prior dev experience. Explain concepts simply. Add "why" comments.

## File Structure
- Pages: `app/[name]/page.js`
- API routes: `app/api/[name]/route.js`
- Components: `components/ComponentName.js` (PascalCase)
- Logic/utils: `lib/name.js` (camelCase)
- Constants: `lib/constants.js`

## Code Style
- JavaScript (NOT TypeScript)
- Tailwind CSS only (no separate CSS files)
- `'use client'` only when using hooks or event handlers
- Import alias: `@/` = project root
- Comments: explain "why", not "what"

## API Route Pattern
1. Check auth (Supabase getUser)
2. Validate input
3. Business logic
4. Return JSON: `{ data }` (200/201) or `{ error: "message" }` (4xx/5xx)
5. Always wrap in try/catch

## Plan → Execute → Verify
1. Plan: Outline approach in 3-5 bullets. Ask: "Does this look good?"
2. Execute: One feature at a time. Complete working code, not pseudocode.
3. Verify: `npm run dev` + browser check + `npm run build` before moving on.

## Verification
```bash
npm run dev      # Must start clean
npm run build    # Must pass before push
npm run lint     # Fix errors before commit
```

## What NOT To Do
- Do NOT delete files without confirmation
- Do NOT modify DB schemas without backup plan
- Do NOT add features not in the current phase
- Do NOT skip verification
- Do NOT use TypeScript
- Do NOT put secrets in client code
- Do NOT install new packages without checking package.json first
- Do NOT apologize for errors — just fix them
- Do NOT use banned words in nudges: "bad", "cheat", "guilty", "fat", "failure"