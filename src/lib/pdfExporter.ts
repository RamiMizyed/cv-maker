import jsPDF, { TextOptionsLight } from "jspdf";
// MODIFIED: Import the specific types you need
import { CVData, Experience, Project, Education } from "@/types/cv";
import translations from "@/lib/translations"; // Adjust path as needed
import GOOGLE_FONTS from "@/lib/fontList"; // Import your font list

// NEW: Define the missing ExportOptions interface
interface ExportOptions {
	cvData: CVData;
	lang: "en" | "ar" | "tr";
	filename: string;
	pageFormat: "a4" | "letter";
	orientation: "portrait" | "landscape";
}

// --- Helper function to get image dimensions (no changes needed here) ---
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

	const t = translations[lang];

	const isRtl = lang === "ar";

	const doc = new jsPDF({ orientation, unit: "pt", format: pageFormat }); // --- Font Management (No changes needed) ---

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
	doc.setFont(activeFont); // --- Page Setup and Styling Constants ---

	const pageHeight = doc.internal.pageSize.getHeight();
	const pageWidth = doc.internal.pageSize.getWidth();
	const margin = 40;
	const contentWidth = pageWidth - margin * 2;
	let cursorY = margin;

	const COLORS = {
		textDark: "#000000",
		textLight: "#4a5568", // Changed to a darker grey for better contrast
		primary: "#2b6cb0",
		line: "#e2e8f0",
		skillBg: "#ebf8ff",
	};

	doc.setTextColor(COLORS.textDark); // Set initial text color // --- Helper Functions ---

	const checkPageBreak = (spaceNeeded: number) => {
		if (cursorY + spaceNeeded > pageHeight - margin) {
			doc.addPage();
			cursorY = margin;
		}
	};

	const addSectionTitle = (title: string) => {
		checkPageBreak(40);
		doc.setFont(activeFont, "bold");
		doc.setFontSize(14);
		doc.setTextColor(COLORS.textDark);
		doc.text(title.toUpperCase(), margin, cursorY, {
			lang: isRtl ? "ar" : undefined,
		} as TextOptionsLight);
		cursorY += 8;
		doc.setDrawColor(COLORS.line);
		doc.setLineWidth(1);
		doc.line(margin, cursorY, contentWidth + margin, cursorY);
		cursorY += 20;
	};

	const addBulletedList = (text: string) => {
		doc.setFont(activeFont, "normal");
		doc.setFontSize(10);
		doc.setTextColor(COLORS.textLight);
		const bulletPoints = text.split("\n").filter((line) => line.trim() !== "");
		const bulletPointSpacing = 6;

		bulletPoints.forEach((point) => {
			const line = `• ${point.trim()}`;
			const splitLines = doc.splitTextToSize(line, contentWidth - 15);
			checkPageBreak(doc.getTextDimensions(splitLines).h + bulletPointSpacing);
			doc.text(splitLines, margin + 15, cursorY, {
				lang: isRtl ? "ar" : undefined,
			} as TextOptionsLight);
			cursorY += doc.getTextDimensions(splitLines).h + bulletPointSpacing / 2;
		});
	};

	const ensureAbsoluteUrl = (url?: string): string => {
		if (!url) return "";
		if (url.startsWith("https://") || url.startsWith("http://")) return url;
		return `https://${url}`;
	}; // --- Header Section ---

	checkPageBreak(180);

	if (personalInfo.portrait) {
		try {
			// Get image dimensions and scale it while maintaining aspect ratio
			const { width: originalWidth, height: originalHeight } =
				await getImageDimensions(personalInfo.portrait);
			const maxImgSize = 80;
			let imgWidth = maxImgSize;
			let imgHeight = maxImgSize;

			const ratio = originalWidth / originalHeight;

			if (ratio > 1) {
				// Landscape or wide square
				imgHeight = maxImgSize / ratio;
			} else if (ratio < 1) {
				// Portrait or tall square
				imgWidth = maxImgSize * ratio;
			} // Center the image

			const imgX = (pageWidth - imgWidth) / 2;

			doc.addImage(
				personalInfo.portrait,
				"JPEG", // Assuming the dataUrl is for a JPEG, change if necessary
				imgX,
				cursorY,
				imgWidth,
				imgHeight
			); // Advance cursor by the actual image height
			cursorY += imgHeight + 45;
		} catch (error) {
			console.error("Failed to add portrait image to PDF:", error);
		}
	} // FIX for White Text Issue: Re-assert the text color immediately after image drawing.

	doc.setTextColor(COLORS.textDark);

	doc.setFont(activeFont, "bold");
	doc.setFontSize(28);
	doc.text(personalInfo.name, pageWidth / 2, cursorY, { align: "center" });
	cursorY += doc.getTextDimensions(personalInfo.name).h;

	doc.setFont(activeFont, "normal");
	doc.setFontSize(16);
	doc.setTextColor(COLORS.textLight);
	doc.text(personalInfo.title, pageWidth / 2, cursorY, { align: "center" });
	cursorY += doc.getTextDimensions(personalInfo.title).h + 20;

	doc.setFontSize(9);
	const contactInfo = [
		{ text: personalInfo.email, link: `mailto:${personalInfo.email}` },
		{ text: personalInfo.phone, link: `tel:${personalInfo.phone}` },
		{
			text: personalInfo.website,
			link: ensureAbsoluteUrl(personalInfo.website),
		},
		{ text: personalInfo.github, link: ensureAbsoluteUrl(personalInfo.github) },
	].filter((item) => item.text && item.text.trim() !== "");

	const separator = "  •  ";
	const fullText = contactInfo.map((c) => c.text).join(separator);
	const textWidth = doc.getTextWidth(fullText);
	let currentX = (pageWidth - textWidth) / 2;

	contactInfo.forEach((item, index) => {
		if (!item.text) return;
		const itemWidth = doc.getTextWidth(item.text);
		doc.setTextColor(COLORS.primary);
		doc.textWithLink(item.text, currentX, cursorY, { url: item.link });
		currentX += itemWidth;

		if (index < contactInfo.length - 1) {
			doc.setTextColor(COLORS.textLight);
			doc.text(separator, currentX, cursorY);
			currentX += doc.getTextWidth(separator);
		}
	});
	cursorY += 35; // --- Summary Section ---

	if (personalInfo.summary) {
		addSectionTitle(t.summary);
		doc.setFont(activeFont, "normal");
		doc.setFontSize(10);
		doc.setTextColor(COLORS.textLight);
		const splitSummary = doc.splitTextToSize(
			personalInfo.summary,
			contentWidth
		);
		doc.text(splitSummary, margin, cursorY);
		cursorY += doc.getTextDimensions(splitSummary).h + 25;
	} // --- Experience Section ---

	if (experience && experience.length > 0) {
		addSectionTitle(t.experience); // MODIFIED: Added explicit type for 'job'
		experience.forEach((job: Experience) => {
			checkPageBreak(60);

			doc.setFont(activeFont, "bold");
			doc.setFontSize(11);
			doc.setTextColor(COLORS.textDark);
			doc.text(job.position, margin, cursorY);

			doc.setFont(activeFont, "normal");
			doc.setTextColor(COLORS.textLight); // NOTE: The (t as any).present is kept as is to suppress the TypeScript error,
			// while making sure the resulting text is visible (not white).
			const endDateText = job.endDate || (t as any).present || "Present";
			doc.text(
				`${job.startDate} - ${endDateText}`,
				contentWidth + margin,
				cursorY,
				{ align: "right" }
			);
			cursorY += 15;

			doc.setFont(activeFont, "italic");
			doc.setFontSize(10);
			doc.setTextColor(COLORS.primary);
			doc.text(job.company, margin, cursorY);
			cursorY += 20;

			if (job.description) {
				addBulletedList(job.description);
			}
			cursorY += 15;
		});
	} // --- Projects Section ---

	if (projects && projects.length > 0) {
		addSectionTitle(t.projects); // MODIFIED: Added explicit type for 'proj'
		projects.forEach((proj: Project) => {
			checkPageBreak(50);

			doc.setFont(activeFont, "bold");
			doc.setFontSize(11);
			doc.setTextColor(COLORS.textDark);
			doc.text(proj.name, margin, cursorY);

			if (proj.link) {
				const linkText = proj.link.replace(/^(https?:\/\/)?(www\.)?/, "");
				const linkWidth = doc.getTextWidth(linkText);
				doc.setFontSize(9);
				doc.setTextColor(COLORS.primary);
				doc.textWithLink(linkText, contentWidth + margin - linkWidth, cursorY, {
					url: ensureAbsoluteUrl(proj.link),
				});
			}
			cursorY += 15;

			doc.setFont(activeFont, "italic");
			doc.setFontSize(10);
			doc.setTextColor(COLORS.primary);
			doc.text(proj.technologies, margin, cursorY);
			cursorY += 20;

			if (proj.description) {
				addBulletedList(proj.description);
			}
			cursorY += 15;
		});
	} // --- Education Section ---

	if (education && education.length > 0) {
		addSectionTitle(t.education); // MODIFIED: Added explicit type for 'edu'
		education.forEach((edu: Education) => {
			checkPageBreak(40);
			doc.setFont(activeFont, "bold");
			doc.setFontSize(11);
			doc.setTextColor(COLORS.textDark);
			doc.text(edu.degree, margin, cursorY);

			doc.setFont(activeFont, "normal");
			doc.setTextColor(COLORS.textLight);
			doc.text(
				`${edu.startDate} - ${edu.endDate}`,
				contentWidth + margin,
				cursorY,
				{ align: "right" }
			);
			cursorY += 15;

			doc.setFont(activeFont, "normal");
			doc.setFontSize(10);
			doc.setTextColor(COLORS.primary);
			doc.text(edu.institution, margin, cursorY);
			cursorY += 25;
		});
	} // --- Skills Section ---

	if (skills) {
		addSectionTitle(t.skills);
		doc.setFont(activeFont, "normal");
		doc.setFontSize(9);

		const skillPills = skills
			.split(",")
			.map((s) => s.trim())
			.filter((s) => s);
		const pillPaddingX = 10;
		const pillPaddingY = 5;
		const pillHeight = doc.getTextDimensions("T").h + pillPaddingY * 2;
		const pillGap = 8;
		let currentX = margin;

		checkPageBreak(pillHeight + pillGap); // MODIFIED: Added explicit type for 'skill'

		skillPills.forEach((skill: string) => {
			const textWidth = doc.getTextWidth(skill);
			const pillWidth = textWidth + pillPaddingX * 2;

			if (currentX + pillWidth > pageWidth - margin) {
				cursorY += pillHeight + pillGap;
				currentX = margin;
				checkPageBreak(pillHeight + pillGap);
			}

			doc.setFillColor(COLORS.skillBg);
			doc.roundedRect(currentX, cursorY, pillWidth, pillHeight, 5, 5, "F");

			doc.setTextColor(COLORS.primary);
			doc.text(skill, currentX + pillPaddingX, cursorY + pillHeight / 2, {
				baseline: "middle",
			});

			currentX += pillWidth + pillGap;
		});
		cursorY += pillHeight + 20;
	} // --- Save File ---

	const defaultFilename = `${
		personalInfo.name.replace(/\s+/g, "_") || "CV"
	}.pdf`;
	doc.save(filename || defaultFilename);
};
