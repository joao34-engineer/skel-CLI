# Software Skeleton CLI - Architecture & Vision Guide

**Version:** 2.0 (Post-Strategic Pivot)  
**Last Updated:** November 20, 2025  
**Status:** Production Ready

---

## 1. Project Identity

**Name:** Software Skeleton (skel)  
**Package:** `@software-skeleton/skel-cli`  
**Mission:** Solve "AI Delirium" by replacing probabilistic code generation with **Deterministic Assembly**

### Core Mechanism
We do **not** generate logic from scratch. We retrieve verified, high-assurance "**Primitives**" from a vault and use an AI Agent to wire them into the user's project.

---

## 2. The Strategic Pivot: From Skeletons to Primitives

### Old Model (DEPRECATED)
- **Skeletons** were monolithic folders (e.g., `express-base`)
- Framework-coupled code
- Brittle, framework-locked templates

### New Model (ACTIVE)
- **Primitives** are atomic, framework-agnostic logic units
- Pure TypeScript components (e.g., `SkelHasher`)
- Work in ANY framework (Express, NestJS, Fastify, Serverless)

**Benefit:** Primitives are "Lego Bricks" that work everywhere. The AI Agent acts as an **Adapter Generator** during installation.

---

## 3. The 3 Laws of a Primitive

Every primitive MUST follow these strict rules:

### Law 1: Framework Agnosticism
```typescript
// ❌ FORBIDDEN
import express from 'express';
import { Injectable } from '@nestjs/common';
import mongoose from 'mongoose';

// ✅ ALLOWED
import { z } from 'zod';
import * as argon2 from 'argon2';
import { SignJWT } from 'jose';
```

**Rule:** Accept standard inputs (string, number, object), return standard outputs. Never know it's inside an HTTP request.

### Law 2: Atomic Responsibility
- ❌ **Bad:** `AuthManager` (handles DB, hash, and tokens)
- ✅ **Good:** `SkelHasher` (hashes strings), `SkelTokenizer` (signs JWTs)

**Rule:** One component = One responsibility

### Law 3: High Assurance (The Gauntlet)
Every primitive must pass:
1. **Static Analysis** - Biome lint (0 warnings)
2. **Runtime Integrity** - Zod validation on all inputs
3. **Unit Tests** - Vitest (100% functional coverage)
4. **Chaos Testing** - fast-check property tests
5. **Mutation Testing** - Stryker (80%+ score)

---

## 4. Directory Structure

```
skel-cli/
├── primitives/                    # The Vault (Source of Truth)
│   ├── security/
│   │   ├── hasher/
│   │   │   └── v1.0.0/
│   │   │       ├── index.ts       # Pure Logic
│   │   │       ├── index.test.ts  # Gauntlet Tests
│   │   │       ├── primitive.json # Metadata Manifest
│   │   │       └── README.md      # Documentation
│   │   └── tokenizer/
│   │       └── v1.0.0/
│   └── utils/
│       └── id-generator/
│           └── v1.0.0/
├── src/                           # CLI Source Code
│   ├── commands/
│   │   ├── init.ts
│   │   ├── info.ts
│   │   └── primitive/
│   │       ├── add.ts
│   │       └── list.ts
│   ├── core/
│   │   ├── errors.ts
│   │   ├── file-system.ts
│   │   └── validation.ts
│   └── types/
└── scripts/
    └── factory.ts                 # SkelFactory automation
```

**Note:** The `skeletons/` folder is **DEPRECATED**

---

## 5. Primitive Manifest Schema

Every primitive requires a `primitive.json` file:

```json
{
  "id": "security.hasher",
  "version": "1.0.0",
  "description": "Argon2 hashing with memory hardening",
  "tags": ["security", "auth", "owasp"],
  "interface": {
    "inputs": [
      {
        "name": "plaintext",
        "type": "string",
        "description": "The plaintext to hash"
      }
    ],
    "outputs": {
      "type": "Promise<string>",
      "description": "The hashed result"
    }
  },
  "dependencies": {
    "argon2": "^0.44.0",
    "zod": "^4.1.12"
  },
  "gauntlet": {
    "mutationScoreRequired": 80,
    "testFramework": "vitest",
    "propertyTests": true
  }
}
```

---

## 6. The Dual Vault Architecture

