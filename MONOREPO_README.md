# The Copy - Monorepo

This is a monorepo setup for The Copy project using pnpm workspaces.

## Structure

```
/
├── apps/
│   ├── the-copy/           # التطبيق الرئيسي (The Copy unified shell)
│   ├── basic-editor/       # المحرر الأساسي (Basic Arabic Screenplay Editor)
│   ├── drama-analyst/      # محلل الدراما (Drama Analyst & Creative Mimic)
│   ├── stations/           # المحطات (Stations App)
│   └── multi-agent-story/  # القصة متعددة الوكلاء (Multi-Agent Story)
├── packages/
│   ├── shared-ui/          # Shared UI components
│   ├── shared-types/       # Shared TypeScript types
│   └── shared-utils/       # Shared utility functions
├── pnpm-workspace.yaml     # Workspace configuration
├── package.json            # Root package.json
└── tsconfig.base.json      # Base TypeScript configuration
```

## Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0

## Installation

```bash
# Install pnpm if not already installed
npm install -g pnpm

# Install all dependencies
pnpm install
```

## Available Scripts

### Development

```bash
# Run all apps in development mode (parallel)
pnpm dev

# Run specific app
pnpm dev:main      # Main app
pnpm dev:basic     # Basic editor
pnpm dev:drama     # Drama analyst
pnpm dev:stations  # Stations
pnpm dev:story     # Multi-agent story
```

### Building

```bash
# Build all apps
pnpm build

# Build everything (including packages)
pnpm build:all

# Build specific app
pnpm build:main
pnpm build:basic
pnpm build:drama
pnpm build:stations
pnpm build:story
```

### Type Checking

```bash
# Type check all workspaces
pnpm type-check

# Type check specific app
pnpm type-check:main
```

### Linting

```bash
# Lint all workspaces
pnpm lint

# Lint and fix
pnpm lint:fix
```

### Testing

```bash
# Run all tests
pnpm test

# Run tests for specific app
pnpm test:main

# Run coverage
pnpm coverage
```

### Cleaning

```bash
# Clean all build outputs and node_modules
pnpm clean

# Clean everything (including .turbo)
pnpm clean:all
```

### Verification

```bash
# Run all quality checks
pnpm verify:all
```

## Workspace Commands

### Working with specific workspace

```bash
# Run command in specific workspace
pnpm --filter <workspace-name> <command>

# Example: Install package in the-copy
pnpm --filter the-copy add lodash

# Example: Run dev in drama-analyst
pnpm --filter drama-analyst run dev
```

### Running commands in all workspaces

```bash
# Run in all workspaces (recursive)
pnpm -r <command>

# Run in all apps only
pnpm --filter "./apps/**" <command>

# Run in all packages only
pnpm --filter "./packages/**" <command>
```

## Adding Dependencies

### To root workspace

```bash
pnpm add -w <package-name>
```

### To specific workspace

```bash
pnpm --filter <workspace-name> add <package-name>
```

### To add shared package as dependency

```bash
# In app's package.json
pnpm --filter the-copy add @the-copy/shared-ui@workspace:*
```

## Path Aliases

The following path aliases are configured in `tsconfig.base.json`:

- `@the-copy/shared-ui` - Shared UI components
- `@the-copy/shared-types` - Shared TypeScript types
- `@the-copy/shared-utils` - Shared utility functions

## Next Steps

1. Move existing code from root to `apps/the-copy/`
2. Move external apps to their respective directories in `apps/`
3. Extract common components to `packages/shared-ui/`
4. Extract common types to `packages/shared-types/`
5. Extract common utilities to `packages/shared-utils/`
6. Update import paths in all apps
7. Test build and development workflows

## Troubleshooting

### pnpm not found

Make sure pnpm is installed globally:

```bash
npm install -g pnpm
```

### Type errors after migration

Clear TypeScript cache and rebuild:

```bash
pnpm clean
pnpm install
pnpm type-check
```

### Dependency issues

Reset the entire workspace:

```bash
pnpm clean:all
pnpm install
```

## Resources

- [pnpm Workspaces](https://pnpm.io/workspaces)
- [pnpm CLI](https://pnpm.io/cli/add)
- [TypeScript Project References](https://www.typescriptlang.org/docs/handbook/project-references.html)
