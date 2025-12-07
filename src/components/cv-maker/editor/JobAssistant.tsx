// components/cv-maker/editor/JobAssistant.tsx
"use client";

import React, { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useCV } from "../CVContext";
import { useLang } from "@/lib/lang";

type AISuggestions = {
	improvedSummary: string;
	suggestedSkills: string[];
	experienceBullets: Record<string, string[]>;
};

export default function JobAssistant() {
	const { state, dispatch } = useCV();
	const { lang } = useLang();

	const [jobDescription, setJobDescription] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [suggestions, setSuggestions] = useState<AISuggestions | null>(null);

	const handleGenerate = async () => {
		if (!jobDescription.trim()) return;

		setLoading(true);
		setError(null);

		try {
			const res = await fetch("/api/cv-assistant", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					jobDescription,
					cvData: state,
					lang,
				}),
			});

			if (!res.ok) {
				const body = await res.json().catch(() => ({}));
				throw new Error(body.error || "Failed to generate suggestions");
			}

			const data = (await res.json()) as AISuggestions;
			setSuggestions(data);
		} catch (err: any) {
			console.error(err);
			setError(err.message || "Unexpected error generating suggestions");
		} finally {
			setLoading(false);
		}
	};

	// 🔹 Apply summary into personalInfo.summary via reducer
	const applySummary = () => {
		if (!suggestions) return;

		dispatch({
			type: "UPDATE_PERSONAL_INFO",
			payload: {
				field: "summary",
				value: suggestions.improvedSummary,
			},
		});
	};

	// 🔹 Apply skills array as comma-separated string
	const applySkills = () => {
		if (!suggestions) return;

		// 1) current skills from state (comma-separated string → array)
		const currentSkills = state.skills
			.split(",")
			.map((s) => s.trim())
			.filter(Boolean);

		// 2) normalize for case-insensitive dedupe
		const existingLower = new Set(currentSkills.map((s) => s.toLowerCase()));

		// 3) start with existing list
		const mergedSkills = [...currentSkills];

		// 4) add only *new* AI skills
		suggestions.suggestedSkills.forEach((skill) => {
			const trimmed = skill.trim();
			if (!trimmed) return;

			const lower = trimmed.toLowerCase();
			if (!existingLower.has(lower)) {
				mergedSkills.push(trimmed);
				existingLower.add(lower);
			}
		});

		// 5) write back to CV state
		dispatch({
			type: "UPDATE_SKILLS",
			payload: mergedSkills.join(", "),
		});
	};

	// 🔹 Apply bullets into each experience.description (by id)
	const applyExperienceBullets = () => {
		if (!suggestions) return;

		state.experience.forEach((exp) => {
			const bullets = suggestions.experienceBullets[String(exp.id)];
			if (!bullets || bullets.length === 0) return;

			dispatch({
				type: "UPDATE_EXPERIENCE",
				payload: {
					id: exp.id,
					field: "description",
					value: bullets.join("\n"),
				},
			});
		});
	};

	return (
		<div className="space-y-6 mb-3">
			<div className="space-y-2">
				<h2 className="text-lg font-semibold">AI Job Match Assistant</h2>
				<p className="text-xs text-muted-foreground">
					Paste the job description and let the AI tailor your summary, skills
					and experience bullets.
				</p>
			</div>

			<Textarea
				rows={8}
				value={jobDescription}
				onChange={(e) => setJobDescription(e.target.value)}
				placeholder="Paste the job description here..."
				className="resize-none"
			/>

			<Button
				onClick={handleGenerate}
				disabled={loading || !jobDescription.trim()}
				className="w-full">
				{loading ? "Thinking…" : "Generate tailored suggestions"}
			</Button>

			{error && (
				<p className="text-xs text-red-500 whitespace-pre-wrap">{error}</p>
			)}

			{suggestions && (
				<Card className="p-4 space-y-6 border border-slate-200">
					{/* SUMMARY */}
					<section className="space-y-2">
						<div className="flex items-center justify-between gap-2">
							<h3 className="text-sm font-semibold">Summary</h3>
							<Button variant="outline" onClick={applySummary}>
								Apply to CV
							</Button>
						</div>
						<p className="text-xs leading-relaxed whitespace-pre-wrap">
							{suggestions.improvedSummary}
						</p>
					</section>

					{/* SKILLS */}
					<section className="space-y-2">
						<div className="flex items-center justify-between gap-2">
							<h3 className="text-sm font-semibold">Skills</h3>
							<Button variant="outline" onClick={applySkills}>
								Apply to CV
							</Button>
						</div>
						<div className="flex flex-wrap gap-2">
							{suggestions.suggestedSkills.map((skill) => (
								<span
									key={skill}
									className="border text-[11px] font-medium px-2 py-2 rounded-full">
									{skill}
								</span>
							))}
						</div>
					</section>

					{/* EXPERIENCE BULLETS */}
					<section className="space-y-3">
						<div className="flex items-center justify-between gap-2">
							<h3 className="text-sm font-semibold">Experience bullets</h3>
							<Button variant="outline" onClick={applyExperienceBullets}>
								Apply all to CV
							</Button>
						</div>

						<div className="space-y-4 text-xs">
							{state.experience.map((exp) => {
								const bullets =
									suggestions.experienceBullets[String(exp.id)] || [];
								if (!bullets.length) return null;

								return (
									<div key={exp.id} className="border-t pt-3">
										<p className="font-semibold mb-1">
											{exp.position} @ {exp.company}
										</p>
										<ul className="list-disc list-inside space-y-1">
											{bullets.map((b, i) => (
												<li key={i} className="whitespace-pre-wrap">
													{b}
												</li>
											))}
										</ul>
									</div>
								);
							})}
						</div>
					</section>
				</Card>
			)}
		</div>
	);
}
