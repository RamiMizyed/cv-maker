// components/cv-maker/editor/DesignPanel.tsx
"use client";

import React from "react";
import { Check } from "lucide-react";
import { useCV } from "../CVContext";
import { CVSettings, DocLang, TemplateId } from "@/types/cv";
import { ACCENT_PRESETS } from "@/lib/cv/defaults";
import { FONTS, isArabicFont } from "@/lib/fontList";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Segmented, Switch, useT } from "./fields";

/** Tiny wireframe of each template so the choice is visual, not just a name. */
function Thumb({ id }: { id: TemplateId }) {
	const line = (w: string, extra = "") => (
		<div className={cn("h-[3px] rounded-full bg-current opacity-25", extra)} style={{ width: w }} />
	);
	const accent = "bg-[var(--thumb-accent)]";
	return (
		<div className="flex h-24 w-full overflow-hidden rounded-md border bg-white p-2 text-slate-900">
			{id === "modern" ? (
				<div className="flex w-full gap-1.5">
					<div className={cn("flex w-1/3 flex-col items-center gap-1 rounded-sm p-1", accent)}>
						<div className="size-4 rounded-full bg-white/80" />
						<div className="h-[3px] w-4/5 rounded-full bg-white/60" />
						<div className="h-[3px] w-3/5 rounded-full bg-white/60" />
					</div>
					<div className="flex flex-1 flex-col gap-1">
						<div className={cn("h-1.5 w-3/4 rounded-full", accent)} />
						{line("90%")}
						{line("70%")}
						{line("85%", "mt-1")}
						{line("60%")}
					</div>
				</div>
			) : id === "minimal" ? (
				<div className="flex w-full flex-col gap-1">
					<div className="h-2 w-1/2 rounded-full bg-slate-800/70" />
					{line("35%")}
					{[0, 1, 2].map((i) => (
						<div key={i} className="mt-1 flex gap-1.5">
							<div className="h-[3px] w-1/5 rounded-full bg-slate-400" />
							<div className="flex flex-1 flex-col gap-0.5">
								{line("90%")}
								{line("65%")}
							</div>
						</div>
					))}
				</div>
			) : (
				<div className="flex w-full flex-col items-center gap-1">
					{id === "classic" && <div className={cn("size-3.5 rounded-full", accent)} />}
					<div
						className={cn("h-1.5 w-1/2 rounded-full", id === "ats" ? "bg-slate-900" : "bg-slate-800/80")}
					/>
					{line("40%")}
					<div className={cn("my-0.5 h-px w-full", id === "ats" ? "bg-slate-900" : accent)} />
					<div className="flex w-full flex-col gap-1">
						<div className={cn("h-[3px] w-1/4 rounded-full", id === "ats" ? "bg-slate-900" : accent)} />
						{line("95%")}
						{line("80%")}
						{line("88%")}
					</div>
				</div>
			)}
		</div>
	);
}

