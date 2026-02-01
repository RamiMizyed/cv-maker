"use client";

import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useCV } from "../CVContext";
import { CVData } from "@/types/cv";

function downloadJson(filename: string, data: unknown) {
	const blob = new Blob([JSON.stringify(data, null, 2)], {
		type: "application/json;charset=utf-8",
	});
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = filename.endsWith(".json") ? filename : `${filename}.json`;
	document.body.appendChild(a);
	a.click();
	a.remove();
	URL.revokeObjectURL(url);
}

// Accepts either:
// 1) Your app's CVData shape (personalInfo/experience/education/projects/skills/selectedFont)
// 2) The earlier "resume-json" format we made (meta.format === "resume-json") and converts it
function normalizeImport(parsed: any, fallbackFont: string): CVData | null {
	// --- Case A: Direct CVData import ---
	const looksLikeCVData =
		parsed &&
		typeof parsed === "object" &&
		parsed.personalInfo &&
		typeof parsed.personalInfo.name === "string" &&
		Array.isArray(parsed.experience) &&
		Array.isArray(parsed.education) &&
		Array.isArray(parsed.projects) &&
		typeof parsed.skills === "string" &&
		typeof parsed.selectedFont === "string";

	if (looksLikeCVData) {
		const safe: CVData = {
			...parsed,
			personalInfo: {
				...parsed.personalInfo,
				github: parsed.personalInfo.github || "",
				website: parsed.personalInfo.website || "",
			},
			experience: parsed.experience.map((e: any, idx: number) => ({
				id: typeof e.id === "number" ? e.id : idx + 1,
				company: e.company || "",
				companyUrl: e.companyUrl || "", // ✅ supports your new field
				position: e.position || "",
				startDate: e.startDate || "",
				endDate: e.endDate || "",
				description: e.description || "",
			})),
			education: parsed.education.map((e: any, idx: number) => ({
				id: typeof e.id === "number" ? e.id : idx + 1,
				institution: e.institution || "",
				degree: e.degree || "",
				startDate: e.startDate || "",
				endDate: e.endDate || "",
			})),
			projects: parsed.projects.map((p: any, idx: number) => ({
				id: typeof p.id === "number" ? p.id : idx + 1,
				name: p.name || "",
				description: p.description || "",
				link: p.link || "",
				technologies: p.technologies || "",
			})),
			skills: parsed.skills || "",
			selectedFont: parsed.selectedFont || fallbackFont,
		};

		return safe;
	}

	// --- Case B: Our earlier "resume-json" format import (convert → CVData) ---
	const isResumeJson =
		parsed &&
		typeof parsed === "object" &&
		parsed.meta &&
		parsed.meta.format === "resume-json";

	if (isResumeJson) {
		const basics = parsed.basics || {};
		const personalInfo = {
			name: basics.name || "",
			title: basics.headline || "",
			email: basics.email || "",
			phone: basics.phone || "",
			website: basics.website || "",
			github:
				(basics.profiles || []).find(
					(p: any) => p?.network?.toLowerCase() === "github",
				)?.url ||
				basics.github ||
				"",
			summary: parsed.summary || "",
			portrait: "/assets/Cat_01.png",
		};

		const experience = (parsed.experience || []).map((x: any, idx: number) => ({
			id: idx + 1,
			company: x.company || "",
			companyUrl: x.companyUrl || "",
			position: x.position || "",
			startDate: x.startDate || "",
			endDate: x.endDate || "",
			description: Array.isArray(x.highlights)
				? x.highlights.join("\n")
				: x.description || "",
		}));

		const education = (parsed.education || []).map((x: any, idx: number) => ({
			id: idx + 1,
			institution: x.institution || "",
			degree: [x.studyType, x.area].filter(Boolean).join(" - ") || "",
			startDate: x.startDate || "",
			endDate: x.endDate || "",
		}));

		const projects = (parsed.projects || []).map((x: any, idx: number) => ({
			id: idx + 1,
			name: x.name || "",
			description: Array.isArray(x.highlights)
				? x.highlights.join("\n")
				: x.description || "",
			link: x.url || "",
			technologies: Array.isArray(x.tech)
				? x.tech.join(", ")
				: x.technologies || "",
		}));

		const skills = Array.isArray(parsed.skills)
			? parsed.skills
					.flatMap((s: any) => (Array.isArray(s.items) ? s.items : []))
					.join(", ")
			: "";

		const cv: CVData = {
			personalInfo,
			experience,
			education,
			projects,
			skills,
			selectedFont: fallbackFont,
		};

		return cv;
	}

	return null;
}

export default function JsonIO() {
	const { state, dispatch } = useCV();
	const fileRef = useRef<HTMLInputElement | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [ok, setOk] = useState<string | null>(null);

	const onExport = () => {
		setError(null);
		setOk(null);
		const safeName = (state.personalInfo?.name || "CV")
			.trim()
			.replace(/\s+/g, "_")
			.replace(/[^\w\-]+/g, "");

		downloadJson(`${safeName}_cv.json`, state);
		setOk("Exported JSON.");
	};

	const onPickImport = () => {
		setError(null);
		setOk(null);
		fileRef.current?.click();
	};

	const onImportFile = async (file: File) => {
		setError(null);
		setOk(null);

		try {
			const text = await file.text();
			const parsed = JSON.parse(text);

			const normalized = normalizeImport(parsed, state.selectedFont);
			if (!normalized) {
				setError("This JSON file is not a supported CV format.");
				return;
			}

			dispatch({ type: "SET_ALL", payload: normalized });
			setOk("Imported JSON successfully.");
		} catch {
			setError("Invalid JSON file (could not parse).");
		} finally {
			if (fileRef.current) fileRef.current.value = "";
		}
	};

	return (
		<div className="space-y-2">
			<div className="flex flex-col gap-2">
				<Button variant="outline" className="w-full" onClick={onExport}>
					Export JSON
				</Button>
				<Button variant="outline" className="w-full" onClick={onPickImport}>
					Import JSON
				</Button>
			</div>

			<input
				ref={fileRef}
				type="file"
				accept="application/json"
				className="hidden"
				onChange={(e) => {
					const f = e.target.files?.[0];
					if (f) onImportFile(f);
				}}
			/>

			{error ? <p className="text-sm text-red-600">{error}</p> : null}
			{ok ? <p className="text-sm text-green-600">{ok}</p> : null}
		</div>
	);
}
