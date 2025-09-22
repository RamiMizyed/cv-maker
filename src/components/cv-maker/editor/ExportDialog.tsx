// components/cv-maker/editor/ExportDialog.tsx
"use client";

import React, { useState } from "react";
import { useCV } from "../CVContext";
import { exportToPDF } from "../pdfExporter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import PrinterIcon from "@/icons/PrinterIcon";
import { useLang } from "@/lib/lang";

export default function ExportDialog() {
	const { state: cvData } = useCV();
	const { lang } = useLang() as { lang: "en" | "ar" | "tr" };
	const [isOpen, setIsOpen] = useState(false);
	const [filename, setFilename] = useState("");
	const [pageFormat, setPageFormat] = useState<"a4" | "letter">("a4");
	const [orientation, setOrientation] = useState<"portrait" | "landscape">(
		"portrait"
	);

	const handleExport = async () => {
		await exportToPDF({
			cvData,
			lang,
			filename,
			pageFormat,
			orientation,
		});
		setIsOpen(false);
	};

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				<Button>
					<PrinterIcon className="h-4 w-4 mr-2" /> Export to PDF
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Export Options</DialogTitle>
				</DialogHeader>
				<div className="space-y-4 py-4">
					<div>
						<Label htmlFor="filename">Filename</Label>
						<Input
							id="filename"
							value={filename}
							onChange={(e) => setFilename(e.target.value)}
							placeholder={`${
								cvData.personalInfo.name.replace(/\s+/g, "_") || "CV"
							}.pdf`}
						/>
					</div>
					<div>
						<Label htmlFor="pageFormat">Page Format</Label>
						<Select
							value={pageFormat}
							onValueChange={(v) => setPageFormat(v as any)}>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="a4">A4</SelectItem>
								<SelectItem value="letter">Letter</SelectItem>
							</SelectContent>
						</Select>
					</div>
					<div>
						<Label htmlFor="orientation">Orientation</Label>
						<Select
							value={orientation}
							onValueChange={(v) => setOrientation(v as any)}>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="portrait">Portrait</SelectItem>
								<SelectItem value="landscape">Landscape</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</div>
				<Button onClick={handleExport} className="w-full">
					Export
				</Button>
			</DialogContent>
		</Dialog>
	);
}
