// types/cv.ts

export const CV_SCHEMA_VERSION = 2;

export type DocLang = "en" | "tr" | "ar";

export type TemplateId = "classic" | "modern" | "minimal" | "ats";

export type SectionId =
	| "summary"
	| "experience"
	| "projects"
	| "education"
	| "skills"
	| "languages"
	| "certifications";

export interface SectionConfig {
	id: SectionId;
	visible: boolean;
	/** Custom heading. Empty string means "use the translated default". */
	title: string;
}

export interface PersonalInfo {
	name: string;
	title: string;
	email: string;
	phone: string;
	location: string;
	website: string;
	github: string;
	linkedin: string;
	summary: string;
	/** Data URL or public path. Empty string means no photo. */
	portrait: string;
}

export interface Experience {
	id: string;
	company: string;
	companyUrl: string;
	position: string;
	location: string;
	startDate: string;
	endDate: string;
	/** One bullet per line. */
	description: string;
}

export interface Education {
	id: string;
	institution: string;
	degree: string;
	startDate: string;
	endDate: string;
	details: string;
}

export interface Project {
	id: string;
	name: string;
	link: string;
	technologies: string;
	/** One bullet per line. */
	description: string;
}

export interface LanguageSkill {
	id: string;
	name: string;
	level: string;
}

export interface Certification {
	id: string;
	name: string;
	issuer: string;
	date: string;
	link: string;
}

export interface CVSettings {
	template: TemplateId;
	/** Language of the CV itself (headings, text direction). Independent of the UI language. */
	language: DocLang;
	accentColor: string;
	font: string;
	/** Base font size in pt. */
	fontSize: number;
	spacing: "compact" | "normal" | "relaxed";
	pageFormat: "a4" | "letter";
	showPhoto: boolean;
	sections: SectionConfig[];
}

export interface CVData {
	version: typeof CV_SCHEMA_VERSION;
	personalInfo: PersonalInfo;
	experience: Experience[];
	education: Education[];
	projects: Project[];
	skills: string[];
	languages: LanguageSkill[];
	certifications: Certification[];
	settings: CVSettings;
}

/** Sections that hold a list of entries the user can add, remove and reorder. */
export type ListSectionKey =
	| "experience"
	| "education"
	| "projects"
	| "languages"
	| "certifications";

export type ListItem<K extends ListSectionKey> = CVData[K][number];
