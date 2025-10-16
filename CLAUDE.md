# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**The Copy** is a comprehensive Arabic screenplay development platform that combines four distinct applications into a unified system. The project uses a hybrid monorepo structure with both integrated and external applications.

**Core Tech Stack:**
- Frontend: React 18-19, TypeScript 5.3+, Vite 5-7
- Build System: pnpm workspaces (monorepo)
- AI Integration: Google Gemini API, Multi-agent systems
- Styling: Tailwind CSS
- Package Manager: pnpm 10.18.3+

## Monorepo Structure

```
the-copy/
├── apps/                       # Workspace applications
│   ├── main-app/              # Main unified application (port 5177)
│   ├── basic-editor/          # Standalone basic editor (port 5178)
│   ├── drama-analyst/         # Drama analysis platform (port 5179)
│   ├── stations/              # Stations management (port 5180)
│   └── multi-agent-story/     # Multi-agent storytelling (port 5181)
├── packages/                   # Shared packages
│   ├── shared-ui/             # Shared UI components
│   ├── shared-types/          # Shared TypeScript types
│   └── shared-utils/          # Shared utility functions
├── external/                   # External integrated projects
│   ├── drama-analyst/         # Full drama analyst with 29 AI agents
│   ├── stations/              # Stations with Express backend
│   └── multi-agent-story/     # Jules (React + Fastify + PostgreSQL)
├── src/                       # Root application source
│   ├── App.tsx               # Main router with 4 sections
│   ├── components/           # React components
│   │   ├── HomePage.tsx      # Landing page with 4 buttons
│   │   ├── editor/           # Integrated screenplay editor
│   │   ├── ProjectsPage.tsx  # Drama analyst iframe
│   │   ├── TemplatesPage.tsx # Stations iframe
│   │   └── ExportPage.tsx    # Multi-agent story iframe
│   ├── agents/               # AI agent definitions
│   ├── services/             # Core services
│   └── lib/                  # Libraries and utilities
├── public/                    # Static assets and built externals
│   ├── drama-analyst/        # Built drama analyst (974 KB)
│   ├── stations/             # Built stations (495 KB)
│   └── multi-agent-story/    # Built multi-agent app
├── pnpm-workspace.yaml        # Workspace configuration
├── tsconfig.base.json         # Base TypeScript config
└── package.json               # Root package.json
```

## Development Commands

### Root Commands (pnpm workspaces)

```bash
# Install all dependencies
pnpm install

# Development - run all apps in parallel
pnpm dev                 # All apps
pnpm dev:main           # Main app only (port 5177)
pnpm dev:basic          # Basic editor (port 5178)
pnpm dev:drama          # Drama analyst (port 5179)
pnpm dev:stations       # Stations (port 5180)
pnpm dev:story          # Multi-agent story (port 5181)

# Build commands
pnpm build              # Build all apps
pnpm build:all          # Build apps + packages
pnpm build:main         # Build main app only
pnpm build:basic        # Build basic editor
pnpm build:drama        # Build drama analyst → public/drama-analyst/
pnpm build:stations     # Build stations → public/stations/
pnpm build:story        # Build multi-agent → public/multi-agent-story/

# Quality assurance
pnpm type-check         # Type check all workspaces
pnpm type-check:main    # Type check main app
pnpm lint               # Lint all workspaces
pnpm lint:fix           # Fix linting issues
pnpm test               # Run all tests
pnpm test:main          # Test main app
pnpm coverage           # Coverage reports

# Maintenance
pnpm clean              # Clean build outputs and node_modules
pnpm clean:all          # Clean everything including .turbo
pnpm verify:all         # Run type-check + lint + test

# Preview
pnpm preview            # Preview main app production build
```

### Working with Specific Workspaces

```bash
# Install package to specific workspace
pnpm --filter main-app add <package>
pnpm --filter drama-analyst add <package>

# Run command in specific workspace
pnpm --filter <workspace-name> <command>

# Add shared package as dependency
pnpm --filter main-app add @the-copy/shared-types@workspace:*
```

## Architecture

### The Four Applications

The Copy consists of **4 distinct sections** accessible from the main app:

#### 1. Basic Editor (Integrated)
- **Location**: `src/components/editor/ScreenplayEditor.tsx`
- **Type**: React component (embedded)
- **Access**: Direct component rendering (no iframe)
- **Features**: Arabic screenplay editor with auto-formatting
- **Status**: ✅ Working

#### 2. Drama Analyst (External)
- **Location**: `external/drama-analyst/` or `apps/drama-analyst/`
- **Type**: Full React SPA with 29 AI agents
- **Access**: iframe loading `/drama-analyst/`
- **Build Output**: `public/drama-analyst/` (974 KB)
- **Features**: Advanced text analysis, Gemini API, PWA
- **Status**: ✅ Working

#### 3. Stations (External)
- **Location**: `external/stations/` or `apps/stations/`
- **Type**: React + Express backend
- **Access**: iframe loading `/stations/`
- **Build Output**: `public/stations/` (495 KB)
- **Features**: Story structure analysis, dramatic stations
- **Status**: ✅ Working

