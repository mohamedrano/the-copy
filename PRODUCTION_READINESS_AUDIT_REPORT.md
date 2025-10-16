# Production Readiness Audit – The Copy

## Executive Summary
- **Status:** Needs-Work (≈30% ready). Critical quality gates (type-check, lint, unit tests, and production builds) fail across multiple applications, preventing a safe release.
- **Key blockers:** `apps/multi-agent-story` lacks required store actions and animation imports, ESLint crashes because of an unsupported TypeScript/React Hooks plugin combination, and `apps/drama-analyst` contains hundreds of unresolved type errors and missing JSX type definitions.
- **Operational risk:** CI runs with `npm` while the repository depends on `pnpm`, builds rely on Docker, and several environment files include production-looking placeholders that require hardening before launch.

## Top 10 Risks (Prioritized)
| ID | Severity | Title | Root Cause | Impact | Fix Plan |
| --- | --- | --- | --- | --- | --- |
| P0-1 | P0 | Multi-agent story type-check fails | `SessionManager` references undefined `updateAgent/updateSession` helpers and misses `framer-motion` imports | Blocks shell integration; runtime breakage likely | Reintroduce the missing store actions, import `motion` from `framer-motion`, and add targeted unit tests before rerunning `pnpm --filter multi-agent-story run type-check` |
| P0-2 | P0 | Drama analyst build breaks | Hundreds of TypeScript errors in tests, services, and UI due to missing types and outdated component APIs | Production bundle cannot be created | Align React 19 typings, fix invalid mocks, and regenerate types; enforce `pnpm --filter drama-analyst run type-check` before rebuild |
| P0-3 | P0 | ESLint gate crashes | `eslint-plugin-react-hooks` 4.6.x is incompatible with TypeScript 5.9.x, causing a `context.getSource` runtime error | Lint gating impossible; hides additional violations | Downgrade TypeScript or upgrade the React Hooks plugin to a TS 5.9 compatible release, then re-run lint in CI |
| P0-4 | P0 | Automated tests abort | `apps/multi-agent-story` test suite exits with code 1 because no test files exist | CI fails; zero automated regression coverage | Stub Vitest suites per feature (store, components) and update `vitest.config` so `pnpm --filter multi-agent-story run test` passes |
| P0-5 | P0 | Production build pipeline fails | Build orchestration stops at drama-analyst errors and `.env` enforces `NODE_ENV=development` only | Prevents shipping unified static assets | Resolve TS defects and remove `NODE_ENV` guard from `.env` for production builds |
| P1-6 | P1 | Security advisory in esbuild | `pnpm audit` reports GHSA-67mh-4wv8-2f99 affecting dev servers | Allows cross-origin leakage while running local dev servers | Pin `esbuild@^0.25.0` for all apps and rerun `pnpm audit --json` to confirm resolution |
| P1-7 | P1 | CI/CD misaligned with workspace tooling | GitHub Actions workflow uses `npm ci`/`npm run` commands and Dockerized deployment while monorepo standard is `pnpm` without containers | Pipeline cannot reproduce local builds; violates no-Docker constraint | Rewrite workflows to use `pnpm` with node caching and replace Docker build steps with static hosting or functions deployments |
| P1-8 | P1 | Missing test coverage across apps | Vitest reports zero discovered tests; stations/drama rely on manual testing | High regression risk; coverage metrics meaningless | Establish baseline smoke/unit suites and enable coverage thresholds via `vitest --coverage` |
| P2-9 | P2 | Committed environment files with production-style secrets | `external/multi-agent-story/.env` contains placeholder passwords and secrets | Risk of accidental reuse in production; unclear secret rotation policy | Replace with `.env.example` only, document secret management, and add git ignore rules |
| P2-10 | P2 | Legacy readiness documentation contradicts audit | `PRODUCTION_READINESS_REPORT.md` claims the system is already production-ready | Misleads stakeholders; hides blockers | Archive or update legacy docs to reference this audit and track remediation status |

## Repository Architecture Overview
- **Workspace layout:** Root `package.json` orchestrates all `apps/*` and `packages/*` through pnpm workspaces, exposing dev/build/test/type-check scripts and shell-specific commands. External legacy copies remain under `external/*`. 
- **Applications:**
  - `apps/the-copy` – Vite React shell embedding the four experiences with health checks.
  - `apps/basic-editor`, `apps/drama-analyst`, `apps/multi-agent-story`, `apps/stations` – individual Vite projects with dedicated ports and build scripts.
- **Shared packages:** `packages/shared-types`, `packages/shared-ui`, and `packages/shared-utils` provide cross-app types, UI atoms, and helpers.
- **Tooling:** Node ≥20, pnpm ≥8 (lockfile pins pnpm 10.18.3). ESLint and Vitest configured per app; no TurboRepo.

