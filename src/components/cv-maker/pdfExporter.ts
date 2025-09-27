import jsPDF, { TextOptionsLight } from "jspdf";
import { CVData } from "@/types/cv";
import translations from "@/lib/translations"; // Adjust path as needed
import GOOGLE_FONTS from "@/lib/fontList"; // Import your font list

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

	const isRtl = lang === "ar";
	const t = translations[lang];

	const doc = new jsPDF({ orientation, unit: "pt", format: pageFormat });

	// --- Font Management ---
	// (This section remains unchanged)
	const standardFonts = {
		Helvetica: "helvetica",
		"Times New Roman": "times",
		Times: "times",
		"Courier New": "courier",
		Courier: "courier",
	};
	const allFonts = [
		...GOOGLE_FONTS.english,
		...GOOGLE_FONTS.arabic,
		...GOOGLE_FONTS.turkish,
	];
	const fontMap = new Map(allFonts.map((font) => [font.value, font.path]));
	let activeFont = "helvetica";
	if (
		selectedFont &&
		standardFonts[selectedFont as keyof typeof standardFonts]
	) {
		activeFont = standardFonts[selectedFont as keyof typeof standardFonts];
	} else if (selectedFont) {
		const fontPath = fontMap.get(selectedFont);
		if (fontPath) {
			try {
				const fontResponse = await fetch(fontPath);
				if (!fontResponse.ok) throw new Error(`Font not found at ${fontPath}`);
				const fontBuffer = await fontResponse.arrayBuffer();
				const base64Font = btoa(
					new Uint8Array(fontBuffer).reduce(
						(data, byte) => data + String.fromCharCode(byte),
						""
					)
				);
				doc.addFileToVFS(`${selectedFont}.ttf`, base64Font);
				doc.addFont(`${selectedFont}.ttf`, selectedFont, "normal");
				activeFont = selectedFont;
			} catch (error) {
				console.warn(`Failed to load custom font "${selectedFont}".`, error);
			}
		}
	} else if (isRtl) {
		const amiriPath = fontMap.get("Amiri");
		if (amiriPath) {
			try {
				const fontResponse = await fetch(amiriPath);
				const fontBuffer = await fontResponse.arrayBuffer();
				const base64Font = btoa(
					new Uint8Array(fontBuffer).reduce(
						(data, byte) => data + String.fromCharCode(byte),
						""
					)
				);
				doc.addFileToVFS("Amiri.ttf", base64Font);
				doc.addFont("Amiri.ttf", "Amiri", "normal");
				activeFont = "Amiri";
			} catch (rtlError) {
				console.error("Failed to load default Arabic font 'Amiri'.", rtlError);
			}
		}
	}
	doc.setFont(activeFont);

	// --- Page Setup ---
	const pageHeight = doc.internal.pageSize.getHeight();
	const pageWidth = doc.internal.pageSize.getWidth();
	const margin = 50;
	const contentWidth = pageWidth - margin * 2;
	let cursorY = margin;

	const checkPageBreak = (spaceNeeded: number) => {
		if (cursorY + spaceNeeded > pageHeight - margin) {
			doc.addPage();
			cursorY = margin;
		}
	};

	const addSectionTitle = (title: string) => {
		checkPageBreak(40);
		doc.setFont(activeFont, "bold");
		doc.setFontSize(12);
		doc.text(title, margin, cursorY, {
			lang: isRtl ? "ar" : undefined,
		} as TextOptionsLight);
		doc.setDrawColor(200);
		doc.line(margin, cursorY + 4, contentWidth + margin, cursorY + 4);
		cursorY += 25;
	};

	// --- Header ---
	checkPageBreak(150); // Increased space for header

	// ** NEW: Add Portrait Image **
	if (personalInfo.portrait) {
		const imgWidth = 160;
		const imgHeight = 160;
		const imgX = (pageWidth - imgWidth) / 2; // Center the image
		try {
			// Assuming the portrait is a base64 data URL (e.g., from a file upload)
			doc.addImage(
				personalInfo.portrait,
				"JPEG",
				imgX,
				cursorY,
				imgWidth,
				imgHeight
			);
			cursorY += imgHeight + 15; // Add space after the image
		} catch (error) {
			console.error("Failed to add portrait image to PDF:", error);
		}
	}

	// Name
	doc.setFont(activeFont, "bold");
	doc.setFontSize(22);
	doc.text(personalInfo.name, pageWidth / 2, cursorY, {
		align: "center",
		lang: isRtl ? "ar" : undefined,
	} as TextOptionsLight);
	cursorY += doc.getTextDimensions(personalInfo.name).h + 6;

	// Title
	doc.setFont(activeFont, "normal");
	doc.setFontSize(14);
	doc.text(personalInfo.title, pageWidth / 2, cursorY, {
		align: "center",
		lang: isRtl ? "ar" : undefined,
	} as TextOptionsLight);
	cursorY += doc.getTextDimensions(personalInfo.title).h + 6;

	// Contact Info
	doc.setFont(activeFont, "normal");
	doc.setFontSize(10);
	const contacts = [
		personalInfo.phone,
		personalInfo.email,
		personalInfo.website,
		personalInfo.github,
	].filter(Boolean);
	const contactText = contacts.join(" | ");
	doc.text(contactText, pageWidth / 2, cursorY, {
		align: "center",
		lang: isRtl ? "ar" : undefined,
	} as TextOptionsLight);
	cursorY += 30;

	// --- The rest of the sections (Summary, Experience, etc.) remain unchanged ---

	// --- Summary ---
	if (personalInfo.summary) {
		addSectionTitle(t.summary);
		doc.setFont(activeFont, "normal");
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
			doc.setFont(activeFont, "bold");
			doc.setFontSize(11);
			doc.text(job.position, margin, cursorY, {
				lang: isRtl ? "ar" : undefined,
			} as TextOptionsLight);
			const endDateText =
				job.endDate || (t as { [key: string]: string }).present || "Present";
			doc.text(
				`${job.startDate} - ${endDateText}`,
				contentWidth + margin,
				cursorY,
				{ align: "right", lang: isRtl ? "ar" : undefined } as TextOptionsLight
			);
			cursorY += 12;
			doc.setFont(activeFont, "normal");
			doc.setFontSize(10);
			doc.text(`${job.company}`, margin, cursorY, {
				lang: isRtl ? "ar" : undefined,
			} as TextOptionsLight);
			cursorY += 15;
			if (job.description) {
				doc.setFont(activeFont, "normal");
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
			doc.setFont(activeFont, "bold");
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
			doc.setFont(activeFont, "normal");
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
			doc.setFont(activeFont, "bold");
			doc.setFontSize(11);
			doc.text(proj.name, margin, cursorY, {
				lang: isRtl ? "ar" : undefined,
			} as TextOptionsLight);
			cursorY += 12;
			doc.setFont(activeFont, "normal");
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
		doc.setFont(activeFont, "normal");
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