export default function DesignPanel() {
	const { state, dispatch } = useCV();
	const t = useT();
	const s = state.settings;
	const set = (patch: Partial<CVSettings>) => dispatch({ type: "UPDATE_SETTINGS", patch });

	const templates: { id: TemplateId; name: string; desc: string }[] = [
		{ id: "classic", name: t.tplClassic, desc: t.tplClassicDesc },
		{ id: "modern", name: t.tplModern, desc: t.tplModernDesc },
		{ id: "minimal", name: t.tplMinimal, desc: t.tplMinimalDesc },
		{ id: "ats", name: t.tplAts, desc: t.tplAtsDesc },
	];

	const setLanguage = (language: DocLang) => {
		// Switching into or out of Arabic also swaps to a font that has the right glyphs.
		const needsArabic = language === "ar";
		const font =
			needsArabic !== isArabicFont(s.font)
				? (needsArabic ? FONTS.arabic : FONTS.latin)[0].value
				: s.font;
		set({ language, font });
	};

	return (
		<div className="space-y-6">
			<section className="space-y-2">
				<h3 className="text-sm font-semibold">{t.template}</h3>
				<div
					role="radiogroup"
					aria-label={t.template}
					className="grid grid-cols-2 gap-3"
					style={{ "--thumb-accent": s.accentColor } as React.CSSProperties}>
					{templates.map((tpl) => {
						const active = s.template === tpl.id;
						return (
							<button
								key={tpl.id}
								type="button"
								role="radio"
								aria-checked={active}
								onClick={() => set({ template: tpl.id })}
								className={cn(
									"relative rounded-lg border p-2 text-start transition-all hover:border-primary/60",
									active && "border-primary ring-2 ring-primary/30",
								)}>
								<Thumb id={tpl.id} />
								<p className="mt-2 text-sm font-medium">{tpl.name}</p>
								<p className="text-[11px] leading-snug text-muted-foreground">{tpl.desc}</p>
								{active && (
									<span className="absolute end-3 top-3 rounded-full bg-primary p-0.5 text-primary-foreground">
										<Check className="size-3" />
									</span>
								)}
							</button>
						);
					})}
				</div>
			</section>

			<section className={cn("space-y-2", s.template === "ats" && "opacity-50")}>
				<h3 className="text-sm font-semibold">{t.accentColor}</h3>
				<div className="flex flex-wrap items-center gap-2">
					{ACCENT_PRESETS.map((c) => (
						<button
							key={c}
							type="button"
							aria-label={c}
							onClick={() => set({ accentColor: c })}
							className={cn(
								"size-8 rounded-full ring-offset-2 ring-offset-background transition-transform hover:scale-110",
								s.accentColor.toLowerCase() === c && "ring-2 ring-foreground",
							)}
							style={{ background: c }}
						/>
					))}
					<label
						className="relative size-8 cursor-pointer overflow-hidden rounded-full border-2 border-dashed"
						title={t.accentColor}>
						<input
							type="color"
							value={s.accentColor}
							onChange={(e) => set({ accentColor: e.target.value })}
							className="absolute inset-0 size-full cursor-pointer opacity-0"
						/>
						<span
							className="absolute inset-1 rounded-full"
							style={{
								background:
									"conic-gradient(red, yellow, lime, aqua, blue, magenta, red)",
							}}
						/>
					</label>
				</div>
			</section>

			<section className="space-y-4">
				<div className="space-y-1.5">
					<p className="text-xs font-medium text-muted-foreground">{t.font}</p>
					<Select value={s.font} onValueChange={(font) => set({ font })}>
						<SelectTrigger className="w-full">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{(["latin", "arabic"] as const).map((group) => (
								<SelectGroup key={group}>
									<SelectLabel>{group === "latin" ? "Latin" : "العربية"}</SelectLabel>
									{FONTS[group].map((f) => (
										<SelectItem key={f.value} value={f.value}>
											<span style={{ fontFamily: `"${f.value}"` }}>{f.label}</span>
										</SelectItem>
									))}
								</SelectGroup>
							))}
						</SelectContent>
					</Select>
				</div>

				<div className="space-y-1.5">
					<div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
						<span>{t.fontSize}</span>
						<span>{s.fontSize} pt</span>
					</div>
					<input
						type="range"
						min={8.5}
						max={12}
						step={0.5}
						value={s.fontSize}
						onChange={(e) => set({ fontSize: Number(e.target.value) })}
						className="w-full accent-[var(--color-primary)]"
					/>
				</div>

				<Segmented
					label={t.spacing}
					value={s.spacing}
					onChange={(spacing) => set({ spacing })}
					options={[
						{ value: "compact", label: t.compact },
						{ value: "normal", label: t.normal },
						{ value: "relaxed", label: t.relaxed },
					]}
				/>

				<Segmented
					label={t.pageFormat}
					value={s.pageFormat}
					onChange={(pageFormat) => set({ pageFormat })}
					options={[
						{ value: "a4", label: "A4" },
						{ value: "letter", label: "US Letter" },
					]}
				/>

				<div className="space-y-1.5">
					<Segmented
						label={t.cvLanguage}
						value={s.language}
						onChange={setLanguage}
						options={[
							{ value: "en", label: "English" },
							{ value: "tr", label: "Türkçe" },
							{ value: "ar", label: "العربية" },
						]}
					/>
					<p className="text-[11px] text-muted-foreground">{t.cvLanguageHint}</p>
				</div>

				<div className={cn(s.template === "ats" && "opacity-50")}>
					<Switch
						label={t.showPhoto}
						checked={s.showPhoto}
						onChange={(showPhoto) => set({ showPhoto })}
					/>
				</div>
			</section>
		</div>
	);
}
