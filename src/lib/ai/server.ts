// Server-only helpers shared by the /api/ai/* routes.
import "server-only";
import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";
import { CVData } from "@/types/cv";
import { normalizeCV } from "@/lib/cv/migrate";

export const MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

let client: OpenAI | null = null;
export const getClient = () => {
	if (!process.env.OPENAI_API_KEY) return null;
	client ??= new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
	return client;
};

export const LANG_NAMES = { en: "English", tr: "Turkish", ar: "Arabic" } as const;
export type Lang = keyof typeof LANG_NAMES;
export const asLang = (v: unknown): Lang =>
	v === "tr" || v === "ar" ? v : "en";

export const jsonError = (error: string, status: number) =>
	NextResponse.json({ error }, { status });

// ---------------- rate limiting ----------------
// In-memory sliding window per IP. On serverless each instance keeps its own
// window, so this is a speed bump rather than a hard cap. For a hard cap put
// Upstash/Vercel KV or Vercel WAF rate limiting in front of /api/ai.

const WINDOW_MS = 10 * 60 * 1000;
const PER_IP = Number(process.env.AI_RATE_LIMIT_PER_10_MIN || 15);
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
	const now = Date.now();
	const recent = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
	if (recent.length >= PER_IP) {
		hits.set(ip, recent);
		return true;
	}
	recent.push(now);
	hits.set(ip, recent);
	// Keep the map from growing without bound on long-lived instances.
	if (hits.size > 5000) {
		for (const [k, v] of hits) if (!v.some((t) => now - t < WINDOW_MS)) hits.delete(k);
	}
	return false;
}

const clientIp = (req: NextRequest) =>
	req.headers.get("x-real-ip") ||
	req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
	"unknown";

/**
 * Common checks for every AI route. Returns an error response to send back,
 * or null when the request may proceed.
 */
export function guard(req: NextRequest, maxBytes: number): NextResponse | null {
	if (!getClient()) {
		return jsonError("ai_unavailable", 503);
	}

	// Only accept calls made from this site's own pages.
	const origin = req.headers.get("origin");
	const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
	if (!origin || !host || new URL(origin).host !== host) {
		return jsonError("Forbidden", 403);
	}

	const length = Number(req.headers.get("content-length") || 0);
	if (!length || length > maxBytes) {
		return jsonError("Request too large.", 413);
	}

	if (rateLimited(clientIp(req))) {
		return jsonError("rate_limited", 429);
	}
	return null;
}

/** The CV as the model sees it: no photo, no layout settings, capped text. */
export function cvForPrompt(input: unknown): Omit<CVData, "settings" | "version"> | null {
	const cv = normalizeCV(input);
	if (!cv) return null;
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const { settings, version, ...rest } = cv;
	return { ...rest, personalInfo: { ...rest.personalInfo, portrait: "" } };
}

export const clip = (s: unknown, max: number) =>
	typeof s === "string" ? s.slice(0, max) : "";

/** Chat completion constrained to a JSON schema; returns the parsed object. */
export async function completeJSON<T>({
	system,
	user,
	schemaName,
	schema,
	maxTokens,
	temperature = 0.4,
}: {
	system: string;
	user: string;
	schemaName: string;
	schema: Record<string, unknown>;
	maxTokens: number;
	temperature?: number;
}): Promise<T> {
	const res = await getClient()!.chat.completions.create({
		model: MODEL,
		temperature,
		max_completion_tokens: maxTokens,
		response_format: {
			type: "json_schema",
			json_schema: { name: schemaName, strict: true, schema },
		},
		messages: [
			{ role: "system", content: system },
			{ role: "user", content: user },
		],
	});
	const raw = res.choices[0]?.message?.content;
	if (!raw) throw new Error("Empty model response");
	return JSON.parse(raw) as T;
}

export function handleAIError(err: unknown) {
	console.error("[ai]", err);
	const { status, code } = (err as { status?: number; code?: string }) || {};
	// Out of credits or billing problem: not something a visitor can wait out.
	if (code === "insufficient_quota" || code === "credit_balance_exhausted") {
		return jsonError("ai_unavailable", 503);
	}
	if (status === 429) return jsonError("rate_limited", 429);
	return jsonError("The AI request failed.", 502);
}

// Schema helpers: strict mode needs every property listed and no extras.
export const str = { type: "string" } as const;
export const strArr = { type: "array", items: str } as const;
export const obj = (properties: Record<string, unknown>) => ({
	type: "object",
	properties,
	required: Object.keys(properties),
	additionalProperties: false,
});
