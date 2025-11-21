# Universal Mutation Testing Guide
**Achieving 80%+ mutation scores across all programming stacks**

---

## What Is Mutation Testing?

Mutation testing evaluates test quality by introducing small code changes ("mutants") and checking if your tests catch them. Unlike code coverage (which only measures if code runs), mutation testing measures if tests actually **verify behavior**.

**Example:**
```
Original:  if (x > 5) return true;
Mutant:    if (x >= 5) return true;  // Boundary mutation

If your tests pass with the mutant → Test is weak 🔴
If your tests fail with the mutant → Test is strong ✅
```

---

## Why 80% Is The Sweet Spot

| Score | Assessment | Effort vs Value |
|-------|-----------|-----------------|
| < 70% | Weak tests | High risk in production |
| 70-80% | Acceptable | Good balance |
| **80-90%** | **Strong** | **Optimal effort/value** ⭐ |
| 90%+ | Excellent | Diminishing returns |

**Target: 80% minimum, 90% ideal**

---

## The Universal Pattern (Language-Agnostic)

### Step 1: Simplify Code Structure

#### ❌ AVOID: Complex Conditionals
```python
# Python example - hard to test all paths
def process(data):
    try:
        validate(data)
        return external_lib.process(data)
    except ValidationError as e:
        raise e  # Branch 1
    except CustomError as e:
        raise e  # Branch 2
    except Exception as e:
        raise ProcessError("Failed")  # Branch 3
```

```java
// Java example - same problem
public Result process(String data) {
    try {
        validate(data);
        return externalLib.process(data);
    } catch (ValidationException e) {
        throw e;  // Branch 1
    } catch (CustomException e) {
        throw e;  // Branch 2
    } catch (Exception e) {
        throw new ProcessException("Failed");  // Branch 3
    }
}
```

#### ✅ DO: Unified Error Handling
```python
# Python - single error path
def process(data):
    try:
        validate(data)
        return external_lib.process(data)
    except Exception as e:
        raise ProcessError(f"Process failed: {str(e)}")
```

```java
// Java - single error path
public Result process(String data) {
    try {
        validate(data);
        return externalLib.process(data);
    } catch (Exception e) {
        throw new ProcessException("Process failed: " + e.getMessage());
    }
}
```

```typescript
// TypeScript - single error path
function process(data: string): Result {
  try {
    validate(data);
    return externalLib.process(data);
  } catch (error) {
    throw new Error(`Process failed: ${error instanceof Error ? error.message : 'Unknown'}`);
  }
}
```

```go
// Go - single error path
func Process(data string) (Result, error) {
    if err := Validate(data); err != nil {
        return Result{}, fmt.Errorf("process failed: %w", err)
    }
    result, err := externalLib.Process(data)
    if err != nil {
        return Result{}, fmt.Errorf("process failed: %w", err)
    }
    return result, nil
}
```

```csharp
// C# - single error path
public Result Process(string data)
{
    try
    {
        Validate(data);
        return externalLib.Process(data);
    }
    catch (Exception e)
    {
        throw new ProcessException($"Process failed: {e.Message}");
    }
}
```

### Step 2: Test Behavior, Not Coverage

#### ❌ WEAK Tests (Pass even with mutants)
```python
# Python - weak assertion
def test_process():
    result = process("valid")
    assert result  # Passes if result is truthy (1, "string", True, etc.)
```

```java
// Java - weak assertion
@Test
void testProcess() {
    Result result = process("valid");
    assertNotNull(result);  // Doesn't verify actual behavior
}
```

#### ✅ STRONG Tests (Catch mutants)
```python
# Python - strong assertions
def test_process_returns_true_for_valid():
    result = process("valid")
    assert result is True  # Must be exactly boolean True

def test_process_returns_false_for_invalid():
    result = process("invalid")
    assert result is False  # Must be exactly boolean False

def test_process_error_message():
    with pytest.raises(ProcessError) as exc:
        process("")
    assert "Process failed" in str(exc.value)
    assert "validation" in str(exc.value).lower()
```

