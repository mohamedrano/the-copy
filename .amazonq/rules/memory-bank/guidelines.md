# Development Guidelines

## Code Quality Standards

### TypeScript Usage
- **Strict Type Safety**: All files use TypeScript with strict configuration
- **Interface Definitions**: Complex objects use interfaces (e.g., `ScreenplayEditorProps`, `ToasterToast`)
- **Type Assertions**: Minimal use of `any`, prefer proper typing
- **Generic Types**: Use generics for reusable components and functions
- **Enum Usage**: Consistent enum patterns for constants (e.g., `TaskType`, `TaskCategory`)

### Component Architecture
- **Functional Components**: All React components use function syntax with hooks
- **Props Interface**: Each component defines its props interface explicitly
- **Default Props**: Use default parameters in function signatures
- **Component Composition**: Break down complex components into smaller, focused pieces
- **Dynamic Imports**: Heavy components use `dynamic()` imports with loading states

### State Management Patterns
- **useState Hook**: Local state management with descriptive state names
- **useCallback**: Memoize event handlers and complex functions
- **useEffect**: Proper dependency arrays and cleanup functions
- **Custom Hooks**: Extract reusable logic (e.g., `useToast`)
- **State Normalization**: Complex state objects use normalized structures

## Naming Conventions

### Variables and Functions
- **camelCase**: All variables and functions use camelCase
- **Descriptive Names**: Clear, self-documenting names (e.g., `handleTaskSelect`, `validateAndNormalizePipelineInput`)
- **Boolean Prefixes**: Boolean variables start with `is`, `has`, `should` (e.g., `isLoading`, `hasColon`)
- **Event Handlers**: Start with `handle` prefix (e.g., `handleSubmit`, `handlePaste`)
- **Constants**: UPPER_SNAKE_CASE for module-level constants

### Components and Classes
- **PascalCase**: Component names use PascalCase (e.g., `DramaAnalystApp`, `ScreenplayEditor`)
- **Descriptive Suffixes**: Components end with descriptive suffixes (e.g., `ScreenplayClassifier`)
- **File Naming**: Component files match component names exactly

### CSS and Styling
- **Tailwind Classes**: Consistent Tailwind CSS usage with logical grouping
- **Conditional Classes**: Use template literals for dynamic classes
- **Style Objects**: Inline styles use camelCase properties
- **CSS Variables**: Use CSS custom properties for theme values

## Error Handling Patterns

### Try-Catch Blocks
- **Specific Error Types**: Catch specific error types when possible
- **Error Propagation**: Re-throw errors with additional context
- **User-Friendly Messages**: Display localized error messages to users
- **Logging**: Log errors with appropriate detail level

### Validation
- **Zod Schemas**: Use Zod for runtime validation (e.g., `PipelineInputSchema`)
- **Input Sanitization**: Validate and sanitize all user inputs
- **Type Guards**: Use type guard functions for runtime type checking
- **Early Returns**: Validate inputs early and return/throw immediately

### Async Error Handling
- **Promise Rejection**: Always handle promise rejections
- **Retry Logic**: Implement retry mechanisms for network requests
- **Timeout Handling**: Set appropriate timeouts for async operations
- **Loading States**: Show loading indicators during async operations

## Testing Patterns

### Test Structure
- **Describe Blocks**: Organize tests with descriptive `describe` blocks
- **Test Cases**: Each `it` block tests a single behavior
- **Setup/Teardown**: Use proper setup and cleanup in tests
- **Mock Data**: Create realistic test data that matches production patterns

### Test Coverage
- **Edge Cases**: Test boundary conditions and edge cases
- **Error Scenarios**: Test error conditions and failure modes
- **Integration Tests**: Test component interactions and data flow
- **Validation Tests**: Comprehensive validation testing for schemas

### Test Utilities
- **Helper Functions**: Extract common test setup into helper functions
- **Mock Services**: Mock external dependencies consistently
- **Test Data**: Use factories or builders for test data creation

## Performance Optimization

### React Optimization
- **Memoization**: Use `useCallback` and `useMemo` appropriately
- **Component Splitting**: Split large components into smaller ones
- **Lazy Loading**: Use dynamic imports for code splitting
- **Ref Usage**: Use refs for DOM manipulation instead of state

### Bundle Optimization
- **Tree Shaking**: Import only needed functions from libraries
- **Dynamic Imports**: Load heavy dependencies only when needed
- **Asset Optimization**: Optimize images and other static assets
- **Bundle Analysis**: Regular bundle size monitoring

### Memory Management
- **Cleanup**: Proper cleanup in useEffect hooks
- **Event Listeners**: Remove event listeners in cleanup functions
- **Timeout Clearing**: Clear timeouts and intervals appropriately
- **Memory Leaks**: Avoid circular references and memory leaks

## API Integration Patterns

### Request Handling
- **Fetch API**: Use native fetch with proper error handling
- **Request Configuration**: Consistent request headers and configuration
- **Response Validation**: Validate API responses with schemas
- **Error Mapping**: Map API errors to user-friendly messages

### Data Flow
- **State Updates**: Update UI state based on API responses
- **Loading States**: Show appropriate loading indicators
- **Optimistic Updates**: Use optimistic updates where appropriate
- **Cache Management**: Implement appropriate caching strategies

## Internationalization (i18n)

### Arabic Language Support
- **RTL Layout**: Proper right-to-left layout support
- **Font Selection**: Arabic-friendly font stacks
- **Text Direction**: Explicit direction attributes where needed
- **Cultural Considerations**: Respect Arabic cultural conventions

### Text Handling
- **Unicode Support**: Proper Unicode handling for Arabic text
- **Text Processing**: Arabic-specific text processing algorithms
- **Input Validation**: Arabic text validation patterns
- **Display Formatting**: Proper Arabic text formatting and display

## Security Practices

### Input Sanitization
- **XSS Prevention**: Sanitize all user inputs
- **SQL Injection**: Use parameterized queries
- **File Upload**: Validate file types and sizes
- **Content Security**: Implement proper content security policies

### Authentication & Authorization
- **Token Handling**: Secure token storage and transmission
- **Session Management**: Proper session lifecycle management
- **Permission Checks**: Validate permissions on both client and server
- **Audit Logging**: Log security-relevant events

## Documentation Standards

### Code Comments
- **JSDoc**: Use JSDoc for function and class documentation
- **Inline Comments**: Explain complex logic with inline comments
- **TODO Comments**: Mark future improvements with TODO comments
- **API Documentation**: Document API endpoints and data structures

### README Files
- **Setup Instructions**: Clear setup and installation instructions
- **Usage Examples**: Provide usage examples and code samples
- **Architecture Overview**: Document system architecture and design decisions
- **Contributing Guidelines**: Include contribution guidelines and standards