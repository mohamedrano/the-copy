# CLAUDE.md

This file provides comprehensive guidance to Claude Code (claude.ai/code) when working with code in this repository. It serves as the primary reference for automated code assistance, development workflows, and project architecture understanding.

## Table of Contents

1. [Repository Overview](#repository-overview)
2. [Project Architecture](#project-architecture)
3. [Development Environment](#development-environment)
4. [Core Components & APIs](#core-components--apis)
5. [Arabic Language Processing](#arabic-language-processing)
6. [Code Quality Standards](#code-quality-standards)
7. [Testing Strategy](#testing-strategy)
8. [Deployment & Production](#deployment--production)
9. [Troubleshooting Guide](#troubleshooting-guide)
10. [Contributing Guidelines](#contributing-guidelines)

## Repository Overview

### Structure
```
├── arabic-screenplay-editor/          # Main React/TypeScript application
│   ├── src/
│   │   ├── ScreenplayEditor.tsx      # Primary component (76KB+ core logic)
│   │   ├── components/               # Reusable UI components
│   │   ├── utils/                    # Utility functions and helpers
│   │   ├── types/                    # TypeScript type definitions
│   │   └── tests/                    # Test files and samples
│   ├── public/                       # Static assets
│   ├── vite.config.ts               # Vite configuration
│   ├── package.json                 # Dependencies and scripts
│   └── tsconfig.json                # TypeScript configuration
├── standalone-modules/               # Independent JavaScript utilities
│   ├── screenplay-parser.js          # Legacy parsing utilities
│   └── text-processors.js           # Text manipulation tools
└── docs/                            # Additional documentation
```

### Project Types
- **Primary**: Arabic Screenplay Editor (React/TypeScript SPA)
- **Secondary**: Standalone JavaScript modules for screenplay processing
- **Target Environment**: Modern browsers with ES2020+ support

## Project Architecture

### Technology Stack
```typescript
// Core Technologies
- Framework: React 18+ with TypeScript 5+
- Build Tool: Vite 5+ (optimized for dev speed)
- Styling: Tailwind CSS 4.1.13+ (utility-first)
- Language: TypeScript (strict mode enabled)
- Runtime: ES2020+ target with modern browser support
```

### Design Patterns

#### 1. Component Architecture
- **Monolithic Main Component**: `ScreenplayEditor.tsx` contains core logic
- **Separation of Concerns**: UI rendering separate from text processing
- **State Management**: React hooks with local state management
- **Event-Driven Updates**: Real-time text processing and formatting

#### 2. Text Processing Pipeline
```typescript
interface TextProcessingPipeline {
  input: string;           // Raw Arabic text
  tokenization: string[];  // Line-by-line breakdown
  classification: LineType[]; // Scene header, dialogue, action, etc.
  formatting: FormattedLine[]; // Styled output with CSS classes
  output: JSX.Element[];   // Rendered components
}
```

## Development Environment

### Prerequisites
```bash
# Required Software
Node.js >= 18.0.0
npm >= 9.0.0 OR yarn >= 1.22.0
Git >= 2.30.0

# Recommended VS Code Extensions
- TypeScript Importer
- Tailwind CSS IntelliSense
- Arabic Language Support
- Prettier - Code formatter
- ESLint
```

### Setup Instructions
```bash
# Clone repository
git clone <repository-url>
cd <repository-name>

# Install dependencies
cd arabic-screenplay-editor
npm install

# Verify installation
npm run type-check
npm run lint

# Start development server
npm run dev
# Server runs on http://localhost:5173 (NOT default 5174)
```

### Development Commands
```bash
# Development
npm run dev          # Start dev server (localhost:5173)
npm run dev:host     # Expose to network (0.0.0.0:5173)

# Building
npm run build        # Production build (type-check + vite build)
npm run build:analyze # Build with bundle analyzer

# Quality Assurance
npm run type-check   # TypeScript compilation check
npm run lint         # ESLint analysis
npm run lint:fix     # Auto-fix linting issues
npm run format       # Prettier formatting

# Testing
npm run test         # Run test suite
npm run test:watch   # Watch mode testing
npm run test:coverage # Coverage report

# Production
npm run preview      # Preview production build
npm run start        # Production server
```

## Core Components & APIs

### ScreenplayClassifier Class

#### Purpose
Advanced Arabic text classification engine for screenplay formatting.

#### Key Features
```typescript
class ScreenplayClassifier {
  // Context tracking for dialogue blocks
  private dialogueContext: {
    inDialogueBlock: boolean;
    lastCharacter: string;
    blockLineCount: number;
  };

  // Arabic verb recognition (60+ verbs)
  private actionVerbs: Set<string>;

  // Classification methods
  classifyLine(line: string, previousContext: LineContext): LineType;
  detectSceneHeader(line: string): boolean;
  detectCharacterLine(line: string): boolean;
  detectDialogue(line: string, context: DialogueContext): boolean;
  detectActionLine(line: string): boolean;
}
```

#### Usage Example
```typescript
const classifier = new ScreenplayClassifier();
const result = classifier.classifyLine("محمد: مرحباً بك في المنزل", {
  previousLineType: 'action',
  dialogueState: { inBlock: false, character: null }
});
// Returns: { type: 'character', confidence: 0.95, formatting: {...} }
```

### Text Processing Utilities

#### RTL Text Handling
```typescript
interface RTLTextProcessor {
  direction: 'rtl' | 'ltr';
  alignment: 'right' | 'center' | 'left';
  
  processArabicText(text: string): ProcessedText;
  handleMixedContent(text: string): MixedContentResult;
  convertNumerals(text: string, format: 'eastern' | 'western'): string;
}
```

#### Pattern Matching System
```typescript
const ARABIC_PATTERNS = {
  SCENE_HEADER: /^مشهد\s+\d+/,
  TIME_LOCATION: /^(ليل|نهار|صباح|مساء)-(داخلي|خارجي)/,
  CHARACTER_NAME: /^[أ-ي\s]+:$/,
  TRANSITION: /^(قطع|ذوبان|انتقال)/,
  ACTION_VERB: new RegExp(`^(${ARABIC_ACTION_VERBS.join('|')})`),
};
```

## Arabic Language Processing

### Character Recognition
- **Arabic Range**: U+0600 to U+06FF (standard Arabic)
- **Extended Range**: U+0750 to U+077F (Arabic supplement)
- **Diacritics**: U+064B to U+065F (Arabic diacritical marks)
- **Presentation Forms**: U+FB50 to U+FDFF (Arabic presentation forms)

### Screenplay Conventions
```typescript
interface ArabicScreenplayFormat {
  sceneHeaders: {
    pattern: "مشهد [number]";
    style: { textAlign: 'center', fontWeight: 'bold' };
  };
  
  timeLocation: {
    pattern: "[time]-[location] [place]";
    style: { textAlign: 'center', fontStyle: 'italic' };
  };
  
  characterNames: {
    pattern: "[NAME]:";
    style: { textAlign: 'center', fontWeight: 'bold', textTransform: 'uppercase' };
  };
  
  dialogue: {
    style: { textAlign: 'center', margin: '0 20%' };
  };
  
  actionLines: {
    style: { textAlign: 'right', direction: 'rtl' };
  };
}
```

### Text Direction Rules
1. **Pure Arabic**: Always RTL alignment
2. **Mixed Content**: RTL base with embedded LTR for numbers/English
3. **Scene Numbers**: LTR numerals within RTL context
4. **Character Names**: Centered regardless of content direction

## Code Quality Standards

### TypeScript Configuration
```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noImplicitOverride": true,
    "exactOptionalPropertyTypes": true
  }
}
```

### Error Handling Patterns
```typescript
// Robust error handling for text processing
function processScreenplayText(input: string): Result<ProcessedText, ProcessingError> {
  try {
    validateInput(input);
    const lines = tokenizeText(input);
    const classified = classifyLines(lines);
    return { success: true, data: classified };
  } catch (error) {
    logError('processScreenplayText', error);
    return { 
      success: false, 
      error: new ProcessingError('Failed to process text', error) 
    };
  }
}

// Input validation
function validateInput(text: string): void {
  if (!text || typeof text !== 'string') {
    throw new ValidationError('Input must be a non-empty string');
  }
  
  if (text.length > MAX_SCREENPLAY_LENGTH) {
    throw new ValidationError(`Text exceeds maximum length of ${MAX_SCREENPLAY_LENGTH} characters`);
  }
}
```

### Performance Optimization
```typescript
// Memoization for expensive operations
const memoizedClassifier = useMemo(() => 
  new ScreenplayClassifier(), []
);

// Debounced text processing
const debouncedProcess = useCallback(
  debounce((text: string) => {
    setProcessedText(processText(text));
  }, 300),
  []
);

// Virtual scrolling for large documents
const VirtualizedScreenplay = memo(({ lines }: { lines: ScreenplayLine[] }) => {
  // Implementation with react-window or react-virtualized
});
```

## Testing Strategy

### Test File Organization
```
src/tests/
├── unit/
│   ├── classifier.test.ts        # ScreenplayClassifier tests
│   ├── text-processing.test.ts   # Utility function tests
│   └── components.test.tsx       # Component unit tests
├── integration/
│   ├── screenplay-flow.test.ts   # End-to-end screenplay processing
│   └── user-interactions.test.ts # User workflow tests
├── fixtures/
│   ├── sample-screenplays/       # Test screenplay files
│   ├── edge-cases/              # Boundary condition tests
│   └── performance/             # Large file tests
└── helpers/
    └── test-utils.ts            # Testing utilities and mocks
```

### Test Data Files
- `final-test.txt`: Complete screenplay sample (production-like)
- `comprehensive-test.txt`: Edge cases and boundary conditions
- `action-line-test.txt`: Action line classification tests
- `dialogue-action-test.txt`: Mixed dialogue/action scenarios
- `basmala-test.cjs`: Node.js compatibility tests
- `test-classifier.cjs`: Classifier unit tests

### Testing Commands
```bash
# Unit tests with coverage
npm run test:unit -- --coverage

# Integration tests
npm run test:integration

# Performance benchmarks
npm run test:performance

# Arabic text processing tests
npm run test:arabic-processing

# Visual regression tests
npm run test:visual
```

## Deployment & Production

### Build Configuration
```typescript
// vite.config.ts
export default defineConfig({
  build: {
    target: 'es2020',
    outDir: 'dist',
    sourcemap: process.env.NODE_ENV === 'development',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          arabic: ['./src/utils/arabic-processing']
        }
      }
    }
  },
  optimizeDeps: {
    include: ['react', 'react-dom']
  }
});
```

### Environment Variables
```bash
# Development
VITE_DEV_SERVER_PORT=5173
VITE_API_BASE_URL=http://localhost:3001

# Production
VITE_API_BASE_URL=https://api.screenplay-editor.com
VITE_ENABLE_ANALYTICS=true
VITE_ERROR_REPORTING_URL=https://errors.screenplay-editor.com
```

### Performance Metrics
- **Bundle Size**: Target < 500KB gzipped
- **First Contentful Paint**: < 2s
- **Time to Interactive**: < 3s
- **Arabic Text Processing**: < 100ms for typical screenplay

## Troubleshooting Guide

### Common Issues

#### 1. Arabic Text Rendering Problems
```typescript
// Symptom: Text appears broken or reversed
// Solution: Ensure proper RTL CSS and Unicode normalization
const normalizeArabicText = (text: string): string => {
  return text.normalize('NFC').replace(/\u202E|\u202D/g, '');
};
```

#### 2. Classification Accuracy Issues
```typescript
// Symptom: Lines classified incorrectly
// Solution: Check context state and pattern matching
const debugClassification = (line: string, context: LineContext) => {
  console.log('Line:', line);
  console.log('Context:', context);
  console.log('Patterns matched:', getMatchingPatterns(line));
};
```

#### 3. Performance Degradation
```typescript
// Symptom: Slow processing with large texts
// Solution: Implement progressive processing
const processInChunks = async (text: string, chunkSize = 1000) => {
  const chunks = splitIntoChunks(text, chunkSize);
  const results = [];
  
  for (const chunk of chunks) {
    results.push(await processChunk(chunk));
    await new Promise(resolve => setTimeout(resolve, 0)); // Yield control
  }
  
  return results.flat();
};
```

### Debugging Tools
```bash
# Enable debug logging
VITE_DEBUG=true npm run dev

# Profile performance
npm run dev -- --profile

# Analyze bundle
npm run build:analyze
```

## Contributing Guidelines

### Code Style
- **Formatting**: Prettier with 2-space indentation
- **Linting**: ESLint with TypeScript recommended rules
- **Naming**: camelCase for variables, PascalCase for components
- **File Organization**: Group by feature, not by type

### Commit Messages
```
feat(classifier): add support for complex Arabic dialogue patterns
fix(ui): resolve RTL text alignment in character names
docs(readme): update installation instructions
perf(processing): optimize large screenplay handling
test(classifier): add edge cases for scene header detection
```

### Pull Request Process
1. Fork repository and create feature branch
2. Implement changes with comprehensive tests
3. Ensure all quality checks pass (`npm run quality-check`)
4. Update documentation as needed
5. Submit PR with detailed description and test results

### Testing Requirements
- Unit test coverage: minimum 80%
- Integration tests for new features
- Performance benchmarks for processing changes
- Arabic text processing validation

---

## Quick Reference

### Essential Commands
```bash
npm run dev          # Development server (localhost:5173)
npm run build        # Production build
npm run test         # Run all tests
npm run quality-check # Lint + type-check + test
```

### Key Files
- `src/ScreenplayEditor.tsx` - Main application component
- `vite.config.ts` - Build configuration
- `tsconfig.json` - TypeScript settings
- `tailwind.config.js` - Styling configuration

### Performance Targets
- Bundle size: < 500KB gzipped
- Classification speed: < 100ms per screenplay
- Memory usage: < 50MB for typical documents
- Startup time: < 2s on modern browsers

---

*Last updated: [Current Date]*
*For Claude Code assistance and automated development workflows*