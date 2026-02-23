# Essential Resources — Bite Coach

> Curated references for scaling from MVP to production quality. Level A resources marked with 🟢, Level B (developer) marked with 🔵. Load this document when you need external guidance beyond the project docs.

---

## Curated Repositories

| Repository | Purpose | Level | When to Use |
|------------|---------|-------|-------------|
| **[PatrickJS/awesome-cursorrules](https://github.com/PatrickJS/awesome-cursorrules)** | Anti-vibe-coding rule templates for `.cursorrules` | 🔵 | When tightening code quality for V2 |
| **[OneRedOak/claude-code-workflows](https://github.com/OneRedOak/claude-code-workflows)** | Review & testing workflow packs for Claude Code | 🔵 | When adding automated review workflows |
| **[matebenyovszky/healing-agent](https://github.com/matebenyovszky/healing-agent)** | Self-healing error patterns for AI-assisted projects | 🔵 | When building auto-retry/recovery logic |
| **[modelcontextprotocol/servers](https://github.com/modelcontextprotocol/servers)** | MCP server implementations for tool integrations | 🔵 | When connecting AI agents to external tools |
| **[vercel/next.js/examples](https://github.com/vercel/next.js/tree/canary/examples)** | Official Next.js example projects | 🟢 | When building any new Next.js feature |
| **[supabase/supabase/examples](https://github.com/supabase/supabase/tree/master/examples)** | Official Supabase integration examples | 🟢 | When setting up auth, RLS, or storage |
| **[supabase/auth-helpers](https://github.com/supabase/auth-helpers)** | Supabase Auth for Next.js (App Router) | 🟢 | When building authentication flow |

---

## Key Documentation

### Core Stack (Read These First)

| Resource | URL | What You'll Learn |
|----------|-----|-------------------|
| 🟢 **Next.js Docs** | [nextjs.org/docs](https://nextjs.org/docs) | App Router, routing, API routes, server/client components |
| 🟢 **Next.js Learn Course** | [nextjs.org/learn](https://nextjs.org/learn) | Free interactive tutorial — great for Level A builders |
| 🟢 **Tailwind CSS Docs** | [tailwindcss.com/docs](https://tailwindcss.com/docs) | Every utility class, responsive design, dark mode |
| 🟢 **Supabase Docs** | [supabase.com/docs](https://supabase.com/docs) | Database, auth, storage, RLS, JavaScript SDK |
| 🟢 **Supabase + Next.js Guide** | [supabase.com/docs/guides/auth/server-side/nextjs](https://supabase.com/docs/guides/auth/server-side/nextjs) | SSR auth setup with @supabase/ssr |
| 🟢 **Google Gemini API Docs** | [ai.google.dev/gemini-api/docs](https://ai.google.dev/gemini-api/docs) | Multimodal API, JavaScript SDK, rate limits || 🟢 **Vercel Docs** | [vercel.com/docs](https://vercel.com/docs) | Deployment, environment variables, domains, analytics |

### Advanced (V2 / Developer Level)

| Resource | URL | What You'll Learn |
|----------|-----|-------------------|
| 🔵 **MCP Protocol** | [modelcontextprotocol.io](https://modelcontextprotocol.io) | How AI agents connect to external tools and data |
| 🔵 **Playwright Testing** | [playwright.dev/docs](https://playwright.dev/docs) | E2E browser testing for V2 automated tests |
| 🔵 **Jest Testing** | [jestjs.io/docs](https://jestjs.io/docs/getting-started) | Unit testing for JavaScript functions |
| 🔵 **React Testing Library** | [testing-library.com/docs/react-testing-library](https://testing-library.com/docs/react-testing-library/intro) | Component testing for React |
| 🔵 **Zod Validation** | [zod.dev](https://zod.dev) | Runtime type validation for API inputs (V2) |
| 🔵 **TanStack Query** | [tanstack.com/query](https://tanstack.com/query/latest) | Data fetching/caching for React (replaces useEffect for data) |
| 🔵 **Husky Pre-commit** | [typicode.github.io/husky](https://typicode.github.io/husky) | Git hooks for automated linting/testing before commits |

---

## AI Coding Agent Resources

### Prompt Engineering for AI Agents
| Resource | URL | Why Useful |
|----------|-----|-----------|
| 🔵 **v0.dev System Prompts** | [v0.dev](https://v0.dev) | Study how Vercel's AI structures component generation prompts |
| 🔵 **Anthropic Prompt Library** | [docs.anthropic.com/en/prompt-library](https://docs.anthropic.com/en/prompt-library) | Production-quality prompt patterns for Claude |
| 🟢 **Anthropic Prompting Guide** | [docs.claude.com/en/docs/build-with-claude/prompt-engineering](https://docs.claude.com/en/docs/build-with-claude/prompt-engineering/overview) | How to write better prompts for Claude |

### Tool-Specific Agent Configs
| Tool | Config File | Where to Put Rules |
|------|------------|-------------------|
| Claude Code / Claude Pro | `CLAUDE.md` | Project root — loaded automatically |
| Cursor IDE | `.cursorrules` | Project root — loaded automatically |
| Google Gemini | `GEMINI.md` | Project root — reference manually |
| Windsurf | `.windsurfrules` | Project root — loaded automatically |
| Aider | `.aider.conf.yml` | Project root |
| GitHub Copilot | `.github/copilot-instructions.md` | `.github/` directory |
### Agent Architecture Pattern
```
AGENTS.md (Master Plan — always read first)
    ├── agent_docs/ (Detailed docs — load only when needed)
    │   ├── tech_stack.md
    │   ├── code_patterns.md
    │   ├── product_requirements.md
    │   ├── project_brief.md
    │   ├── database_schema.md
    │   ├── api_routes.md
    │   ├── gemini_integration.md
    │   ├── feedback_engine.md
    │   ├── testing.md
    │   └── resources.md (this file)
    └── Tool Configs (Concise pointers → agent_docs)
        ├── CLAUDE.md
        ├── GEMINI.md
        └── .cursorrules
```

**Key Principle:** Tool configs are SHORT pointers. Detailed content lives in `agent_docs/`. This prevents context window overload when AI agents load project rules.

---

## Nutrition & Food AI References

These helped inform the Gemini prompt design and calorie calculation approach:

| Resource | What It Provides |
|----------|-----------------|
| **Mifflin-St Jeor Equation** | Industry-standard BMR formula (published 1990, most accurate for modern populations) |
| **USDA FoodData Central** | Reference database for validating AI calorie estimates |
| **Google CalCam Research** | Validated Gemini for food photo analysis |
| **WHO Guidelines** | Minimum calorie intake recommendations (safety floors) |
| **MyFitnessPal / Cronometer** | Competitor references for macro tracking UX patterns |

---

## Quick-Access Dashboards

Bookmark these — you'll check them frequently:

| Dashboard | URL | What to Check |
|-----------|-----|--------------|
| Supabase Project | `https://supabase.com/dashboard` | Table data, auth users, storage, logs |
| Google AI Studio | `https://aistudio.google.com` | API key, usage quota, rate limits |
| Vercel Dashboard | `https://vercel.com/dashboard` | Deploy status, logs, environment variables |
| GitHub Repo | `https://github.com/YOUR-USERNAME/bite-coach` | Code, commits, issues |

---

## Troubleshooting Quick Links

| Problem | Where to Look |
|---------|--------------|
| Next.js build errors | [nextjs.org/docs/messages](https://nextjs.org/docs/messages) — error code explanations |
| Supabase RLS issues | [supabase.com/docs/guides/database/postgres/row-level-security](https://supabase.com/docs/guides/database/postgres/row-level-security) |
| Supabase Auth issues | [supabase.com/docs/guides/auth/debugging](https://supabase.com/docs/guides/auth) |
| Gemini API errors | [ai.google.dev/gemini-api/docs/troubleshooting](https://ai.google.dev/gemini-api/docs/troubleshooting) |
| Tailwind classes not working | [tailwindcss.com/docs/content-configuration](https://tailwindcss.com/docs/content-configuration) — check content paths |
| Vercel deploy fails | Check build logs at `vercel.com/dashboard` → project → Deployments |

---

## Community & Support

| Channel | URL | Best For |
|---------|-----|---------|
| Next.js Discord | [nextjs.org/discord](https://nextjs.org/discord) | Quick help from the community |
| Supabase Discord | [discord.supabase.com](https://discord.supabase.com) | Database and auth questions |
| Stack Overflow | [stackoverflow.com](https://stackoverflow.com) | Searchable Q&A for specific errors |
| Vercel Support | [vercel.com/help](https://vercel.com/help) | Deployment issues |
| r/nextjs on Reddit | [reddit.com/r/nextjs](https://reddit.com/r/nextjs) | Community discussions and patterns |