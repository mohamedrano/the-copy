# External Projects Build Guide

This guide outlines the build configuration requirements for all external projects integrated into "the copy".

## Build Configuration Template

Each external project must follow this standardized configuration:

### Vite Configuration Requirements

```typescript
// vite.config.ts - Standard template
export default defineConfig({
  base: '/<project-name>/',           // Must match project directory name
  build: {
    outDir: 'dist',                   // Standard output directory
    emptyOutDir: true,                // Clean before build
    sourcemap: false,                 // Disabled for production
    rollupOptions: {
      output: {
        manualChunks: {
          // Optimize chunk splitting for performance
          vendor: ['react', 'react-dom'],
          // Add project-specific chunks as needed
        }
      }
    }
  },
  server: {
    port: 5000 + <offset>,            // Avoid port conflicts
    host: true,                       // Allow external access
  }
})
```

### Package.json Requirements

```json
{
  "name": "the-copy-<project-name>",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "type-check": "tsc --noEmit",
    "lint": "eslint . --ext .ts,.tsx --max-warnings 0"
  }
}
```

## Project-Specific Configurations

### Drama Analyst (`drama-analyst/`)
- **Base Path**: `/drama-analyst/`
- **Dev Port**: 5001
- **Build Output**: `dist/`
- **Special Features**: PWA support, Sentry integration
- **Dependencies**: React 19, TypeScript, Vite

### Stations (`stations/`)
- **Base Path**: `/stations/`
- **Dev Port**: 5002
- **Build Output**: `dist/`
- **Special Features**: Full-stack with Express backend
- **Dependencies**: React 18, TypeScript, Vite, Express

### Multi-Agent Story (`multi-agent-story/`)
- **Base Path**: `/multi-agent-story/`
- **Dev Port**: 5003
- **Build Output**: `jules-frontend/dist/`
- **Special Features**: Multi-agent system, Fastify backend
- **Dependencies**: React 18, TypeScript, Vite, Fastify

## Build Process

### Individual Project Build
```bash
# Navigate to project directory
cd external/<project-name>

# Install dependencies
npm install

# Type check
npm run type-check

# Lint check
npm run lint

# Build
npm run build
```

### Unified Build (from root)
```bash
# Build all external projects
npm run build:external

# Build main app + external projects
npm run build:prod
```

## Port Allocation

| Project | Dev Port | Production Path |
|---------|----------|-----------------|
| Main App | 5173 | `/` |
| Drama Analyst | 5001 | `/drama-analyst/` |
| Stations | 5002 | `/stations/` |
| Multi-Agent Story | 5003 | `/multi-agent-story/` |

## Router Configuration

For projects using React Router, ensure proper basename configuration:

```typescript
// For React Router v6
<BrowserRouter basename={import.meta.env.BASE_URL}>

// For React Router v5
<BrowserRouter basename={process.env.PUBLIC_URL}>
```

## Error Handling

Each project should implement:
- Error boundaries for React components
- Graceful fallbacks for missing dependencies
- Proper error logging and reporting

## Performance Requirements

- **Bundle Size**: < 1MB per project (gzipped)
- **First Load**: < 3 seconds
- **Time to Interactive**: < 5 seconds
- **Lighthouse Score**: > 90

## Testing Requirements

- Unit tests for core functionality
- Integration tests for API calls
- E2E tests for critical user flows
- Performance tests for large datasets

## Deployment Notes

- All projects build to their respective `dist/` directories
- Main application copies built projects to `public/<project-name>/`
- Nginx serves static files with proper caching headers
- Docker container includes all built projects