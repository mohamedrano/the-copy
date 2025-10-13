# Agent Rules - Arabic Screenplay Editor

## Project Context
Professional Arabic screenplay editor application with AI-powered analysis agents, built with React 19, TypeScript 5, Vite 7, and Tailwind CSS 4. Focuses on screenplay formatting, character analysis, and content generation using Google Gemini API.

## Core Principles

### 1. Technology Stack Adherence
- **React 19+**: Use latest React features (JSX.Element, functional components)
- **TypeScript Strict Mode**: All code must pass strict type checking
- **Vite 7**: ES2020+ target with modern build optimization
- **Tailwind CSS 4**: Utility-first styling with RTL support
- **No State Management Library**: Use React hooks and local state only

### 2. Code Quality Standards
- **TypeScript Types**: Define interfaces for all props and complex objects
- **Arabic Comments**: Use Arabic for business logic comments
- **Error Boundaries**: Wrap components with proper error handling
- **JSDoc Optional**: Use TypeScript types instead of JSDoc

### 3. File Organization
```
src/
├── agents/              # AI agent modules
│   ├── analysis/       # Analysis agents
│   ├── generation/     # Content generation agents
│   ├── transformation/ # Content transformation agents
│   ├── evaluation/     # Quality evaluation agents
│   ├── core/          # Shared agent utilities
│   └── instructions/  # Agent prompt templates
├── components/         # React components
│   ├── editor/        # Editor components
│   └── [feature]/     # Feature-specific components
├── services/          # Business logic services
├── utils/             # Utility functions
├── types/             # TypeScript type definitions
└── config/            # Configuration files
```

## Development Guidelines

### Component Structure Pattern
```typescript
import type { JSX } from 'react';
import { useState, useCallback, useMemo } from 'react';

interface ComponentProps {
  onBack: () => void;
  initialValue?: string;
}

export default function ComponentName({ onBack, initialValue }: ComponentProps): JSX.Element {
  const [state, setState] = useState<string>(initialValue ?? '');

  const handleAction = useCallback(() => {
    // Implementation
  }, [/* dependencies */]);

  const memoizedValue = useMemo(() => {
    // Expensive computation
  }, [/* dependencies */]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Component content */}
    </div>
  );
}
```

### Agent Module Pattern
```typescript
import { GoogleGenerativeAI } from '@google/generative-ai';
import type { GenerateContentResult } from '@google/generative-ai';

export interface AgentConfig {
  apiKey: string;
  model: string;
  temperature?: number;
}

export interface AgentOutput<T> {
  success: boolean;
  data?: T;
  error?: string;
  confidence: number;
}

export class AgentName {
  private genAI: GoogleGenerativeAI;
  private model: string;

  constructor(config: AgentConfig) {
    this.genAI = new GoogleGenerativeAI(config.apiKey);
    this.model = config.model;
  }

  async analyze(input: string): Promise<AgentOutput<YourType>> {
    try {
      // Agent implementation
      return { success: true, data, confidence: 0.95 };
    } catch (error) {
      return { success: false, error: String(error), confidence: 0 };
    }
  }
}
```

### Arabic Text Processing
- **Unicode Normalization**: Always use `.normalize('NFC')` on Arabic text
- **RTL Direction**: Default `direction: 'rtl'` for Arabic content
- **Text Alignment**: Use `text-right` for RTL, `text-center` for centered content
- **Mixed Content**: Handle Arabic + English/Numbers with proper Unicode bidi

### State Management
- **Local State**: `useState` for component-specific state
- **Callbacks**: `useCallback` for event handlers to prevent re-renders
- **Memoization**: `useMemo` for expensive computations
- **No Global State**: Pass state through props or context when needed

### Routing Pattern
```typescript
// App.tsx - Simple page-based routing
const [currentPage, setCurrentPage] = useState('home');

const renderPage = () => {
  switch (currentPage) {
    case 'editor':
      return <EditorPage onBack={() => setCurrentPage('home')} />;
    case 'agents':
      return <AgentsPage onBack={() => setCurrentPage('home')} />;
    default:
      return <HomePage onNavigate={setCurrentPage} />;
  }
};
```

## Feature Development Rules

### AI Agent Integration
- **API Key**: Use environment variables or user-provided keys
- **Model Selection**: Default to `gemini-1.5-pro` or `gemini-2.0-flash-exp`
- **Error Handling**: Always wrap API calls in try-catch
- **Timeout**: Set reasonable timeout for API requests (30s default)
- **Streaming**: Use streaming for long-form generation when possible

