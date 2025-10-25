# Project Structure

## Root Architecture
```
the-copy-/
├── frontend/           # Next.js React application
├── backend/            # Express.js API server
├── start-dev.sh       # Development startup script
└── package.json       # Root dependencies
```

## Frontend Structure (`frontend/`)
```
frontend/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (main)/            # Main application routes
│   │   │   ├── analysis/      # Analysis pages (initial, deep)
│   │   │   ├── brainstorm/    # AI brainstorming interface
│   │   │   └── editor/        # Screenplay editor
│   │   ├── api/               # API routes
│   │   └── globals.css        # Global styles
│   ├── components/            # React components
│   │   ├── ui/               # Reusable UI components (shadcn/ui)
│   │   ├── file-upload.tsx   # File handling component
│   │   ├── ScreenplayEditor.tsx # Main editor component
│   │   └── stations-pipeline.tsx # Analysis pipeline UI
│   ├── lib/                   # Core libraries and utilities
│   │   ├── ai/               # AI integration and pipeline
│   │   ├── drama-analyst/    # Specialized analysis agents
│   │   └── utils/            # Utility functions
│   └── hooks/                # Custom React hooks
├── public/                   # Static assets
├── tests/                   # Test files
└── docs/                    # Documentation
```

## Backend Structure (`backend/`)
```
backend/
├── src/
│   ├── controllers/         # Request handlers
│   ├── services/           # Business logic
│   │   ├── analysis.service.ts
│   │   └── gemini.service.ts
│   ├── middleware/         # Express middleware
│   ├── utils/             # Utility functions
│   ├── types/             # TypeScript type definitions
│   ├── config/            # Configuration files
│   ├── server.ts          # Main server entry point
│   └── mcp-server.ts      # Model Context Protocol server
└── package.json           # Backend dependencies
```

## Key Components

### AI Analysis Pipeline
- **Station-based Architecture**: 7 specialized analysis stations
- **Agent System**: 25+ specialized AI agents for different analysis aspects
- **Orchestration Layer**: Manages agent execution and data flow
- **Caching System**: Optimizes performance for repeated analyses

### Frontend Architecture
- **Next.js App Router**: Modern routing with server components
- **Component Library**: shadcn/ui for consistent UI components
- **State Management**: React hooks and context for state handling
- **File Processing**: Support for PDF, DOCX, and text files

### Backend Architecture
- **Express.js API**: RESTful API with middleware stack
- **Google Gemini Integration**: AI model integration for text analysis
- **MCP Server**: Model Context Protocol for external integrations
- **Error Handling**: Comprehensive error management and logging

## Data Flow
1. **File Upload**: Users upload dramatic texts through frontend
2. **Processing**: Backend processes files and extracts text content
3. **AI Analysis**: Multi-stage AI pipeline analyzes content
4. **Results**: Structured analysis results returned to frontend
5. **Visualization**: Frontend displays results with interactive components

## Development Workflow
- **Monorepo Structure**: Separate frontend and backend with shared dependencies
- **Development Scripts**: Unified development startup via `start-dev.sh`
- **Testing**: Comprehensive test suites for both frontend and backend
- **Type Safety**: Full TypeScript implementation across the stack