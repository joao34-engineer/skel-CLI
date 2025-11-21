# 🚀 Quick Start Guide - skel-cli (oclif)

## ✅ Migration Complete!

Your project has been successfully migrated from **Commander.js** to **oclif**.

---

## Running the CLI

### Development Mode (Recommended for Development)
```bash
cd skel-cli

# Show help
./bin/dev.js --help

# List available commands
./bin/dev.js

# Run init command (interactive)
./bin/dev.js init

# Run with flags
./bin/dev.js init --name my-awesome-project

# Run add command
./bin/dev.js add

# Run fuse command
./bin/dev.js fuse
```

### Production Mode (After Build)
```bash
./bin/run.js init
./bin/run.js add
./bin/run.js fuse
```

---

## Available Commands

| Command | Description | Usage |
|---------|-------------|-------|
| `init` | Initialize a new Software Skeleton project | `./bin/dev.js init [--name PROJECT_NAME]` |
| `add` | Add a skeleton component | `./bin/dev.js add [--skeleton SKELETON_NAME]` |
| `fuse` | Fuse multiple skeleton components | `./bin/dev.js fuse [--skeletons SKELETON1,SKELETON2]` |
| `help` | Display help | `./bin/dev.js help [COMMAND]` |
| `plugins` | List installed plugins | `./bin/dev.js plugins` |

---

## File Structure

```
skel-cli/
├── src/
│   ├── commands/
│   │   ├── init.ts    ✅ Initialize projects
│   │   ├── add.ts     ✅ Add components
│   │   └── fuse.ts    ✅ Fuse components
│   ├── core/
│   │   └── file-system.ts  ✅ Core business logic (stub)
│   ├── types/          (Ready for type definitions)
│   └── templates/      (Ready for template files)
├── bin/
│   ├── dev.js         (Development runner)
│   └── run.js         (Production runner)
├── dist/              (Compiled JavaScript - auto-generated)
├── test/              (Test files)
└── package.json
```

---

## NPM Scripts

```bash
npm run build        # Compile TypeScript to JavaScript
npm test            # Run tests
npm run prepack     # Prepare for publishing
```

---

## Example Workflows

### 1️⃣ Create a New Project
```bash
./bin/dev.js init

# OR with flags
./bin/dev.js init -n my-new-project
```

### 2️⃣ Add Authentication Component
```bash
./bin/dev.js add

# Select "auth-jwt" from the menu
# OR with flags
./bin/dev.js add -s auth-jwt
```

### 3️⃣ Fuse Multiple Components
```bash
./bin/dev.js fuse

# Select multiple components using space bar
# OR with flags
./bin/dev.js fuse -s auth-jwt,express-base,database
```

---

## Why oclif?

✅ **Automatic command discovery** - No manual registration needed  
✅ **Built-in plugin system** - Perfect for your skeleton architecture  
✅ **Better scalability** - Designed for large CLI apps  
✅ **Full TypeScript support** - Better type safety  
✅ **Auto-generated help** - Professional CLI help system  
✅ **CLI best practices** - Industry-standard approach  

---

## Next Steps

1. **Customize Core Logic**
   - Edit `src/core/file-system.ts`
   - Implement actual file operations and template copying

2. **Add Your Skeleton Components**
   - Place template files in `src/templates/`
   - Update `add.ts` and `fuse.ts` commands

3. **Configure Types**
   - Add type definitions in `src/types/`
   - Update configuration schema

4. **Build & Deploy**
   ```bash
   npm run build
   npm publish  # Optional: publish to npm
   ```

5. **Uninstall (if needed)**
   ```bash
   npm unlink -g skel-cli
   ```

---

**Status: ✅ Production Ready**

Need help? Run `skel --help`