### Screenplay Formatting
- **Scene Headers**: `مشهد [number]` - bold, centered
- **Time/Location**: `(ليل|نهار)-(داخلي|خارجي)` - centered, italic
- **Character Names**: `NAME:` - uppercase, centered, bold
- **Dialogue**: Centered with 20% margin on both sides
- **Action Lines**: Right-aligned, normal weight
- **Transitions**: Right-aligned, uppercase

### Character Analysis
```typescript
interface Character {
  name: string;              // Arabic name
  appearances: number;       // Scene count
  dialogueLines: number;     // Total dialogue
  relationships: string[];   // Related characters
  development: string;       // Character arc
}

// Minimum thresholds
const ANALYSIS_THRESHOLDS = {
  minScenes: 3,
  minDialogueLines: 2,
  minConfidence: 0.7
};
```

### Export Functionality
- **Formats**: PDF, DOCX, TXT support
- **Templates**: Professional screenplay templates
- **Encoding**: UTF-8 with BOM for Arabic support
- **Metadata**: Include title, author, date in exports

## Code Standards

### Naming Conventions
- **Components**: PascalCase (`ScreenplayEditor`, `HomePage`)
- **Functions**: camelCase (`analyzeCharacter`, `formatDialogue`)
- **Types/Interfaces**: PascalCase (`ScreenplayLine`, `AgentConfig`)
- **Files**: PascalCase for components, camelCase for utilities
- **Constants**: UPPER_SNAKE_CASE (`MAX_SCENES`, `DEFAULT_CONFIG`)

### TypeScript Best Practices
```typescript
// Use strict types
interface Props {
  required: string;
  optional?: number;
}

// Avoid 'any' - use 'unknown' if needed
function process(data: unknown): void {
  if (typeof data === 'string') {
    // Type narrowing
  }
}

// Use type guards
function isScreenplayLine(obj: unknown): obj is ScreenplayLine {
  return typeof obj === 'object' && obj !== null && 'type' in obj;
}

// Prefer readonly for immutable data
interface Config {
  readonly apiKey: string;
  readonly model: string;
}
```

### Error Handling
```typescript
// Component error boundaries
try {
  const result = await analyzeContent(text);
  setAnalysis(result);
} catch (error) {
  console.error('Analysis failed:', error);
  // Show user-friendly error message
  setError('فشل تحليل المحتوى. يرجى المحاولة مرة أخرى.');
}

// Agent error handling
if (!result.success) {
  return {
    success: false,
    error: 'خطأ في معالجة النص',
    confidence: 0
  };
}
```

### Styling with Tailwind
- **RTL Support**: Use `dir="rtl"` on Arabic containers
- **Responsive**: Mobile-first approach (`md:`, `lg:` prefixes)
- **Colors**: Use semantic color names (`bg-blue-600`, `text-gray-900`)
- **Spacing**: Consistent spacing scale (4px increments)
- **Gradients**: Use for backgrounds (`bg-gradient-to-br from-blue-50 to-indigo-100`)

## Build & Deployment

### Environment Configuration
```bash
# Required for AI features
VITE_GEMINI_API_KEY=your_api_key_here

# Optional configuration
VITE_APP_NAME=Arabic Screenplay Editor
VITE_APP_VERSION=1.0.0
VITE_DEFAULT_MODEL=gemini-1.5-pro
```

### Build Scripts
```json
{
  "dev": "vite",                    // Development server (localhost:5173)
  "build": "tsc && vite build",     // Production build with type-check
  "preview": "vite preview",        // Preview production build
  "type-check": "tsc --noEmit",     // Type checking only
  "lint": "eslint src --ext ts,tsx",
  "test": "vitest",                 // Run tests
  "test:coverage": "vitest run --coverage"
}
```

### Build Optimization
- **Code Splitting**: Vendor, core, features chunks
- **Bundle Size**: Target < 500KB gzipped
- **Tree Shaking**: Remove unused code automatically
- **Asset Optimization**: Images and fonts compressed
- **Lazy Loading**: Load routes and heavy components on demand

### Development Workflow
- **Hot Reload**: Vite HMR for instant updates
- **Type Checking**: Run `npm run type-check` before commit
- **Linting**: ESLint with TypeScript rules
- **Testing**: Vitest for unit and integration tests

