# The Copy Monorepo - Repository Map

## Overview
**The Copy** is a comprehensive Arabic screenplay development platform combining four distinct applications into a unified system using a hybrid monorepo structure.

## Repository Structure

### Root Configuration
- **Package Manager**: pnpm 10.18.3
- **Node Version**: >=18.0.0
- **TypeScript**: 5.3.3+
- **Build System**: Vite 5.2.0+
- **Linting**: ESLint with TypeScript support

### Workspace Configuration
```yaml
# pnpm-workspace.yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

**Note**: `external/*` is NOT included in workspace configuration, causing potential integration issues.

## Applications (apps/)

### 1. Main App (`apps/main-app/`)
- **Name**: `@the-copy/main-app`
- **Port**: 5177
- **Type**: React + Vite + TypeScript
- **Purpose**: Main unified application shell
- **Status**: ✅ Active
- **Dependencies**: React 19.2.0, Google Gemini AI, Lucide React
- **Scripts**: dev, build, preview, type-check, lint, test

### 2. Basic Editor (`apps/basic-editor/`)
- **Name**: `@the-copy/basic-editor`
- **Port**: 5178
- **Type**: React + Vite + TypeScript
- **Purpose**: Standalone Arabic screenplay editor
- **Status**: ✅ Active
- **Build Output**: `../../public/basic-editor/`
- **Dependencies**: React 19.2.0, Lucide React

### 3. Drama Analyst (`apps/drama-analyst/`)
- **Name**: `@the-copy/drama-analyst`
- **Port**: 5179
- **Type**: React + Vite + TypeScript + PWA
- **Purpose**: Advanced drama analysis with 29 AI agents
- **Status**: ✅ Active
- **Build Output**: `../../public/drama-analyst/`
- **Dependencies**: Google Gemini AI, Sentry, Mammoth, React Dropzone
- **Features**: E2E testing with Playwright, Docker support, multiple deployment targets

### 4. Stations (`apps/stations/`)
- **Name**: `the-copy-stations`
- **Port**: 5180 (via tsx server)
- **Type**: React + Vite + Express + TypeScript
- **Purpose**: Story structure analysis and dramatic stations
- **Status**: ✅ Active
- **Dependencies**: Radix UI, Drizzle ORM, Express, Redis, WebSocket
- **Features**: Full-stack with backend server, database integration

### 5. Multi-Agent Story (`apps/multi-agent-story/`)
- **Name**: `@the-copy/multi-agent-story`
- **Port**: 5181
- **Type**: React + Vite + TypeScript
- **Purpose**: Multi-agent storytelling platform (Jules)
- **Status**: ✅ Active
- **Build Output**: `../../public/multi-agent-story/`
- **Dependencies**: React Router, TanStack Query, Socket.io, Framer Motion

## Shared Packages (packages/)

### 1. Shared Types (`packages/shared-types/`)
- **Name**: `@the-copy/shared-types`
- **Purpose**: Common TypeScript type definitions
- **Exports**: `./src/index.ts`

### 2. Shared UI (`packages/shared-ui/`)
- **Name**: `@the-copy/shared-ui`
- **Purpose**: Reusable UI components
- **Dependencies**: Lucide React, React 19
- **Exports**: `./src/index.ts`

### 3. Shared Utils (`packages/shared-utils/`)
- **Name**: `@the-copy/shared-utils`
- **Purpose**: Common utility functions
- **Exports**: `./src/index.ts`

## External Projects (external/)

**⚠️ CRITICAL ISSUE**: External projects are NOT included in pnpm workspace, causing:
- Dependency management issues
- Build script conflicts
- Integration difficulties

### 1. Drama Analyst (`external/drama-analyst/`)
- **Name**: `the-copy-drama-analyst`
- **Type**: Duplicate of `apps/drama-analyst/`
- **Status**: ⚠️ Duplicate/Outdated
- **Issue**: Different package name and version (0.0.0 vs 1.0.0)

### 2. Multi-Agent Story (`external/multi-agent-story/`)
- **Name**: `the-copy-multi-agent-story`
- **Type**: Complex multi-service project
- **Structure**:
  - `jules-backend/`: Fastify + PostgreSQL + Prisma
  - `jules-frontend/`: React + Vite
- **Status**: ⚠️ Complex setup required

### 3. Stations (`external/stations/`)
- **Name**: `the-copy-stations`
- **Type**: Duplicate of `apps/stations/`
- **Status**: ⚠️ Duplicate/Outdated
- **Issue**: Different React versions (18.3.1 vs 19.2.0)

## Build Outputs (public/)

### Current Built Applications
1. **basic-editor/**: ✅ Built (3 assets)
2. **drama-analyst/**: ✅ Built (15 assets + PWA files)
3. **multi-agent-story/**: ✅ Built (4 assets)
4. **stations/**: ✅ Built (8 assets)

### Integration Status
- All four applications are successfully built
- Applications are accessible via iframe integration
- Main app serves as shell with navigation between apps

## Port Allocation

| Application | Development Port | Production Path |
|-------------|------------------|-----------------|
| Main App | 5177 | `/` |
| Basic Editor | 5178 | `/basic-editor/` |
| Drama Analyst | 5179 | `/drama-analyst/` |
| Stations | 5180 | `/stations/` |
| Multi-Agent Story | 5181 | `/multi-agent-story/` |

## Key Configuration Files

### TypeScript Configuration
- **Base Config**: `tsconfig.base.json` (shared paths for packages)
- **Root Config**: `tsconfig.json` (main app specific)
- **Path Aliases**: Configured for shared packages and main app

### Vite Configuration
- **Main App**: `vite.config.ts` (port 5177, manual chunks)
- **Individual Apps**: Each has its own vite.config.ts

### ESLint Configuration
- **File**: `eslint.config.mjs`
- **Rules**: TypeScript + React + TSDoc standards
- **Coverage**: All TypeScript/React files

## Current Architecture

### Integration Pattern
The main app (`src/App.tsx`) uses a simple state-based routing system:
- HomePage with navigation buttons
- Individual page components for each app
- iframe integration for external apps

### Navigation Flow
```
HomePage (4 buttons)
├── Basic Editor → ScreenplayEditor (integrated component)
├── Drama Analyst → ProjectsPage (iframe: /drama-analyst/)
├── Stations → TemplatesPage (iframe: /stations/)
└── Multi-Agent Story → ExportPage (iframe: /multi-agent-story/)
```

## Critical Issues Identified

### P0 (Blocking)
1. **External Projects Not in Workspace**: `external/*` not included in pnpm-workspace.yaml
2. **Duplicate Applications**: External versions conflict with apps versions
3. **Version Mismatches**: Different React versions across projects
4. **Missing Turbo Configuration**: No turbo.json for build optimization

### P1 (High Priority)
1. **Inconsistent Naming**: Mix of `@the-copy/*` and `the-copy-*` naming
2. **Build Script Dependencies**: External apps not integrated into root build
3. **Port Management**: No centralized port configuration

### P2 (Medium Priority)
1. **Shared Package Usage**: Limited usage of shared packages across apps
2. **Type Safety**: Some apps don't use shared types
3. **Testing Coverage**: Inconsistent test coverage across apps

## Recommendations

### Immediate Actions (P0)
1. Add `external/*` to pnpm-workspace.yaml or migrate to apps/
2. Resolve duplicate applications
3. Standardize React versions across all projects
4. Add turbo.json for build optimization

### Short-term (P1)
1. Standardize package naming convention
2. Create unified build scripts
3. Implement centralized port management

### Long-term (P2)
1. Increase shared package adoption
2. Improve test coverage
3. Add CI/CD pipeline configuration

## File Count Summary

- **Total Files**: 1000+ files across the repository
- **TypeScript Files**: 500+ .ts/.tsx files
- **Configuration Files**: 50+ config files
- **Documentation**: 100+ .md files
- **Build Outputs**: 30+ built assets in public/

## Next Steps

1. **Phase 1**: Fix workspace configuration and resolve duplicates
2. **Phase 2**: Standardize build and development scripts
3. **Phase 3**: Implement unified shell application
4. **Phase 4**: Add comprehensive testing and CI/CD

---

**Generated**: 2025-01-27
**Status**: Discovery Complete - Ready for Audit Phase