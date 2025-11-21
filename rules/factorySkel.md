SkelFactory: The Automation Engine Specification

Component: scripts/factory.ts
Goal: An autonomous node script that manufactures Primitives.

1. The Architecture

The Factory is a loop that processes a "Build Queue" to produce verified software components.

The 4-Stage Pipeline

SCAFFOLD (The Setup):

Reads factory.queue.json.

Creates directory primitives/{category}/{name}/{version}/.

Generates package.json (with Biome, Vitest, Stryker config).

Generates primitive.json (Manifest).

GENERATE (The AI Agent):

Input: Description from queue.

Action: Generates src/index.ts (Logic) and src/index.test.ts (Tests).

Constraint: Must use Zod, no frameworks, strict types.

VERIFY (The Gauntlet):

Executes npm install.

Executes npm run lint (Biome).

Executes npm test (Vitest + Fast-Check).

Executes npx stryker run (Mutation Test).

Rule: If any step fails, the primitive is rejected.

PUBLISH (The Vault):

If Verify passes: Zip the folder.

Move zip to dist/vault/.

Update factory.queue.json status to "Completed".

2. The Queue Schema (factory.queue.json)

[
{
"id": "security.tokenizer",
"version": "1.0.0",
"description": "JWT Signing/Verification using 'jose'. Supports HS256/RS256.",
"status": "pending"
},
{
"id": "utils.uuid",
"version": "1.0.0",
"description": "UUID v7 generator. Zero dependencies.",
"status": "pending"
}
]


3. Technical Stack (The Driver)

Language: TypeScript (Node.js execution).

Libraries:

fs-extra: File ops.

execa: Running shell commands (npm, stryker).

archiver: Creating zips.

chalk: Terminal UI.

openai (Future): For the Generation step.

# Context
We are building "Software Skeleton," a CLI that uses "Primitives" (verified micro-components).
We have manually created the first primitive (`SkelHasher`) and verified our quality standards.
Now, we need to automate this process.

# The Mission
Build the **SkelFactory Engine** (`scripts/factory.ts`).
This script will automate the creation, testing, and packaging of new primitives.

# Requirements

## 1. Create the Configuration
Create a file `factory.queue.json` in the root with the following pending jobs:
```json
[
  {
    "id": "security.tokenizer",
    "version": "1.0.0",
    "description": "JWT Signing/Verification using 'jose'. Zod validation for all inputs.",
    "status": "pending"
  }
]

## 2. Implement `scripts/factory.ts`
Create a TypeScript script (to be run via `ts-node`) that implements the following **Pipeline**:

### Class: `FactoryRunner`
* **loadQueue()**: Read `factory.queue.json`.
* **processItem(item)**:
    1.  **Scaffold**: Create folder `primitives/security/tokenizer/v1.0.0/`. Write a `package.json` that includes `vitest`, `biome`, `stryker`, and `fast-check`.
    2.  **Mock Generation**: (For now) Write a *dummy* `index.ts` and `index.test.ts` file to that folder just to prove the file creation works.
    3.  **The Gauntlet**: Using `execa`, run:
        * `npm install` (inside the primitive folder)
        * `npm test` (Run the dummy test)
    4.  **Publish**: If successful, use `archiver` to zip the folder to `dist/vault/security.tokenizer.v1.0.0.zip`.

## 3. Technical Constraints
* Use `fs-extra` for file operations.
* Use `execa` for running shell commands.
* Use `chalk` for colorful progress logs (e.g., "⚙️ Scaffolding...", "⚔️ Running Gauntlet...").
* Ensure the script handles errors gracefully (try/catch around the Gauntlet).

## 4. Goal
I want to run `npx ts-node scripts/factory.ts` and see it create the folder, install dependencies, run a test, and create a zip file.

***

**What this does:**
This builds the **Assembly Line**. Once this script works (creating a dummy file and zipping it), we simply swap the "Mock Generation" step with an OpenAI API call, and you will have a fully autonomous software factory.