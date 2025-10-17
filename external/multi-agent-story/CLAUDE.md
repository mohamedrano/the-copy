# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Jules is a multi-agent storytelling development platform that orchestrates 11 specialized AI agents (powered by Gemini 2.5 Pro/Flash) to analyze and develop story concepts through a structured 5-phase process: Creative Brief → Idea Generation → Independent Review → Tournament Discussion → Final Decision.

**Stack**: Node.js/TypeScript backend (Fastify) + React/TypeScript frontend (Vite) + PostgreSQL + Redis + Prisma ORM

## Essential Commands

### ⚡ Quick Start (Recommended)
```bash
# Install everything
npm install

# Start the entire platform with one command
npm start

# Development mode with hot reload
npm run dev
```

### Root Level Commands
```bash
npm start                     # Run full platform (auto-build if needed)
npm run dev                   # Development mode (backend + frontend)
npm run build                 # Build both backend and frontend
npm run prisma:generate       # Generate Prisma client
npm run prisma:migrate        # Run database migrations
npm test                      # Run tests
npm run lint                  # Lint all code
npm run clean                 # Clean all builds and dependencies
```

### Backend (jules-backend/)
```bash
cd jules-backend

npm run dev                    # Start development server with hot reload
npm run build                 # Compile TypeScript and resolve aliases
npm start                     # Run production build
npm run prisma:generate        # Generate Prisma client after schema changes
npm run prisma:migrate         # Create and apply migrations
npm run prisma:studio          # Open Prisma Studio GUI
npm test                       # Run tests
npm run lint                  # Check for linting errors
npm run lint:fix              # Auto-fix linting errors
npm run type-check            # Type check without emitting files
```

### Frontend (jules-frontend/)
```bash
cd jules-frontend

npm run dev                   # Start Vite dev server
npm run build                 # Type check and build for production
npm run preview              # Preview production build locally
npm run lint                 # Check for linting errors
npm run lint:fix             # Auto-fix linting errors
npm run type-check           # Type check without emitting
npm run format               # Format code with Prettier
npm run format:check         # Check formatting without changing files
```

### Docker (Optional)
```bash
# Full stack
docker-compose up --build    # Build and start all services
docker-compose down          # Stop all services

# Production
docker-compose -f docker-compose.prod.yml up --build -d

# Individual services available: postgres, redis, backend, frontend
```

## Architecture

### Multi-Agent System
The platform manages 11 specialized AI agents:
- **Story Architect**: Overall structure and narrative flow
- **Character Expansion**: Deep character development
- **Dialogue & Voice**: Character voice and dialogue quality
- **World Building**: Setting and environment consistency
- **Theme**: Thematic depth and resonance
- **Conflict/Tension**: Dramatic tension and stakes
- **Pacing**: Story rhythm and momentum
- **Genre/Tone**: Genre conventions and tonal consistency
- **Realism Critic**: Logical consistency and believability
- **Strategic Analyst**: Marketability and audience appeal

### Service Layer Architecture (jules-backend/src/services/)
- **orchestrator.service.ts**: Master coordinator managing the entire 5-phase workflow
- **agent.service.ts**: Manages agent lifecycle and Gemini API interactions
- **session.service.ts**: Session state management
- **idea.service.ts**: Idea generation coordination (2 competing ideas per session)
- **review.service.ts**: Independent review phase (each agent reviews each idea)
- **tournament.service.ts**: Manages 8-turn debate between agents
- **decision.service.ts**: Final decision synthesis

### Gemini Integration (jules-backend/src/integrations/gemini/)
- **client.ts**: Gemini API client with retry logic and streaming support
- **pool.ts**: Connection pool management for parallel agent calls
- **prompts.ts**: Agent-specific prompt templates and system instructions

### Data Model (Prisma Schema)
Core entities: `User` → `Session` → `CreativeBrief` → `Idea` → `Review` → `Tournament` → `FinalDecision`

Each session flows through phases tracked via `currentPhase` field:
1. `brief` - Creative brief definition
2. `generation` - Generate 2 competing ideas
3. `review` - Independent agent reviews (11 agents × 2 ideas = 22 reviews)
4. `tournament` - 8-turn debate discussion
5. `decision` - Final synthesis and winner selection

### State Management (Frontend)
Zustand stores in [jules-frontend/src/store/](jules-frontend/src/store/):
- Authentication state
- Session state with WebSocket real-time updates
- Agent status tracking

### Real-time Updates
WebSocket connection provides live updates during long-running phases (generation, tournament, decision). The backend emits progress events consumed by frontend hooks.

## Key Development Patterns

### Adding a New Agent Type
1. Add agent definition to agent prompt templates in [jules-backend/src/integrations/gemini/prompts.ts](jules-backend/src/integrations/gemini/prompts.ts)
2. Update agent creation logic in [jules-backend/src/services/agent.service.ts](jules-backend/src/services/agent.service.ts)
3. Modify orchestrator workflow if agent participates in new phases

### Database Schema Changes
```bash
# 1. Edit jules-backend/prisma/schema.prisma
# 2. Generate migration
npm run prisma:migrate
# 3. Regenerate Prisma client
npm run prisma:generate
# 4. Restart dev server for types to update
```

### Environment Variables
Required variables (see [.env.example](.env.example)):
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Min 32 chars for production
- `GEMINI_API_KEY`: User-provided API key (stored encrypted per user)
- `ENCRYPTION_KEY`: For API key encryption (Fernet-compatible)

Users provide their own Gemini API keys which are encrypted and stored in `api_keys` table. The platform does not ship with a default API key.

## Common Development Tasks

### Running a Single Test
```bash
cd jules-backend
npm test -- path/to/test-file.test.ts
```

### Debugging WebSocket Issues
Check connection logs in browser DevTools Network tab (WS filter). Backend WebSocket handler is in [jules-backend/src/server.ts](jules-backend/src/server.ts).

### Testing Gemini Integration Locally
Ensure `GEMINI_API_KEY` is set in your `.env` file or stored via the API key management endpoints. Test via API docs at `http://localhost:8000/docs` when backend is running.

## Important Notes

- **Always respond to users in Arabic** when they communicate in Arabic (per AGENTS.md directive)
- Agent prompts and guides are bilingual (Arabic/English) - maintain this pattern
- The platform uses Gemini 2.0 Flash Experimental by default (configurable in [config.ts](jules-backend/src/config.ts))
- Sessions are stateful and can take several minutes to complete due to multiple API calls (2 ideas × 11 reviews + 8-turn tournament)
- Use Prisma Studio (`npm run prisma:studio`) for inspecting database during development