## Performance Optimization

### React Performance
```typescript
// Memoize expensive computations
const processedText = useMemo(() =>
  processScreenplay(text),
  [text]
);

// Memoize callbacks
const handleChange = useCallback((newText: string) => {
  setText(newText);
}, []);

// Lazy load components
const AdvancedEditor = lazy(() => import('./AdvancedEditor'));

// Debounce frequent updates
const debouncedUpdate = useMemo(
  () => debounce((value: string) => {
    updateAnalysis(value);
  }, 500),
  []
);
```

### Agent Performance
- **Caching**: Cache analysis results (1 hour TTL)
- **Batching**: Batch multiple agent requests when possible
- **Parallel Execution**: Run independent agents in parallel
- **Progressive Loading**: Show partial results immediately

### Memory Management
- **Cleanup**: Use `useEffect` cleanup for subscriptions
- **Limits**: Max 50 items in undo/redo stack
- **Large Files**: Stream processing for > 10,000 lines
- **Memory Target**: < 200MB for typical screenplay

## Security & Privacy

### Data Protection
- **Local Storage**: All screenplay data stored client-side only
- **No Tracking**: Zero analytics or user tracking
- **API Keys**: User-provided or environment variables only
- **Content Safety**: No screenplay content sent to external services except Gemini API

### API Security
```typescript
// Never hardcode API keys
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || userProvidedKey;

// Validate API responses
if (!response || typeof response !== 'object') {
  throw new Error('Invalid API response');
}

// Rate limiting
const MAX_REQUESTS_PER_MINUTE = 60;
let requestCount = 0;
```

### Content Security
- **Sanitization**: Sanitize HTML content before rendering
- **XSS Protection**: Use React's built-in XSS protection
- **Input Validation**: Validate all user inputs
- **Safe Rendering**: Use `textContent` instead of `innerHTML` when possible

## Testing Strategy

### Unit Testing
```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import HomePage from './HomePage';

describe('HomePage', () => {
  it('renders navigation buttons', () => {
    const mockNavigate = vi.fn();
    render(<HomePage onNavigate={mockNavigate} />);

    expect(screen.getByText('المحرر الأساسي')).toBeInTheDocument();
    expect(screen.getByText('المحرر المتقدم')).toBeInTheDocument();
  });
});
```

### Integration Testing
- **Agent Testing**: Test with sample screenplays in `src/tests/`
- **Component Testing**: Test user interactions with @testing-library
- **E2E Testing**: Manual testing of complete workflows

### Test Coverage Targets
- **Components**: > 80% coverage
- **Agents**: > 85% coverage
- **Utilities**: > 90% coverage
- **Critical Paths**: 100% coverage

## Agent-Specific Rules

### Analysis Agents
```typescript
// Character Analysis
interface CharacterAnalysisOutput {
  characters: Character[];
  relationships: CharacterRelationship[];
  arcSummaries: Map<string, string>;
  confidence: number;
}

// Minimum requirements
const MIN_SCENES_FOR_ANALYSIS = 3;
const MIN_CONFIDENCE = 0.7;

// Output must be JSON parseable
const EXPECTED_JSON_FORMAT = `
{
  "characters": [...],
  "relationships": [...],
  "confidence": 0.95
}
`;
```

### Generation Agents
```typescript
// Scene Generation
interface SceneGenerationInput {
  context: string;           // Previous scenes
  characters: string[];      // Available characters
  plotPoint: string;         // What should happen
  tone: string;             // Genre/mood
  constraints?: string[];    // Additional rules
}

// Quality checks
const QUALITY_CHECKS = {
  maxSceneLength: 3 * 1000,  // ~3 pages
  minDialogueQuality: 0.8,
  noModernSlang: true,
  consistentDialect: true
};
```

### Transformation Agents
```typescript
// Platform Adaptation
type Platform = 'film' | 'tv-series' | 'web-series' | 'stage';

interface AdaptationConfig {
  sourcePlatform: Platform;
  targetPlatform: Platform;
  preserveArc: boolean;
  adjustPacing: boolean;
}

// Transformation rules
const PLATFORM_RULES = {
  'film-to-tv': 'Add act breaks, expand subplots',
  'tv-to-film': 'Consolidate episodes, tighten pacing'
};
```

