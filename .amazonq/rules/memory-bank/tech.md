# Technology Stack

## Runtime Environment
- **Node.js**: >=20.0.0 (both frontend and backend)
- **Package Manager**: npm with pnpm-lock.yaml support

## Frontend Technology Stack

### Core Framework
- **Next.js**: 15.3.3 (App Router, React Server Components)
- **React**: 18.3.1 with React DOM
- **TypeScript**: 5.x with strict configuration

### AI Integration
- **Google Genkit**: 1.20.0 (AI framework)
- **Google Generative AI**: 0.24.1 (Gemini API)
- **Firebase**: 11.9.1 (hosting and services)

### UI Framework
- **Tailwind CSS**: 3.4.1 with animations
- **Radix UI**: Complete component library
  - Accordion, Alert Dialog, Avatar, Checkbox, Dialog
  - Dropdown Menu, Form, Input, Select, Tabs, Toast
- **Lucide React**: 0.475.0 (icon system)
- **Recharts**: 2.15.1 (data visualization)

### Form & Validation
- **React Hook Form**: 7.54.2
- **Zod**: 3.25.76 (schema validation)
- **Hookform Resolvers**: 4.1.3

### File Processing
- **PDF.js**: 4.4.168 (PDF text extraction)
- **Mammoth**: 1.7.0 (DOCX processing)

### Development Tools
- **ESLint**: 8.57.1 with TypeScript rules
- **Prettier**: 3.6.2 (code formatting)
- **Vitest**: 4.0.2 (unit testing)
- **Playwright**: 1.49.1 (E2E testing)
- **Husky**: 9.1.7 (git hooks)

### Build & Optimization
- **Turbopack**: Next.js bundler
- **Bundle Analyzer**: Performance analysis
- **PostCSS**: CSS processing with autoprefixer
- **Sentry**: 8.47.0 (error monitoring)

## Backend Technology Stack

### Core Framework
- **Express.js**: 4.18.2
- **TypeScript**: 5.x
- **tsx**: 4.7.0 (TypeScript execution)

### AI Integration
- **Google Generative AI**: 0.24.1 (Gemini API)

### Security & Middleware
- **Helmet**: 7.1.0 (security headers)
- **CORS**: 2.8.5 (cross-origin requests)
- **Express Rate Limit**: 7.1.5 (rate limiting)
- **Compression**: 1.7.4 (response compression)

### File Processing
- **Multer**: 1.4.5-lts.1 (file uploads)
- **PDF.js**: 4.4.168 (PDF processing)
- **Mammoth**: 1.7.0 (DOCX processing)

### Utilities
- **Winston**: 3.11.0 (logging)
- **Zod**: 3.25.76 (validation)
- **dotenv**: 16.5.0 (environment variables)

### Testing
- **Vitest**: 4.0.2 (unit testing)
- **Supertest**: 6.3.4 (API testing)
- **Coverage**: @vitest/coverage-v8

## Development Commands

### Frontend
```bash
npm run dev              # Development server (port 9002)
npm run build           # Production build
npm run test            # Unit tests
npm run e2e             # End-to-end tests
npm run lint            # Code linting
npm run typecheck       # Type checking
```

### Backend
```bash
npm run dev             # Development server (port 3001)
npm run build           # TypeScript compilation
npm run start           # Production server
npm run test            # Unit tests
npm run lint            # Code linting
```

## Environment Configuration

### Frontend Environment Variables
- `NEXT_PUBLIC_GOOGLE_AI_API_KEY` - Google AI API key
- `NEXT_PUBLIC_BACKEND_URL` - Backend API URL
- Firebase configuration variables

### Backend Environment Variables
- `GOOGLE_AI_API_KEY` - Google AI API key
- `PORT` - Server port (default: 3001)
- `NODE_ENV` - Environment mode

## Deployment Architecture

### Frontend Deployment
- **Platform**: Firebase App Hosting
- **Build**: Next.js static export
- **CDN**: Firebase CDN with global distribution

### Backend Deployment
- **Platform**: Node.js server
- **Process Management**: PM2 or similar
- **Load Balancing**: Nginx reverse proxy
- **Monitoring**: Winston logging with external aggregation