#### 4. Multi-Agent Story (External - Jules)
- **Location**: `external/multi-agent-story/`
- **Type**: Full-stack (React + Fastify + PostgreSQL)
- **Structure**:
  - `jules-frontend/`: React SPA
  - `jules-backend/`: Fastify API server
  - `prisma/`: Database schema
- **Access**: iframe loading `/multi-agent-story/`
- **Build Output**: `public/multi-agent-story/`
- **Features**: Multi-agent story generation, WebSocket, database
- **Status**: ⚠️ Build issues (currently showing drama-analyst duplicate)

### Request Flow

```
User visits /
  → Main App (src/App.tsx)
    → HomePage (4 buttons)
      ├→ Button 1: المحرر الأساسي
      │   └→ <ScreenplayEditor /> (integrated component)
      │
      ├→ Button 2: محلل الدراما
      │   └→ <ProjectsPage>
      │       └→ <iframe src="/drama-analyst/" />
      │
      ├→ Button 3: المحطات
      │   └→ <TemplatesPage>
      │       └→ <iframe src="/stations/" />
      │
      └→ Button 4: قصة متعددة الوكلاء
          └→ <ExportPage>
              └→ <iframe src="/multi-agent-story/" />
```

### Path Aliases

Configured in [tsconfig.base.json](tsconfig.base.json):

```typescript
"@the-copy/shared-ui"       → packages/shared-ui/src
"@the-copy/shared-types"    → packages/shared-types/src
"@the-copy/shared-utils"    → packages/shared-utils/src
```

Individual apps may have their own path aliases configured in their local `tsconfig.json`.

## Key Implementation Patterns

### 1. External App Integration Pattern

External apps are built independently and loaded via iframes:

```typescript
// src/components/ExternalAppFrame.tsx
interface ExternalAppFrameProps {
  url: string;      // Path to built app in public/
  title: string;    // App title
}

// Example usage in ProjectsPage.tsx
<ExternalAppFrame
  url="/drama-analyst/"
  title="Drama Analyst"
/>
```

### 2. Build Process for External Apps

Each external app must:
1. Build to its own `dist/` directory
2. Copy output to `public/<app-name>/` in main app
3. Configure correct `base` path in `vite.config.ts`

```typescript
// external/drama-analyst/vite.config.ts
export default defineConfig({
  base: '/drama-analyst/',  // Must match public/ subdirectory
  build: {
    outDir: '../../public/drama-analyst/',  // Output to main app public/
    emptyOutDir: true
  }
})
```

### 3. Workspace Dependencies

Apps can depend on shared packages:

```json
// apps/drama-analyst/package.json
{
  "dependencies": {
    "@the-copy/shared-types": "workspace:*",
    "@the-copy/shared-utils": "workspace:*"
  }
}
```

### 4. TypeScript Configuration Inheritance

```json
// apps/main-app/tsconfig.json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    // App-specific overrides
  }
}
```

## Environment Configuration

### Main App

```bash
# .env
VITE_API_KEY=<gemini-api-key>
VITE_SENTRY_DSN=<sentry-dsn>
```

### Drama Analyst

```bash
# apps/drama-analyst/.env
API_KEY=<gemini-api-key>
VITE_SENTRY_DSN=<sentry-dsn>
```

### Multi-Agent Story

```bash
# external/multi-agent-story/.env
DATABASE_URL=<postgres-connection-string>
API_PORT=3001
FRONTEND_PORT=5003
```

## Important Implementation Details

### 1. Arabic Language Support

All apps prioritize RTL (right-to-left) text rendering:
- UI text in Arabic
- RTL CSS directives
- Proper Unicode handling for Arabic characters (U+0600 to U+06FF)

### 2. Port Allocation

| Application | Dev Port | Production Path |
|-------------|----------|-----------------|
| Main App | 5177 | `/` |
| Basic Editor | 5178 | `/` (integrated) |
| Drama Analyst | 5179 | `/drama-analyst/` |
| Stations | 5180 | `/stations/` |
| Multi-Agent Story | 5181 | `/multi-agent-story/` |

### 3. Build Outputs

```
public/
├── drama-analyst/      # Built from apps/drama-analyst/
│   ├── index.html
│   ├── assets/
│   └── ... (974 KB total)
├── stations/           # Built from apps/stations/
│   ├── index.html
│   ├── assets/
│   └── ... (495 KB total)
└── multi-agent-story/  # Built from external/multi-agent-story/jules-frontend/
    ├── index.html
    ├── assets/
    └── ...
```

### 4. Agent-Based Architecture (Drama Analyst)

Drama Analyst uses a sophisticated AI agent system:

