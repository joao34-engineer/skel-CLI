# The 80% Mutation Score Playbook
**Proven patterns for consistently achieving 80%+ mutation test scores**

---

## Core Principle

> **Kill mutants by testing behavior, not implementation details**

Mutation testing measures test quality by introducing small code changes (mutants) and checking if tests catch them. 80%+ scores require strategic code design and comprehensive testing.

---

## Pattern 1: Simplify Error Handling ⭐

### ❌ AVOID: Conditional Error Re-throwing
```typescript
// Creates untestable branches - hard to mock in ESM
try {
  schema.parse(input);
  return await externalLib.process(input);
} catch (error) {
  if (error instanceof ZodError) {
    throw error; // Branch 1 - easy to test
  }
  if (error instanceof CustomError) {
    throw error; // Branch 2 - hard to test
  }
  throw new Error('Failed'); // Branch 3 - hard to test
}
```

### ✅ DO: Unified Error Wrapping
```typescript
// Single error path - 100% testable
try {
  schema.parse(input);
  return await externalLib.process(input);
} catch (error) {
  throw new Error(
    `Operation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
  );
}
```

**Why it works**: 
- Single error path = easier to test
- Original error message preserved
- No conditional branches to mock
- Tests verify wrapped error format

---

## Pattern 2: Test Error Paths Directly

### Structure Tests for Error Scenarios
```typescript
describe('Error Handling', () => {
  it('should throw descriptive error on invalid input', async () => {
    try {
      await MyClass.method('');
      expect.fail('Should have thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).toContain('Operation failed');
      expect((error as Error).message).toContain('validation'); // Original error included
    }
  });
});
```

**Coverage targets**:
- ✅ Error is thrown (kills `BlockStatement` removal)
- ✅ Error message format (kills `StringLiteral` mutations)
- ✅ Original error preserved (kills conditional mutations)

---

## Pattern 3: Property-Based Testing Setup

### Optimized for Mutation Testing
```typescript
import fc from 'fast-check';

it('[PROPERTY] should handle any valid input', async () => {
  await fc.assert(
    fc.asyncProperty(
      fc.string({ minLength: 1, maxLength: 100 }), // Limited range for speed
      async (input: string) => {
        const result = await MyClass.method(input);
        expect(result).toBeDefined();
        expect(typeof result).toBe('string');
      }
    ),
    { numRuns: 3 } // 3-5 runs sufficient for mutation testing
  );
}, 120000); // Timeout as 3rd parameter
```

**Key settings**:
- `maxLength: 100` - Fast execution
- `numRuns: 3` - Balance coverage vs speed
- `120000ms timeout` - Prevent Stryker crashes

---

## Pattern 4: Configuration Object Testing

### Test Constants Are Used Correctly
```typescript
const CONFIG = {
  maxSize: 1000,
  retries: 3,
  timeout: 5000
};

// Test each config value is actually used
describe('Configuration Validation', () => {
  it('should enforce maxSize limit', async () => {
    const input = 'x'.repeat(CONFIG.maxSize + 1);
    await expect(process(input)).rejects.toThrow('exceeds maximum');
  });

  it('should use correct timeout value', async () => {
    const result = await process('test');
    // Verify result includes timeout config
    expect(result).toContain(`timeout=${CONFIG.timeout}`);
  });
});
```

**Kills mutations in**: Object literals, numeric constants, string values

---

## Pattern 5: Boundary Value Testing

### Test Edges of All Validations
```typescript
describe('Boundary Tests', () => {
  it('should reject exactly 0 characters', async () => {
    await expect(hash('')).rejects.toThrow('Hashing failed');
  });

  it('should accept exactly 1 character', async () => {
    const result = await hash('a');
    expect(result).toBeDefined();
  });

  it('should accept max - 1', async () => {
    const input = 'x'.repeat(MAX_SIZE - 1);
    const result = await hash(input);
    expect(result).toBeDefined();
  });

  it('should reject max + 1', async () => {
    const input = 'x'.repeat(MAX_SIZE + 1);
    await expect(hash(input)).rejects.toThrow('Hashing failed');
  });
});
```

**Kills mutations in**: Comparison operators (`<`, `>`, `<=`, `>=`), boundary constants

---

## Pattern 6: Test Return Values Explicitly

### Don't Just Test "Truthy"
```typescript
// ❌ Weak - doesn't kill boolean mutations
it('should return something', () => {
  const result = doThing();
  expect(result).toBeTruthy(); // Passes even if mutated to return 1 or "string"
});

// ✅ Strong - kills type and value mutations
it('should return true for valid case', () => {
  const result = doThing();
  expect(result).toBe(true); // Must be exactly boolean true
});

it('should return false for invalid case', () => {
  const result = doThing();
  expect(result).toBe(false); // Must be exactly boolean false
});
```

---

## Pattern 7: Vitest Configuration for Mutation Testing

### `vitest.config.ts`
```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['primitives/**/*.test.ts'],
    exclude: ['node_modules', '.stryker-tmp'],
    testTimeout: 180000,      // 3 minutes - prevents timeouts during mutation
    hookTimeout: 60000,       // 1 minute for setup/teardown
  },
});
```

### `stryker.conf.json`
```json
{
  "$schema": "./node_modules/@stryker-mutator/core/schema/stryker-schema.json",
  "packageManager": "npm",
  "testRunner": "vitest",
  "checkers": ["typescript"],
  "mutate": ["primitives/**/index.ts"],
  "thresholds": {
    "high": 85,
    "low": 70,
    "break": 70
  },
  "coverageAnalysis": "perTest",
  "timeoutMS": 180000,
  "ignoreStatic": true
}
```

---

## Pattern 8: Test Suite Structure

### The Gauntlet Pattern
```typescript
describe('MyClass - The Gauntlet', () => {
  // 1. Core Functionality (kills main logic mutations)
  describe('Core Functionality', () => {
    it('should perform main operation');
    it('should handle variations');
  });

  // 2. Validation (kills input validation mutations)
  describe('Input Validation', () => {
    it('should reject empty input');
    it('should reject null input');
    it('should reject invalid type');
  });

  // 3. Error Handling (kills error path mutations)
  describe('Error Handling', () => {
    it('should throw descriptive errors');
    it('should preserve original error messages');
  });

  // 4. Property-Based (kills edge case mutations)
  describe('Property-Based Tests', () => {
    it('[PROPERTY] should handle any valid input');
  });

  // 5. Configuration (kills constant mutations)
  describe('Configuration Validation', () => {
    it('should use correct config values');
  });

  // 6. Boundaries (kills comparison operator mutations)
  describe('Boundary Tests', () => {
    it('should enforce min/max limits');
  });

  // 7. Edge Cases (kills special value mutations)
  describe('Edge Cases', () => {
    it('should handle special characters');
    it('should handle unicode');
  });
});
```

---

## Decision Matrix: Accept or Fix Low Scores

### Accept "No Coverage" Mutants If:
- ✅ Fallback for `'Unknown error'` when non-Error thrown (rare)
- ✅ Error message string literals in unreachable defensive code
- ✅ ESM module mocking limitations (Vitest 4)
- ✅ Risk assessment shows low impact

### Must Fix Survived Mutants:
- ❌ Boolean return values not tested explicitly
- ❌ Comparison operators not boundary tested
- ❌ Configuration values not validated
- ❌ Conditional branches not covered

---

## Quick Checklist for 80%+

Before running mutation tests:

- [ ] Error handling has single path (no conditional re-throwing)
- [ ] All errors wrapped with descriptive messages
- [ ] Tests verify error message content
- [ ] Boolean returns tested with `.toBe(true)` and `.toBe(false)`
- [ ] Boundary values tested (0, 1, max-1, max+1)
- [ ] Configuration constants validated in tests
- [ ] Property-based tests use 3-5 runs, maxLength: 100
- [ ] Test timeout set to 120000ms for async property tests
- [ ] Vitest timeout: 180000ms
- [ ] Stryker ignoreStatic: true

---

## Real-World Example: SkelHasher

### Implementation (index.ts)
```typescript
export class SkelHasher {
  static async hash(plaintext: string): Promise<string> {
    try {
      PlaintextSchema.parse(plaintext);
      return await argon2.hash(plaintext, HASH_OPTIONS);
    } catch (error) {
      // Single error path - 100% testable
      throw new Error(
        `Hashing failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}
```

### Tests (index.test.ts)
```typescript
// Validation errors
it('should throw on empty string', async () => {
  try {
    await SkelHasher.hash('');
    expect.fail('Should have thrown');
  } catch (error) {
    expect(error).toBeInstanceOf(Error);
    expect((error as Error).message).toContain('Hashing failed');
  }
});

// Property-based
it('[PROPERTY] should hash any valid string', async () => {
  await fc.assert(
    fc.asyncProperty(
      fc.string({ minLength: 1, maxLength: 100 }),
      async (password: string) => {
        const hash = await SkelHasher.hash(password);
        expect(hash).toMatch(/^\$argon2/);
      }
    ),
    { numRuns: 3 }
  );
}, 120000);

// Boundary testing
it('should reject exactly 0 characters', async () => {
  await expect(SkelHasher.hash('')).rejects.toThrow('Hashing failed');
});

it('should accept exactly 1 character', async () => {
  const hash = await SkelHasher.hash('a');
  expect(hash).toBeDefined();
});

// Configuration validation
it('must use exactly m=19456 for memory cost', async () => {
  const hash = await SkelHasher.hash('test');
  const memoryMatch = hash.match(/m=(\d+)/);
  expect(memoryMatch?.[1]).toBe('19456');
});
```

**Result**: 80% mutation score, 0 survived mutants

---

## Common Pitfalls

### 1. Over-relying on Coverage
```typescript
// ❌ 100% code coverage doesn't mean good tests
it('should do something', () => {
  myFunction(); // Covered but not verified
});

// ✅ Verify behavior
it('should return expected result', () => {
  const result = myFunction();
  expect(result).toBe(expectedValue);
});
```

### 2. Not Testing False Cases
```typescript
// ❌ Only tests true path
it('should validate correct input', () => {
  expect(validate('valid')).toBe(true);
});

// ✅ Tests both paths
it('should validate correct input', () => {
  expect(validate('valid')).toBe(true);
});

it('should reject incorrect input', () => {
  expect(validate('invalid')).toBe(false);
});
```

### 3. Ignoring Timeout Configuration
```typescript
// ❌ Will timeout during mutation testing
it('[PROPERTY] test', async () => {
  await fc.assert(fc.asyncProperty(...), { numRuns: 20 });
});

// ✅ Properly configured
it('[PROPERTY] test', async () => {
  await fc.assert(fc.asyncProperty(...), { numRuns: 3 });
}, 120000);
```

---

## Success Metrics

**Target**: 80% minimum, 90% ideal

| Score | Quality | Action |
|-------|---------|--------|
| 90%+ | Excellent | Maintain patterns |
| 80-89% | Good | Review "no coverage" mutants |
| 70-79% | Acceptable | Identify survived mutants, add targeted tests |
| <70% | Needs work | Follow this playbook systematically |

---

## Resources

- **Stryker Docs**: https://stryker-mutator.io/docs/
- **Fast-check Guide**: https://fast-check.dev/docs/
- **OWASP Testing**: https://owasp.org/www-project-web-security-testing-guide/

---

**Last Updated**: November 19, 2025  
**Validated With**: SkelHasher (80% score, 0 survived mutants, 34 tests)

