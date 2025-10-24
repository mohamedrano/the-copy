# Project Structure

## Root Directory Organization

### Core Application
- **src/**: Main application source code
  - **app/**: Next.js App Router pages and layouts
  - **components/**: Reusable React components
  - **hooks/**: Custom React hooks
  - **lib/**: Utility functions and configurations
  - **ai/**: AI integration and Genkit flows

### Configuration & Setup
- **public/**: Static assets and public files
- **.github/workflows/**: CI/CD pipeline configurations
- **scripts/**: Build and analysis automation scripts
- **docs/**: Project documentation and blueprints

### Testing Infrastructure
- **tests/**: E2E test suites with Playwright
- **test-results/**: Generated test reports and artifacts
- **reports/**: Coverage and performance reports

## Detailed Directory Structure

### `/src/app/` - Next.js App Router
```
app/
├── (main)/                 # Route groups for main application
│   └── analysis/          # Analysis tools and interfaces
├── api/                   # API routes and endpoints
├── layout.tsx            # Root layout component
├── page.tsx              # Homepage component
├── globals.css           # Global styles
└── actions.ts            # Server actions
```

### `/src/components/` - React Components
```
components/
├── ui/                   # shadcn/ui component library
│   ├── sidebar.tsx      # Navigation sidebar
│   └── [other-ui-components]
├── ErrorBoundary.tsx    # Error handling component
├── ScreenplayEditor.tsx # Drama analysis editor
├── file-upload.tsx      # File handling component
└── stations-pipeline.tsx # Processing pipeline UI
```

### `/src/lib/` - Utilities & Configuration
```
lib/
├── types/               # TypeScript type definitions
├── ai/                  # AI utility functions
├── drama-analyst/       # Drama analysis logic
├── __tests__/          # Unit tests for utilities
├── utils.ts            # General utility functions
└── web-vitals.ts       # Performance monitoring
```

### `/src/ai/` - AI Integration
```
ai/
├── flows/              # Genkit AI flow definitions
├── ai-team-brainstorming.ts # Collaborative AI features
├── genkit.ts           # Genkit configuration
└── dev.ts              # Development AI tools
```

## Architectural Patterns

### Component Architecture
- **Atomic Design**: UI components organized by complexity (atoms, molecules, organisms)
- **Compound Components**: Complex components with sub-components (e.g., forms, dialogs)
- **Provider Pattern**: Context providers for global state management

### Data Flow
- **Server Actions**: Next.js server actions for form handling
- **React Hook Form**: Client-side form state management
- **Zod Validation**: Schema validation for type safety

### AI Integration
- **Genkit Flows**: Structured AI workflows with Google Generative AI
- **Streaming Responses**: Real-time AI response handling
- **Context Management**: Conversation and session state handling

### Testing Strategy
- **Unit Tests**: Component and utility function testing with Vitest
- **Integration Tests**: API and flow testing
- **E2E Tests**: Full user journey testing with Playwright
- **Accessibility Tests**: Automated a11y validation

## Key Relationships

### Component Dependencies
- UI components depend on shadcn/ui base components
- Feature components consume utility functions from `/lib/`
- AI components integrate with Genkit flows

### Data Dependencies
- Components use React Hook Form for state management
- Server actions handle form submissions and API calls
- AI flows process user inputs and generate responses

### Build Dependencies
- Next.js handles routing and server-side rendering
- Tailwind CSS provides styling system
- TypeScript ensures type safety across the application