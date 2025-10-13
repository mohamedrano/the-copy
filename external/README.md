# External Projects Integration

This directory contains three external applications that are integrated into "the copy" main application.

## Project Structure

```
external/
├── drama-analyst/          # Arabic Drama Analysis Platform
├── stations/               # Stations Management System  
└── multi-agent-story/      # Multi-Agent Storytelling Platform
```

## Individual Project Details

### Drama Analyst (`drama-analyst/`)
- **Purpose**: Arabic drama analysis and creative mimicry platform
- **Technology**: React 19, TypeScript, Vite, PWA
- **Base Path**: `/drama-analyst/`
- **Port**: 5001 (dev server)
- **Key Features**:
  - Arabic text analysis using AI
  - Document processing (Word files)
  - Creative content generation
  - PWA capabilities with offline support

### Stations (`stations/`)
- **Purpose**: REST API and management system
- **Technology**: React 18, TypeScript, Vite, Express backend
- **Base Path**: `/stations/`
- **Port**: 5002 (dev server)
- **Key Features**:
  - Full-stack application with Express backend
  - Database integration (PostgreSQL)
  - User authentication and sessions
  - Data visualization with Recharts

### Multi-Agent Story (`multi-agent-story/`)
- **Purpose**: Multi-agent storytelling development platform
- **Technology**: React 18, TypeScript, Vite, Fastify backend
- **Base Path**: `/multi-agent-story/`
- **Port**: 5003 (dev server)
- **Key Features**:
  - Multi-agent AI system
  - Story development tools
  - Real-time collaboration
  - Backend API integration

## Build Configuration

Each project is configured with:
- **Base URL**: Set to their respective subdirectory
- **Build Output**: `dist/` directory
- **Source Maps**: Disabled for production
- **Code Splitting**: Optimized for performance

## Integration Points

- **Main App Routes**:
  - `/drama-analyst/` → Drama Analyst application
  - `/stations/` → Stations management system
  - `/multi-agent-story/` → Multi-agent storytelling platform

- **Build Process**: Each project builds independently and is copied to `public/<project-name>/`

## Development

To work on individual projects:

```bash
# Drama Analyst
cd external/drama-analyst
npm install
npm run dev

# Stations
cd external/stations  
npm install
npm run dev

# Multi-Agent Story
cd external/multi-agent-story
npm install
npm run dev
```

## Production Build

The main application handles building all external projects:

```bash
# From root directory
npm run build:external  # Build all external projects
npm run build:prod      # Build main app + external projects
```

## Notes

- All projects maintain their independent development environments
- Shared dependencies are handled at the main application level
- Each project has its own error boundaries and loading states
- CSP headers are configured to work with the integrated setup