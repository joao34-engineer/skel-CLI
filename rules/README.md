# Software Skeleton CLI - Rules & Documentation Index

**Last Updated:** November 20, 2025  
**Status:** Minimal & Production Ready

---

## 📖 Quick Navigation

### For New Users
**Start Here:** [`QUICK_START.md`](./QUICK_START.md) → Get running in 5 minutes

### For Developers
**Architecture:** [`PROJECT_ARCHITECTURE.md`](./PROJECT_ARCHITECTURE.md) → Complete system design
**Testing:** [`MUTATION_TESTING_INDEX.md`](./MUTATION_TESTING_INDEX.md) → Quality strategy

### For Reference
**Security:** [`security.md`](./security.md) → 5-layer security model

---

## 📚 Essential Documentation (10 Files)

### 1. Getting Started

#### [`QUICK_START.md`](./QUICK_START.md) ⭐ START HERE
**Purpose:** Get the CLI running in 5 minutes  
**Audience:** Everyone  
**Contents:**
- Installation instructions
- Available commands
- Usage examples
- Development vs production modes

---

### 2. Project Architecture & Vision

#### [`PROJECT_ARCHITECTURE.md`](./PROJECT_ARCHITECTURE.md) ⭐ COMPREHENSIVE
**Purpose:** Complete system architecture and vision  
**Audience:** Developers, architects, contributors  
**Contents:**
- Project identity & mission
- The strategic pivot (Skeletons → Primitives)
- The 3 Laws of Primitives
- Directory structure
- Dual vault architecture
- SkelFactory automation
- Multi-language roadmap
- Current status & next steps

**This is THE master architecture document** - All vision, strategy, and factory specs consolidated here.

---

### 3. Security Standards

#### [`security.md`](./security.md)
**Purpose:** The 5-layer security model ("The Gauntlet")  
**Audience:** Developers, security engineers  
**Contents:**
1. **Static Analysis** (Biome)
2. **Runtime Integrity** (Zod)
3. **Logic Verification** (Vitest)
4. **Chaos Engineering** (fast-check)
5. **Mutation Testing** (Stryker)

---

### 4. Mutation Testing Documentation (6 Files)

All mutation testing docs are cross-referenced through the index.

#### [`MUTATION_TESTING_INDEX.md`](./MUTATION_TESTING_INDEX.md) ⭐ MUTATION HUB
**Purpose:** Central navigation for all mutation testing docs  
**Audience:** Everyone working with tests  
**Contents:**
- Active documentation list
- Archived documentation
- Quick start paths
- Reading order recommendations

#### [`MUTATION_TESTING_UNIVERSAL_GUIDE.md`](./MUTATION_TESTING_UNIVERSAL_GUIDE.md) ⭐ PRIMARY
**Purpose:** Cross-platform mutation testing guide  
**Audience:** All developers (any language)  
**Contents:**
- Universal patterns for TypeScript, Java, Python, C#, Go, Ruby, Rust, PHP
- The 8 mutation killing patterns
- Tool configuration for each stack
- Real-world examples in multiple languages
- Property-based testing strategies
- Performance optimization

**Use this for:** Any new project or language

#### [`MUTATION_TESTING_PLAYBOOK.md`](./MUTATION_TESTING_PLAYBOOK.md)
**Purpose:** TypeScript/JavaScript-specific deep dive  
**Audience:** TypeScript/JavaScript developers  
**Contents:**
- Detailed patterns with TypeScript examples
- Vitest + Stryker configuration
- Property-based testing with fast-check
- Test suite architecture (The Gauntlet pattern)
- Performance optimization

**Use this for:** TypeScript/JavaScript projects

#### [`MUTATION_QUICK_REF.md`](./MUTATION_QUICK_REF.md)
**Purpose:** Quick reference card for daily use  
**Audience:** Active developers  
**Contents:**
- Code patterns at a glance
- Config snippets
- Test checklist
- When to accept "no coverage"

**Use this for:** Quick lookups during development

#### [`MUTATION_VISUAL_SUMMARY.md`](./MUTATION_VISUAL_SUMMARY.md)
**Purpose:** Visual learning tool with diagrams  
**Audience:** New learners, visual thinkers  
**Contents:**
- ASCII diagrams and flowcharts
- Score interpretation charts
- Debugging decision trees
- Quick commands by language
- Success story visualization

**Use this for:** Learning concepts or explaining to others

#### [`MUTATION_SCORE_80_ACHIEVED.md`](./MUTATION_SCORE_80_ACHIEVED.md)
**Purpose:** Project-specific results and case study  
**Audience:** Stakeholders, learners  
**Contents:**
- SkelHasher case study
- Changes made to achieve 80%
- Final metrics (10 mutants, 8 killed, 0 survived)
- Recommendations

**Use this for:** Understanding what worked in this project

---


## 🎯 Common Tasks & Where to Look

### "I want to..."

| Task | Start Here |
|------|-----------|
| Get started quickly | `QUICK_START.md` |
| Understand the architecture | `PROJECT_ARCHITECTURE.md` |
| Learn mutation testing | `MUTATION_TESTING_INDEX.md` → Choose your path |
| Improve test quality | `MUTATION_TESTING_UNIVERSAL_GUIDE.md` |
| See TypeScript-specific patterns | `MUTATION_TESTING_PLAYBOOK.md` |
| Quick mutation reference | `MUTATION_QUICK_REF.md` |
| Understand security layers | `security.md` |
| Implement a primitive | `PROJECT_ARCHITECTURE.md` → Section 3 (The 3 Laws) |
| Contribute code | `PROJECT_ARCHITECTURE.md` → Section 17 (Contribution) |