### A. Physical Vault (AWS S3 - Future)
- **Role:** Stores immutable, verified artifacts
- **Format:** Zipped files (`s3://skel-vault/primitives/security/hasher/v1.0.0.zip`)
- **Guarantee:** Bit-perfect verified code

### B. Intellectual Vault (Vector Database - Future)
- **Role:** Stores semantic understanding of components
- **Mechanism:** Embeds `primitive.json` manifests
- **Usage:** The "Fuse" Agent queries to find the right component
  - Example: "Find me a tax validator"

---

## 7. The "Fuse" Strategy (Adapter Pattern)

### Old Job: Copy/Paste
```bash
# Just copied files blindly
skel add express-base
```

### New Job: Generate Adapters
```typescript
// User runs in NestJS project
skel primitive add security.hasher

// AI Agent generates:
import { Injectable } from '@nestjs/common';
import { SkelHasher } from '@software-skeleton/hasher';

@Injectable()
export class HashService {
  async hashPassword(password: string): Promise<string> {
    return SkelHasher.hash(password);
  }
}
```

**The primitive code is never modified** - we wrap it with framework-specific adapters.

---

## 8. The SkelFactory (Autonomous Generation)

### Goal
An autonomous loop that generates verified primitives.

### Input: Factory Queue
```json
[
  {
    "id": "security.tokenizer",
    "description": "JWT Signing/Verification using jose library"
  },
  {
    "id": "utils.uuid",
    "description": "UUID generator (v4 and v7). Zero dependencies"
  }
]
```

### Pipeline
For each queue item:

1. **SCAFFOLD** - Generate folder structure, `primitive.json`, `package.json`
2. **GENERATE** - Use LLM to write `index.ts` and `index.test.ts`
3. **THE GAUNTLET** (Verification):
   - Run `npm install`
   - Run `npm run lint` (Biome)
   - Run `npm test` (Vitest + fast-check)
   - Run `npx stryker run` (Mutation testing)
4. **RETRY LOOP** (if failure):
   - Feed error back to LLM: "You failed mutation testing on line 40. Fix it."
   - Max retries: 3
5. **PUBLISH** (if success):
   - Zip file → S3 / Vector DB
   - Mark as "Complete" in queue

### Multi-Language Support (Planned)
The Factory will support multiple languages by selecting the appropriate driver:

| Language | Build Tool | Test Framework | Mutation Tool |
|----------|-----------|----------------|---------------|
| TypeScript | npm | Vitest | Stryker |
| C# | dotnet | xUnit | Stryker.NET |
| Python | pip | pytest | mutmut |
| Java | Maven | JUnit | PIT |

---

## 9. The 5-Layer Security Model

### Layer 1: Static Analysis (The "Spellcheck")
- **Tool:** Biome (30x faster than ESLint)
- **Standard:** Strict TypeScript + `noImplicitAny`
- **Check:** `npm run lint` must pass with 0 warnings

### Layer 2: Runtime Integrity (The "Bouncer")
- **Tool:** Zod
- **Why:** TypeScript types disappear at runtime
- **Check:** All public methods validate inputs via Zod schemas

### Layer 3: Logic Verification (The "Happy Path")
- **Tool:** Vitest
- **Standard:** Native ESM, faster than Jest
- **Check:** 100% functional coverage

### Layer 4: Chaos Engineering (The "Stress Test")
- **Tool:** fast-check (Property-Based Testing)
- **Why:** Test properties, not just distinct values
- **Check:** `fc.assert()` passes 100 runs with random inputs

### Layer 5: Mutation Testing (The "Test of Tests")
- **Tool:** Stryker Mutator
- **Why:** Modifies source code, verifies tests catch changes
- **Check:** Mutation score > 80%

---

## 10. CLI Commands

### Current Commands (v2.0)

| Command | Description | Status |
|---------|-------------|--------|
| `skel init` | Initialize new project | ✅ Active |
| `skel info` | Show project metadata | ✅ Active |
| `skel primitive add` | Install a primitive | ✅ Active |
| `skel primitive list` | List available primitives | ✅ Active |
| `skel add` | Legacy skeleton installer | ⚠️ Deprecated |
| `skel fuse` | Legacy skeleton fusion | ⚠️ Deprecated |

