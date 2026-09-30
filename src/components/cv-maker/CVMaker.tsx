// components/cv-maker/CVMaker.tsx
"use client";

import React, { useState } from "react";
import { Eye, PenLine } from "lucide-react";
import { CVProvider } from "./CVContext";
import Editor from "./editor/Editor";
import Preview from "./preview/Preview";
import PrintRoot from "./document/PrintRoot";
import { useT } from "./editor/fields";
import { cn } from "@/lib/utils";

function Workspace() {
	const t = useT();
	// On small screens editor and preview share the space; a toggle switches between them.
	const [mobileView, setMobileView] = useState<"edit" | "preview">("edit");

	return (
		<section id="cvMaker" className="mx-auto w-full max-w-[1600px] scroll-mt-24 px-3 pb-24 pt-6 lg:px-6">
			<div className="mb-4 grid grid-cols-2 gap-1 rounded-lg bg-muted p-1 lg:hidden">
				{(
					[
						{ id: "edit", label: t.editTab, icon: PenLine },
						{ id: "preview", label: t.previewTab, icon: Eye },
					] as const
				).map(({ id, label, icon: Icon }) => (
					<button
						key={id}
						type="button"
						onClick={() => setMobileView(id)}
						aria-pressed={mobileView === id}
						className={cn(
							"flex items-center justify-center gap-1.5 rounded-md py-2 text-sm font-medium",
							mobileView === id ? "bg-background shadow-sm" : "text-muted-foreground",
						)}>
						<Icon className="size-4" /> {label}
					</button>
				))}
			</div>

			<div className="grid items-start gap-6 lg:grid-cols-[minmax(400px,5fr)_7fr] xl:gap-10">
				<Editor className={cn(mobileView === "preview" && "hidden lg:block")} />
				<div
					data-lenis-prevent
					className={cn(
						"min-w-0 lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)] lg:overflow-y-auto lg:pb-6",
						mobileView === "edit" && "hidden lg:block",
					)}>
					<Preview />
				</div>
			</div>
		</section>
	);
}

export default function CVMaker() {
	return (
		<CVProvider>
			<Workspace />
			<PrintRoot />
		</CVProvider>
	);
}
