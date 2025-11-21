export default {
	testRunner: "vitest",
	checkers: ["typescript"],
	mutate: ["src/index.ts"],
	tsconfigFile: "tsconfig.json",
	plugins: ["@stryker-mutator/vitest-runner", "@stryker-mutator/typescript-checker"],
	reporters: ["html", "clear-text"],
	timeoutMS: 180000,
	timeoutFactor: 1.5,
	ignoreStatic: true,
	thresholds: { high: 85, low: 70, break: 70 },
};