### Usage Examples
```bash
# Initialize new project
skel init --name my-awesome-project

# List available primitives
skel primitive list

# Add a primitive
skel primitive add security.hasher

# Show project info
skel info
```

---

## 11. Technical Stack

### CLI Framework
- **Framework:** oclif (TypeScript)
- **Migration:** Commander.js → oclif ✅ Complete
- **Global Install:** `npm link` ready

### Development Tools
- **TypeScript:** v5.x
- **Node:** v24.8.0
- **Package Manager:** npm v10.2.3

### Quality Tools
- **Linting:** Biome v2.3.6
- **Testing:** Vitest v4.0.10
- **Property Testing:** fast-check v4.3.0
- **Mutation:** Stryker v9.3.0
- **Validation:** Zod v4.1.12

---

## 12. Current Status (November 2025)

### ✅ Completed
- [x] CLI engine migrated to oclif
- [x] Primitive architecture implemented
- [x] First primitive created (SkelHasher)
- [x] Mutation testing achieving 80%+ scores
- [x] Documentation system established
- [x] Quality standards defined (The 3 Laws)

### 🚧 In Progress
- [ ] SkelFactory automation script
- [ ] Vector database integration
- [ ] AWS S3 vault setup
- [ ] Second primitive (SkelTokenizer)

### 📋 Planned
- [ ] Multi-language support (C#, Python, Java)
- [ ] Community curation system
- [ ] CI/CD pipeline for primitives
- [ ] Public primitive registry

---

## 13. Next Steps

### Immediate (This Week)
1. Create second primitive: `security.tokenizer`
   - Use `jose` library (NOT `jsonwebtoken`)
   - Support HS256 and RS256
   - Pass The Gauntlet

2. Implement SkelFactory prototype
   - Create `scripts/factory.ts`
   - Implement queue processing
   - Test with mock LLM calls

### Short-term (This Month)
1. Build out primitive library (5-10 core components)
2. Implement vector database search
3. Add primitive versioning system
4. Create adapter templates for popular frameworks

### Long-term (This Quarter)
1. Launch public primitive registry
2. Implement multi-language support
3. Build community curation pipeline
4. Integrate with major IDEs

---

## 14. Design Principles

### AI-Assisted Curation (Not Community PRs)
1. **Seed:** Human architect defines strict interface
2. **Bot:** AI generates implementation (Pure TS)
3. **Gauntlet:** Automated rig runs comprehensive tests
4. **Publish:** Only if it survives, signed and pushed

### Immutable Versioning
- Primitives are never modified after publish
- New versions create new folders (`v1.0.0`, `v1.0.1`, `v2.0.0`)
- Breaking changes = major version bump

### Zero Framework Lock-in
- Primitives work with ANY framework
- CLI generates framework-specific adapters
- User owns the code, not tied to our ecosystem

---

## 15. Success Metrics

### Quality Gates
- **Mutation Score:** 80%+ minimum
- **Code Coverage:** 100% functional paths
- **Lint Score:** 0 warnings
- **Property Tests:** Pass 100 runs
- **Build Time:** < 30 seconds

### Business Metrics
- **Time to Install:** < 2 minutes per primitive
- **Adaptation Success:** 95%+ of frameworks supported
- **Bug Rate:** < 0.1% in production
- **Developer Satisfaction:** 4.5+ stars

---

## 16. Related Documentation

- **Quick Start:** `QUICK_START.md` - Get started in 5 minutes
- **Mutation Testing:** `MUTATION_TESTING_INDEX.md` - Testing strategy guide
- **Project Status:** `PROJECT_IDENTITY_VERIFIED.md` - Current verification
- **Security Standards:** `security.md` - 5-layer security model
- **Technical Summary:** `TECHNICAL_SUMMARY.md` - Implementation checklist

---

## 17. Contact & Contribution

**Project Lead:** Joao Marcelo  
**Repository:** https://github.com/software-skeleton-CLI/skel-cli  
**License:** MIT  

### How to Contribute
1. Review The 3 Laws
2. Propose primitive via issue
3. AI generates + Gauntlet validates
4. Curator review + publish

**We do not accept direct code PRs** - all primitives go through The Factory.

---

**Last Updated:** November 20, 2025  
**Version:** 2.0.0  
**Status:** Production Ready - Primitives Active