---

## 📖 Recommended Reading Order

### For Beginners
1. `QUICK_START.md` - Get familiar with commands
2. `PROJECT_ARCHITECTURE.md` - Sections 1-4 (Identity & Laws)
3. `MUTATION_TESTING_INDEX.md` - Understand the index
4. `MUTATION_VISUAL_SUMMARY.md` - Visual concepts

### For Intermediate Developers
1. `PROJECT_ARCHITECTURE.md` - Full read
2. `MUTATION_TESTING_UNIVERSAL_GUIDE.md` - Your language section
3. `MUTATION_TESTING_PLAYBOOK.md` - Deep patterns
4. `security.md` - Security model

### For Advanced/Contributors
1. All documentation (for reference)
2. `PROJECT_ARCHITECTURE.md` - Sections 8-11 (Factory & Multi-language)
3. `MUTATION_TESTING_UNIVERSAL_GUIDE.md` - All languages
4. `security.md` - Security implementation details

---

## 📊 Documentation Metrics

| Metric | Value |
|--------|-------|
| **Total Files** | 10 |
| **Getting Started** | 1 |
| **Architecture** | 1 |
| **Security** | 1 |
| **Mutation Testing** | 6 |
| **Index/Navigation** | 1 |
| **Total Size** | ~150KB |
| **Languages Covered** | 9 (TS, JS, Java, Python, C#, PHP, Ruby, Go, Rust) |
| **Last Update** | November 20, 2025 |
| **Status** | ✅ Minimal & Production Ready |

---

## 🔄 Maintenance

### When to Update
- **Weekly:** Review for accuracy after significant code changes
- **Monthly:** Check for outdated tool versions
- **Quarterly:** Major documentation review
- **Yearly:** Archive old patterns, add new ones

### Update Checklist
- [ ] Update version numbers and dates
- [ ] Validate all file paths and links
- [ ] Check for new patterns discovered
- [ ] Verify tool versions are current
- [ ] Update this index when adding new docs

### Next Review: February 2026

---

## 🎯 Documentation Quality Standards

All documentation in this folder follows these principles:

### ✅ Clear Purpose
Each document has a single, well-defined purpose stated at the top.

### ✅ Target Audience
Every document explicitly states who should read it.

### ✅ No Duplication
Information appears in one primary location, with cross-references to related topics.

### ✅ Actionable
Focus on "how to" rather than "what is" - practical guidance over theory.

### ✅ Maintained
Regular reviews, version dates, and clear deprecation when superseded.

### ✅ Searchable
Consistent naming, clear headers, comprehensive index.

---

## 🔗 External Resources

### Tools
- **Stryker (JS/TS/C#):** https://stryker-mutator.io
- **PIT (Java):** https://pitest.org
- **mutmut (Python):** https://mutmut.readthedocs.io
- **oclif (CLI Framework):** https://oclif.io

### Community
- **Repository:** https://github.com/software-skeleton-CLI/skel-cli
- **Issues:** https://github.com/software-skeleton-CLI/skel-cli/issues
- **Discussions:** https://github.com/software-skeleton-CLI/skel-cli/discussions

---

## ✨ Document Organization Highlights

### What Changed (November 20, 2025)
✅ **Consolidated** 5+ architecture docs → 1 comprehensive `PROJECT_ARCHITECTURE.md`  
✅ **Removed** 20+ redundant historical reports  
✅ **Removed** 3 duplicate status files  
✅ **Clarified** mutation testing docs → clear index with purpose statements  
✅ **Created** this master index for easy navigation  
✅ **Reduced** from 31 files → 10 essential files (68% reduction)  

### Result
- 🎯 **Minimal:** Only essential, actionable docs
- 📦 **Organized:** Clear purpose for each file
- 🚀 **Actionable:** Easy to find what you need
- 🔍 **Maintained:** No historical clutter

---

## 💡 Tips for Using This Documentation

### Finding Information
1. **Start with this index** - Ctrl+F to search
2. **Check the table of contents** in each document
3. **Follow cross-references** for related topics
4. **Use the "I want to..." table** for common tasks

### Contributing to Docs
1. Follow the quality standards above
2. Update this index when adding new documents
3. Keep dates and versions current
4. Add cross-references to related docs
5. Ensure no duplication across files

### Feedback
If documentation is unclear, outdated, or missing:
1. Open an issue on GitHub
2. Tag it with `documentation`
3. Suggest improvements

---

## 📊 Final Minimal Structure

```
rules/
├── README.md                              ⭐ START HERE
│
├── QUICK_START.md                         Get running in 5 minutes
│
├── PROJECT_ARCHITECTURE.md                Complete system design
├── security.md                            5-layer security model
│
└── Mutation Testing (6 files)
    ├── MUTATION_TESTING_INDEX.md          Navigation hub
    ├── MUTATION_TESTING_UNIVERSAL_GUIDE.md All languages guide
    ├── MUTATION_TESTING_PLAYBOOK.md       TypeScript deep dive
    ├── MUTATION_QUICK_REF.md              Quick reference
    ├── MUTATION_VISUAL_SUMMARY.md         Visual learning
    └── MUTATION_SCORE_80_ACHIEVED.md      Case study
```

**Total:** 10 essential files | **Zero** redundancy | **100%** actionable

---

**Maintained by:** Software Skeleton CLI Team  
**Last Major Cleanup:** November 20, 2025  
**Documentation Version:** 2.0 Minimal  
**Status:** ✅ Minimal & Production Ready

