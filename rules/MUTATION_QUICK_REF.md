# 80% Mutation Score - Quick Reference Card

## The 3 Golden Rules

1. **Simplify Error Handling** - One catch block, wrap all errors consistently
2. **Test Behavior, Not Coverage** - Verify exact values, not just "truthy"
3. **Optimize for Speed** - Property tests: 3 runs, 100 char max, 120s timeout

---

## Code Patterns

### ✅ Error Handling
```typescript
try {
  validate(input);
  return await process(input);
} catch (error) {
  throw new Error(`Failed: ${error instanceof Error ? error.message : 'Unknown'}`);
}
```

### ✅ Test Structure
```typescript
it('should handle error case', async () => {
  try {
    await myFunc('');
    expect.fail('Should have thrown');
  } catch (error) {
    expect(error).toBeInstanceOf(Error);
    expect((error as Error).message).toContain('Failed');
  }
});
```

### ✅ Property-Based
```typescript
it('[PROPERTY] test', async () => {
  await fc.assert(
    fc.asyncProperty(
      fc.string({ minLength: 1, maxLength: 100 }),
      async (input) => { /* test */ }
    ),
    { numRuns: 3 }
  );
}, 120000);
```

### ✅ Boundary Testing
```typescript
it('reject at 0', () => expect(fn('')).rejects.toThrow());
it('accept at 1', () => expect(fn('a')).resolves.toBeDefined());
it('accept at max-1', () => expect(fn('x'.repeat(MAX-1))).resolves.toBeDefined());
it('reject at max+1', () => expect(fn('x'.repeat(MAX+1))).rejects.toThrow());
```

### ✅ Boolean Testing
```typescript
expect(result).toBe(true);   // NOT .toBeTruthy()
expect(result).toBe(false);  // NOT .toBeFalsy()
```

### ✅ Config Validation
```typescript
it('uses config value', async () => {
  const result = await process('test');
  expect(result).toContain(`timeout=${CONFIG.timeout}`);
});
```

---

## Config Files

### vitest.config.ts
```typescript
testTimeout: 180000,
hookTimeout: 60000,
```

### stryker.conf.json
```json
{
  "timeoutMS": 180000,
  "ignoreStatic": true,
  "thresholds": { "break": 70 }
}
```

---

## Test Checklist

- [ ] Single error path (no `if (error instanceof X)`)
- [ ] Error messages tested with `.toContain()`
- [ ] Boolean returns tested with `.toBe(true/false)`
- [ ] Boundaries tested (0, 1, max-1, max+1)
- [ ] Config constants validated in tests
- [ ] Property tests: 3 runs, 100 chars, 120s timeout
- [ ] All tests verify exact values, not just types

---

## When to Accept "No Coverage"

✅ **OK to accept:**
- `'Unknown error'` fallback strings
- Error messages in unreachable defensive code
- ESM mocking limitations

❌ **Must fix:**
- Survived mutants (0% tolerance)
- Boolean mutations
- Comparison operator mutations
- Config value mutations

---

**Target**: 80% minimum | **Ideal**: 90%+
**See**: `/rules/MUTATION_TESTING_PLAYBOOK.md` for full guide

