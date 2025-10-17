# Redundancy Report

| File | Status | Evidence |
|------|--------|----------|
| `orchestration/agentFactory.ts` | Unreferenced | `analysis/layer-analysis.json:37` lists the file under "unreferenced"; no modules import it, so the builder is dormant. |
| `ui/index.tsx` | Duplicate entry | `ui/index.tsx:1-13` recreates the React root while `index.html:55` loads `ui/main.tsx`, leaving this entry point unused. |

**Duplicate Content Audit**
- No identical hashes detected across `.ts/.tsx` sources (`analysis/duplicate-files.json`).

**Type Definition Notes**
- Placeholder `any` exports remain in `core/types.ts:89`; they require replacement rather than removal, so they are tracked in the restructure plan instead of this report.
