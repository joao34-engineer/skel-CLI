import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { CONFIG, sign, verify } from "./index";

describe("SkelTokenizer", () => {
	it("sign adds algorithm and version", () => {
		const token = sign("payload", "HS256");
		expect(token).toContain(".HS256.");
		expect(token.endsWith(CONFIG.version)).toBe(true);
	});
	it("verify returns true for valid token", () => {
		const token = sign("data", "RS256");
		expect(verify(token, "RS256")).toBe(true);
	});
	it("verify returns false for invalid token", () => {
		expect(verify("invalid.token.0.0.0", "HS256")).toBe(false);
	});
	it("sign throws on empty payload", () => {
		expect(() => sign("", "HS256")).toThrow(/Sign failed/);
	});
	it("verify throws on empty token", () => {
		expect(() => verify("", "HS256")).toThrow(/Verify failed/);
	});
	it("verify error message contains details", () => {
		try {
			verify("", "HS256");
			expect.fail("Should have thrown");
		} catch (error) {
			expect(error).toBeInstanceOf(Error);
			expect((error as Error).message).toContain("Verify failed");
		}
	});
	it("[PROPERTY] signed tokens end with version", () => {
		fc.assert(
			fc.property(
				fc.string({ minLength: 1, maxLength: 100 }),
				fc.constantFrom(...CONFIG.algorithms),
				(payload, alg) => {
					const t = sign(payload, alg);
					expect(t.endsWith(CONFIG.version)).toBe(true);
				},
			),
			{ numRuns: 3 },
		);
	}, 120000);
});
