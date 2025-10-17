# ADR-003: TypeScript Strict Mode

## Status

**Accepted** - 2024-01-15

## Context

The Drama Analyst application requires high code quality and reliability for production deployment. TypeScript provides excellent type safety, but the default configuration allows many unsafe patterns that can lead to runtime errors.

Common issues in non-strict TypeScript:
- Implicit `any` types
- Unchecked array access
- Missing null checks
- Implicit returns
- Unreachable code
- Unsafe optional property access

## Decision

We will enable **TypeScript Strict Mode** with additional quality rules for maximum type safety and code quality.

### Configuration

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "strictNullChecks": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

### Strict Mode Rules

1. **`strict: true`** - Enables all strict type checking options
2. **`noUncheckedIndexedAccess: true`** - Requires explicit checks for array/object access
3. **`strictNullChecks: true`** - Prevents null/undefined errors
4. **`noImplicitReturns: true`** - Ensures all code paths return a value
5. **`noFallthroughCasesInSwitch: true`** - Prevents accidental fallthrough in switch statements

### Additional Quality Rules

```json
{
  "compilerOptions": {
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": false, // Disabled due to compatibility issues
    "noImplicitAny": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    "noImplicitOverride": true
  }
}
```

## Consequences

### Positive

- **Type Safety**: Eliminates entire classes of runtime errors
- **Code Quality**: Forces developers to write more robust code
- **Refactoring Safety**: Type system catches breaking changes
- **Documentation**: Types serve as inline documentation
- **IDE Support**: Better autocomplete and error detection
- **Maintainability**: Easier to understand and modify code
- **Production Readiness**: Higher confidence in deployment

### Negative

- **Development Overhead**: More verbose code required
- **Learning Curve**: Developers need to understand strict typing
- **Migration Effort**: Existing code needs updates
- **Build Time**: Slightly longer compilation times
- **Complexity**: More complex type definitions required

### Implementation Challenges

- **Array Access**: Must handle potential undefined values
- **Optional Properties**: Need explicit null checks
- **Function Returns**: All code paths must return values
- **Switch Statements**: Must handle all cases explicitly
- **Type Definitions**: More complex generic and utility types

### Mitigation Strategies

- **Gradual Migration**: Enable rules incrementally
- **Utility Types**: Create helper types for common patterns
- **Type Guards**: Use type guards for runtime type checking
- **Documentation**: Comprehensive type documentation
- **Training**: Team training on strict TypeScript patterns

## Code Examples

### Before (Non-Strict)
```typescript
function processFiles(files: any[]) {
  const firstFile = files[0]; // Could be undefined
  const content = firstFile.content; // Could be undefined
  return content.toUpperCase(); // Could throw error
}
```

### After (Strict)
```typescript
function processFiles(files: ProcessedFile[]): string {
  if (files.length === 0) {
    throw new Error('No files provided');
  }
  
  const firstFile = files[0]!; // Explicit non-null assertion
  if (!firstFile.content) {
    throw new Error('File content is required');
  }
  
  return firstFile.content.toUpperCase();
}
```

### Utility Types for Common Patterns
```typescript
// Safe array access
type SafeArrayAccess<T> = T extends readonly (infer U)[] ? U | undefined : never;

// Non-null assertion helper
function assertNonNull<T>(value: T | null | undefined): asserts value is T {
  if (value == null) {
    throw new Error('Value is null or undefined');
  }
}

// Optional property access
function getOptionalProperty<T, K extends keyof T>(
  obj: T,
  key: K
): T[K] | undefined {
  return obj[key];
}
```

## Related Decisions

- [ADR-008: Error Handling Strategy](./ADR-008-error-handling.md)
- [ADR-007: CI/CD Pipeline Strategy](./ADR-007-ci-cd-pipeline.md)

## Implementation Status

- ✅ TypeScript strict mode enabled
- ✅ Additional quality rules configured
- ✅ All existing code migrated to strict mode
- ✅ Utility types created for common patterns
- ✅ CI pipeline enforces type checking
- ✅ Documentation updated with type examples

