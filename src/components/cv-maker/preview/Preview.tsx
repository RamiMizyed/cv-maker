// components/cv-maker/preview/Preview.tsx
"use client";

import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Maximize2, Minimize2 } from "lucide-react";
import { useCV } from "../CVContext";
import CVDocument, { PAGE_SIZE } from "../document/CVDocument";
import { cn } from "@/lib/utils";
import { useT } from "../editor/fields";

/**
 * Live preview. Renders the same CVDocument that gets printed, scaled to fit
 * the column, with dashed guides where page breaks will roughly fall.
 */
export default function Preview({ className }: { className?: string }) {
	const { state } = useCV();
	const t = useT();
	const frameRef = useRef<HTMLDivElement>(null);
	const sheetRef = useRef<HTMLDivElement>(null);
	const [frameWidth, setFrameWidth] = useState(0);
	const [contentHeight, setContentHeight] = useState(0);
	const [fit, setFit] = useState(true);

	const page = PAGE_SIZE[state.settings.pageFormat];

	useLayoutEffect(() => {
		const frame = frameRef.current;
		const sheet = sheetRef.current;
		if (!frame || !sheet) return;
		const ro = new ResizeObserver(() => {
			setFrameWidth(frame.clientWidth);
			setContentHeight(sheet.offsetHeight);
		});
		ro.observe(frame);
		ro.observe(sheet);
		return () => ro.disconnect();
	}, []);

	// Keep the sheet at least one full page tall so a short CV still looks like paper.
	const sheetHeight = Math.max(contentHeight, page.heightPx);
	const scale = fit && frameWidth ? Math.min(1, frameWidth / page.widthPx) : 1;
	const pages = Math.max(1, Math.ceil((contentHeight - 2) / page.heightPx));

	// Measure once more after web fonts arrive, since they change line wrapping.
	useEffect(() => {
		document.fonts?.ready.then(() => {
			if (sheetRef.current) setContentHeight(sheetRef.current.offsetHeight);
		});
	}, [state.settings.font]);

	return (
		<div className={cn("relative", className)}>
			<div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
				<span>
					{pages} {pages === 1 ? t.pageOne : t.pageMany} ·{" "}
					{state.settings.pageFormat === "a4" ? "A4" : "US Letter"}
				</span>
				<button
					type="button"
					onClick={() => setFit((f) => !f)}
					className="inline-flex items-center gap-1 rounded-md px-2 py-1 hover:bg-accent hover:text-accent-foreground"
					aria-label={fit ? t.actualSize : t.fitWidth}>
					{fit ? <Maximize2 className="size-3.5" /> : <Minimize2 className="size-3.5" />}
					{fit ? "100%" : t.fit}
				</button>
			</div>

			<div
				ref={frameRef}
				className={cn("w-full", !fit && "overflow-x-auto")}
				data-lenis-prevent>
				<div
					className="relative mx-auto"
					style={{
						width: page.widthPx * scale,
						height: sheetHeight * scale,
					}}>
					<div
						className="absolute left-0 top-0 origin-top-left overflow-hidden rounded-sm bg-white shadow-xl ring-1 ring-black/5"
						style={{
							width: page.widthPx,
							minHeight: page.heightPx,
							transform: `scale(${scale})`,
						}}>
						<div ref={sheetRef}>
							<CVDocument cv={state} />
						</div>
						{Array.from({ length: pages - 1 }, (_, i) => (
							<div
								key={i}
								aria-hidden
								className="pointer-events-none absolute inset-x-0 border-t-2 border-dashed border-sky-400/70"
								style={{ top: (i + 1) * page.heightPx }}>
								<span className="absolute right-2 top-1 rounded bg-sky-500 px-1.5 py-0.5 text-[11px] font-medium text-white">
									{t.pageLabel} {i + 2}
								</span>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
