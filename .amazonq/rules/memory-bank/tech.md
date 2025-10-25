# Technology Stack

## Core Technologies

### Frontend
- **Framework**: Next.js 15.3.3 (React 18.3.1)
- **Language**: TypeScript 5.x
- **Styling**: Tailwind CSS 3.4.1 with tailwindcss-animate
- **UI Components**: Radix UI primitives with shadcn/ui
- **Build Tool**: Turbopack (Next.js built-in)
- **Package Manager**: npm

### Backend
- **Runtime**: Node.js ≥20.0.0
- **Framework**: Express.js 4.18.2
- **Language**: TypeScript 5.x
- **AI Integration**: Google Generative AI 0.24.1
- **File Processing**: Mammoth (DOCX), PDF.js (PDF)
- **Validation**: Zod 3.25.76

## Development Requirements
- **Node.js**: ≥20.11.0 (frontend), ≥20.0.0 (backend)
- **npm**: Latest version
- **Environment**: Linux/macOS/Windows with bash support

## Key Dependencies

### Frontend Core
```json
{
  "@genkit-ai/google-genai": "^1.20.0",
  "@google/genai": "^0.8.0",
  "next": "15.3.3",
  "react": "^18.3.1",
  "typescript": "^5"
}
```

### UI & Styling
```json
{
  "@radix-ui/react-*": "Various versions",
  "tailwindcss": "^3.4.1",
  "class-variance-authority": "^0.7.1",
  "lucide-react": "^0.475.0"
}
```

### Backend Core
```json
{
  "@google/generative-ai": "^0.24.1",
  "@modelcontextprotocol/sdk": "^1.20.2",
  "express": "^4.18.2",
  "zod": "^3.25.76"
}
```

## Development Tools

### Testing
- **Frontend**: Vitest 4.0.2, Playwright 1.49.1, Testing Library
- **Backend**: Vitest 4.0.2, Supertest 6.3.4
- **Coverage**: @vitest/coverage-v8

### Code Quality
- **Linting**: ESLint 8.57.1 with TypeScript rules
- **Formatting**: Prettier 3.6.2
- **Type Checking**: TypeScript compiler
- **Git Hooks**: Husky 9.1.7 with lint-staged

### Build & Deployment
- **Bundler**: Next.js with Turbopack
- **Monitoring**: Sentry 8.47.0
- **Performance**: Web Vitals 4.2.4
- **Security**: Helmet 7.1.0, CORS 2.8.5

## Development Commands

### Frontend
```bash
npm run dev          # Start development server (port 9002)
npm run build        # Production build
npm run test         # Run unit tests
npm run e2e          # Run end-to-end tests
npm run lint         # Lint code
npm run typecheck    # Type checking
```

### Backend
```bash
npm run dev          # Start development server (port 3001)
npm run dev:mcp      # Start MCP server
npm run build        # Compile TypeScript
npm run test         # Run tests
npm run lint         # Lint code
```

### Root Level
```bash
./start-dev.sh       # Start both frontend and backend
```

## Architecture Patterns
- **Monorepo**: Separate frontend/backend with shared dependencies
- **API-First**: RESTful API design with OpenAPI documentation
- **Component-Driven**: Reusable UI components with Storybook-ready structure
- **Type-Safe**: End-to-end TypeScript with strict configuration
- **Test-Driven**: Comprehensive testing strategy with high coverage targets

## Performance Optimizations
- **Code Splitting**: Next.js automatic code splitting
- **Image Optimization**: Next.js Image component
- **Bundle Analysis**: @next/bundle-analyzer for size monitoring
- **Caching**: Strategic caching for AI analysis results
- **Lazy Loading**: Dynamic imports for heavy components