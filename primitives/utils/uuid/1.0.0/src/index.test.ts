import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { generateV7, UUID_V7_REGEX, validateFormat } from "./index";

describe("SkelUUID", () => {
	it("generates valid pattern", () => {
		const id = generateV7();
		expect(UUID_V7_REGEX.test(id)).toBe(true);
	});
	it("validateFormat returns true for generated id", () => {
		const id = generateV7();
		expect(validateFormat(id)).toBe(true);
	});
	it("validateFormat returns false for invalid", () => {
		expect(validateFormat("not-a-uuid")).toBe(false);
	});
	it("[PROPERTY] many generated ids match regex", () => {
		fc.assert(
			fc.property(fc.integer({ min: 1, max: 3 }), () => {
				const id = generateV7();
				expect(UUID_V7_REGEX.test(id)).toBe(true);
			}),
			{ numRuns: 3 },
		);
	}, 120000);
});
