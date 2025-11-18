## 🚀 Next Steps
 your a senior type script developer. You have just finished reading the PROJECT_MANIFESTO.md file for the Skeleton CLI project. Now, outline the next steps to take in order to start implementing the project. Break down the tasks into manageable phases, and include specific files or modules that need to be created or modified. Also, list any important considerations or principles from the manifesto that should be kept in mind during development.

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
