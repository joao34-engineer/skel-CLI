# Software Skeleton CLI - Complete Setup Documentation

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Project Structure](#project-structure)
4. [Dependencies](#dependencies)
5. [Configuration Files](#configuration-files)
6. [Core Files](#core-files)
7. [Development Workflow](#development-workflow)
8. [Key Concepts](#key-concepts)
9. [Troubleshooting](#troubleshooting)
10. [Next Steps](#next-steps)

---

## 📖 Project Overview

**Software Skeleton** is a CLI tool designed to solve "AI Delirium" (hallucinations and architecture drift) in code generation.

### Core Philosophy
- ❌ **NOT**: AI generates code from scratch (Probabilistic Generation)
- ✅ **YES**: AI assembles pre-verified components (Deterministic Assembly)

### Analogy
We don't ask AI to manufacture bricks; we ask it to act as the mason who places pre-made bricks according to a blueprint.

---

## 🏗️ Architecture

### Three-Layer System

#### 1. Skeleton Vault (Source of Truth)
- Repository of robust, pre-verified code components
- Components are **ReadOnly** by AI
- Each component has defined Inputs/Outputs
- Examples: JWT auth module, scalable folder structures

#### 2. Orchestrator (The Builder)
- CLI tool built in Node.js/TypeScript
- Manages file system and enforces constraints
- Reads `skeleton.config.json` for project architecture
- Prevents mixing incompatible stacks

#### 3. AI Layer (The Gluer)
- Used ONLY for wiring components
- Connects Component A to Component B
- **Cannot** rewrite internal logic of components
- Example: "Import AuthRouter and mount it to ExpressApp"

---

## 📁 Project Structure

```
software-skeleton-CLI/
├── bin/
│   └── skel.js                    # Executable entry point (#!/usr/bin/env node)
├── src/
│   ├── commands/                  # Command implementations
│   │   ├── init.ts               # (Future) skel init command
│   │   ├── add.ts                # (Future) skel add command
│   │   └── fuse.ts               # (Future) skel fuse command
│   ├── core/                      # Core logic modules
│   │   ├── file-system.ts        # (Future) File operations
│   │   └── ai-orchestrator.ts    # (Future) AI integration
│   ├── types/                     # TypeScript interfaces
│   ├── templates/                 # Local boilerplate JSONs
│   └── index.ts                   # Main Commander program setup
├── dist/                          # Compiled JavaScript output (generated)
├── node_modules/                  # Dependencies (generated)
├── package.json                   # Project configuration
├── tsconfig.json                  # TypeScript configuration
├── PROJECT_MANIFESTO.md           # Project philosophy and rules
└── SETUP_GUIDE.md                 # This file
```

---

## 📦 Dependencies

### Production Dependencies
```json
{
  "commander": "^11.1.0",      // CLI framework and argument parsing
  "inquirer": "^8.2.6",        // Interactive command-line prompts
  "chalk": "^4.1.2",           // Terminal string styling
  "fs-extra": "^11.2.0",       // Enhanced file system operations
  "ora": "^5.4.1"              // Elegant terminal spinners
}
```

### Development Dependencies
```json
{
  "typescript": "^5.9.3",           // TypeScript compiler
  "@types/node": "^20.11.5",        // Node.js type definitions
  "@types/inquirer": "^8.2.10",     // Inquirer type definitions
  "@types/fs-extra": "^11.0.4",     // fs-extra type definitions
  "ts-node": "^10.9.2",             // Execute TypeScript directly
  "nodemon": "^3.0.3"               // Auto-restart on file changes
}
```

### Installation Command
```bash
npm install commander inquirer@8.2.6 chalk@4.1.2 fs-extra ora@5.4.1
npm install -D typescript @types/node @types/inquirer @types/fs-extra ts-node nodemon
```

---

## ⚙️ Configuration Files

### tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2022",                          // Modern JavaScript features
    "module": "commonjs",                        // Node.js module system
    "outDir": "./dist",                          // Compiled output directory
    "rootDir": "./src",                          // Source files directory
    "moduleResolution": "node",                  // Node.js module resolution
    "resolveJsonModule": true,                   // Import JSON files
    "declaration": true,                         // Generate .d.ts files
    "sourceMap": true,                           // Generate source maps for debugging
    "esModuleInterop": true,                     // Better ES module compatibility
    "forceConsistentCasingInFileNames": true,    // Enforce case sensitivity
    "strict": true,                              // Enable all strict type checks
    "skipLibCheck": true                         // Skip type checking of declaration files
  },
  "include": ["src/**/*"],                       // Files to compile
  "exclude": ["node_modules", "dist"]            // Files to ignore
}
```

### package.json (Key Sections)
```json
{
  "name": "software-skeleton-cli",
  "version": "0.0.1",
  "description": "A CLI tool to assemble code using pre-verified skeleton components",
  "main": "dist/index.js",
  "bin": {
    "skel": "./bin/skel.js"                      // Global command name
  },
  "scripts": {
    "build": "tsc",                              // Compile TypeScript
    "dev": "ts-node src/index.ts"                // Run without compiling
  }
}
```

---

## 📝 Core Files

### bin/skel.js (Executable Entry Point)
```javascript
#!/usr/bin/env node
require('../dist/index.js');
```

**Purpose**: 
- Shebang (`#!/usr/bin/env node`) makes it executable
- Loads compiled JavaScript from `dist/`
- Entry point for global `skel` command

### src/index.ts (Main Program)
```typescript
import { Command } from 'commander'

const program = new Command()

program
  .name('skel')
  .description('Software Skeleton CLI - Assemble code using pre-verified components')
  .version('1.0.0')

program.parse(process.argv)

console.log('Software Skeleton CLI v1.0.0');
```

**Purpose**:
- Sets up Commander.js CLI framework
- Defines CLI metadata (name, description, version)
- Parses command-line arguments

---

## 🔄 Development Workflow

### Initial Setup
```bash
# 1. Create directory structure
mkdir -p bin src/commands src/core src/types src/templates

# 2. Install dependencies
npm install

# 3. Build the project
npm run build

# 4. Link globally (makes 'skel' command available everywhere)
npm link

# 5. Make executable (if needed)
chmod +x bin/skel.js
```

### Daily Development Cycle

#### Option 1: Build & Test (Production-like)
```bash
# 1. Edit files in src/
# 2. Compile TypeScript to JavaScript
npm run build

# 3. Test the CLI
skel
skel --help
skel --version
```

#### Option 2: Quick Development (No Build)
```bash
# Run TypeScript directly without compiling
npm run dev
```

### Testing Commands
```bash
# Test basic execution
skel

# View help information
skel --help

# Check version
skel --version
skel -V
```

---

## 💡 Key Concepts

### Why dist/ instead of src/ in bin/skel.js?

**The Compilation Flow:**
```
src/index.ts (TypeScript) 
    ↓ [npm run build]
dist/index.js (JavaScript)
    ↓ [require()]
bin/skel.js (Executable)
```

- **src/**: TypeScript source files (`.ts`) - Human writes here
- **dist/**: Compiled JavaScript files (`.js`) - Machine executes this
- **Node.js**: Can only execute JavaScript, not TypeScript
- **ts-node**: Special tool that compiles TypeScript on-the-fly (dev only)

### Commander.js Configuration Explained

```typescript
program
  .name('skel')           // Command name shown in help text
  .description('...')     // Brief explanation of the tool
  .version('1.0.0')       // Enables --version and -V flags
```

**What it does:**
- `.name()`: Sets the command name in usage instructions
- `.description()`: Appears in help output
- `.version()`: Auto-creates `--version` flag

### The Three Core Commands (Planned)

#### 1. skel init <project-name>
```bash
skel init my-app
```
- Creates rigid directory structure
- Based on selected stack (Node/Express/TypeScript)
- **AI Role**: None (purely deterministic file copying)
- **Purpose**: Ensure structural integrity

#### 2. skel add <component>
```bash
skel add auth
```
- Retrieves verified component from Vault
- Places in enforced directory (e.g., `/src/modules/auth`)
- Includes snippet + dependencies
- **AI Role**: None (ensures security and verification)
- **Purpose**: Add pre-verified functionality

#### 3. skel fuse
```bash
skel fuse
```
- The "magic" step
- Detects unwired components
- **AI Role**: Connects components with strict prompts
- **Constraint**: "Write import statements and initialization code. Do not change anything else."
- **Validation**: Runs linter/compiler check immediately
- **Purpose**: Wire components together safely

---

## 🛠️ Troubleshooting

### Problem: Changes not reflecting after editing src/

**Solution:**
```bash
npm run build
```
**Reason**: You edited TypeScript source, but the executable runs compiled JavaScript.

---

### Problem: "Cannot find module '../dist/index.js'"

**Solution:**
```bash
npm run build
```
**Reason**: The `dist/` folder doesn't exist yet. Build creates it.

---

### Problem: Want to test without building every time

**Solution:**
```bash
npm run dev
```
**Reason**: `ts-node` compiles TypeScript in-memory without creating `dist/`.

---

### Problem: Global command not working after changes

**Solution:**
```bash
npm run build
# No need to npm link again
```
**Reason**: The link points to `bin/skel.js`, which loads `dist/index.js`. Just rebuild.

---

### Problem: Permission denied when running bin/skel.js

**Solution:**
```bash
chmod +x bin/skel.js
```
**Reason**: The file needs executable permissions.

---

## 🚀 Next Steps

### Phase 1: Command Implementation
- [ ] Implement `src/commands/init.ts`
  - Create project scaffolding
  - Generate `skeleton.config.json`
  - Set up directory structure based on stack
  
- [ ] Implement `src/commands/add.ts`
  - Connect to Skeleton Vault
  - Retrieve component metadata
  - Copy component to correct location
  - Update dependencies

- [ ] Implement `src/commands/fuse.ts`
  - Detect unwired components
  - Generate strict AI prompts
  - Execute AI wiring
  - Validate with linter/compiler

### Phase 2: Core Modules
- [ ] Create `src/core/file-system.ts`
  - Safe file operations
  - Directory structure enforcement
  - Template copying

- [ ] Create `src/core/ai-orchestrator.ts`
  - AI prompt generation
  - Response validation
  - Anti-hallucination constraints

### Phase 3: Type System
- [ ] Define interfaces in `src/types/`
  - Component metadata structure
  - Config file schema
  - AI prompt/response types

### Phase 4: Skeleton Vault
- [ ] Build component repository
  - JWT authentication module
  - Database connection templates
  - API route structures
  - Testing frameworks

### Phase 5: Configuration
- [ ] Design `skeleton.config.json` schema
  - Stack definition
  - Component registry
  - Wiring rules

---

## 📚 Development Principles (From Manifesto)

### Technical Constraints
1. **Strict Typing**: All CLI code must be strict TypeScript
2. **Modular Design**: Keep AI logic separate from File System logic
3. **Anti-Hallucination**: Prompts must include:
   - "Do not explain"
   - "Return only code"
   - Strict constraints on what can be modified

### AI Usage Rules
- ✅ AI can: Connect components, write import statements, wire modules
- ❌ AI cannot: Rewrite component internals, change architecture, generate from scratch

### Component Rules
- Components are **ReadOnly** by AI
- Each component has defined Inputs/Outputs
- Components are pre-verified and secure
- No mixing of incompatible stacks

---

## 📖 Quick Reference

### Common Commands
```bash
npm run build          # Compile TypeScript
npm run dev            # Run without compiling
npm link               # Link globally
skel                   # Run CLI
skel --help            # Show help
skel --version         # Show version
```

### File Locations
- Source code: `src/`
- Compiled output: `dist/`
- Executable: `bin/skel.js`
- Config: `tsconfig.json`, `package.json`

### Key Files to Reference
- `PROJECT_MANIFESTO.md` - Project philosophy
- `SETUP_GUIDE.md` - This documentation
- `src/index.ts` - Main entry point
- `package.json` - Dependencies and scripts

---

**Last Updated**: Initial Setup Phase  
**Version**: 1.0.0  
**Status**: Foundation Complete, Ready for Command Implementation