- **29 specialized agents** organized by category:
  - Core Agents (4): Analysis, Creative, Integrated, Completion
  - Analytical Agents (6): Rhythm, Character Networks, Dialogue Forensics, etc.
  - Creative Agents (4): Rewriting, Scene Generation, Character Voice, etc.
  - Predictive Agents (4): Plot Prediction, Tension Optimization, etc.
  - Advanced Modules (11): Deep analyzers for various aspects

- **Orchestration System**: Manages agent collaboration, dependencies, and performance
- **Memory Systems**: Episodic, semantic, and procedural memory

### 5. Current Known Issues

⚠️ **Multi-Agent Story Build Problem**:
- `public/multi-agent-story/` currently contains drama-analyst instead of Jules
- Build process needs fixing to properly build and copy jules-frontend
- Backend (jules-backend) runs separately and needs database connection

## Testing & Type Checking

```bash
# Type checking
npx tsc --noEmit                    # Root level
pnpm --filter main-app type-check   # Specific app

# Testing
pnpm test                           # All tests
pnpm --filter drama-analyst test    # Specific app tests
pnpm --filter drama-analyst test:coverage  # With coverage

# E2E Testing (Drama Analyst)
pnpm --filter drama-analyst test:e2e     # Playwright tests
pnpm --filter drama-analyst test:e2e:ui  # With UI
```

## Common Development Tasks

### Adding a New Workspace

1. Create directory in `apps/` or `packages/`
2. Initialize with `package.json`:
```json
{
  "name": "@the-copy/new-app",
  "version": "1.0.0",
  "private": true
}
```
3. Run `pnpm install` from root
4. The workspace is automatically detected

### Migrating Code Between Workspaces

1. Extract shared code to appropriate package:
   - UI components → `packages/shared-ui/`
   - Types → `packages/shared-types/`
   - Utilities → `packages/shared-utils/`

2. Update imports in consuming apps:
```typescript
// Before
import { MyComponent } from '../../../components/MyComponent';

// After
import { MyComponent } from '@the-copy/shared-ui';
```

3. Add dependency in consuming app's `package.json`

### Building External Apps for Production

```bash
# From root
pnpm build:drama      # Builds to public/drama-analyst/
pnpm build:stations   # Builds to public/stations/
pnpm build:story      # Builds to public/multi-agent-story/

# Then build main app
pnpm build:main       # Includes all external apps from public/
```

### Fixing Multi-Agent Story Build

The multi-agent story app has a complex structure that needs special attention:

```bash
# Navigate to frontend
cd external/multi-agent-story/jules-frontend

# Install dependencies
pnpm install

# Build with correct base path
# Ensure vite.config.ts has:
# base: '/multi-agent-story/'
# outDir: '../../../public/multi-agent-story/'

pnpm build

# Verify output
ls -lh ../../../public/multi-agent-story/
```

## Notable Design Decisions

1. **Hybrid Integration Strategy**:
   - Basic Editor: Fully integrated for simplicity and direct access
   - External Apps: Isolated for independent development and deployment

2. **Monorepo with pnpm**:
   - Efficient disk space usage with shared dependencies
   - Fast installation and builds
   - Workspace protocol for internal dependencies

3. **iframe Integration**:
   - Isolation: Each app runs in its own context
   - Independent routing: Apps manage their own routes
   - Security: CSP headers configured appropriately
   - Fallback: Error boundaries handle loading failures

4. **Multiple Build Targets**:
   - Apps can be developed independently
   - Main app aggregates all built apps
   - Each app maintains its own release cycle

5. **Shared Packages Strategy**:
   - Deduplication of common code
   - Consistent typing across apps
   - Centralized utility functions

## Troubleshooting

### pnpm Issues

```bash
# pnpm not found
npm install -g pnpm

# Clear cache
pnpm store prune

# Reinstall everything
pnpm clean:all
pnpm install
```

### Type Errors After Migration

```bash
# Clear TypeScript cache
rm -rf node_modules/.cache
pnpm clean
pnpm install
pnpm type-check
```

### Build Failures

```bash
# Check individual app builds
cd apps/drama-analyst
pnpm build

# Check dependencies
pnpm list --depth=0

# Verify vite.config.ts base path matches deployment path
```

### iframe Loading Issues

1. Check `public/<app-name>/index.html` exists
2. Verify `base` path in `vite.config.ts` matches iframe `src`
3. Check browser console for CSP violations
4. Ensure built assets reference correct paths (relative to base)

## Resources

- [pnpm Workspaces Documentation](https://pnpm.io/workspaces)
- [Vite Configuration](https://vitejs.dev/config/)
- [TypeScript Project References](https://www.typescriptlang.org/docs/handbook/project-references.html)
- Main README: [README.md](README.md)
- Architecture Details: [ARCHITECTURE.md](ARCHITECTURE.md)
- External Apps: [external/README.md](external/README.md)
- Build Guide: [external/BUILD_GUIDE.md](external/BUILD_GUIDE.md)
- Monorepo Setup: [MONOREPO_README.md](MONOREPO_README.md)

---

**Last Updated**: 2025-10-15
**For**: Claude Code automated assistance and development workflows
