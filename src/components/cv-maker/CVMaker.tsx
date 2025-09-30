// components/cv-maker/CVMaker.tsx
"use client";

import React from "react";
import { CVProvider } from "./CVContext";
import Editor from "./editor/Editor";
import Preview from "./preview/Preview";

// Main CV Maker Component
export default function CVMaker() {
	return (
		<CVProvider>
			<div
				id="cvMaker"
				className="grid grid-cols-1 lg:grid-cols-5 gap-8 min-h-[100svh] container mx-auto py-10 lg:py-20 px-3 lg:px-6 relative overflow-visible">
				<Editor />
				<Preview />
			</div>
		</CVProvider>
	);
}
