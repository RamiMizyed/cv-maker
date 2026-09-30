// components/cv-maker/editor/AIPanel.tsx
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
	Check,
	CheckCircle2,
	Copy,
	Download,
	FileUp,
	Loader2,
	Plus,
	Sparkles,
	X,
	XCircle,
} from "lucide-react";
import { useCV } from "../CVContext";
import { CVData } from "@/types/cv";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { normalizeCV } from "@/lib/cv/migrate";
import { matchKeywords, runChecks } from "@/lib/cv/analysis";
import { toBullets } from "@/lib/cv/format";
import { requestPrint } from "@/lib/print";
import type { TailorResult } from "@/lib/ai/types";
import { Translation } from "@/lib/translations";
import { cn } from "@/lib/utils";
import { useT } from "./fields";
import { mergeSkills } from "./SkillsInput";

const JOB_KEY = "cvmaker:job";

/** The CV without the photo: smaller request, and the model has no use for it. */
const lean = (cv: CVData) => ({ ...cv, personalInfo: { ...cv.personalInfo, portrait: "" } });

async function postAI<T>(path: string, body: unknown, t: Translation): Promise<T> {
	const isForm = body instanceof FormData;
	const res = await fetch(`/api/ai/${path}`, {
		method: "POST",
		headers: isForm ? undefined : { "Content-Type": "application/json" },
		body: isForm ? body : JSON.stringify(body),
	});
	const data = await res.json().catch(() => ({}));
	if (res.status === 429) throw new Error(t.rateLimited);
	if (data.error === "ai_unavailable") throw new Error(t.aiUnavailable);
	if (!res.ok) throw new Error(data.error || t.aiError);
	return data as T;
}

function Card({
	title,
	desc,
	icon,
	children,
}: {
	title: string;
	desc?: string;
	icon?: React.ReactNode;
	children: React.ReactNode;
}) {
	return (
		<section className="space-y-3 rounded-xl border bg-card p-4 shadow-xs">
			<div className="space-y-1">
				<h3 className="flex items-center gap-2 font-semibold">
					{icon}
					{title}
				</h3>
				{desc && <p className="text-xs leading-relaxed text-muted-foreground">{desc}</p>}
			</div>
			{children}
		</section>
	);
}

const ErrorText = ({ error }: { error: string | null }) =>
	error ? <p className="text-xs text-destructive">{error}</p> : null;

// ---------------- tailoring ----------------

function Suggestion({
	title,
	current,
	suggested,
	onAccept,
	onDismiss,
	t,
}: {
	title: string;
	current: React.ReactNode;
	suggested: React.ReactNode;
	onAccept: () => void;
	onDismiss: () => void;
	t: Translation;
}) {
	return (
		<div className="overflow-hidden rounded-lg border">
			<div className="flex items-center justify-between gap-2 border-b bg-muted/50 px-3 py-2">
				<p className="truncate text-sm font-medium">{title}</p>
				<div className="flex shrink-0 gap-1">
					<Button size="sm" variant="ghost" onClick={onDismiss}>
						<X /> {t.reject}
					</Button>
					<Button size="sm" onClick={onAccept}>
						<Check /> {t.accept}
					</Button>
				</div>
			</div>
			<div className="grid gap-px bg-border text-xs leading-relaxed sm:grid-cols-2">
				<div className="bg-background p-3">
					<p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
						{t.current}
					</p>
					<div className="text-muted-foreground">{current}</div>
				</div>
				<div className="bg-emerald-50/60 p-3 dark:bg-emerald-950/20">
					<p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
						{t.suggested}
					</p>
					<div>{suggested}</div>
				</div>
			</div>
		</div>
	);
}

const BulletList = ({ items }: { items: string[] }) => (
	<ul className="list-disc space-y-1 ps-4">
		{items.map((b, i) => (
			<li key={i}>{b}</li>
		))}
	</ul>
);

