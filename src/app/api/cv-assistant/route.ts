import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import type { CVData } from "@/types/cv";

export const runtime = "nodejs"; // just to be explicit

const apiKey = process.env.OPENAI_API_KEY;

const openai = apiKey ? new OpenAI({ apiKey }) : null;

type AISuggestions = {
	improvedSummary: string;
	suggestedSkills: string[];
	experienceBullets: Record<string, string[]>;
};

export async function POST(req: NextRequest) {
	try {
		if (!apiKey || !openai) {
			return NextResponse.json(
				{
					error:
						"OPENAI_API_KEY is not set on the server. Check your .env.local.",
				},
				{ status: 500 },
			);
		}

		const body = (await req.json()) as {
			jobDescription: string;
			cvData: CVData;
			lang: "en" | "ar" | "tr";
		};

		const { jobDescription, cvData, lang } = body;

		if (!jobDescription || !jobDescription.trim()) {
			return NextResponse.json(
				{ error: "jobDescription is required" },
				{ status: 400 },
			);
		}

		const completion = await openai.chat.completions.create({
			// use a very standard model name
			model: "gpt-4o-mini",
			response_format: { type: "json_object" },
			temperature: 0.4,
			messages: [
				{
					role: "system",
					content:
						"You are an expert CV writer. You help tailor an existing CV to a specific job description. You MUST reply with valid JSON only.",
				},
				{
					role: "user",
					content: [
						`Job description:\n${jobDescription}`,
						`Current CV data (as JSON):\n${JSON.stringify(cvData)}`,
						`The CV UI language code is "${lang}". Write all text in this language.`,
						"",
						"Return JSON ONLY with this exact shape:",
						"{",
						'  "improvedSummary": string,',
						'  "suggestedSkills": string[],',
						'  "experienceBullets": {',
						'     "<experienceId>": string[]',
						"  }",
						"}",
						"",
						"- experienceId must match the numeric `experience.id` values from the CV data.",
						"- For each experience, suggest 3–6 strong, achievement-focused bullet points aligned with the job.",
						"- Do NOT include comments, explanations, markdown or extra keys.",
					].join("\n"),
				},
			],
		});

		const raw = completion.choices[0]?.message?.content ?? "";

		let parsed: AISuggestions;
		try {
			parsed = JSON.parse(raw) as AISuggestions;
		} catch (e) {
			console.error("Failed to parse model JSON:", raw);
			return NextResponse.json(
				{
					error: "Model returned invalid JSON",
					raw,
				},
				{ status: 500 },
			);
		}

		return NextResponse.json(parsed);
	} catch (error: any) {
		console.error("cv-assistant error >>>", error);
		return NextResponse.json(
			{
				error: error?.message || "Unexpected error generating suggestions",
			},
			{ status: 500 },
		);
	}
}