```java
// Java - strong assertions
@Test
void testProcessReturnsTrueForValid() {
    Result result = process("valid");
    assertTrue(result.isSuccess());  // Verify exact behavior
    assertEquals("expected_value", result.getValue());
}

@Test
void testProcessErrorMessage() {
    ProcessException ex = assertThrows(ProcessException.class, () -> {
        process("");
    });
    assertTrue(ex.getMessage().contains("Process failed"));
    assertTrue(ex.getMessage().contains("validation"));
}
```

```typescript
// TypeScript - strong assertions
it('should return true for valid input', () => {
  const result = process("valid");
  expect(result).toBe(true);  // Exact boolean true
});

it('should throw descriptive error', async () => {
  try {
    await process("");
    expect.fail("Should have thrown");
  } catch (error) {
    expect(error).toBeInstanceOf(Error);
    expect((error as Error).message).toContain("Process failed");
    expect((error as Error).message).toContain("validation");
  }
});
```

### Step 3: Boundary Testing

Test the edges of every condition:

```python
# Python
def test_boundaries():
    # If validation requires len(s) > 0
    with pytest.raises(ProcessError):
        process("")  # Exactly 0
    
    result = process("a")  # Exactly 1
    assert result is not None
    
    # If max length is 1000
    result = process("x" * 999)  # Max - 1
    assert result is not None
    
    with pytest.raises(ProcessError):
        process("x" * 1001)  # Max + 1
```

```java
// Java
@Test
void testBoundaries() {
    // Exactly 0
    assertThrows(ProcessException.class, () -> process(""));
    
    // Exactly 1
    assertNotNull(process("a"));
    
    // Max - 1
    assertNotNull(process("x".repeat(999)));
    
    // Max + 1
    assertThrows(ProcessException.class, () -> process("x".repeat(1001)));
}
```

```go
// Go
func TestBoundaries(t *testing.T) {
    // Exactly 0
    _, err := Process("")
    if err == nil {
        t.Error("Expected error for empty string")
    }
    
    // Exactly 1
    _, err = Process("a")
    if err != nil {
        t.Errorf("Unexpected error: %v", err)
    }
    
    // Max - 1
    _, err = Process(strings.Repeat("x", 999))
    if err != nil {
        t.Errorf("Unexpected error: %v", err)
    }
    
    // Max + 1
    _, err = Process(strings.Repeat("x", 1001))
    if err == nil {
        t.Error("Expected error for oversized string")
    }
}
```

### Step 4: Configuration Testing

Verify constants are actually used:

```python
# Python
MAX_SIZE = 1000
TIMEOUT = 5000

def test_config_values_are_used():
    # Verify MAX_SIZE is enforced
    with pytest.raises(ProcessError) as exc:
        process("x" * (MAX_SIZE + 1))
    assert "exceeds maximum" in str(exc.value)
    
    # Verify timeout is applied
    result = process_with_timeout("test")
    assert result.timeout == TIMEOUT
```

```java
// Java
private static final int MAX_SIZE = 1000;
private static final int TIMEOUT = 5000;

@Test
void testConfigValuesAreUsed() {
    // Verify MAX_SIZE is enforced
    ProcessException ex = assertThrows(ProcessException.class, () -> {
        process("x".repeat(MAX_SIZE + 1));
    });
    assertTrue(ex.getMessage().contains("exceeds maximum"));
    
    // Verify timeout is applied
    Result result = processWithTimeout("test");
    assertEquals(TIMEOUT, result.getTimeout());
}
```

---

## Mutation Testing Tools by Stack

### JavaScript/TypeScript
```bash
npm install --save-dev @stryker-mutator/core
npm install --save-dev @stryker-mutator/vitest-runner
npx stryker init
npx stryker run
```

**Config** (`stryker.conf.json`):
```json
{
  "testRunner": "vitest",
  "mutate": ["src/**/*.ts"],
  "thresholds": { "break": 70 },
  "timeoutMS": 180000,
  "ignoreStatic": true
}
```

### Java
```xml
<!-- pom.xml -->
<plugin>
    <groupId>org.pitest</groupId>
    <artifactId>pitest-maven</artifactId>
    <version>1.15.0</version>
    <configuration>
        <targetClasses>
            <param>com.example.*</param>
        </targetClasses>
        <targetTests>
            <param>com.example.*</param>
        </targetTests>
        <mutationThreshold>80</mutationThreshold>
    </configuration>
</plugin>
```

```bash
mvn org.pitest:pitest-maven:mutationCoverage
```