function Tailor({ job }: { job: string }) {
	const { state, dispatch } = useCV();
	const t = useT();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [result, setResult] = useState<TailorResult | null>(null);
	const [done, setDone] = useState<Set<string>>(new Set());

	const finish = (key: string) => setDone((d) => new Set(d).add(key));

	const generate = async () => {
		if (job.trim().length < 40) return setError(t.needJob);
		setLoading(true);
		setError(null);
		try {
			const r = await postAI<TailorResult>(
				"tailor",
				{ job, cv: lean(state), lang: state.settings.language },
				t,
			);
			setResult(r);
			setDone(new Set());
		} catch (e) {
			setError((e as Error).message);
		} finally {
			setLoading(false);
		}
	};

	const roles = useMemo(
		() =>
			(result?.experience || [])
				.map((s) => ({ s, role: state.experience.find((e) => e.id === s.id) }))
				.filter((x) => x.role && x.s.bullets.length),
		[result, state.experience],
	);
	const newSkills = (result?.skillsToAdd || []).filter(
		(s) => !state.skills.some((x) => x.toLowerCase() === s.toLowerCase()),
	);

	const acceptSummary = () => {
		dispatch({ type: "SET_PERSONAL", field: "summary", value: result!.summary });
		finish("summary");
	};
	const acceptRole = (id: string, bullets: string[]) => {
		dispatch({
			type: "UPDATE_ITEM",
			section: "experience",
			id,
			patch: { description: bullets.join("\n") },
		});
		finish(`exp:${id}`);
	};
	const acceptSkills = (skills: string[]) =>
		dispatch({ type: "SET_SKILLS", skills: mergeSkills(state.skills, skills) });

	const pending = {
		summary: !!result?.summary && !done.has("summary"),
		roles: roles.filter(({ s }) => !done.has(`exp:${s.id}`)),
		skills: !done.has("skills") ? newSkills : [],
	};
	const nothingLeft =
		result && !pending.summary && !pending.roles.length && !pending.skills.length;

	const acceptAll = () => {
		if (pending.summary) acceptSummary();
		pending.roles.forEach(({ s }) => acceptRole(s.id, s.bullets));
		if (pending.skills.length) {
			acceptSkills(pending.skills);
			finish("skills");
		}
	};

	return (
		<Card
			title={t.aiTailorTitle}
			desc={t.aiTailorDesc}
			icon={<Sparkles className="size-4 text-primary" />}>
			<Button onClick={generate} disabled={loading} className="w-full">
				{loading ? <Loader2 className="animate-spin" /> : <Sparkles />}
				{loading ? t.thinking : t.generate}
			</Button>
			<ErrorText error={error} />

			{result && (
				<div className="space-y-3">
					{!nothingLeft && (
						<div className="flex justify-end">
							<Button size="sm" variant="outline" onClick={acceptAll}>
								<Check /> {t.acceptAll}
							</Button>
						</div>
					)}

					{pending.summary && (
						<Suggestion
							t={t}
							title={t.summary}
							current={state.personalInfo.summary || "..."}
							suggested={result.summary}
							onAccept={acceptSummary}
							onDismiss={() => finish("summary")}
						/>
					)}

					{pending.roles.map(({ s, role }) => (
						<Suggestion
							key={s.id}
							t={t}
							title={[role!.position, role!.company].filter(Boolean).join(" · ")}
							current={<BulletList items={toBullets(role!.description)} />}
							suggested={<BulletList items={s.bullets} />}
							onAccept={() => acceptRole(s.id, s.bullets)}
							onDismiss={() => finish(`exp:${s.id}`)}
						/>
					))}

					{pending.skills.length > 0 && (
						<div className="space-y-2 rounded-lg border p-3">
							<div className="flex items-center justify-between gap-2">
								<p className="text-sm font-medium">{t.newSkills}</p>
								<div className="flex gap-1">
									<Button size="sm" variant="ghost" onClick={() => finish("skills")}>
										<X /> {t.reject}
									</Button>
									<Button
										size="sm"
										onClick={() => {
											acceptSkills(pending.skills);
											finish("skills");
										}}>
										<Check /> {t.acceptAll}
									</Button>
								</div>
							</div>
							<div className="flex flex-wrap gap-1.5">
								{pending.skills.map((s) => (
									<button
										key={s}
										type="button"
										onClick={() => acceptSkills([s])}
										className="inline-flex items-center gap-1 rounded-full border border-dashed border-emerald-500/60 px-2.5 py-1 text-xs text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/30">
										<Plus className="size-3" /> {s}
									</button>
								))}
							</div>
						</div>
					)}

					{nothingLeft && (
						<p className="flex items-center gap-2 text-sm text-muted-foreground">
							<CheckCircle2 className="size-4 text-emerald-500" /> {t.noChanges}
						</p>
					)}
				</div>
			)}
		</Card>
	);
}

