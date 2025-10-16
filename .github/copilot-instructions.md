## The Copy — Copilot instructions for coding agents

These short instructions help AI coding assistants be immediately useful in this repository.
Focus on concrete, discoverable patterns and commands — not generic advice.

1. Big picture (what this repo is)
   - Hybrid monorepo combining 4 user-facing apps: `main-app` (root `src/`), `basic-editor`, `drama-analyst`, `stations`, and `multi-agent-story`.
   - External/full-stack apps live in `external/` and are integrated by building into `public/<app>/` and loaded via iframes (`src/components/ExternalAppFrame.tsx`). See `CLAUDE.md`.

2. Important files & entry points (quick links)
   - Main app entry: `src/App.tsx`, integrated editor: `src/components/editor/ScreenplayEditor.tsx`.
   - External apps: `external/*` or `apps/*` (e.g. `external/multi-agent-story/`, `external/drama-analyst/`).
   - Monorepo config: `pnpm-workspace.yaml`, `package.json`, `tsconfig.base.json` (path aliases).
   - Agent code & orchestration: `src/agents/` and external app `agent_guides/` / `external/*/agent_guides`.

3. Development workflow & commands (use these exactly)
   - Install: `pnpm install` (workspace). Root scripts defined in `package.json`/`pnpm`.
   - Dev (run all): `pnpm dev` ; per-app: `pnpm dev:main`, `pnpm dev:drama`, `pnpm dev:story`, `pnpm dev:stations`, `pnpm dev:basic`.
   - Build all: `pnpm build` ; per-app builds: `pnpm build:main`, `pnpm build:drama`, `pnpm build:story`.
   - Typecheck & QA: `pnpm type-check`, `pnpm lint`, `pnpm test`, `pnpm coverage`.
   - Workspace-scoped commands: `pnpm --filter <workspace> <command>` (e.g. `pnpm --filter main-app add <pkg>`).

4. External-app build pattern you must follow when editing apps
   - Each external app must set `vite.config.ts` base to `'/<app-name>/'` and outDir to `../../public/<app-name>/` (see `external/drama-analyst/vite.config.ts`).
   - Build outputs are consumed by the main app at `public/<app-name>/` and loaded by iframe `src/components/ExternalAppFrame.tsx`.
   - Common failure mode: `public/multi-agent-story/` contains wrong app — verify `outDir` and run `pnpm build:story` from root.

5. Project-specific conventions (follow exactly)
   - Path aliases: use `@the-copy/*` packages from `packages/` (see `tsconfig.base.json`).
   - Arabic-first UI: prefer RTL-aware CSS and components; many files expect Arabic text (test content and agent guides).
   - Agent guides: Do not change `agent_guides/` files lightly — they are source-of-truth for agent behavior.
   - Commits: Conventional Commits (type(scope): message). Examples in `external/multi-agent-story/AGENTS.md`.

6. Sensitive areas (do not modify without tests / approvals)
   - Backend security code (external FastAPI): `backend/app/core/security.py` (or `external/*/backend/app/core/security.py`).
   - DB migrations: `**/alembic/versions/*` — never delete historic migrations.
   - Gemini/AI integration: `**/integrations/gemini/**` — handle rate limit, retries, and don't log secrets.

7. Testing & CI notes
   - Unit/integration/E2E patterns: backend uses `pytest`, frontend uses `jest` + `playwright`. See `external/multi-agent-story/AGENTS.md` test examples.
   - CI workflows are under `.github/workflows/ci.yml` and `.github/workflows/cd.yml` — ensure new scripts are added there when you change build steps.

8. Examples to copy from (concrete snippets)
   - External iframe usage: `src/components/ProjectsPage.tsx` → `<iframe src="/drama-analyst/" />`.
   - Build config example: `external/drama-analyst/vite.config.ts` sets `base: '/drama-analyst/'` and `outDir: '../../public/drama-analyst/'`.
   - Agent loading: look at `external/multi-agent-story/backend/app/integrations/gemini/client.py` and `external/multi-agent-story/backend/app/agent_guides/*.md` for prompt patterns.

9. What an AI assistant may safely do autonomously
   - Small bugfixes in UI and services with existing tests passing.
   - Add typings, small refactors, and lint fixes across TS/React files.
   - Update Vite base/outDir when adding or fixing external app builds if you run `pnpm build:...` locally.

10. When to ask for human review (stop and ask)
   - Any changes to security, auth, database schema, or migration files.
   - Adding large dependencies (>10MB) or changing architecture.
   - Modifying agent guidance files that change agent behavior or prompts.

If anything in these instructions is unclear or you want more examples from a specific app (e.g. `drama-analyst` or `multi-agent-story`), tell me which app and I will expand the guidance.

-- End of copilot instructions (generated 2025-10-15)
