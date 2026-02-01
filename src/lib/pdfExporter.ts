import jsPDF from "jspdf";
import { CVData, Experience, Project, Education } from "@/types/cv";
import translations from "@/lib/translations";
import GOOGLE_FONTS from "@/lib/fontList";

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

	const t = translations[lang];
	const isRtl = lang === "ar";
	const doc = new jsPDF({ orientation, unit: "pt", format: pageFormat });

	// --- Font Management (Omitted for brevity, no changes) ---
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
						"",
					),
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
						"",
					),
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

	// --- Page Setup and Styling Constants ---
	const pageHeight = doc.internal.pageSize.getHeight();
	const pageWidth = doc.internal.pageSize.getWidth();
	const margin = 40;
	const contentWidth = pageWidth - margin * 2;
	let cursorY = margin;

	const COLORS = {
		textDark: "#1a202c",
		textLight: "#4a5568",
		primary: "#2b6cb0",
		line: "#e2e8f0",
		skillBg: "#ebf8ff",
	};

	const SPACING = {
		sectionTitleBottom: 20,
		sectionBottom: 35,
		itemGap: 22,
		headingLine: 15,
		subheadingBottom: 15,
		companyToBullets: 10, // ✅ extra breathing room between company line and bullets
		bulletItem: 8,
		paragraph: 12,
		headerBottom: 35,
	};

	doc.setTextColor(COLORS.textDark);

	// --- Helper Functions ---
	const checkPageBreak = (spaceNeeded: number) => {
		if (cursorY + spaceNeeded > pageHeight - margin) {
			doc.addPage();
			cursorY = margin;
			return true;
		}
		return false;
	};

	const addSectionTitle = (title: string) => {
		checkPageBreak(40);
		doc.setFont(activeFont, "bold");
		doc.setFontSize(14);
		doc.setTextColor(COLORS.textDark);
		doc.text(title.toUpperCase(), margin, cursorY);
		cursorY += 8;
		doc.setDrawColor(COLORS.line);
		doc.setLineWidth(1);
		doc.line(margin, cursorY, contentWidth + margin, cursorY);
		cursorY += SPACING.sectionTitleBottom;
	};

	const addBulletedList = (text: string) => {
		doc.setFont(activeFont, "normal");
		doc.setFontSize(10);
		doc.setTextColor(COLORS.textLight);
		const bulletPoints = text.split("\n").filter((line) => line.trim() !== "");
		bulletPoints.forEach((point) => {
			const line = `•  ${point.trim()}`;
			const splitLines = doc.splitTextToSize(line, contentWidth - 15);
			const textHeight = doc.getTextDimensions(splitLines).h;
			checkPageBreak(textHeight + SPACING.bulletItem);
			doc.text(splitLines, margin + 15, cursorY);
			cursorY += textHeight + SPACING.bulletItem;
		});
	};

	const ensureAbsoluteUrl = (url?: string): string => {
		if (!url) return "";
		if (url.startsWith("https://") || url.startsWith("http://")) return url;
		return `https://${url}`;
	};

	const displayUrl = (url: string) =>
		url
			.replace(/^https?:\/\//i, "")
			.replace(/^www\./i, "")
			.replace(/\/+$/g, "");

	const truncateToWidth = (text: string, maxWidth: number) => {
		if (doc.getTextWidth(text) <= maxWidth) return text;
		let t = text;
		while (t.length > 3 && doc.getTextWidth(`${t}…`) > maxWidth) {
			t = t.slice(0, -1);
		}
		return `${t}…`;
	};

	// ✨ Smart footer
	const addFooter = () => {
		const footerText =
			"This CV was made with https://cvmaker.ramimizyed.dev/ - Open Source CV Maker";
		const footerFontSize = 8;
		const footerColor = "#718096";

		doc.setPage(doc.getNumberOfPages());

		const desiredY = cursorY + 40;
		const maxY = pageHeight - 20;
		const finalY = Math.min(desiredY, maxY);

		doc.setFontSize(footerFontSize);
		doc.setTextColor(footerColor);
		doc.setFont(activeFont, "normal");
		doc.text(footerText, pageWidth / 2, finalY, { align: "center" });
	};

	// --- Header Section ---
	doc.setTextColor(COLORS.textDark);
	doc.setFont(activeFont, "bold");
	doc.setFontSize(28);
	doc.text(personalInfo.name, pageWidth / 2, cursorY, { align: "center" });
	cursorY += doc.getTextDimensions(personalInfo.name).h - 8;

	doc.setFont(activeFont, "normal");
	doc.setFontSize(16);
	doc.setTextColor(COLORS.textLight);
	doc.text(personalInfo.title, pageWidth / 2, cursorY, { align: "center" });
	cursorY += doc.getTextDimensions(personalInfo.title).h + 15;

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

	const separator = "   •   ";
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

	cursorY += SPACING.headerBottom;

	// --- Summary Section (boxed) ---
	if (personalInfo.summary) {
		addSectionTitle(t.summary);

		doc.setFont(activeFont, "normal");
		doc.setFontSize(10);
		doc.setTextColor(COLORS.textLight);

		const padding = 12;
		const splitSummary = doc.splitTextToSize(
			personalInfo.summary,
			contentWidth - padding * 2,
		);
		const summaryTextHeight = doc.getTextDimensions(splitSummary).h;
		const boxH = summaryTextHeight + padding * 2;

		checkPageBreak(boxH + SPACING.sectionBottom);

		// Box: 5px solid black, 10px radius
		doc.setDrawColor("#000000");
		doc.setLineWidth(5);
		doc.roundedRect(margin, cursorY, contentWidth, boxH, 10, 10, "S");

		// Text inside box
		doc.setTextColor(COLORS.textLight);
		doc.setFont(activeFont, "normal");
		doc.text(splitSummary, margin + padding, cursorY + padding + 10);

		cursorY += boxH + SPACING.sectionBottom;

		// Restore defaults
		doc.setLineWidth(1);
		doc.setDrawColor(COLORS.line);
		doc.setTextColor(COLORS.textDark);
	}

	// --- Experience Section (company link + URL on right + extra spacing) ---
	if (experience && experience.length > 0) {
		addSectionTitle(t.experience);

		experience.forEach((job: Experience, index) => {
			// Estimate space needed (position line + dates line + company line + spacing + bullets)
			const headingHeight =
				SPACING.headingLine * 2 + SPACING.companyToBullets + 6;

			let descriptionHeight = 0;
			if (job.description) {
				const splitLines = doc.splitTextToSize(
					job.description,
					contentWidth - 15,
				);
				descriptionHeight = doc.getTextDimensions(splitLines).h;
			}

			if (checkPageBreak(headingHeight + descriptionHeight)) {
				addSectionTitle(t.experience);
			}

			// Position + dates
			doc.setFont(activeFont, "bold");
			doc.setFontSize(11);
			doc.setTextColor(COLORS.textDark);
			doc.text(job.position, margin, cursorY);

			doc.setFont(activeFont, "normal");
			doc.setTextColor(COLORS.textLight);
			const endDateText = job.endDate || t.present || "Present";
			doc.text(
				`${job.startDate} - ${endDateText}`,
				contentWidth + margin,
				cursorY,
				{
					align: "right",
				},
			);

			cursorY += SPACING.headingLine;

			// Company line (left company name as link + right URL like Projects)
			doc.setFont(activeFont, "italic");
			doc.setFontSize(10);
			doc.setTextColor(COLORS.primary);

			const companyUrlAbs = ensureAbsoluteUrl((job as any).companyUrl);
			const companyUrlText = companyUrlAbs ? displayUrl(companyUrlAbs) : "";

			// Prevent overlap: reserve width for URL on the right if present
			const rightWidth = companyUrlText ? doc.getTextWidth(companyUrlText) : 0;
			const leftMaxWidth = companyUrlText
				? contentWidth - rightWidth - 12
				: contentWidth;

			const companyText = truncateToWidth(job.company, leftMaxWidth);

			if (companyUrlAbs) {
				// left: company name clickable
				doc.textWithLink(companyText, margin, cursorY, { url: companyUrlAbs });

				// right: URL clickable (like projects)
				const linkWidth = doc.getTextWidth(companyUrlText);
				doc.setFontSize(9); // match your project link style
				doc.textWithLink(
					companyUrlText,
					contentWidth + margin - linkWidth,
					cursorY,
					{
						url: companyUrlAbs,
					},
				);
				doc.setFontSize(10); // restore for consistency
			} else {
				doc.text(companyText, margin, cursorY);
			}

			// ✅ more space before bullets
			cursorY += SPACING.headingLine + SPACING.companyToBullets;

			// Bullets
			if (job.description) {
				addBulletedList(job.description);
			}

			if (index < experience.length - 1) {
				cursorY += SPACING.itemGap;
			} else {
				cursorY += SPACING.sectionBottom;
			}
		});
	}

	// --- Projects Section ---
	if (projects && projects.length > 0) {
		addSectionTitle(t.projects);

		projects.forEach((proj: Project, index) => {
			checkPageBreak(60);

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

			cursorY += SPACING.headingLine;

			doc.setFont(activeFont, "italic");
			doc.setFontSize(10);
			doc.setTextColor(COLORS.primary);
			doc.text(proj.technologies, margin, cursorY);

			cursorY += SPACING.subheadingBottom;

			if (proj.description) {
				addBulletedList(proj.description);
			}

			if (index < projects.length - 1) {
				cursorY += SPACING.itemGap;
			} else {
				cursorY += SPACING.sectionBottom;
			}
		});
	}

	// --- Education Section ---
	if (education && education.length > 0) {
		addSectionTitle(t.education);

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
				{
					align: "right",
				},
			);

			cursorY += SPACING.headingLine;

			doc.setFont(activeFont, "normal");
			doc.setFontSize(10);
			doc.setTextColor(COLORS.primary);
			doc.text(edu.institution, margin, cursorY);

			cursorY += SPACING.sectionBottom;
		});
	}

	// --- Skills Section ---
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
		checkPageBreak(pillHeight + pillGap);

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
	}

	// --- Finalize and Save ---
	addFooter();

	const defaultFilename = `${
		personalInfo.name.replace(/\s+/g, "_") || "CV"
	}.pdf`;
	doc.save(filename || defaultFilename);
};