// ---------------- CV check ----------------

function ScoreRing({ value, label }: { value: number; label: string }) {
	const r = 26;
	const c = 2 * Math.PI * r;
	const color = value >= 80 ? "#10b981" : value >= 50 ? "#f59e0b" : "#ef4444";
	return (
		<div className="flex flex-col items-center gap-1">
			<svg width="68" height="68" viewBox="0 0 68 68" role="img" aria-label={`${label}: ${value}%`}>
				<circle cx="34" cy="34" r={r} fill="none" strokeWidth="6" className="stroke-muted" />
				<circle
					cx="34"
					cy="34"
					r={r}
					fill="none"
					strokeWidth="6"
					stroke={color}
					strokeLinecap="round"
					strokeDasharray={c}
					strokeDashoffset={c * (1 - value / 100)}
					transform="rotate(-90 34 34)"
					style={{ transition: "stroke-dashoffset 400ms ease" }}
				/>
				<text x="34" y="39" textAnchor="middle" className="fill-foreground text-[15px] font-bold">
					{value}
				</text>
			</svg>
			<span className="text-[11px] font-medium text-muted-foreground">{label}</span>
		</div>
	);
}

function CVCheck({ job }: { job: string }) {
	const { state, dispatch } = useCV();
	const t = useT();
	const { checks, score } = useMemo(() => runChecks(state), [state]);
	const keywords = useMemo(() => matchKeywords(state, job), [state, job]);

	return (
		<Card title={t.scoreTitle} desc={t.scoreDesc}>
			<div className="flex items-center justify-around gap-4 py-1">
				<ScoreRing value={score} label={t.scoreTitle} />
				{keywords && <ScoreRing value={keywords.percent} label={t.jobMatch} />}
			</div>
			<ul className="space-y-1.5 text-sm">
				{checks.map((c) => (
					<li key={c.id} className="flex items-start gap-2">
						{c.pass ? (
							<CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-500" />
						) : (
							<XCircle className="mt-0.5 size-4 shrink-0 text-amber-500" />
						)}
						<span className={cn(c.pass && "text-muted-foreground")}>{t[c.id]}</span>
					</li>
				))}
			</ul>
			{keywords && (
				<div className="space-y-3 border-t pt-3">
					{keywords.missing.length > 0 && (
						<div className="space-y-1.5">
							<p className="text-xs font-medium text-muted-foreground">{t.missing}</p>
							<div className="flex flex-wrap gap-1.5">
								{keywords.missing.map((k) => (
									<button
										key={k}
										type="button"
										title={t.addSkill}
										onClick={() =>
											dispatch({ type: "SET_SKILLS", skills: mergeSkills(state.skills, [k]) })
										}
										className="inline-flex items-center gap-1 rounded-full border border-dashed border-amber-500/60 px-2.5 py-1 text-xs text-amber-700 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-950/30">
										<Plus className="size-3" /> {k}
									</button>
								))}
							</div>
						</div>
					)}
					{keywords.matched.length > 0 && (
						<div className="space-y-1.5">
							<p className="text-xs font-medium text-muted-foreground">{t.matched}</p>
							<div className="flex flex-wrap gap-1.5">
								{keywords.matched.map((k) => (
									<span
										key={k}
										className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs text-emerald-700 dark:text-emerald-400">
										{k}
									</span>
								))}
							</div>
						</div>
					)}
				</div>
			)}
		</Card>
	);
}

// ---------------- cover letter ----------------

