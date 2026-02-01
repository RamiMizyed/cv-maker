"use client";

import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useCV } from "../CVContext";
import { CVData } from "@/types/cv";

function isCVData(x: any): x is CVData {
	// Very lightweight validation (keeps UX smooth).
	// You can make this stricter if you want.
	return (
		x &&
		typeof x === "object" &&
		x.personalInfo &&
		typeof x.personalInfo.name === "string" &&
		Array.isArray(x.experience) &&
		Array.isArray(x.education) &&
		Array.isArray(x.projects) &&
		typeof x.skills === "string" &&
		typeof x.selectedFont === "string"
	);
}

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

export default function JsonIO() {
	const { state, dispatch } = useCV();
	const fileRef = useRef<HTMLInputElement | null>(null);
	const [error, setError] = useState<string | null>(null);

	const onExport = () => {
		setError(null);
		const safeName = (state.personalInfo?.name || "CV")
			.trim()
			.replace(/\s+/g, "_")
			.replace(/[^\w\-]+/g, "");
		downloadJson(`${safeName}_cv`, state);
	};

	const onPickFile = () => {
		setError(null);
		fileRef.current?.click();
	};

	const onImportFile = async (file: File) => {
		setError(null);
		try {
			const text = await file.text();
			const parsed = JSON.parse(text);

			if (!isCVData(parsed)) {
				setError("This JSON doesn't match the expected CV format.");
				return;
			}

			// Optional: normalize missing fields so your UI doesn't crash
			const normalized: CVData = {
				...parsed,
				personalInfo: {
					...parsed.personalInfo,
					github: parsed.personalInfo.github || "",
				},
				experience: parsed.experience.map((e: any, idx: number) => ({
					id: typeof e.id === "number" ? e.id : idx + 1,
					company: e.company || "",
					position: e.position || "",
					startDate: e.startDate || "",
					endDate: e.endDate || "",
					description: e.description || "",
					// If you added companyUrl, keep it:
					...(e.companyUrl ? { companyUrl: e.companyUrl } : {}),
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
				selectedFont: parsed.selectedFont || state.selectedFont,
			};

			dispatch({ type: "SET_ALL", payload: normalized });
		} catch (e: any) {
			setError(
				"Invalid JSON file. Please export from this app or check the format.",
			);
		} finally {
			// Reset input so selecting the same file again triggers onChange
			if (fileRef.current) fileRef.current.value = "";
		}
	};

	return (
		<div className="flex flex-col gap-2">
			<div className="flex gap-2">
				<Button variant="outline" onClick={onExport} className="w-full">
					Export JSON
				</Button>
				<Button variant="outline" onClick={onPickFile} className="w-full">
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
		</div>
	);
}
