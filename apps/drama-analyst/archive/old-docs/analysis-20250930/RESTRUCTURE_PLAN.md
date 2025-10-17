# Restructure Plan

**Objectives**
- Restore strict type safety by defining shared payloads in `core/types.ts` and eliminating `any` placeholders (`core/types.ts:89`).
- Route UI interactions through orchestration so that caching/collaboration metadata in `orchestration/orchestration.ts` becomes effective.
- Remove redundant entry points and dormant factories to reduce maintenance overhead.

**Sequenced Actions**
1. **Typed payloads** – extend `core/types.ts` with concrete interfaces such as `ProcessedFile`, update `services/fileReaderService.ts` and `services/geminiService.ts`, then rerun `npx tsc --noEmit`.
2. **Service facade** – extract prompt-building helpers into orchestration and slim `services/geminiService.ts` to pure network IO (`services/geminiService.ts:27-231`).
3. **UI integration** – replace direct service calls with the new orchestration facade inside `ui/App.tsx:18-247`.
4. **Agent registry hygiene** – either wire `orchestration/agentFactory.ts:1-120` into the orchestration flow or delete it after documenting the `aiAgentOrchestra` path.
5. **Entry-point cleanup** – delete `ui/index.tsx` once `index.html:55` is confirmed to load only `ui/main.tsx`.

**Configuration Updates**
- Enable stricter checks in `tsconfig.json` (`compilerOptions.strict`, shared `types`) to surface regressions early.
- Ensure `vite.config.ts` path aliases stay aligned with `tsconfig.json` after any directory movement.

**Automated Code Mods**
- Replace `from '@services/…'` imports in UI with the orchestration facade namespace.
- Rename `ProcessTextsParams` usages to the new typed payload (e.g., `GeminiRequestPayload`).

**Validation & Acceptance**
- Run `npx tsc --noEmit` followed by `npm run build` after each milestone.
- Success criteria: builds pass, UI no longer imports services directly, agent registration is centralized, dead files removed, and main bundle shrinks below 500 kB if achievable through code splitting.
