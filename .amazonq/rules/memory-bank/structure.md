# Project Structure

## Root Architecture
```
the-copy-/
├── frontend/           # Next.js React application
├── backend/            # Express.js API server
└── README.md          # Project documentation
```

## Frontend Structure (`/frontend`)

### Core Application (`/src/app`)
- **Main Layout**: App router with main layout and loading states
- **Analysis Routes**: 
  - `/analysis/initial` - Initial dramatic analysis interface
  - `/analysis/deep` - Deep analysis results
  - `/brainstorm` - AI brainstorming interface
  - `/editor` - Screenplay editor
- **API Routes**: Health check and screenplay review endpoints

### AI System (`/src/ai` & `/src/lib`)
- **Genkit Integration**: Google AI Genkit framework setup
- **Analysis Pipeline**: 7-station comprehensive analysis system
- **Drama Analyst**: Specialized AI agents for different analysis aspects
- **Services**: Gemini AI service, caching, error handling, logging

### Components (`/src/components`)
- **UI Components**: Radix UI-based design system (40+ components)
- **Business Components**: 
  - `ScreenplayEditor` - Rich text editor for scripts
  - `stations-pipeline` - Analysis pipeline visualization
  - `file-upload` - Document processing interface

### Testing & Quality
- **Unit Tests**: Vitest-based testing with coverage
- **E2E Tests**: Playwright automation for critical user flows
- **Performance**: Web vitals monitoring and bundle analysis

## Backend Structure (`/backend`)

### Core API (`/src`)
- **Server**: Express.js with security middleware (helmet, cors, rate limiting)
- **Controllers**: Analysis endpoint handlers
- **Services**: 
  - `analysis.service.ts` - Core analysis logic
  - `gemini.service.ts` - Google AI integration
- **Types**: TypeScript definitions for API contracts
- **Utils**: Logging and utility functions

### Configuration
- **Environment**: Centralized config management
- **Middleware**: Request processing and validation
- **Security**: Rate limiting, CORS, compression

## Key Architectural Patterns

### Microservices Communication
- Frontend (port 9002) ↔ Backend (port 3001)
- RESTful API design with structured endpoints
- Health monitoring and status checking

### AI Integration Architecture
- **Multi-Agent System**: Specialized AI agents for different analysis tasks
- **Pipeline Processing**: Sequential station-based analysis
- **Service Layer**: Abstracted AI service integration
- **Caching Strategy**: Performance optimization for AI responses

### File Processing Pipeline
- **Upload Handling**: PDF/DOCX file processing
- **Text Extraction**: Mammoth (DOCX) and PDF.js integration
- **Content Sanitization**: Security-focused text processing

### State Management
- **React Hook Form**: Form state and validation
- **Context API**: Global application state
- **Local Storage**: User preferences and session data

## Development Infrastructure

### Build System
- **Frontend**: Next.js with Turbopack, TypeScript, Tailwind CSS
- **Backend**: TypeScript compilation with tsx for development
- **Monorepo**: Independent package management per service

### Quality Assurance
- **Linting**: ESLint with TypeScript rules
- **Formatting**: Prettier with consistent configuration
- **Type Checking**: Strict TypeScript configuration
- **Testing**: Comprehensive unit and integration testing

### Deployment
- **Frontend**: Firebase hosting with App Hosting
- **Backend**: Node.js deployment with PM2 process management
- **CI/CD**: GitHub Actions for automated testing and deployment