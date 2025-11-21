1. Static Analysis (The "Spellcheck")

   Standard: Strict TypeScript + Biome (Successor to ESLint/Prettier).

   Why: noImplicitAny prevents type guessing. Biome is 30x faster than ESLint.

   Check: npm run lint must pass with 0 warnings.

2. Runtime Integrity (The "Bouncer")

   Standard: Zod.

   Why: TypeScript types disappear at runtime. Zod ensures that if a user passes { age: "ten" } instead of { age: 10 }, the component throws a clean, descriptive error instead of crashing cryptically.

   Check: All public methods must validate inputs via Zod schemas.

3. Logic Verification (The "Happy Path")

   Standard: Vitest (Native ESM, faster than Jest).

   Why: We need to prove the code does what it says.

   Check: 100% functional coverage of intended features.

4. Chaos Engineering (The "Stress Test")

   Standard: Fast-Check (Property-Based Testing).

   Why: Developers test distinct values (test("hello")). Chaos tools test properties. They inject 10,000 variations (Emoji strings, 50MB buffers, SQL injection patterns, null bytes) to ensure the logic holds true for any string.

   Check: fc.assert(fc.property(...)) passes 100 runs.

5. Mutation Testing (The "Test of Tests")

   Standard: Stryker Mutator.

   Why: It modifies your source code (changes + to -, true to false) and runs your tests. If your tests still pass, your tests are bad.

   Check: Mutation Score > 90%. (This means your tests caught 90% of the sabotage attempts).