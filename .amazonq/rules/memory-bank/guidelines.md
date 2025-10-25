# Development Guidelines

## Code Quality Standards

### TypeScript Usage
- **Strict Configuration**: All files use strict TypeScript with explicit typing
- **Interface Definitions**: Complex objects use interfaces (e.g., `ScreenplayEditorProps`, `AIResponse`, `ProcessedFile`)
- **Type Safety**: No `any` types except for specific DOM manipulation cases
- **Enum Usage**: Consistent use of enums for constants (`TaskType`, `TaskCategory`, `AgentId`)

### Component Architecture
- **Functional Components**: All React components use functional components with hooks
- **Props Interface**: Every component defines explicit props interface
- **Default Exports**: Components use default exports with descriptive names
- **Dynamic Imports**: Heavy components use dynamic imports with loading states

### State Management Patterns
- **useState Hook**: Local state management with descriptive state variables
- **useCallback**: Event handlers wrapped in useCallback for performance
- **useEffect**: Side effects properly managed with dependency arrays
- **Custom Hooks**: Reusable logic extracted to custom hooks (e.g., `useToast`)

## Structural Conventions

### File Organization
- **Feature-Based Structure**: Components organized by feature/domain
- **Index Files**: Barrel exports for clean imports
- **Type Definitions**: Centralized type definitions in dedicated files
- **Utility Functions**: Helper functions in dedicated utils directories

### Naming Conventions
- **PascalCase**: Component names and interfaces
- **camelCase**: Variables, functions, and methods
- **kebab-case**: File names and directories
- **SCREAMING_SNAKE_CASE**: Constants and enum values

### Import Organization
- **External Libraries**: React and third-party imports first
- **Internal Imports**: Local imports grouped by type (components, utils, types)
- **Relative Imports**: Use `@/` alias for clean import paths
- **Dynamic Imports**: Heavy components loaded dynamically

## Arabic Language Support

### Text Handling
- **RTL Support**: All text components support right-to-left direction
- **Arabic Fonts**: Dedicated Arabic font families (Amiri, Cairo, Tajawal)
- **Unicode Support**: Proper handling of Arabic Unicode ranges
- **Text Classification**: Sophisticated Arabic text pattern recognition

### Internationalization
- **Bilingual Interface**: Arabic-first with English fallback
- **Language Detection**: Automatic language detection for content
- **Cultural Patterns**: Arabic-specific screenplay formatting rules
- **Localized Messages**: All user-facing text in Arabic

## Testing Standards

### Test Structure
- **Vitest Framework**: All tests use Vitest testing framework
- **Describe Blocks**: Logical grouping of related tests
- **Comprehensive Coverage**: Edge cases and error scenarios included
- **Type Safety**: Tests maintain TypeScript type safety

### Test Patterns
- **Schema Validation**: Zod schema validation testing
- **Input Normalization**: Data transformation testing
- **Error Handling**: Explicit error case testing
- **Real-world Scenarios**: Practical use case testing

## Performance Optimization

### Bundle Optimization
- **Dynamic Imports**: Code splitting for heavy components
- **Tree Shaking**: Proper import/export for dead code elimination
- **Safelist Configuration**: Tailwind CSS safelist for dynamic classes
- **Font Optimization**: Optimized font loading with fallbacks

### Runtime Performance
- **Memoization**: useCallback and useMemo for expensive operations
- **Lazy Loading**: Components loaded on demand
- **Efficient Re-renders**: Proper dependency arrays to prevent unnecessary renders
- **Memory Management**: Cleanup in useEffect hooks

## Error Handling

### Frontend Error Patterns
- **Try-Catch Blocks**: Async operations wrapped in error handling
- **User Feedback**: Toast notifications for user actions
- **Graceful Degradation**: Fallback UI states for errors
- **Error Boundaries**: Component-level error containment

### Backend Error Patterns
- **Winston Logging**: Structured logging with different levels
- **Environment-Specific**: Different logging strategies for dev/prod
- **Error Metadata**: Contextual information in error logs
- **Service Identification**: Service name in log metadata

## API Integration

### Request Patterns
- **Fetch with Retry**: Robust API calls with retry logic
- **Type-Safe Requests**: Zod validation for API payloads
- **Error Response Handling**: Structured error response processing
- **Loading States**: Proper loading indicators for async operations

### Data Validation
- **Input Sanitization**: All user inputs validated and sanitized
- **Schema Validation**: Zod schemas for data structure validation
- **Normalization**: Data transformation before validation
- **Type Coercion**: Safe type conversion with fallbacks

## UI/UX Patterns

### Component Library Usage
- **Radix UI**: Consistent use of Radix UI primitives
- **Shadcn Components**: Styled components following design system
- **Lucide Icons**: Consistent icon usage throughout application
- **Responsive Design**: Mobile-first responsive layouts

### Accessibility
- **Semantic HTML**: Proper HTML semantics for screen readers
- **ARIA Labels**: Accessibility labels for interactive elements
- **Keyboard Navigation**: Full keyboard navigation support
- **Color Contrast**: Proper color contrast ratios

## Configuration Management

### Environment Variables
- **Type-Safe Config**: Environment variables with type validation
- **Development Defaults**: Sensible defaults for development
- **Production Security**: Secure configuration for production
- **API Key Management**: Proper handling of sensitive credentials

### Build Configuration
- **Next.js Optimization**: Turbopack for fast development builds
- **TypeScript Strict Mode**: Strict compilation settings
- **ESLint Rules**: Comprehensive linting with custom rules
- **Prettier Formatting**: Consistent code formatting

## Documentation Standards

### Code Documentation
- **JSDoc Comments**: Function and component documentation
- **Type Annotations**: Explicit type information
- **Usage Examples**: Practical usage examples in comments
- **Architecture Notes**: High-level architectural decisions documented

### README Structure
- **Project Overview**: Clear project description and purpose
- **Setup Instructions**: Step-by-step development setup
- **API Documentation**: Endpoint documentation with examples
- **Deployment Guide**: Production deployment instructions