### Evaluation Agents
```typescript
// Tension Analysis
interface TensionCurve {
  sceneIndex: number;
  tensionLevel: number;  // 0-100
  type: 'rising' | 'falling' | 'plateau';
}

// Recommendations
interface TensionRecommendation {
  sceneIndex: number;
  issue: string;
  suggestion: string;
  priority: 'high' | 'medium' | 'low';
}
```

## Prompt Engineering Standards

### System Instructions Template
```typescript
const SYSTEM_INSTRUCTION = `
أنت خبير في تحليل السيناريوهات العربية.

المهمة: ${task}

القواعد:
1. استخدم اللغة العربية الفصحى
2. كن دقيقاً في التحليل
3. قدم أمثلة من النص
4. اتبع معايير الصناعة

التنسيق المطلوب: JSON
`;
```

### Prompt Best Practices
- **Clear Instructions**: Be specific about task and expected output
- **Format Specification**: Always specify JSON format with schema
- **Examples**: Include few-shot examples for complex tasks
- **Constraints**: List hard limits and requirements
- **Language**: Use Arabic for screenplay content, English for technical terms

### Token Management
```typescript
const TOKEN_LIMITS = {
  input: 1_000_000,      // Gemini 1.5 Pro
  output: 8_192,         // Max response
  context: 900_000,      // Reserve for screenplay
  systemPrompt: 10_000   // Max for instructions
};

// Truncate if needed
function truncateToTokens(text: string, maxTokens: number): string {
  // Rough estimate: 1 token ≈ 4 characters
  const maxChars = maxTokens * 4;
  return text.length > maxChars ? text.substring(0, maxChars) : text;
}
```

## Maintenance Rules

### Code Review Checklist
- [ ] TypeScript strict mode passes
- [ ] All interfaces/types defined
- [ ] Error handling implemented
- [ ] Arabic RTL support maintained
- [ ] Performance optimizations applied
- [ ] Tests added for new features
- [ ] Build process successful
- [ ] No console.log in production code

### Refactoring Guidelines
- **Small Changes**: One feature at a time
- **Tests First**: Add tests before refactoring
- **Backward Compatible**: Don't break existing features
- **Type Safety**: Improve types during refactoring
- **Documentation**: Update comments and types

### Version Control
```bash
# Commit message format
feat(editor): add auto-save functionality
fix(agents): correct character name extraction
perf(ui): optimize large screenplay rendering
docs(readme): update installation instructions
```

## Troubleshooting Guide

### Common Issues

#### TypeScript Errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Type check
npm run type-check
```

#### Build Failures
```bash
# Check environment variables
echo $VITE_GEMINI_API_KEY

# Clear Vite cache
rm -rf node_modules/.vite

# Rebuild
npm run build
```

#### Agent Not Responding
```typescript
// Check API key
if (!apiKey) {
  throw new Error('GEMINI_API_KEY not configured');
}

// Add timeout
const controller = new AbortController();
setTimeout(() => controller.abort(), 30000);

const response = await fetch(url, { signal: controller.signal });
```

#### Arabic Text Issues
```typescript
// Ensure UTF-8 encoding
const text = arabicText.normalize('NFC');

// Check RTL direction
<div dir="rtl" className="text-right">
  {arabicContent}
</div>

// Handle mixed content
const hasMixedContent = /[a-zA-Z0-9]/.test(arabicText);
```

### Debug Tools
- **React DevTools**: Inspect component tree and props
- **TypeScript Playground**: Test type definitions
- **Vite Inspector**: Analyze bundle and dependencies
- **Network Tab**: Monitor Gemini API calls

## Performance Benchmarks

### Target Metrics
- **Initial Load**: < 2 seconds
- **Time to Interactive**: < 3 seconds
- **Bundle Size**: < 500KB gzipped
- **Memory Usage**: < 200MB for typical screenplay
- **Agent Response**: < 10 seconds for analysis
- **Rendering**: 60 FPS for smooth scrolling

### Monitoring
```typescript
// Performance measurement
const startTime = performance.now();
const result = await processScreenplay(text);
const endTime = performance.now();
console.log(`Processing took ${endTime - startTime}ms`);

// Memory usage
if (performance.memory) {
  console.log(`Memory: ${performance.memory.usedJSHeapSize / 1024 / 1024}MB`);
}
```

---

*Follow these rules to maintain code quality, performance, and user experience in the Arabic Screenplay Editor application.*
