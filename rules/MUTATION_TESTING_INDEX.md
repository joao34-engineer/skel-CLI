# Mutation Testing Documentation Index

**Current Date:** November 19, 2025  
**Project:** Software Skeleton CLI  
**Achievement:** 80% Mutation Score ✅

---

## 📚 Active Documentation

### 1. **MUTATION_TESTING_UNIVERSAL_GUIDE.md** ⭐ PRIMARY
**Universal guide for all programming languages and stacks**
- Cross-platform patterns (TypeScript, Java, Python, C#, Go, Ruby, Rust, PHP)
- 8 mutation killing patterns
- Tools configuration for each stack
- Real-world examples in multiple languages
- **Use this for:** Any new project or language

### 2. **MUTATION_TESTING_PLAYBOOK.md**
**TypeScript/JavaScript-specific deep dive**
- Detailed patterns with TypeScript examples
- Vitest + Stryker configuration
- Property-based testing with fast-check
- Test suite architecture (The Gauntlet pattern)
- **Use this for:** TypeScript/JavaScript projects

### 3. **MUTATION_QUICK_REF.md**
**Quick reference card for daily use**
- Code patterns at a glance
- Config snippets
- Test checklist
- When to accept "no coverage"
- **Use this for:** Quick lookups during development

### 4. **MUTATION_SCORE_80_ACHIEVED.md**
**Project-specific results and learnings**
- SkelHasher case study
- Changes made to achieve 80%
- Final metrics
- Recommendations
- **Use this for:** Understanding what worked in this project

---

## 🗂️ Archived Documentation

The following files contain historical information from the mutation testing journey. They are kept for reference but superseded by the active documentation above.

### Historical Records
- `MUTATION_TEST_RESULTS.md` - Early test results (70.59% score)
- `MUTATION_IMPROVEMENT_STRATEGY.md` - Initial improvement plan
- `MUTATION_TEST_QUICK_REFERENCE.md` - Deprecated quick ref
- `PROFESSIONAL_MUTATION_STRATEGY.md` - Early strategy document

**Status:** Archived - Information consolidated into active guides above

---

## 🎯 Quick Start

### For TypeScript/JavaScript Projects
1. Read: `MUTATION_TESTING_PLAYBOOK.md`
2. Reference: `MUTATION_QUICK_REF.md`
3. Configure: Use Stryker + Vitest patterns from playbook

### For Other Languages
1. Read: `MUTATION_TESTING_UNIVERSAL_GUIDE.md`
2. Find your stack's section
3. Apply the 8 universal patterns
4. Configure tools for your language

### For Daily Development
1. Keep `MUTATION_QUICK_REF.md` open
2. Follow the checklist before running tests
3. Target: 80% minimum, 90% ideal

---

## 📊 Key Metrics Achieved

**SkelHasher Primitive (TypeScript + Vitest + Stryker)**

| Metric | Count | Percentage |
|--------|-------|------------|
| Total Mutants | 10 | 100% |
| Killed | 8 | 80.00% ✅ |
| Survived | 0 | 0% ✅ |
| No Coverage | 2 | 20.00% |
| Tests | 34 | 100% passing |

---

## 🔄 Maintenance

### When to Update This Documentation

1. **New stack validated** → Add to UNIVERSAL_GUIDE
2. **New pattern discovered** → Add to both UNIVERSAL_GUIDE and PLAYBOOK
3. **Tool version changes** → Update config examples
4. **Score improvements** → Document in new case study

### Review Schedule
- Quarterly review of patterns
- Update tool versions as released
- Add new language examples as project expands

---

## 📖 Reading Order

**Beginner:**
1. MUTATION_TESTING_UNIVERSAL_GUIDE.md (Concepts section)
2. MUTATION_QUICK_REF.md (Quick reference)
3. MUTATION_SCORE_80_ACHIEVED.md (Real example)

**Intermediate:**
1. MUTATION_TESTING_PLAYBOOK.md (Deep patterns)
2. MUTATION_TESTING_UNIVERSAL_GUIDE.md (Cross-stack)

**Expert:**
1. All active docs for reference
2. Contribute new patterns to guides

---

## 🔗 External Resources

### Tools
- **Stryker (JS/TS/C#):** https://stryker-mutator.io
- **PIT (Java):** https://pitest.org
- **mutmut (Python):** https://mutmut.readthedocs.io
- **Infection (PHP):** https://infection.github.io
- **Mutant (Ruby):** https://github.com/mbj/mutant
- **cargo-mutants (Rust):** https://mutants.rs
- **go-mutesting (Go):** https://github.com/zimmski/go-mutesting

### Property-Based Testing
- **fast-check (TypeScript):** https://fast-check.dev
- **hypothesis (Python):** https://hypothesis.readthedocs.io
- **jqwik (Java):** https://jqwik.net
- **FsCheck (C#):** https://fscheck.github.io/FsCheck

### Testing Philosophies
- **Mutation Testing Intro:** https://en.wikipedia.org/wiki/Mutation_testing
- **Property-Based Testing:** https://fsharpforfunandprofit.com/posts/property-based-testing/

---

## ✅ Success Criteria

Use this documentation effectively if you can:

- [ ] Explain why mutation testing > code coverage
- [ ] Achieve 80%+ mutation score on new code
- [ ] Write tests that catch boolean mutations
- [ ] Test boundary conditions systematically
- [ ] Configure mutation tools for your stack
- [ ] Decide when to accept "no coverage" mutants
- [ ] Optimize property-based tests for performance
- [ ] Apply patterns across different languages

---

**Maintained by:** Software Skeleton CLI Team  
**Last Major Update:** November 19, 2025  
**Next Review:** February 2026