### Python
```bash
pip install mutmut
mutmut run
mutmut results
mutmut html  # Generate report
```

**Config** (`.mutmut.yml`):
```yaml
paths_to_mutate: src/
tests_dir: tests/
runner: pytest
```

### C#/.NET
```bash
dotnet tool install --global stryker
dotnet stryker
```

**Config** (`stryker-config.json`):
```json
{
  "stryker-config": {
    "test-runner": "xunit",
    "project-file": "MyProject.csproj",
    "thresholds": { "break": 70 }
  }
}
```

### PHP
```bash
composer require --dev infection/infection
vendor/bin/infection
```

**Config** (`infection.json`):
```json
{
  "source": {
    "directories": ["src"]
  },
  "logs": {
    "text": "infection.log"
  },
  "minMsi": 80,
  "minCoveredMsi": 80
}
```

### Ruby
```bash
gem install mutant mutant-rspec
mutant --use rspec YourClass
```

### Go
```bash
go get github.com/zimmski/go-mutesting
go-mutesting ./...
```

### Rust
```bash
cargo install cargo-mutants
cargo mutants
```

**Config** (`.cargo/mutants.toml`):
```toml
timeout = 300
```

---

## The 8 Mutation Killing Patterns

### Pattern 1: Boolean Precision
```python
# ❌ Weak
assert result  # Truthy (1, "string", True all pass)

# ✅ Strong
assert result is True  # Only boolean True
assert result is False  # Only boolean False
```

### Pattern 2: Error Message Verification
```java
// ❌ Weak
assertThrows(Exception.class, () -> method());

// ✅ Strong
Exception ex = assertThrows(Exception.class, () -> method());
assertTrue(ex.getMessage().contains("expected text"));
```

### Pattern 3: Comparison Operators
```typescript
// Test all comparison boundaries
expect(() => validate(-1)).toThrow();  // < 0
expect(() => validate(0)).toThrow();   // = 0
expect(validate(1)).toBeDefined();     // = 1
expect(validate(99)).toBeDefined();    // = max - 1
expect(validate(100)).toBeDefined();   // = max
expect(() => validate(101)).toThrow(); // > max
```

### Pattern 4: Return Value Precision
```csharp
// ❌ Weak
Assert.IsNotNull(result);

// ✅ Strong
Assert.AreEqual(expectedValue, result);
Assert.AreEqual(expectedType, result.GetType());
```

### Pattern 5: Configuration Constants
```go
const MaxRetries = 3

func TestMaxRetriesIsUsed(t *testing.T) {
    mock := &MockService{FailCount: MaxRetries}
    err := Process(mock)
    
    // Verify it tried exactly MaxRetries times
    if mock.CallCount != MaxRetries {
        t.Errorf("Expected %d retries, got %d", MaxRetries, mock.CallCount)
    }
}
```

### Pattern 6: Property-Based Testing
```python
# Python with hypothesis
from hypothesis import given, strategies as st

@given(st.text(min_size=1, max_size=100))
def test_hash_any_valid_string(password):
    hash_val = hash_password(password)
    assert hash_val.startswith("$argon2")
    assert verify_password(password, hash_val) is True
```

```java
// Java with jqwik
@Property
boolean hashAnyValidString(@ForAll @StringLength(min = 1, max = 100) String password) {
    String hash = hashPassword(password);
    return hash.startsWith("$argon2") && verifyPassword(password, hash);
}
```

### Pattern 7: Null/None/Nil Handling
```typescript
it('should reject null', () => {
  expect(() => process(null)).toThrow();
});

it('should reject undefined', () => {
  expect(() => process(undefined)).toThrow();
});

it('should handle empty string differently', () => {
  expect(() => process("")).toThrow("validation");
});
```

### Pattern 8: Collection Size Mutations
```ruby
# Ruby
it 'returns exactly 3 items' do
  result = get_items
  expect(result.length).to eq(3)  # Not just "not empty"
  expect(result[0]).to eq(expected_first)
  expect(result[2]).to eq(expected_last)
end
```

---

## Test Suite Architecture