## Quality Gate Status
### TypeScript
- `pnpm run type-check` fails: multi-agent story reports undefined store actions and missing `motion` import while shared-store `get` is unused.
- Drama analyst build/type-check cascades with numerous TS6133/TS23xx/TS70xx errors spanning orchestration services and UI modules.

### Linting
- `pnpm run lint` crashes in `apps/multi-agent-story` because `eslint-plugin-react-hooks` expects an older TypeScript AST API. Lint results for other packages remain unverified.

### Testing & Coverage
- `pnpm run test` halts immediately: multi-agent story's Vitest runner finds zero test files. Stations/the-copy suites never report due to the early failure.
- No coverage artifacts generated; coverage scripts likely stale.

### Build & Bundle Health
- CI-style `pnpm run build` stops: drama-analyst fails compilation and multi-agent story logs `.env` guard rejecting `NODE_ENV=production`. Only basic-editor completes bundling (~232 kB main bundle, gzip 70 kB).
- Shell build status unknown due to early abort.

## Security & Compliance
- `pnpm audit --json` reports two moderate vulnerabilities (esbuild dev server CORS leak). No high/critical issues, but remediation required before release.
- Installation warns about ignored native build scripts (Sharp, esbuild). Validate manual postinstall steps for production images.
- Checked `.env` files: repo ships multiple real-looking environment files under `external/*`; sanitize before distribution.

## Performance & Availability Notes
- Successful basic-editor build provides baseline asset sizes; other apps lack metrics until compilation issues resolve.
- Stations app bundles both client (Vite) and server (esbuild) artifacts; ensure Node runtime (>=20) available for API layer.
- Multi-agent story build pipeline enforces dev-only `NODE_ENV`, blocking production builds—must update configuration.

## Documentation & Operational Readiness
- Current `PRODUCTION_READINESS_REPORT.md` asserts full readiness despite failing gates; documentation must be reconciled with this audit.
- GitHub Actions `ci-cd.yml` relies on npm and Docker workflows that diverge from pnpm-based local flows and the no-Docker mandate. Additional workflows (`docs.yml`, `pnpm-firebase-deploy.yml`) exist but were not executed in this audit.
- Shell app documentation (`ProductionReadiness.md`, `RepositoryAuditReport.json`) should be regenerated after fixes.

## Immediate Action Plan (0–48 Hours)
1. **Restore type safety in multi-agent story**
   - Reintroduce missing store helpers and import `motion`.
   - Run `pnpm --filter multi-agent-story run type-check`.
2. **Stabilize lint tooling**
   - Align TypeScript and `eslint-plugin-react-hooks` versions.
   - Re-run `pnpm run lint`.
3. **Repair drama analyst types & tests**
   - Update React typings, fix invalid mocks, and adjust Vitest setup.
   - Validate with `pnpm --filter drama-analyst run type-check` and `pnpm --filter drama-analyst run test`.
4. **Author baseline tests**
   - Add smoke/unit tests for multi-agent story and shell panes.
   - Execute `pnpm run test` and `pnpm run coverage`.
5. **Unify build pipeline**
   - Remove `.env` NODE_ENV guard, fix TypeScript errors, and confirm `pnpm run build` completes.
6. **Patch security advisory**
   - Upgrade `esbuild` across workspaces, then re-run `pnpm audit --json`.
7. **Refit CI/CD**
   - Replace npm commands with pnpm, remove Docker dependencies, and align gating steps with local scripts.
8. **Harden environment management**
   - Replace committed `.env` files with `.env.example`, document secret loading, and add safeguards in CI.
9. **Refresh documentation & reports**
   - Update readiness reports and UI plan once quality gates pass.

## Appendices
### Command Log
| Command | Result |
| --- | --- |
| `pnpm install` | Completed with ignored build-script warning |
| `pnpm run type-check` | Failed in `apps/multi-agent-story` |
| `pnpm --filter multi-agent-story run type-check` | Detailed missing helper/motion errors |
| `pnpm run lint` | Aborted due to React Hooks plugin runtime error |
| `pnpm --filter multi-agent-story run lint` | Reproduced plugin crash |
| `pnpm run test` | Failed – no tests detected in multi-agent story |
| `pnpm --filter multi-agent-story run test` | Confirmed zero tests |
| `CI=1 pnpm run build` | Failed – drama-analyst TS errors, NODE_ENV guard |
| `pnpm audit --json` | Reported esbuild moderate advisory |

### Environment
- Node.js v20.19.4
- Package manager: pnpm 10.18.3 (from lockfile)
- No Docker commands executed per constraint.
