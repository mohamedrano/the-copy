# Contributing Tests

This document outlines the guidelines and best practices for contributing tests to the project. The goal is to ensure high-quality, reliable, and maintainable tests that increase confidence in our codebase.

## General Rules

*   **Readability**: Use clear and descriptive Arabic names for test suites and individual tests. Employ Given/When/Then comments when necessary to improve clarity.
*   **Independence**: Tests should not have interdependencies. Use local fixtures to set up test data.
*   **Speed**: Avoid actual network or disk operations. Use in-memory alternatives or mocks for external dependencies.
*   **Stability**: Ensure tests are stable by fixing time and randomness. Avoid un-mocked `Date.now()`.
*   **Value**: Each test should cover a logical branch or a clear business risk. Avoid trivial tests.
*   **UI Tests**: Test behavior (Role/Label/Text) rather than fragile DOM details. Use semantic selectors from Testing Library.

## Examples

### Good Example (TypeScript)

```ts
import { describe, it, expect } from 'vitest';
import { calculateDiscount } from '../../src/pricing/calculateDiscount'; // Adjust path as needed

describe('calculateDiscount', () => {
  it('يحسِب 20% للمستخدم المميّز', () => {
    expect(calculateDiscount(100, 'premium', 5)).toBe(20);
  });

  it('يعيد 0 للسعر غير الصالح', () => {
    expect(calculateDiscount(-50, 'premium', 5)).toBe(0);
  });

  it('يضع حدّاً أقصى 50%', () => {
    expect(calculateDiscount(100, 'premium', 20)).toBe(50);
  });

  it('يتعامل مع نوع مستخدم غير معروف', () => {
    expect(calculateDiscount(100, 'unknown', 5)).toBe(0);
  });
});
```

### Bad Example (Avoid)

*   **Manipulating code to pass tests**: Do not alter production code solely to make tests pass without a documented engineering justification.
*   **Blind snapshot tests for complex logic**: Snapshot tests are useful for UI components but can be brittle for complex business logic.
*   **Testing internal implementation details**: Focus on the observable behavior of the code, not its internal workings.

## Prohibitions

*   **No PRs that reduce coverage**: Any Pull Request that decreases the coverage of any package below its defined thresholds, or reduces the coverage of changed files below the higher threshold, will be automatically rejected.
*   **No undocumented code changes for tests**: Modifying production code to pass a test without a documented engineering justification (e.g., an Issue or a clear commit message) is forbidden.
*   **No important Happy Paths without Negative Paths**: For every important "happy path" (successful scenario), corresponding "negative path" (failure/error scenario) tests are required.
*   **No unaddressed flaky tests**: Any "flaky" test (a test that intermittently fails) must be quarantined and have an open ticket with a clear plan and timeline for resolution.

## Best Practices

*   **Prioritize**: Focus on critical business logic, security, and data transformations (P0), followed by shared services and utility libraries (P1).
*   **Edge Cases**: Thoroughly test edge cases, including `null`, `undefined`, `NaN`, empty values, and boundary conditions (min/max).
*   **Asynchronous Logic**: Pay special attention to testing asynchronous code, promises, timeouts, and race conditions.
*   **Property-Based Testing**: Consider using `fast-check` for property-based testing of pure functions to ensure adherence to contractual rules.
*   **Dependency Isolation**: Isolate I/O operations (network, database) using mocks or in-memory adapters.
