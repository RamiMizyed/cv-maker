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
			<div className="grid grid-cols-1 md:grid-cols-2 h-screen container mx-auto">
				<Editor />
				<Preview />
			</div>
		</CVProvider>
	);
}
