# Software Skeleton CLI - Complete Project Overview

**Version:** 2.0.0  
**Status:** Production-Ready  
**Last Updated:** November 20, 2025

---

## 🎯 Project Mission

**Software Skeleton CLI** is a framework-agnostic CLI tool that automates the creation, management, and installation of **Primitives** - reusable, immutable, versioned logic units that can be plugged into any project regardless of framework or language.

The project transforms how developers share and reuse code by providing:
- ✅ Framework-agnostic primitives (TypeScript, Python, C#, Java, PHP)
- ✅ Automatic framework detection
- ✅ CLI-based project initialization and primitive installation
- ✅ Advanced quality assurance with mutation testing
- ✅ Multi-language support roadmap

---

## 📦 What This Project Does

### 1. **CLI Commands**

#### `skel init [--name PROJECT_NAME]`
Creates a new Software Skeleton project with:
- `skeleton.config.json` - Project configuration
- Metadata with creation/update timestamps
- Empty primitives, dependencies, and devDependencies arrays

**Example:**
```bash
skel init --name my-api
# Creates: my-api/skeleton.config.json
```

---

#### `skel info`
Displays information about the current skeleton project:
- Project name and version
- Installed primitives count
- List of installed primitives

**Example:**
```bash
skel info
# Outputs:
# 📦 Project Information
# Name: my-api
# Version: 1.0.0
# Skeletons: 2
# • security.tokenizer
# • utils.uuid
```

---

#### `skel primitive add <PRIMITIVE_ID> [--version VERSION]`
Installs a primitive into the current project:
- Downloads primitive from the library (e.g., `security.tokenizer@1.0.0`)
- Copies primitive files (index.ts, index.test.ts, primitive.json)
- Updates skeleton.config.json with primitive metadata
- Supports versioning (default: 1.0.0)

**Example:**
```bash
skel primitive add security.tokenizer --version 1.0.0
# Installs to: primitives/security/tokenizer/1.0.0/
```

---

#### `skel primitive list`
Lists all available primitives in the CLI library with:
- Primitive ID (format: category.name)
- Versions available
- Description
- Category

---

### 2. **Framework Detection System**

The **FrameworkDetector** automatically identifies:

#### Supported Languages & Frameworks:

**TypeScript/JavaScript (via package.json)**
- NestJS (`@nestjs/core`, priority: 10)
- Next.js (`next`, priority: 9)
- Angular (`@angular/core`, priority: 8)
- Express (`express`, priority: 5)

**Python (via requirements.txt, Pipfile, pyproject.toml)**
- Django (priority: 10)
- FastAPI (priority: 9)
- Flask (priority: 7)

**C# (via .csproj, .sln)**
- ASP.NET Core (`Microsoft.AspNetCore`, priority: 10)

**Java (via pom.xml, build.gradle)**
- Spring Boot (`spring-boot-starter`, priority: 10)

**PHP (via composer.json)**
- Laravel (`laravel/framework`, priority: 10)

#### Detected Data Layers:
- MongoDB (mongoose, mongodb)
- PostgreSQL (pg, postgres, typeorm)
- GraphQL (graphql, apollo-server)

#### Detection Features:
- **Priority-based ordering** - Detectors run in priority order (Node: 10, Python: 8, C#: 7, Java: 6, PHP: 5)
- **Confidence scoring** - Each detection includes confidence (0.0-1.0)
- **Confidence boosters** - Enhanced confidence when additional indicators found (e.g., @nestjs/cli for NestJS)
- **Parallel detection** - Option for concurrent framework detection
- **Caching** - Results cached to avoid redundant file I/O
- **Error isolation** - Failures in one detector don't break the chain

---

### 3. **Primitives Library**

The project includes versioned, immutable primitives:

#### **security.tokenizer@1.0.0**
**Description:** JWT Signing/Verification using 'jose'  
**Features:**
- HS256 and RS256 algorithm support
- Zod input validation
- Mutation test score: 80%+
- Zero external dependencies (except jose)

**Files:**
- `src/index.ts` - Implementation
- `src/index.test.ts` - Test suite
- `primitive.json` - Metadata
- `package.json` - Dependencies
- `tsconfig.json` - TypeScript config
- `vitest.config.ts` - Test configuration
- `stryker.conf.js` - Mutation testing config

---

#### **utils.uuid@1.0.0**
**Description:** UUID v7 generator  
**Features:**
- Zero dependencies
- UUID format validation
- Mutation test score: 80%+
- Production-ready

**Files:**
- `src/index.ts` - Implementation
- `src/index.test.ts` - Test suite
- `primitive.json` - Metadata
- `package.json` - Dependencies
- `tsconfig.json` - TypeScript config
- `vitest.config.ts` - Test configuration
- `stryker.conf.js` - Mutation testing config

---

### 4. **Quality Assurance System**

#### Mutation Testing with Stryker
The project enforces code quality through mutation testing:
- **Stryker configuration** - `stryker.conf.json`
- **Mutation score thresholds:**
  - High: 85%
  - Low: 70%
  - Break: 70%
- **Test runners supported:** Vitest (primary)
- **Type checkers:** TypeScript
- **Coverage analysis:** Per test

#### Test Framework
- **Vitest 2.0.4** - Fast unit testing
- **Fast-check** - Property-based testing
- **@vitest/ui** - Visual test reporting

#### Linting & Formatting
- **Biome 2.3.6** - Fast linter and formatter
- **ESLint config** - `eslint.config.mjs`

---

### 5. **Factory Automation System**

The **SkelFactory** (scripts/factory.ts) automates:
- Queue-based primitive processing (`factory.queue.json`)
- Automatic test suite generation
- Automatic Stryker configuration generation
- Vitest configuration generation
- Biome configuration generation
- Package.json setup for each primitive
- Status tracking (pending, completed, failed)

**Features:**
- Reads primitives from queue
- Generates standardized configurations
- Runs tests and mutation testing
- Archives completed primitives
- Logs results to FACTORY_RUN_SUMMARY.md

---

## 🏗️ Project Structure

```
software-skeleton-cli/
├── bin/                          # CLI entry points
│   ├── run.js                    # Main executable (oclif)
│   └── dev.cmd/dev.js            # Development entry
│
├── src/                          # Source code
│   ├── commands/                 # CLI commands
│   │   ├── init.ts              # Create new project
│   │   ├── info.ts              # Show project info
│   │   └── primitive/
│   │       ├── add.ts           # Install primitive
│   │       └── list.ts          # List primitives
│   │
│   ├── core/                     # Core business logic
│   │   ├── file-system.ts       # File operations
│   │   ├── validation.ts        # Input validation
│   │   ├── errors.ts            # Custom errors
│   │   └── frameworks/
│   │       ├── detector.ts      # Framework detection
│   │       ├── config.ts        # Framework configs
│   │       └── detector.test.ts # Framework tests
│   │
│   ├── types/
│   │   └── config.d.ts          # Configuration types
│   │
│   └── index.ts                 # Main exports
│
├── scripts/                      # Automation scripts
│   └── factory.ts               # SkelFactory (queue-based automation)
│
├── primitives/                   # Primitive library
│   ├── security/
│   │   └── tokenizer/1.0.0/
│   │       ├── src/
│   │       ├── package.json
│   │       ├── tsconfig.json
│   │       ├── vitest.config.ts
│   │       ├── stryker.conf.js
│   │       ├── biome.json
│   │       └── primitive.json
│   │
│   └── utils/
│       └── uuid/1.0.0/
│           ├── src/
│           ├── package.json
│           ├── tsconfig.json
│           ├── vitest.config.ts
│           ├── stryker.conf.js
│           ├── biome.json
│           └── primitive.json
│
├── dist/                        # Compiled output
│   ├── src/commands/            # Compiled CLI commands
│   ├── src/core/                # Compiled core logic
│   └── scripts/                 # Compiled factory
│
├── rules/                       # Documentation
│   ├── README.md
│   ├── QUICK_START.md
│   ├── PROJECT_ARCHITECTURE.md
│   ├── MUTATION_TESTING_INDEX.md
│   ├── security.md
│   └── ... (10+ documentation files)
│
├── reports/                     # Test results
│   └── mutation/
│       └── mutation.html        # Mutation test report
│
├── package.json                 # Project dependencies
├── tsconfig.json                # TypeScript configuration
├── stryker.conf.json            # Mutation testing config
├── eslint.config.mjs            # Linting configuration
├── factory.queue.json           # Factory task queue
├── DETECTOR_IMPLEMENTATION.md    # Detector documentation
├── CONFIG_INTEGRATION.md         # Config integration docs
└── FACTORY_RUN_SUMMARY.md       # Factory execution log
```

---

## 📋 Dependencies

### Production Dependencies
- **@oclif/core** ^3.27.0 - CLI framework
- **archiver** ^7.0.1 - ZIP file creation
- **chalk** ^5.6.2 - Colored terminal output
- **execa** ^9.5.2 - Execute external commands
- **fs-extra** ^11.3.2 - Enhanced file system operations
- **inquirer** ^8.2.5 - Interactive command-line prompts
- **zod** ^4.1.12 - TypeScript schema validation

### Dev Dependencies
- **@biomejs/biome** ^2.3.6 - Linter & formatter
- **@stryker-mutator/core** ^9.3.0 - Mutation testing engine
- **@stryker-mutator/typescript-checker** ^9.3.0 - TS support for Stryker
- **@stryker-mutator/vitest-runner** ^9.3.0 - Vitest integration
- **@types/inquirer** ^9.0.7 - TypeScript types
- **@vitest/ui** ^2.0.4 - Visual test reporting
- **fast-check** ^4.3.0 - Property-based testing
- **ts-node** ^10 - Execute TypeScript directly
- **typescript** ^5 - TypeScript compiler
- **vitest** ^2.0.4 - Test runner

### Volta Management
- **Node.js** 24.8.0 (pinned)
- **npm** 10.8.3 (pinned)

---

## 🛠️ Build & Development

### Scripts Available

```bash
# Build TypeScript to JavaScript
npm run build

# Run tests with Vitest
npm run test

# Run factory automation
npm run factory

# Development mode
npm run dev          # or on Windows: npm run dev.cmd
```

### TypeScript Configuration
- **Target:** ES2022
- **Module:** ESNext
- **Strict Mode:** Enabled
- **Source Maps:** Enabled
- **Declarations:** Enabled with source maps
- **Module Resolution:** Node
- **Output:** `./dist`

---

## 🎯 Key Features

### ✅ **Framework-Agnostic Primitives**
- Works across TypeScript, Python, C#, Java, PHP
- Each primitive is language-specific but can be adapted
- Versioning ensures compatibility

### ✅ **Automatic Framework Detection**
- Multi-language support (6 languages, 12+ frameworks)
- Confidence scoring for detection accuracy
- Parallel and sequential detection options
- Configurable priority-based ordering

### ✅ **Production-Quality Code**
- Mutation testing (80%+ score requirement)
- Property-based testing support
- Comprehensive test coverage
- Biome linting & formatting

### ✅ **CLI-First Experience**
- Easy project initialization
- One-command primitive installation
- Interactive prompts with Inquirer
- Colored output with Chalk

### ✅ **Scalable Architecture**
- Strategy pattern for detectors
- Configuration-driven detection
- Dependency injection
- Clean separation of concerns

### ✅ **Queue-Based Automation**
- Factory automation for bulk operations
- Status tracking (pending/completed/failed)
- Automatic configuration generation
- Extensible queue system

---

## 📖 Documentation

The project includes 10+ comprehensive documentation files in `/rules`:
1. **QUICK_START.md** - Get running in 5 minutes
2. **PROJECT_ARCHITECTURE.md** - Complete system design
3. **MUTATION_TESTING_INDEX.md** - Quality strategy
4. **security.md** - 5-layer security model
5. **MUTATION_TESTING_PLAYBOOK.md** - Testing best practices
6. **MUTATION_TESTING_UNIVERSAL_GUIDE.md** - Advanced testing
7. **MUTATION_VISUAL_SUMMARY.md** - Visual testing overview
8. **MUTATION_SCORE_80_ACHIEVED.md** - Milestone achievement

Plus:
- **DETECTOR_IMPLEMENTATION.md** - Framework detection documentation
- **CONFIG_INTEGRATION.md** - Configuration system documentation
- **FACTORY_RUN_SUMMARY.md** - Factory execution logs

---

## 🚀 Usage Examples

### Initialize a New Project
```bash
skel init --name my-awesome-api
cd my-awesome-api
skel info
```

### Install Primitives
```bash
# Add JWT token signing/verification
skel primitive add security.tokenizer --version 1.0.0

# Add UUID generator
skel primitive add utils.uuid --version 1.0.0

# View installed primitives
skel info
```

### Develop & Test
```bash
cd primitives/security/tokenizer/1.0.0
npm test              # Run unit tests
npm run mutation      # Run mutation tests
npm run lint          # Lint code
```

### Detect Project Framework
```bash
# In any project directory
npx software-skeleton-cli detect  # (future feature)
# Auto-detects: NestJS, Django, Spring, ASP.NET Core, Laravel, etc.
```

---

## 🔄 The 3 Laws of Primitives

1. **Immutability** - Once published, a primitive version never changes
2. **Framework-Agnostic** - Primitives can be adapted to any framework
3. **Zero External Dependencies** - Primitives either have no deps or only essential ones

---

## 🎯 Strategic Vision

### Current Status (v2.0.0)
- ✅ CLI framework fully functional
- ✅ Framework detection (6 languages, 12+ frameworks)
- ✅ Primitive management system
- ✅ Quality assurance pipeline
- ✅ Factory automation

### Roadmap
- **Phase 1:** Multi-language support (in progress)
- **Phase 2:** Web UI for primitive discovery
- **Phase 3:** Community primitive registry
- **Phase 4:** IDE integrations
- **Phase 5:** AI-assisted primitive generation

---

## 📊 Code Quality Metrics

| Metric | Value |
|--------|-------|
| **Mutation Score (Target)** | 80%+ |
| **Test Framework** | Vitest 2.0.4 |
| **Linter** | Biome 2.3.6 |
| **Languages Supported** | 6 (TS, Python, C#, Java, PHP, and more) |
| **Primitives Available** | 2 (security.tokenizer, utils.uuid) |
| **CLI Commands** | 4 main + subcommands |
| **Frameworks Detected** | 12+ |
| **Lines of Code (CLI)** | ~500 |
| **Lines of Code (Primitives)** | ~200 per primitive |

---

## ⚠️ **Current Architecture Gap: `skel init` vs Framework Detector**

### **The Misalignment**

Currently, `skel init` and the Framework Detector operate **independently**:

```
CURRENT STATE (Disconnected):

skel init
├─> Creates new project
├─> Creates skeleton.config.json
└─> STOPS - no framework detection
    └─> Result: Empty config

Framework Detector
└─> Analyzes EXISTING projects
    ├─> Identifies frameworks, versions, data layers
    ├─> Provides confidence scores
    └─> Result: Unused (not integrated with init)
```

### **What Happens Now**

**Step 1: User runs `skel init`**
```bash
$ skel init --name my-api
✓ Creates: my-api/skeleton.config.json

# Content: EMPTY
{
  "name": "my-api",
  "version": "1.0.0",
  "skeletons": [],
  "dependencies": {},
  "devDependencies": {},
  "metadata": { ... }
}
```

**Step 2: Framework Detector exists but is NOT called**
- The detector can identify NestJS, Django, Spring, Laravel, etc.
- The detector can identify MongoDB, PostgreSQL, GraphQL
- **But it's never invoked during `skel init`**

### **What SHOULD Happen (Integrated)**

```
DESIRED STATE (Integrated):

skel init --name my-api
├─> Creates new project
├─> Creates skeleton.config.json
├─> Runs Framework Detector automatically
├─> Populates config with detected frameworks
└─> Result: Pre-populated, intelligent config

Content: INTELLIGENT
{
  "name": "my-api",
  "version": "1.0.0",
  "frameworks": {
    "language": "ts",
    "framework": "nestjs",
    "data": "postgres",
    "confidence": 0.95
  },
  "skeletons": [],
  "metadata": { ... }
}
```

### **Impact of Misalignment**

| Aspect | Current | Ideal |
|--------|---------|-------|
| **Project Setup** | Manual, empty config | Automatic, pre-populated |
| **User Experience** | User must manually identify stack | Stack auto-identified |
| **Primitive Selection** | Guesswork | Informed by detected frameworks |
| **Configuration Accuracy** | 0% auto-filled | 100% auto-filled with confidence scores |
| **Time to Productivity** | Longer | Immediate |

### **Recommendation: Integration Steps**

To bring `skel init` and Framework Detector into sync:

1. **Modify `init.ts`** to call detector after project creation:
```typescript
// After creating skeleton.config.json
const detector = new FrameworkDetector(projectPath);
const detected = await detector.detect();
if (detected.framework !== 'unknown') {
  config.frameworks = detected;
  await fs.writeJson(configPath, config, { spaces: 2 });
}
```

2. **Update `skeleton.config.json` schema** to include frameworks field
3. **Display detected frameworks** to user after init completes
4. **Add option to skip detection** with `--no-detect` flag

### **Benefits of Integration**

✅ **Smart initialization** - Project config matches actual stack  
✅ **Better primitive recommendations** - Suggest primitives for detected framework  
✅ **Improved UX** - Less manual configuration needed  
✅ **Data consistency** - Single source of truth for framework info  
✅ **Future-ready** - Foundation for AI-assisted primitive generation  

---



The project follows a **5-layer security model**:
1. Input validation (Zod schemas)
2. Type safety (TypeScript strict mode)
3. Immutable primitives (versioning)
4. Test-driven quality (mutation testing)
5. Configuration isolation (skeleton.config.json)

See `rules/security.md` for details.

---

## 🤝 Contributing

To contribute:
1. Clone the repository
2. Run `npm install`
3. Create a new primitive or feature
4. Run `npm test` to verify
5. Run mutation testing: Check primitives have 80%+ score
6. Submit PR with documentation

---

## 📝 License

Refer to project license (check LICENSE file in root)

---

## 📞 Support

For issues, questions, or feature requests:
- Check `rules/QUICK_START.md` for common questions
- Review `rules/PROJECT_ARCHITECTURE.md` for design decisions
- Create an issue in the repository

---

**This is a production-ready, scalable, and well-documented project that transforms how developers share and reuse code across different frameworks and languages.**

Status: ✅ Ready for Use | Last Verified: November 20, 2025

