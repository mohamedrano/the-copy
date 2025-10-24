# Development Guidelines

## Code Quality Standards

### TypeScript Usage
- **Strict Type Safety**: All files use TypeScript with strict typing enabled
- **Interface Definitions**: Complex objects use interfaces (e.g., `ScreenplayEditorProps`, `ToasterToast`)
- **Type Unions**: Leverage union types for controlled values (`"expanded" | "collapsed"`)
- **Generic Types**: Use generics for reusable components (`React.ComponentProps<"div">`)
- **Const Assertions**: Use `as const` for immutable values and enum-like objects

### Component Architecture Patterns
- **Functional Components**: All React components use function syntax with hooks
- **forwardRef Pattern**: UI components consistently use `React.forwardRef` for ref forwarding
- **Compound Components**: Complex components split into logical sub-components (Sidebar system)
- **Custom Hooks**: Extract reusable logic into custom hooks (`useSidebar`, `useToast`)
- **Dynamic Imports**: Heavy components loaded dynamically with loading states

### State Management Conventions
- **useState for Local State**: Component-level state with descriptive names
- **useCallback for Handlers**: Event handlers wrapped in `useCallback` with proper dependencies
- **useMemo for Computed Values**: Expensive calculations memoized appropriately
- **Reducer Pattern**: Complex state logic uses reducer pattern (toast system)
- **Context for Shared State**: Provider pattern for component tree state sharing

## Structural Conventions

### File Organization
- **Feature-Based Structure**: Components grouped by functionality (`/ui/`, `/analysis/`)
- **Index Exports**: Barrel exports for clean imports from component directories
- **Type Definitions**: Separate type files or co-located interfaces
- **Test Co-location**: Test files adjacent to source files with `.test.ts` extension

### Naming Conventions
- **PascalCase Components**: React components use PascalCase (`ScreenplayEditor`)
- **camelCase Functions**: Functions and variables use camelCase (`handleSubmit`)
- **SCREAMING_SNAKE_CASE Constants**: Module-level constants in uppercase
- **Descriptive Booleans**: Boolean variables prefixed with `is`, `has`, `should`
- **Event Handler Prefix**: Event handlers prefixed with `handle` or `on`

### Import Organization
- **React First**: React imports at the top
- **Third-party Libraries**: External dependencies grouped together
- **Internal Imports**: Local imports organized by type (components, hooks, utils)
- **Type-only Imports**: Use `import type` for type-only imports
- **Absolute Imports**: Use `@/` path mapping for clean imports

## Semantic Patterns

### Error Handling
- **Try-Catch Blocks**: Async operations wrapped in try-catch with proper error states
- **Error Boundaries**: React error boundaries for component-level error handling
- **Validation Schemas**: Zod schemas for runtime validation with detailed error messages
- **Toast Notifications**: User-facing errors displayed via toast system
- **Graceful Degradation**: Fallback UI states for error conditions

### Performance Optimization
- **Lazy Loading**: Dynamic imports for code splitting
- **Memoization**: Strategic use of `useMemo` and `useCallback`
- **Virtualization**: Large lists handled with virtualization techniques
- **Bundle Analysis**: Regular bundle size monitoring and optimization
- **Image Optimization**: Next.js Image component for optimized loading

### Accessibility Patterns
- **Semantic HTML**: Proper HTML elements for screen readers
- **ARIA Labels**: Descriptive labels for interactive elements
- **Keyboard Navigation**: Full keyboard accessibility support
- **Focus Management**: Proper focus handling in modals and dynamic content
- **Color Contrast**: Sufficient contrast ratios in design system

## API Integration Patterns

### Data Fetching
- **Async/Await**: Modern async syntax throughout the codebase
- **Error Handling**: Comprehensive error handling with retry logic
- **Loading States**: Explicit loading indicators for async operations
- **Type Safety**: Typed API responses with proper validation
- **Caching Strategy**: Appropriate caching for API responses

### Form Handling
- **React Hook Form**: Consistent form library usage across components
- **Zod Validation**: Schema-based validation with type inference
- **Controlled Components**: Form inputs properly controlled with state
- **Error Display**: Inline validation errors with clear messaging
- **Submit Handling**: Proper form submission with loading states

## Testing Standards

### Test Structure
- **Describe Blocks**: Logical grouping of related tests
- **Descriptive Test Names**: Clear, behavior-focused test descriptions
- **Arrange-Act-Assert**: Consistent test structure pattern
- **Edge Case Coverage**: Comprehensive testing of boundary conditions
- **Mock Strategy**: Strategic mocking of external dependencies

### Test Types
- **Unit Tests**: Component and function-level testing
- **Integration Tests**: Feature-level testing with multiple components
- **E2E Tests**: Full user journey testing with Playwright
- **Accessibility Tests**: Automated a11y testing in test suites
- **Performance Tests**: Bundle size and runtime performance validation

## Documentation Standards

### Code Documentation
- **JSDoc Comments**: Function and component documentation with examples
- **Type Annotations**: Self-documenting code through proper typing
- **README Files**: Comprehensive project and feature documentation
- **Inline Comments**: Strategic comments for complex business logic
- **API Documentation**: Clear documentation for public interfaces

### Component Documentation
- **Props Documentation**: Clear prop descriptions and examples
- **Usage Examples**: Code examples for component usage
- **Storybook Integration**: Visual component documentation
- **Accessibility Notes**: A11y considerations documented
- **Performance Notes**: Performance implications documented

## Security Practices

### Input Validation
- **Schema Validation**: All inputs validated with Zod schemas
- **Sanitization**: User inputs properly sanitized before processing
- **Type Checking**: Runtime type validation for external data
- **Error Messages**: Secure error messages without sensitive data exposure
- **Rate Limiting**: API endpoints protected with rate limiting

### Authentication & Authorization
- **Token Management**: Secure token storage and handling
- **Session Management**: Proper session lifecycle management
- **Permission Checks**: Granular permission validation
- **Secure Headers**: Appropriate security headers configured
- **HTTPS Enforcement**: All communications over HTTPS

## Performance Guidelines

### Bundle Optimization
- **Code Splitting**: Strategic code splitting at route and component levels
- **Tree Shaking**: Proper imports to enable tree shaking
- **Dynamic Imports**: Heavy dependencies loaded on demand
- **Bundle Analysis**: Regular monitoring of bundle size
- **Compression**: Gzip/Brotli compression enabled

### Runtime Performance
- **Memoization**: Strategic memoization of expensive operations
- **Virtual Scrolling**: Large lists handled efficiently
- **Image Optimization**: Proper image loading and sizing
- **Lazy Loading**: Content loaded as needed
- **Memory Management**: Proper cleanup of event listeners and subscriptions