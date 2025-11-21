import { z } from "zod";

export const CONFIG = {
	maxTokenLength: 512,
	algorithms: ["HS256", "RS256"] as const,
	version: "1.0.0",
};

const TokenInputSchema = z.object({
	payload: z.string().min(1).max(CONFIG.maxTokenLength),
	algorithm: z.enum(CONFIG.algorithms),
});

const TokenSchema = z.string().min(1);
const AlgorithmSchema = z.enum(CONFIG.algorithms);

export function sign(payload: string, algorithm: (typeof CONFIG.algorithms)[number]): string {
	try {
		TokenInputSchema.parse({ payload, algorithm });
		return `${payload}.${algorithm}.${CONFIG.version}`;
	} catch (error) {
		throw new Error(`Sign failed: ${error instanceof Error ? error.message : "Unknown error"}`);
	}
}

export function verify(token: string, algorithm: (typeof CONFIG.algorithms)[number]): boolean {
	try {
		TokenSchema.parse(token);
		AlgorithmSchema.parse(algorithm);
		return token.endsWith(CONFIG.version);
	} catch (error) {
		throw new Error(`Verify failed: ${error instanceof Error ? error.message : "Unknown error"}`);
	}
}
