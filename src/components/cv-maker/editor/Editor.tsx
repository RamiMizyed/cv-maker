// components/cv-maker/editor/Editor.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import {
	CloudCheck,
	CloudAlert,
	Download,
	FileJson,
	FilePlus2,
	FileUp,
	Info,
	Loader2,
	MoreHorizontal,
	Palette,
	PenLine,
	Redo2,
	Sparkles,
	Undo2,
	WandSparkles,
} from "lucide-react";
import { useCV } from "../CVContext";
import { Button } from "@/components/ui/button";
import { emptyCV, sampleCV } from "@/lib/cv/defaults";
import { normalizeCV } from "@/lib/cv/migrate";
import { requestPrint } from "@/lib/print";
import { cn } from "@/lib/utils";
import { IconButton, useT } from "./fields";
import ContentPanel from "./ContentPanel";
import DesignPanel from "./DesignPanel";
import AIPanel from "./AIPanel";

type Tab = "content" | "design" | "ai";

function downloadJson(filename: string, data: unknown) {
	const blob = new Blob([JSON.stringify(data, null, 2)], {
		type: "application/json;charset=utf-8",
	});
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = filename;
	a.click();
	URL.revokeObjectURL(url);
}

function MoreMenu({ onMessage }: { onMessage: (m: string) => void }) {
	const { state, dispatch } = useCV();
	const t = useT();
	const [open, setOpen] = useState(false);
	const ref = useRef<HTMLDivElement>(null);
	const fileRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		if (!open) return;
		const close = (e: MouseEvent) => {
			if (!ref.current?.contains(e.target as Node)) setOpen(false);
		};
		const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
		document.addEventListener("mousedown", close);
		document.addEventListener("keydown", esc);
		return () => {
			document.removeEventListener("mousedown", close);
			document.removeEventListener("keydown", esc);
		};
	}, [open]);

	const replace = (cv: ReturnType<typeof emptyCV>) => {
		if (window.confirm(t.confirmReplace)) dispatch({ type: "REPLACE", cv });
		setOpen(false);
	};

	const items = [
		{
			icon: FileJson,
			label: t.exportJson,
			run: () => {
				const name = (state.personalInfo.name || "CV").trim().replace(/\s+/g, "_");
				downloadJson(`${name}_cv.json`, state);
				setOpen(false);
			},
		},
		{ icon: FileUp, label: t.importJson, run: () => fileRef.current?.click() },
		{
			icon: FilePlus2,
			label: t.startBlank,
			run: () => {
				const cv = emptyCV(state.settings.font, state.settings.language);
				replace({ ...cv, settings: { ...state.settings } });
			},
		},
		{ icon: WandSparkles, label: t.loadSample, run: () => replace(sampleCV()) },
	];

	return (
		<div ref={ref} className="relative">
			<IconButton label={t.more} onClick={() => setOpen((o) => !o)}>
				<MoreHorizontal />
			</IconButton>
			{open && (
				<div
					role="menu"
					className="absolute end-0 top-full z-50 mt-1 w-56 rounded-lg border bg-popover p-1 text-popover-foreground shadow-lg">
					{items.map(({ icon: Icon, label, run }) => (
						<button
							key={label}
							role="menuitem"
							type="button"
							onClick={run}
							className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-start text-sm hover:bg-accent">
							<Icon className="size-4 text-muted-foreground" />
							{label}
						</button>
					))}
				</div>
			)}
			<input
				ref={fileRef}
				type="file"
				accept="application/json,.json"
				className="hidden"
				onChange={async (e) => {
					const f = e.target.files?.[0];
					e.target.value = "";
					setOpen(false);
					if (!f) return;
					try {
						const cv = normalizeCV(JSON.parse(await f.text()), state.settings.font);
						if (!cv) return onMessage(t.importFailed);
						if (window.confirm(t.confirmReplace)) {
							dispatch({ type: "REPLACE", cv });
							onMessage(t.imported);
						}
					} catch {
						onMessage(t.importFailed);
					}
				}}
			/>
		</div>
	);
}

function SaveStatus() {
	const { saveStatus } = useCV();
	const t = useT();
	if (saveStatus === "idle") return null;
	const map = {
		saving: { icon: Loader2, text: t.saving, cls: "animate-spin" },
		saved: { icon: CloudCheck, text: t.saved, cls: "" },
		error: { icon: CloudAlert, text: t.saveError, cls: "text-destructive" },
	} as const;
	const { icon: Icon, text, cls } = map[saveStatus];
	return (
		<span
			className={cn(
				"hidden min-w-0 items-center gap-1.5 truncate text-xs text-muted-foreground sm:inline-flex",
				saveStatus === "error" && "text-destructive",
			)}
			aria-live="polite">
			<Icon className={cn("size-3.5 shrink-0", cls)} />
			<span className="truncate">{text}</span>
		</span>
	);
}

export default function Editor({ className }: { className?: string }) {
	const { undo, redo, canUndo, canRedo } = useCV();
	const t = useT();
	const [tab, setTab] = useState<Tab>("content");
	const [message, setMessage] = useState<string | null>(null);

	useEffect(() => {
		if (!message) return;
		const id = setTimeout(() => setMessage(null), 6000);
		return () => clearTimeout(id);
	}, [message]);

	const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
		{ id: "content", label: t.tabContent, icon: PenLine },
		{ id: "design", label: t.tabDesign, icon: Palette },
		{ id: "ai", label: t.tabAI, icon: Sparkles },
	];

	return (
		<div className={cn("min-w-0 space-y-4", className)}>
			<div className="sticky top-3 z-40 space-y-2 rounded-xl border bg-background/85 p-2 shadow-sm backdrop-blur-lg">
				<div className="flex items-center gap-1">
					<IconButton label={`${t.undo} (Ctrl+Z)`} onClick={undo} disabled={!canUndo}>
						<Undo2 />
					</IconButton>
					<IconButton label={`${t.redo} (Ctrl+Y)`} onClick={redo} disabled={!canRedo}>
						<Redo2 />
					</IconButton>
					<div className="mx-1 min-w-0 flex-1">
						<SaveStatus />
					</div>
					<MoreMenu onMessage={setMessage} />
					<Button
						size="sm"
						onClick={() => {
							setMessage(t.pdfHint);
							requestPrint({ kind: "cv" });
						}}>
						<Download /> {t.downloadPdf}
					</Button>
				</div>

				<div role="tablist" className="grid grid-cols-3 gap-1 rounded-lg bg-muted p-1">
					{tabs.map(({ id, label, icon: Icon }) => (
						<button
							key={id}
							type="button"
							role="tab"
							aria-selected={tab === id}
							onClick={() => setTab(id)}
							className={cn(
								"flex items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-sm font-medium transition-colors",
								tab === id
									? "bg-background text-foreground shadow-sm"
									: "text-muted-foreground hover:text-foreground",
							)}>
							<Icon className="size-4" />
							{label}
						</button>
					))}
				</div>

				{message && (
					<p className="flex items-start gap-2 rounded-md bg-sky-500/10 px-2.5 py-2 text-xs text-sky-800 dark:text-sky-300">
						<Info className="mt-px size-3.5 shrink-0" />
						{message}
					</p>
				)}
			</div>

			<div role="tabpanel">
				{tab === "content" && <ContentPanel />}
				{tab === "design" && <DesignPanel />}
				{tab === "ai" && <AIPanel />}
			</div>
		</div>
	);
}
