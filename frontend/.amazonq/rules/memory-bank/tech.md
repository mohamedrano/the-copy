# Technology Stack

## Core Technologies

### Frontend Framework
- **Next.js 15.3.3**: React framework with App Router
- **React 18.3.1**: UI library with concurrent features
- **TypeScript 5**: Static type checking
- **Tailwind CSS 3.4.1**: Utility-first CSS framework

### AI & Machine Learning
- **Google Genkit 1.20.0**: AI application framework
- **Google Generative AI 0.24.1**: LLM integration
- **@genkit-ai/google-genai**: Genkit Google AI connector
- **@genkit-ai/next**: Next.js Genkit integration

### UI Components & Styling
- **shadcn/ui**: Component library built on Radix UI
- **Radix UI**: Headless UI primitives
- **Lucide React**: Icon library
- **Tailwind Merge**: Utility class merging
- **Class Variance Authority**: Component variant management

### Form Handling & Validation
- **React Hook Form 7.54.2**: Form state management
- **Zod 3.25.76**: Schema validation
- **@hookform/resolvers**: Form validation resolvers

### Testing Infrastructure
- **Vitest 4.0.2**: Unit testing framework
- **Playwright 1.49.1**: E2E testing framework
- **@testing-library/react**: React testing utilities
- **@vitest/coverage-v8**: Code coverage reporting

### Monitoring & Analytics
- **Sentry 8.47.0**: Error tracking and performance monitoring
- **Web Vitals 4.2.4**: Core Web Vitals measurement
- **@sentry/nextjs**: Next.js Sentry integration

### Development Tools
- **ESLint 8.57.1**: Code linting
- **Prettier 3.6.2**: Code formatting
- **Husky 9.1.7**: Git hooks
- **TypeScript ESLint**: TypeScript-specific linting rules

## Build & Deployment

### Build Tools
- **Turbopack**: Next.js bundler for development
- **@next/bundle-analyzer**: Bundle size analysis
- **PostCSS**: CSS processing
- **Autoprefixer**: CSS vendor prefixing

### Deployment Platforms
- **Firebase Hosting**: Static site hosting
- **Vercel**: Alternative deployment platform
- **GitHub Actions**: CI/CD pipeline

### Package Management
- **npm**: Primary package manager
- **pnpm**: Alternative package manager (lockfile present)
- **Node.js >=20.0.0**: Runtime requirement

## Development Commands

### Development Server
```bash
npm run dev                 # Start development server on port 9002
npm run genkit:dev         # Start Genkit development server
npm run genkit:watch       # Start Genkit with file watching
```

### Building & Production
```bash
npm run build              # Production build
npm run build:production   # Production build with optimizations
npm run start              # Start production server
npm run analyze            # Build with bundle analysis
```

### Testing
```bash
npm run test               # Run unit tests in watch mode
npm run test:coverage      # Run tests with coverage report
npm run test:ui            # Run tests with UI interface
npm run e2e                # Run E2E tests
npm run e2e:ui             # Run E2E tests with UI
npm run test:all           # Run all tests
```

### Code Quality
```bash
npm run lint               # Run ESLint
npm run lint:fix           # Fix ESLint issues
npm run format             # Format code with Prettier
npm run typecheck          # TypeScript type checking
```

### Performance & Monitoring
```bash
npm run performance:report # Generate performance report
npm run a11y:ci           # Run accessibility tests
npm run perf:ci           # Run performance tests
```

## Environment Configuration

### Required Environment Variables
- **NODE_ENV**: Environment mode (development/production)
- **GOOGLE_GENAI_API_KEY**: Google Generative AI API key
- **SENTRY_DSN**: Sentry error tracking DSN
- **FIREBASE_PROJECT_ID**: Firebase project identifier

### Optional Integrations
- **OPENAI_API_KEY**: OpenAI API integration
- **ANTHROPIC_API_KEY**: Anthropic Claude integration
- **DATABASE_URL**: PostgreSQL database connection
- **REDIS_URL**: Redis cache connection

### Feature Flags
- **ENABLE_ANALYTICS**: Analytics tracking toggle
- **ENABLE_VOICE_FEATURES**: Voice feature toggle
- **ENABLE_3D_PREVIEW**: 3D preview functionality
- **ENABLE_AI_SUGGESTIONS**: AI suggestion features

## Version Requirements
- **Node.js**: >=20.0.0
- **npm**: Latest stable version
- **TypeScript**: Version 5.x
- **React**: Version 18.x