function CoverLetter({ job }: { job: string }) {
	const { state } = useCV();
	const t = useT();
	const [company, setCompany] = useState("");
	const [letter, setLetter] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [copied, setCopied] = useState(false);

	const generate = async () => {
		if (job.trim().length < 40) return setError(t.needJob);
		setLoading(true);
		setError(null);
		try {
			const r = await postAI<{ letter: string }>(
				"cover-letter",
				{ job, company, cv: lean(state), lang: state.settings.language },
				t,
			);
			setLetter(r.letter);
		} catch (e) {
			setError((e as Error).message);
		} finally {
			setLoading(false);
		}
	};

	return (
		<Card title={t.coverTitle} desc={t.coverDesc}>
			<Input
				value={company}
				placeholder={t.companyName}
				onChange={(e) => setCompany(e.target.value)}
			/>
			<Button onClick={generate} disabled={loading} variant="outline" className="w-full">
				{loading ? <Loader2 className="animate-spin" /> : <Sparkles />}
				{loading ? t.thinking : t.generateLetter}
			</Button>
			<ErrorText error={error} />
			{letter && (
				<div className="space-y-2">
					<Textarea
						dir="auto"
						value={letter}
						onChange={(e) => setLetter(e.target.value)}
						className="min-h-72 text-sm leading-relaxed"
					/>
					<div className="flex gap-2">
						<Button
							variant="outline"
							size="sm"
							onClick={async () => {
								await navigator.clipboard.writeText(letter);
								setCopied(true);
								setTimeout(() => setCopied(false), 1500);
							}}>
							{copied ? <Check /> : <Copy />} {copied ? t.copied : t.copy}
						</Button>
						<Button
							size="sm"
							onClick={() => requestPrint({ kind: "letter", body: letter })}>
							<Download /> {t.printLetter}
						</Button>
					</div>
				</div>
			)}
		</Card>
	);
}

// ---------------- import ----------------

function ImportCV() {
	const { state, dispatch } = useCV();
	const t = useT();
	const fileRef = useRef<HTMLInputElement>(null);
	const [text, setText] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [ok, setOk] = useState(false);

	const run = async (body: FormData | { text: string }) => {
		setLoading(true);
		setError(null);
		setOk(false);
		try {
			const parsed = await postAI<unknown>("parse", body, t);
			const cv = normalizeCV(parsed);
			if (!cv) throw new Error(t.importFailed);
			if (!window.confirm(t.confirmReplace)) return;
			// Keep the current design; only the content is imported.
			dispatch({
				type: "REPLACE",
				cv: {
					...cv,
					settings: state.settings,
					personalInfo: { ...cv.personalInfo, portrait: state.personalInfo.portrait },
				},
			});
			setOk(true);
			setText("");
		} catch (e) {
			setError((e as Error).message);
		} finally {
			setLoading(false);
		}
	};

	return (
		<Card title={t.importTitle} desc={t.importDesc}>
			<Button
				variant="outline"
				className="w-full"
				disabled={loading}
				onClick={() => fileRef.current?.click()}>
				{loading ? <Loader2 className="animate-spin" /> : <FileUp />} {t.uploadPdf}
			</Button>
			<input
				ref={fileRef}
				type="file"
				accept="application/pdf"
				className="hidden"
				onChange={(e) => {
					const f = e.target.files?.[0];
					e.target.value = "";
					if (!f) return;
					const form = new FormData();
					form.append("file", f);
					run(form);
				}}
			/>
			<p className="text-center text-xs text-muted-foreground">{t.orPaste}</p>
			<Textarea
				dir="auto"
				rows={4}
				value={text}
				onChange={(e) => setText(e.target.value)}
				className="text-sm"
			/>
			<Button
				variant="secondary"
				className="w-full"
				disabled={loading || text.trim().length < 80}
				onClick={() => run({ text })}>
				{t.parse}
			</Button>
			<ErrorText error={error} />
			{ok && (
				<p className="flex items-center gap-2 text-xs text-emerald-600">
					<CheckCircle2 className="size-4" /> {t.imported}
				</p>
			)}
		</Card>
	);
}

// ---------------- panel ----------------

export default function AIPanel() {
	const t = useT();
	const [job, setJob] = useState("");

	useEffect(() => {
		try {
			setJob(localStorage.getItem(JOB_KEY) || "");
		} catch {}
	}, []);

	const updateJob = (v: string) => {
		setJob(v);
		try {
			localStorage.setItem(JOB_KEY, v);
		} catch {}
	};

	return (
		<div className="space-y-4">
			<div className="space-y-1.5">
				<label htmlFor="job-description" className="text-sm font-semibold">
					{t.jobDescription}
				</label>
				<Textarea
					id="job-description"
					dir="auto"
					rows={7}
					value={job}
					placeholder={t.jobPlaceholder}
					onChange={(e) => updateJob(e.target.value)}
					className="max-h-80 text-sm"
				/>
			</div>
			<Tailor job={job} />
			<CVCheck job={job} />
			<CoverLetter job={job} />
			<ImportCV />
		</div>
	);
}
