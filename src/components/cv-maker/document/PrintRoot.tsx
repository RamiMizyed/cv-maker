// components/cv-maker/document/PrintRoot.tsx
"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useCV } from "../CVContext";
import CVDocument, { LetterDocument } from "./CVDocument";
import { onPrintRequest, PrintRequest } from "@/lib/print";

/**
 * Holds an unscaled copy of the document that is hidden on screen and is the
 * only thing visible when printing. "Save as PDF" in the print dialog then gives
 * a vector PDF with real fonts, working links and correct Arabic shaping.
 */
export default function PrintRoot() {
	const { state } = useCV();
	const [mounted, setMounted] = useState(false);
	const [job, setJob] = useState<(PrintRequest & { n: number }) | null>(null);

	useEffect(() => setMounted(true), []);

	useEffect(
		() => onPrintRequest((req) => setJob((prev) => ({ ...req, n: (prev?.n ?? 0) + 1 }))),
		[],
	);

	// Print once the requested document has rendered and its fonts have loaded.
	useEffect(() => {
		if (!job) return;
		let cancelled = false;
		const run = async () => {
			await document.fonts?.ready;
			await new Promise((r) => requestAnimationFrame(() => r(null)));
			if (cancelled) return;
			const prevTitle = document.title;
			// Browsers use the page title as the suggested PDF filename.
			const name = state.personalInfo.name.trim() || "CV";
			document.title = job.kind === "letter" ? `${name} Cover Letter` : `${name} CV`;
			const restore = () => {
				document.title = prevTitle;
				window.removeEventListener("afterprint", restore);
				// Back to the CV, so a plain Ctrl+P later prints the CV, not a letter.
				setJob(null);
			};
			window.addEventListener("afterprint", restore);
			window.print();
		};
		run();
		return () => {
			cancelled = true;
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [job?.n]);

	if (!mounted) return null;

	const size = state.settings.pageFormat === "letter" ? "letter" : "A4";

	return createPortal(
		<div id="print-root" aria-hidden>
			<style>{`@page { size: ${size}; margin: 0; }`}</style>
			{job?.kind === "letter" ? (
				<LetterDocument cv={state} body={job.body} />
			) : (
				<CVDocument cv={state} />
			)}
		</div>,
		document.body,
	);
}
