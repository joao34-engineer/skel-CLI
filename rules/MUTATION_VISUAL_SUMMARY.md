# 🎯 Mutation Testing: Visual Summary

```
┌─────────────────────────────────────────────────────────────────┐
│                     MUTATION TESTING WORKFLOW                   │
└─────────────────────────────────────────────────────────────────┘

   1. Write Tests          2. Run Mutation        3. Fix Weak Tests
   ┌──────────┐           ┌──────────┐           ┌──────────┐
   │ 34 Tests │  ──────>  │ 10 Mutants│  ──────> │  8 Killed │
   │ 100% Cov │           │ Generated │           │  0 Survived│
   └──────────┘           └──────────┘           └──────────┘
        │                       │                       │
        v                       v                       v
   All code runs        Tests vs Mutants         80% Score ✅
```

---

## 📊 The Mutation Testing Matrix

```
╔════════════════════════════════════════════════════════════════╗
║  METRIC          │  BAD    │  OK     │  GOOD   │  EXCELLENT  ║
╠════════════════════════════════════════════════════════════════╣
║  Code Coverage   │  <70%   │  70-80% │  80-90% │  90%+       ║
║  Mutation Score  │  <70%   │  70-80% │  80-90% │  90%+       ║
║  Survived        │  >10%   │  5-10%  │  1-5%   │  0%         ║
║  No Coverage     │  >30%   │  20-30% │  10-20% │  <10%       ║
╚════════════════════════════════════════════════════════════════╝

       Coverage alone is not enough!
       
   100% Coverage + 45% Mutation Score = WEAK TESTS 🔴
    85% Coverage + 85% Mutation Score = STRONG TESTS ✅
```

---

## 🎭 What Mutation Testing Does

```
Original Code:              Mutant:
──────────────             ──────────
if (x > 5)                 if (x >= 5)        ← Boundary changed
  return true;               return true;
  
Your Test:
──────────
assert fn(5) == false      ✅ CATCHES MUTANT → Test is STRONG
assert fn(6) == true       
                           
Bad Test:                  
──────────                 
assert fn(6) == true       ❌ MISSES MUTANT → Test is WEAK
                           (Doesn't test boundary)
```

---

## 🔧 The 3 Core Patterns (Universal)

### Pattern 1: Simplify Error Handling
```
❌ COMPLEX (Hard to Test)          ✅ SIMPLE (Easy to Test)
─────────────────────────          ────────────────────────
try {                              try {
  validate(x);                       validate(x);
  process(x);                        process(x);
} catch (ValidationError) {        } catch (Exception e) {
  throw e;          ← Branch 1       throw Error("Failed: " + e.message);
} catch (ProcessError) {           }
  throw e;          ← Branch 2     
} catch (Exception) {              Single path = 100% testable
  throw Error();    ← Branch 3     
}                                  
                                   
3 branches = hard to test          
```

### Pattern 2: Test Exact Values
```
❌ WEAK ASSERTION                  ✅ STRONG ASSERTION
──────────────────                 ───────────────────
assert result                      assert result == True
  ↑                                  ↑
  Passes if: True, 1,                Only passes if: True
  "string", [], {}                   
                                     
Mutant survives:                   Mutant killed:
if (...) return 1  ✗               if (...) return 1  ✓
```

### Pattern 3: Test Boundaries
```
If condition: x > 0 and x <= 100

Test Points:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  -1    0    1    2  ...  99   100   101
  ❌    ❌    ✅    ✅       ✅    ✅    ❌
  
Must test:  -1, 0, 1, 99, 100, 101
            └──┘└─┘  └─┘  └──┘└───┘
            fail ok  ok   ok  fail

Kills mutations in: >, >=, <, <=, ==, !=
```

---

## 🌍 Tools by Language (Quick Lookup)

```
┌──────────────┬──────────────────┬────────────┬──────────┐
│  Language    │  Mutation Tool   │  Test Tool │  Score   │
├──────────────┼──────────────────┼────────────┼──────────┤
│  TypeScript  │  Stryker         │  Vitest    │  80%     │
│  JavaScript  │  Stryker         │  Jest      │  80%     │
│  Java        │  PIT (Pitest)    │  JUnit     │  85%     │
│  Python      │  mutmut          │  pytest    │  80%     │
│  C#          │  Stryker.NET     │  xUnit     │  80%     │
│  PHP         │  Infection       │  PHPUnit   │  75%     │
│  Ruby        │  Mutant          │  RSpec     │  80%     │
│  Go          │  go-mutesting    │  testing   │  80%     │
│  Rust        │  cargo-mutants   │  cargo     │  85%     │
└──────────────┴──────────────────┴────────────┴──────────┘
```

---

## 🎓 Learning Path

```
BEGINNER                INTERMEDIATE            EXPERT
────────                ────────────            ──────

📖 Read Concepts        📖 Read Playbook        📖 All Docs
   ↓                       ↓                       ↓
✏️  Write Basic Tests    ✏️  Property Tests      ✏️  Custom Patterns
   ↓                       ↓                       ↓
🏃 Run Mutation         🏃 Optimize Speed       🏃 CI/CD Integration
   ↓                       ↓                       ↓
🎯 Fix Survived         🎯 Boundary Tests       🎯 Cross-Stack
   ↓                       ↓                       ↓
✅ 70%+ Score           ✅ 80%+ Score           ✅ 90%+ Score
```

---