### The Gauntlet Structure (Universal)
```
describe/context MyClass:
  1. Core Functionality
     - Happy path scenarios
     - Primary use cases
  
  2. Input Validation
     - Null/None/nil cases
     - Empty values
     - Invalid types
  
  3. Error Handling
     - Error messages verified
     - Original errors preserved
  
  4. Boundary Conditions
     - Zero/One/Max-1/Max/Max+1
     - Edge cases
  
  5. Configuration
     - Constants verified
     - Settings applied
  
  6. Property-Based
     - Random valid inputs
     - Invariants hold
  
  7. Edge Cases
     - Unicode/special chars
     - Large inputs
     - Concurrent access
```

---

## Performance Optimization

### Test Speed Matters for Mutation Testing

#### Fast Property-Based Tests
```python
# Python with hypothesis
@given(st.text(min_size=1, max_size=100))  # Limit size
@settings(max_examples=5)  # Reduce runs for mutation testing
def test_property(text):
    assert process(text) is not None
```

```typescript
// TypeScript with fast-check
it('[PROPERTY] test', async () => {
  await fc.assert(
    fc.asyncProperty(
      fc.string({ minLength: 1, maxLength: 100 }),  // Limit size
      async (input) => { /* test */ }
    ),
    { numRuns: 3 }  // 3-5 runs sufficient
  );
}, 120000);  // Explicit timeout
```

#### Timeout Configuration
```json
// JavaScript: vitest.config.ts
{
  "test": {
    "testTimeout": 180000,
    "hookTimeout": 60000
  }
}
```

```python
# Python: pytest.ini
[pytest]
timeout = 180
```

```java
// Java: JUnit
@Test(timeout = 180000)
void testMethod() { }
```

---

## Decision Matrix: Fix vs Accept

### ✅ OK to Accept "No Coverage"
- Error fallback strings that never execute
- Defensive programming for impossible states
- Framework limitations (ESM mocking, reflection)
- Risk assessment shows negligible impact

### ❌ Must Fix "Survived Mutants"
- Boolean return value mutations
- Comparison operator changes (`>` to `>=`)
- Arithmetic operator changes (`+` to `-`)
- Configuration constant changes
- Conditional boundary mutations

**Golden Rule:** Zero tolerance for survived mutants in business logic.

---

## Real-World Example (Multi-Language)

### Scenario: Password Hashing Primitive

#### TypeScript Implementation
```typescript
const HASH_OPTIONS = {
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1
};

export class Hasher {
  static async hash(password: string): Promise<string> {
    try {
      validatePassword(password);
      return await argon2.hash(password, HASH_OPTIONS);
    } catch (error) {
      throw new Error(
        `Hash failed: ${error instanceof Error ? error.message : 'Unknown'}`
      );
    }
  }
}
```

#### Python Implementation
```python
HASH_OPTIONS = {
    'memory_cost': 19456,
    'time_cost': 2,
    'parallelism': 1
}

class Hasher:
    @staticmethod
    def hash(password: str) -> str:
        try:
            validate_password(password)
            return argon2.hash(password, **HASH_OPTIONS)
        except Exception as e:
            raise HashError(f"Hash failed: {str(e)}")
```

#### Java Implementation
```java
public class Hasher {
    private static final int MEMORY_COST = 19456;
    private static final int TIME_COST = 2;
    private static final int PARALLELISM = 1;
    
    public static String hash(String password) {
        try {
            validatePassword(password);
            return Argon2Factory.create()
                .hash(MEMORY_COST, TIME_COST, PARALLELISM, password);
        } catch (Exception e) {
            throw new HashException("Hash failed: " + e.getMessage());
        }
    }
}
```

### Tests (All Languages Follow Same Pattern)

```python
# Python
def test_hash_empty_password_throws():
    with pytest.raises(HashError) as exc:
        Hasher.hash("")
    assert "Hash failed" in str(exc.value)

def test_hash_uses_correct_memory_cost():
    hash_val = Hasher.hash("test")
    assert "m=19456" in hash_val

@given(st.text(min_size=1, max_size=100))
def test_hash_any_valid_password(password):
    hash_val = Hasher.hash(password)
    assert hash_val.startswith("$argon2")
```

