Project Manifesto: Software Skeleton

1. The Core Mission

"Software Skeleton" is a CLI tool designed to solve the problem of "AI Delirium" (hallucinations and architecture drift) in code generation. Instead of asking AI to generate code from scratch (Probabilistic Generation), we use AI to assemble pre-verified, "Gold Standard" code blocks (Deterministic Assembly).

The Analogy: We are not asking the AI to manufacture the bricks; we are asking it to act as the mason who places the bricks according to a blueprint.

2. The Architecture

The system is composed of three layers:

A. The Skeleton Vault (Source of Truth)

A repository (eventually a Vector Database) containing robust, opinionated code components (e.g., a hardened JWT authentication module, a scalable folder structure).

    Rule: Components are treated as "ReadOnly" by the AI.

    Metadata: Each component has defined Inputs/Outputs.

B. The Orchestrator (The Builder)

A CLI tool built in Node.js/TypeScript. It manages the file system and enforces constraints.

    It reads a skeleton.config.json file to understand the project's architecture.

    It prevents the user (and the AI) from mixing incompatible stacks.

C. The AI Layer (The "Gluer")

The AI is used only for wiring.

    Task: Connect Component A to Component B.

    Constraint: Do not rewrite the internal logic of A or B.

    Example: "Import the AuthRouter from the skeleton file and mount it to the ExpressApp."

3. The CLI Workflow

The user interacts with the system via three primary commands:

skel init <project-name>

    Action: Creates a rigid directory structure based on a selected stack (e.g., Node/Express/TypeScript).

    AI Role: None. This is purely deterministic file copying to ensure structural integrity.

skel add <component>

    Action: Retrieves a verified component (Snippet + Dependencies) from the Vault and places it in the enforced directory (e.g., /src/modules/auth).

    AI Role: None. This ensures the code is secure and verified.

skel fuse

    Action: The "Magic" step. It detects unwired components.

    AI Role: The CLI generates a strict prompt: "I have a host file X and a new module Y. Write the import statements and the initialization code to connect Y into X. Do not change anything else."

    Validation: The CLI runs a linter/compiler check immediately after the AI writes the code to prevent syntax errors.

4. Technical Constraints for the AI Assistant

When assisting with this project, the AI must adhere to the following:

    Strict Typing: All CLI code must be strict TypeScript.

    Modular Design: Keep the AI logic separate from the File System logic.

    Anti-Hallucination: When writing prompts for the internal LLM, always include "Do not explain" and "Return only code" constraints.