## 📈 Score Interpretation

```
MUTATION SCORE GUIDE
════════════════════════════════════════════════════════════

 100% ─┤                                            ┌─ Impossible
       │                                        ┌───┘  (Diminishing returns)
       │                                    ┌───┘
  90% ─┤                                ┌───┘           
       │                            ┌───┘    ← IDEAL ZONE
       │                        ┌───┘        
  80% ─┤                    ┌───┘  ← TARGET (This guide)
       │                ┌───┘                
       │            ┌───┘        ← ACCEPTABLE
  70% ─┤        ┌───┘                        
       │    ┌───┘                ← NEEDS WORK
       │┌───┘                    
  60% ─┤                                     
       │← WEAK TESTS
       └────────────────────────────────────
        
  < 70%  = Red    (High risk)
  70-80% = Yellow (Acceptable)
  80-90% = Green  (Target) ⭐
  90%+   = Blue   (Excellent)
```

---

## 🏆 Success Story: SkelHasher

```
BEFORE                          AFTER
──────────────────             ──────────────────
❌ 62.5% Score                 ✅ 80.0% Score
❌ 3 Survived                  ✅ 0 Survived
❌ Complex error handling      ✅ Simple error handling
❌ Weak assertions             ✅ Strong assertions
❌ No boundary tests           ✅ Full boundary coverage

Changes Made:
─────────────
1. Removed conditional error re-throwing
2. Wrapped all errors consistently
3. Added exact value assertions
4. Tested boundaries (0, 1, max-1, max+1)
5. Validated configuration constants

Time Investment: 4 hours
ROI: Prevented future bugs, increased confidence
```

---

## 📚 Documentation Map

```
MUTATION_TESTING_INDEX.md (START HERE)
         │
         ├─── For Any Language
         │    └─── MUTATION_TESTING_UNIVERSAL_GUIDE.md
         │         (Python, Java, Go, Rust, C#, PHP, Ruby, TS)
         │
         ├─── For TypeScript/JavaScript
         │    └─── MUTATION_TESTING_PLAYBOOK.md
         │         (Detailed patterns, Vitest, Stryker)
         │
         ├─── For Quick Reference
         │    └─── MUTATION_QUICK_REF.md
         │         (Code snippets, checklist)
         │
         └─── For Case Study
              └─── MUTATION_SCORE_80_ACHIEVED.md
                   (Real results, lessons learned)
```

---

## ⚡ Quick Commands

### TypeScript/JavaScript
```bash
# Install
npm install --save-dev @stryker-mutator/core @stryker-mutator/vitest-runner

# Run
npm run test:mutation

# Expected output
# Mutation score: 80.00%
```

### Java
```bash
# Run
mvn org.pitest:pitest-maven:mutationCoverage

# Expected output
# Mutation Coverage: 80%
```

### Python
```bash
# Install
pip install mutmut

# Run
mutmut run

# Results
mutmut results
```

### Go
```bash
# Install
go get github.com/zimmski/go-mutesting

# Run
go-mutesting ./...
```

---

## 🎯 Daily Checklist (Keep This Visible)

```
Before Committing Code:
□ All tests passing (100%)
□ Single error handling path
□ Exact value assertions (not .toBeTruthy())
□ Boundary tests (0, 1, max-1, max+1)
□ Config constants verified
□ Error messages tested
□ Run mutation tests
□ Score >= 80%
□ Zero survived mutants

If mutation score < 80%:
1. Check survived mutants
2. Add missing boundary tests
3. Strengthen assertions
4. Re-run mutation tests
```

---

## 🔍 Debugging Low Scores

```
LOW SCORE? FOLLOW THIS TREE:
════════════════════════════

Mutation Score < 80%?
    │
    ├── Survived Mutants > 0?
    │   │
    │   ├── Boolean mutations?
    │   │   └─→ Fix: assert x == True (not assert x)
    │   │
    │   ├── Boundary mutations?
    │   │   └─→ Fix: Test 0, 1, max-1, max+1
    │   │
    │   └── Config mutations?
    │       └─→ Fix: Verify constants in tests
    │
    └── No Coverage > 20%?
        │
        ├── Error handling?
        │   └─→ Simplify: One catch block
        │
        └── Unreachable code?
            └─→ Remove or document
```

---

## 💡 Pro Tips

```
1. START SIMPLE
   Don't aim for 100% on day 1
   Target: 70% → 80% → 90%

2. FOCUS ON BUSINESS LOGIC
   Mutation test your core algorithms
   Skip: getters, setters, obvious code

3. PROPERTY-BASED TESTS
   3-5 runs sufficient for mutation testing
   More runs = slower but more thorough

4. OPTIMIZE FOR SPEED
   Mutation tests run ALL tests MANY times
   Keep individual tests fast (<100ms)

5. AUTOMATE
   Add mutation tests to CI pipeline
   Fail build if score drops below 70%
```

---

## 🚀 Next Steps

1. **Read:** `MUTATION_TESTING_INDEX.md` to understand the docs
2. **Choose:** Your language guide (Universal or Playbook)
3. **Apply:** The 8 mutation killing patterns
4. **Run:** Mutation tests on your code
5. **Iterate:** Fix survived mutants
6. **Achieve:** 80%+ mutation score
7. **Maintain:** Keep score high on new code

---

**Target: 80% minimum, 90% ideal**
**Result: Confident, bug-resistant code** ✅

Last Updated: November 19, 2025