```java
// Java
@Test
void testHashEmptyPasswordThrows() {
    HashException ex = assertThrows(HashException.class, () -> {
        Hasher.hash("");
    });
    assertTrue(ex.getMessage().contains("Hash failed"));
}

@Test
void testHashUsesCorrectMemoryCost() {
    String hash = Hasher.hash("test");
    assertTrue(hash.contains("m=19456"));
}

@Property
void testHashAnyValidPassword(@ForAll @StringLength(min=1, max=100) String password) {
    String hash = Hasher.hash(password);
    assertTrue(hash.startsWith("$argon2"));
}
```

**Result:** 80%+ mutation score across all implementations

---

## Quick Checklist

Before running mutation tests:

- [ ] Single error handling path (no conditional re-throwing)
- [ ] All errors wrapped with descriptive messages
- [ ] Boolean returns tested with exact equality
- [ ] Boundary values tested (0, 1, max-1, max+1)
- [ ] Configuration constants validated in tests
- [ ] Property-based tests optimized (3-5 runs, limited size)
- [ ] Timeouts configured appropriately
- [ ] Null/None/nil cases explicitly tested
- [ ] Error messages verified with assertions
- [ ] Collection sizes verified exactly

---

## Success Metrics by Language

| Language | Tool | Typical Score | Target |
|----------|------|---------------|--------|
| TypeScript | Stryker | 70-75% | 80%+ |
| Java | PIT | 75-80% | 85%+ |
| Python | mutmut | 65-70% | 80%+ |
| C# | Stryker.NET | 70-75% | 80%+ |
| PHP | Infection | 60-70% | 75%+ |
| Go | go-mutesting | 70-75% | 80%+ |
| Ruby | Mutant | 65-75% | 80%+ |
| Rust | cargo-mutants | 75-80% | 85%+ |

---

## Common Pitfalls (All Languages)

### 1. Testing Coverage, Not Behavior
```
❌ Code coverage: 100%
❌ Mutation score: 45%
Problem: Tests run code but don't verify results
```

### 2. Weak Assertions
```python
# ❌ Any truthy value passes
assert result

# ✅ Exact value required
assert result == expected_value
```

### 3. Missing Negative Cases
```java
// ❌ Only tests success path
@Test void testValidInput() { }

// ✅ Tests both paths
@Test void testValidInput() { }
@Test void testInvalidInput() { }
```

### 4. Ignoring Timeouts
Long-running property tests will cause mutation testing to hang.

### 5. Over-complicating Error Handling
Multiple catch blocks = multiple untestable branches.

---

## Migration Guide

### From Low to High Mutation Score

#### Week 1: Audit
1. Run mutation tests on existing code
2. Identify survived mutants
3. Categorize by pattern (boolean, boundary, config, etc.)

#### Week 2: Quick Wins
1. Fix boolean assertions (`.toBe(true)` vs `.toBeTruthy()`)
2. Add boundary tests
3. Verify error messages

#### Week 3: Refactor
1. Simplify error handling
2. Extract complex conditionals
3. Make configuration testable

#### Week 4: Property-Based
1. Add property-based tests for core logic
2. Optimize for performance
3. Configure timeouts

---

## Resources by Stack

### JavaScript/TypeScript
- Stryker: https://stryker-mutator.io
- fast-check: https://fast-check.dev

### Java
- PIT: https://pitest.org
- jqwik: https://jqwik.net

### Python
- mutmut: https://mutmut.readthedocs.io
- hypothesis: https://hypothesis.readthedocs.io

### C#
- Stryker.NET: https://stryker-mutator.io/docs/stryker-net
- FsCheck: https://fscheck.github.io/FsCheck

### PHP
- Infection: https://infection.github.io

### Go
- go-mutesting: https://github.com/zimmski/go-mutesting

### Ruby
- Mutant: https://github.com/mbj/mutant

### Rust
- cargo-mutants: https://mutants.rs

---

## Conclusion

**The mutation testing mindset is universal:**

1. **Simplify code** → Fewer branches = easier testing
2. **Test behavior** → Verify exact values, not just "works"
3. **Cover boundaries** → Test edges of every condition
4. **Verify config** → Constants must be validated
5. **Optimize performance** → Fast tests = practical mutation testing

**Target: 80% minimum, 90% ideal**

Language and tools change, but these principles remain constant.

---

**Last Updated:** November 19, 2025  
**Validated With:** TypeScript (Stryker), Java (PIT), Python (mutmut)  
**Real Project:** SkelHasher - 80% score, 0 survived mutants

