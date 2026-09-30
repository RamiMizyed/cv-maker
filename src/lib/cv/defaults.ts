import {
	CV_SCHEMA_VERSION,
	DocLang,
	CVData,
	CVSettings,
	ListItem,
	ListSectionKey,
	SectionConfig,
	SectionId,
} from "@/types/cv";

export const uid = (): string => {
	if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
		return crypto.randomUUID();
	}
	return Math.random().toString(36).slice(2) + Date.now().toString(36);
};

export const SECTION_ORDER: SectionId[] = [
	"summary",
	"experience",
	"projects",
	"education",
	"skills",
	"languages",
	"certifications",
];

export const defaultSections = (): SectionConfig[] =>
	SECTION_ORDER.map((id) => ({ id, visible: true, title: "" }));

export const ACCENT_PRESETS = [
	"#e11d48", // rose
	"#2563eb", // blue
	"#0f766e", // teal
	"#7c3aed", // violet
	"#c2410c", // orange
	"#334155", // slate
	"#111111", // ink
];

export const defaultSettings = (
	font = "Roboto",
	language: DocLang = "en",
): CVSettings => ({
	template: "classic",
	language,
	accentColor: ACCENT_PRESETS[0],
	font,
	fontSize: 10,
	spacing: "normal",
	pageFormat: "a4",
	showPhoto: true,
	sections: defaultSections(),
});

export const emptyItem = <K extends ListSectionKey>(key: K): ListItem<K> => {
	const id = uid();
	const items: { [P in ListSectionKey]: ListItem<P> } = {
		experience: {
			id,
			company: "",
			companyUrl: "",
			position: "",
			location: "",
			startDate: "",
			endDate: "",
			description: "",
		},
		education: {
			id,
			institution: "",
			degree: "",
			startDate: "",
			endDate: "",
			details: "",
		},
		projects: { id, name: "", link: "", technologies: "", description: "" },
		languages: { id, name: "", level: "" },
		certifications: { id, name: "", issuer: "", date: "", link: "" },
	};
	return items[key];
};

export const emptyCV = (font?: string, language?: DocLang): CVData => ({
	version: CV_SCHEMA_VERSION,
	personalInfo: {
		name: "",
		title: "",
		email: "",
		phone: "",
		location: "",
		website: "",
		github: "",
		linkedin: "",
		summary: "",
		portrait: "",
	},
	experience: [emptyItem("experience")],
	education: [emptyItem("education")],
	projects: [],
	skills: [],
	languages: [],
	certifications: [],
	settings: defaultSettings(font, language),
});

/** A clearly fictional example so first-time visitors see a full CV. */
export const sampleCV = (font?: string): CVData => ({
	version: CV_SCHEMA_VERSION,
	personalInfo: {
		name: "Alex Morgan",
		title: "Senior Frontend Engineer",
		email: "alex.morgan@example.com",
		phone: "+1 555 0100",
		location: "Lisbon, Portugal",
		website: "alexmorgan.example.com",
		github: "github.com/alexmorgan-example",
		linkedin: "",
		summary:
			"Frontend engineer with 7 years of experience building fast, accessible web products with React, Next.js and TypeScript. I have led small teams, rebuilt legacy dashboards, and care about the details that make an interface feel effortless.",
		portrait: "",
	},
	experience: [
		{
			id: uid(),
			company: "Lumen Analytics",
			companyUrl: "",
			position: "Senior Frontend Engineer",
			location: "Remote",
			startDate: "2022",
			endDate: "Present",
			description:
				"Led the rebuild of the customer dashboard in Next.js, cutting median load time from 4.1s to 1.3s\n" +
				"Introduced a shared component library used by 4 product teams, reducing UI bugs by roughly 30%\n" +
				"Mentored 3 junior engineers through code review, pairing and a weekly frontend guild",
		},
		{
			id: uid(),
			company: "Harbor & Pine Studio",
			companyUrl: "",
			position: "Frontend Developer",
			location: "Porto, Portugal",
			startDate: "2019",
			endDate: "2022",
			description:
				"Shipped 20+ marketing sites and web apps for clients in retail, travel and education\n" +
				"Made accessibility audits part of every release, bringing all flagship sites to WCAG 2.1 AA\n" +
				"Worked directly with designers in Figma to prototype interactions before development",
		},
	],
	projects: [
		{
			id: uid(),
			name: "Open Recipe Box",
			link: "",
			technologies: "React, IndexedDB, PWA",
			description:
				"Offline-first recipe manager with 2,000 monthly users and full keyboard navigation",
		},
	],
	education: [
		{
			id: uid(),
			institution: "University of Porto",
			degree: "BSc Computer Science",
			startDate: "2015",
			endDate: "2019",
			details: "",
		},
	],
	skills: [
		"TypeScript",
		"React",
		"Next.js",
		"Node.js",
		"Accessibility (WCAG)",
		"Performance",
		"Design Systems",
		"Figma",
	],
	languages: [
		{ id: uid(), name: "English", level: "Native" },
		{ id: uid(), name: "Portuguese", level: "Professional" },
	],
	certifications: [],
	settings: defaultSettings(font),
});
