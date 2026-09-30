// components/cv-maker/editor/SkillsInput.tsx
"use client";

import React, { useState } from "react";
import { X } from "lucide-react";
import { useCV } from "../CVContext";
import { useT } from "./fields";

export const mergeSkills = (current: string[], incoming: string[]) => {
	const seen = new Set(current.map((s) => s.toLowerCase()));
	const out = [...current];
	for (const raw of incoming) {
		const s = raw.trim();
		if (s && !seen.has(s.toLowerCase())) {
			seen.add(s.toLowerCase());
			out.push(s);
		}
	}
	return out;
};

export default function SkillsInput() {
	const { state, dispatch } = useCV();
	const t = useT();
	const [draft, setDraft] = useState("");
	const [dragIndex, setDragIndex] = useState<number | null>(null);

	const set = (skills: string[]) => dispatch({ type: "SET_SKILLS", skills });

	const commit = (text: string) => {
		const parts = text.split(/[,;\n]/);
		const next = mergeSkills(state.skills, parts);
		if (next.length !== state.skills.length) set(next);
		setDraft("");
	};

	const drop = (to: number) => {
		if (dragIndex === null || dragIndex === to) return;
		const next = state.skills.slice();
		const [s] = next.splice(dragIndex, 1);
		next.splice(to, 0, s);
		set(next);
		setDragIndex(null);
	};

	return (
		<div className="space-y-2">
			<div className="flex min-h-11 flex-wrap items-center gap-1.5 rounded-md border bg-transparent p-1.5 shadow-xs focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50 dark:bg-input/30">
				{state.skills.map((skill, i) => (
					<span
						key={skill}
						draggable
						onDragStart={() => setDragIndex(i)}
						onDragOver={(e) => e.preventDefault()}
						onDrop={() => drop(i)}
						className="inline-flex cursor-grab items-center gap-1 rounded-full bg-primary/10 py-1 pe-1 ps-2.5 text-xs font-medium text-primary active:cursor-grabbing">
						{skill}
						<button
							type="button"
							aria-label={`${t.remove} ${skill}`}
							onClick={() => set(state.skills.filter((_, j) => j !== i))}
							className="rounded-full p-0.5 hover:bg-primary/20">
							<X className="size-3" />
						</button>
					</span>
				))}
				<input
					value={draft}
					dir="auto"
					placeholder={state.skills.length ? "" : t.skillsPlaceholder}
					onChange={(e) => {
						const v = e.target.value;
						if (/[,;\n]/.test(v)) commit(v);
						else setDraft(v);
					}}
					onKeyDown={(e) => {
						if (e.key === "Enter") {
							e.preventDefault();
							commit(draft);
						} else if (e.key === "Backspace" && !draft && state.skills.length) {
							set(state.skills.slice(0, -1));
						}
					}}
					onBlur={() => draft.trim() && commit(draft)}
					className="min-w-32 flex-1 bg-transparent px-1.5 py-1 text-sm outline-none placeholder:text-muted-foreground"
				/>
			</div>
			<p className="text-[11px] text-muted-foreground">{t.skillsHint}</p>
		</div>
	);
}
