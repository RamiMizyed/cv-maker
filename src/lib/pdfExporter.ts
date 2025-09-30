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

// --- Helper function to get image dimensions while preserving aspect ratio ---
const getImageDimensions = (
	dataUrl: string
): Promise<{ width: number; height: number }> => {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.onload = () => {
			resolve({ width: img.width, height: img.height });
		};
		img.onerror = (err) => {
			console.error("Failed to load image for dimension reading.", err);
			reject(err);
		};
		img.src = dataUrl;
	});
};

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
	// (This is your original font management logic. It can be further refactored
	// into a helper function to reduce repetition if desired).
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

	// --- Helper for rendering bulleted descriptions with proper spacing ---
	const addBulletedList = (text: string) => {
		const bulletPoints = text.split("\n").filter((line) => line.trim() !== "");
		const bulletPointSpacing = 5; // Additional vertical space between bullet points

		bulletPoints.forEach((point) => {
			const line = `• ${point.trim()}`;
			// Indent bullet points slightly from the margin
			const splitLines = doc.splitTextToSize(line, contentWidth - 10);

			checkPageBreak(doc.getTextDimensions(splitLines).h + bulletPointSpacing);

			doc.text(splitLines, margin + 10, cursorY, {
				lang: isRtl ? "ar" : undefined,
			} as TextOptionsLight);

			cursorY += doc.getTextDimensions(splitLines).h + bulletPointSpacing;
		});
	};

	// --- Header ---
	checkPageBreak(150);

	// ** FIXED: Add Portrait Image, preserving aspect ratio **
	if (personalInfo.portrait) {
		const MAX_WIDTH = 100;
		const MAX_HEIGHT = 100;

		try {
			const { width, height } = await getImageDimensions(personalInfo.portrait);
			const aspectRatio = width / height;

			let imgWidth = MAX_WIDTH;
			let imgHeight = MAX_WIDTH / aspectRatio;

			if (imgHeight > MAX_HEIGHT) {
				imgHeight = MAX_HEIGHT;
				imgWidth = MAX_HEIGHT * aspectRatio;
			}

			const imgX = (pageWidth - imgWidth) / 2; // Center the image
			doc.addImage(
				personalInfo.portrait,
				"JPEG", // Can be 'PNG', 'WEBP', etc. depending on image data
				imgX,
				cursorY,
				imgWidth,
				imgHeight
			);
			cursorY += imgHeight + 15;
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
	cursorY += doc.getTextDimensions(personalInfo.title).h + 10;

	// ** IMPROVED: Contact Info with Clickable Links **
	doc.setFontSize(10);
	const ensureAbsoluteUrl = (url?: string): string => {
		if (!url) return "";
		// If it already has a protocol, leave it as is.
		if (url.startsWith("https://") || url.startsWith("http://")) {
			return url;
		}
		// Otherwise, add the protocol.
		return `https://${url}`;
	};
	const contactInfo = [
		{ text: personalInfo.phone, link: `tel:${personalInfo.phone}` },
		{ text: personalInfo.email, link: `mailto:${personalInfo.email}` },
		{
			text: personalInfo.website,
			link: ensureAbsoluteUrl(personalInfo.website),
		},
		{ text: personalInfo.github, link: ensureAbsoluteUrl(personalInfo.github) },
	].filter((item) => item.text && item.text.trim() !== "");

	const separator = " | ";
	const fullText = contactInfo.map((c) => c.text).join(separator);
	const textWidth = doc.getTextWidth(fullText);
	let currentX = (pageWidth - textWidth) / 2;

	contactInfo.forEach((item, index) => {
		if (!item.text) return;
		const itemWidth = doc.getTextWidth(item.text);

		doc.setTextColor("#0000EE"); // Standard link blue
		doc.textWithLink(item.text, currentX, cursorY, { url: item.link });
		doc.setTextColor("#000000"); // Reset to black

		currentX += itemWidth;

		if (index < contactInfo.length - 1) {
			doc.text(separator, currentX, cursorY);
			currentX += doc.getTextWidth(separator);
		}
	});
	cursorY += 30;

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
				job.endDate || ("present" in t && t.present) || "Present";
			doc.text(
				`${job.startDate} - ${endDateText}`,
				contentWidth + margin,
				cursorY,
				{ align: "right", lang: isRtl ? "ar" : undefined } as TextOptionsLight
			);

			cursorY += 12;
			doc.setFont(activeFont, "normal");
			doc.setFontSize(10);
			doc.text(job.company, margin, cursorY, {
				lang: isRtl ? "ar" : undefined,
			} as TextOptionsLight);
			cursorY += 15;

			// ** FIXED: Use bulleted list helper for descriptions **
			if (job.description) {
				doc.setFont(activeFont, "normal");
				doc.setFontSize(10);
				addBulletedList(job.description);
			}
			cursorY += 10; // Extra space after the entire job entry
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
			doc.text(edu.institution, margin, cursorY, {
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
			cursorY += 15;

			if (proj.description) {
				doc.setFont(activeFont, "normal");
				doc.setFontSize(10);
				// Use the bullet helper here too if descriptions can have multiple lines
				addBulletedList(proj.description);
			}
			cursorY += 10;
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
