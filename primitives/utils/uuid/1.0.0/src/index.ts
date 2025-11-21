import { z } from "zod";

export const UUID_V7_REGEX =
	/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export const CONFIG = { version: "1.0.0" };

const UUIDInputSchema = z.string().min(1).regex(UUID_V7_REGEX, "Invalid UUID v7 format");

function toHex(n: number, length: number): string {
	return n.toString(16).padStart(length, "0");
}

function pseudoRandomHex(length: number): string {
	let out = "";
	while (out.length < length) out += Math.random().toString(16).slice(2);
	return out.slice(0, length);
}

export function generateV7(): string {
	const time = toHex(Date.now(), 12).slice(-12);
	const rand = pseudoRandomHex(34);
	const part1 = time.slice(0, 8);
	const part2 = time.slice(8, 12);
	const part3 = `7${rand.slice(0, 3)}`; // version 7
	const variantNibble = (parseInt(rand.slice(3, 4), 16) & 0x3) | 0x8; // variant bits 10xx
	const part4 = `${variantNibble.toString(16)}${rand.slice(4, 7)}`;
	const part5 = rand.slice(7, 19);
	return `${part1}-${part2}-${part3}-${part4}-${part5}`;
}

export function validateFormat(uuid: string): boolean {
	try {
		UUIDInputSchema.parse(uuid);
		return true;
	} catch {
		return false;
	}
}
