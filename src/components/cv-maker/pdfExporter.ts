import jsPDF, { TextOptionsLight } from "jspdf";
import { CVData } from "@/types/cv";
import translations from "@/lib/translations"; // Adjust path as needed

interface ExportOptions {
	cvData: CVData;
	lang: "en" | "ar" | "tr";
	filename: string;
	pageFormat: "a4" | "letter";
	orientation: "portrait" | "landscape";
}

export const exportToPDF = async ({
	cvData,
	lang,
	filename,
	pageFormat,
	orientation,
}: ExportOptions) => {
	const {
		personalInfo,
		experience,
		education,
		projects,
		skills,
		selectedFont,
	} = cvData;
	const fontName = selectedFont;
	const isRtl = lang === "ar";
	const t = translations[lang];

	const doc = new jsPDF({ orientation, unit: "pt", format: pageFormat });

	// Font loading for RTL
	if (isRtl) {
		try {
			const fontResponse = await fetch("/font/Amiri-Regular.ttf"); // Ensure this font is in your /public folder
			const fontBuffer = await fontResponse.arrayBuffer();
			const base64Font = btoa(
				new Uint8Array(fontBuffer).reduce(
					(data, byte) => data + String.fromCharCode(byte),
					""
				)
			);
			doc.addFileToVFS("Amiri-Regular.ttf", base64Font);
			doc.addFont("Amiri-Regular.ttf", "Amiri", "normal");
			doc.setFont("Amiri");
		} catch (error) {
			console.error("Failed to load Arabic font:", error);
		}
	}

	const pageHeight = doc.internal.pageSize.getHeight();
	const pageWidth = doc.internal.pageSize.getWidth();
	const margin = 50;
	const contentWidth = pageWidth - margin * 2;
	let cursorY = margin;

	// Font Mapping
	let jsPdfFont = "helvetica";
	if (fontName === "Times New Roman" || fontName === "Times")
		jsPdfFont = "times";
	if (fontName === "Courier") jsPdfFont = "courier";

	const checkPageBreak = (spaceNeeded: number) => {
		if (cursorY + spaceNeeded > pageHeight - margin) {
			doc.addPage();
			cursorY = margin;
		}
	};

	const addSectionTitle = (title: string) => {
		checkPageBreak(40);
		doc.setFont(jsPdfFont, "bold");
		if (isRtl) doc.setFont("Amiri", "normal");
		doc.setFontSize(12);
		doc.text(title, margin, cursorY, {
			lang: isRtl ? "ar" : undefined,
		} as TextOptionsLight);
		doc.setDrawColor(200);
		doc.line(margin, cursorY + 4, contentWidth + margin, cursorY + 4);
		cursorY += 25;
	};

	// --- Header ---
	checkPageBreak(50);
	doc.setFont(jsPdfFont, "bold");
	if (isRtl) doc.setFont("Amiri", "normal");
	doc.setFontSize(22);
	doc.text(personalInfo.name, pageWidth / 2, cursorY, {
		align: "center",
		lang: isRtl ? "ar" : undefined,
	} as TextOptionsLight);
	cursorY += doc.getTextDimensions(personalInfo.name).h + 6;

	// Title
	doc.setFont(jsPdfFont, "normal");
	if (isRtl) doc.setFont("Amiri", "normal");
	doc.setFontSize(14);
	doc.text(personalInfo.title, pageWidth / 2, cursorY, {
		align: "center",
		lang: isRtl ? "ar" : undefined,
	} as TextOptionsLight);
	cursorY += doc.getTextDimensions(personalInfo.title).h + 6;

	// Contact Info
	doc.setFont(jsPdfFont, "normal");
	if (isRtl) doc.setFont("Amiri", "normal");
	doc.setFontSize(10);
	const contacts = [
		personalInfo.phone,
		personalInfo.email,
		personalInfo.website,
		personalInfo.github,
	].filter(Boolean); // Filter out empty strings
	const contactText = contacts.join(" | ");
	doc.text(contactText, pageWidth / 2, cursorY, {
		align: "center",
		lang: isRtl ? "ar" : undefined,
	} as TextOptionsLight);
	cursorY += 30;

	// --- Summary ---
	if (personalInfo.summary) {
		addSectionTitle(t.summary);
		doc.setFont(jsPdfFont, "normal");
		if (isRtl) doc.setFont("Amiri", "normal");
		doc.setFontSize(10);
		const splitSummary = doc.splitTextToSize(
			personalInfo.summary,
			contentWidth
		);
		doc.text(splitSummary, margin, cursorY, {
			lang: isRtl ? "ar" : undefined,
		} as TextOptionsLight);
		cursorY += doc.getTextDimensions(splitSummary).h + 20;
	}

	// --- Experience ---
	if (experience && experience.length > 0) {
		addSectionTitle(t.experience);
		experience.forEach((job) => {
			checkPageBreak(50);
			doc.setFont(jsPdfFont, "bold");
			if (isRtl) doc.setFont("Amiri", "normal");
			doc.setFontSize(11);
			doc.text(job.position, margin, cursorY, {
				lang: isRtl ? "ar" : undefined,
			} as TextOptionsLight);
			// Fix for the TypeScript error: t.present might not exist on the type
			const endDateText = job.endDate || (t as { [key: string]: string }).present || "Present";
			doc.text(
				`${job.startDate} - ${endDateText}`,
				contentWidth + margin,
				cursorY,
				{ align: "right", lang: isRtl ? "ar" : undefined } as TextOptionsLight
			);
			cursorY += 12;

			doc.setFont(jsPdfFont, "normal");
			if (isRtl) doc.setFont("Amiri", "normal");
			doc.setFontSize(10);
			doc.text(`${job.company}`, margin, cursorY, {
				lang: isRtl ? "ar" : undefined,
			} as TextOptionsLight);
			cursorY += 15;

			if (job.description) {
				doc.setFont(jsPdfFont, "normal");
				if (isRtl) doc.setFont("Amiri", "normal");
				doc.setFontSize(10);
				const splitDesc = doc.splitTextToSize(
					`- ${job.description}`,
					contentWidth
				);
				doc.text(splitDesc, margin, cursorY, {
					lang: isRtl ? "ar" : undefined,
				} as TextOptionsLight);
				cursorY += doc.getTextDimensions(splitDesc).h + 10;
			}
		});
	}

	// --- Education ---
	if (education && education.length > 0) {
		addSectionTitle(t.education);
		education.forEach((edu) => {
			checkPageBreak(30);
			doc.setFont(jsPdfFont, "bold");
			if (isRtl) doc.setFont("Amiri", "normal");
			doc.setFontSize(11);
			doc.text(edu.degree, margin, cursorY, {
				lang: isRtl ? "ar" : undefined,
			} as TextOptionsLight);
			doc.text(
				`${edu.startDate} - ${edu.endDate}`,
				contentWidth + margin,
				cursorY,
				{ align: "right", lang: isRtl ? "ar" : undefined } as TextOptionsLight
			);
			cursorY += 12;

			doc.setFont(jsPdfFont, "normal");
			if (isRtl) doc.setFont("Amiri", "normal");
			doc.setFontSize(10);
			doc.text(`${edu.institution}`, margin, cursorY, {
				lang: isRtl ? "ar" : undefined,
			} as TextOptionsLight);
			cursorY += 15;
		});
	}

	// --- Projects ---
	if (projects && projects.length > 0) {
		addSectionTitle(t.projects);
		projects.forEach((proj) => {
			checkPageBreak(40);
			doc.setFont(jsPdfFont, "bold");
			if (isRtl) doc.setFont("Amiri", "normal");
			doc.setFontSize(11);
			doc.text(proj.name, margin, cursorY, {
				lang: isRtl ? "ar" : undefined,
			} as TextOptionsLight);
			cursorY += 12;

			doc.setFont(jsPdfFont, "normal");
			if (isRtl) doc.setFont("Amiri", "normal");
			doc.setFontSize(10);
			const splitDesc = doc.splitTextToSize(proj.description, contentWidth);
			doc.text(splitDesc, margin, cursorY, {
				lang: isRtl ? "ar" : undefined,
			} as TextOptionsLight);
			cursorY += doc.getTextDimensions(splitDesc).h + 15;
		});
	}

	// --- Skills ---
	if (skills) {
		addSectionTitle(t.skills);
		doc.setFont(jsPdfFont, "normal");
		if (isRtl) doc.setFont("Amiri", "normal");
		doc.setFontSize(10);
		const splitSkills = doc.splitTextToSize(skills, contentWidth);
		doc.text(splitSkills, margin, cursorY, {
			lang: isRtl ? "ar" : undefined,
		} as TextOptionsLight);
		cursorY += doc.getTextDimensions(splitSkills).h + 10;
	}

	// --- Save File ---
	const defaultFilename = `${
		personalInfo.name.replace(/\s+/g, "_") || "CV"
	}.pdf`;
	doc.save(filename || defaultFilename);
};
