// components/cv-maker/types.ts

export type TabId =
	| "fonts"
	| "personal"
	| "experience"
	| "education"
	| "skills"
	| "projects";

export interface PersonalInfo {
	name: string;
	title: string;
	email: string;
	phone: string;
	github?: string;
	website: string;
	summary: string;
	portrait: string;
}

export interface Project {
	id: number;
	name: string;
	description: string;
	link: string;
	technologies: string;
}

export interface Experience {
	id: number;
	company: string;
	position: string;
	startDate: string;
	endDate: string;
	description: string;
}

export interface Education {
	id: number;
	institution: string;
	degree: string;
	startDate: string;
	endDate: string;
}

export interface CVData {
	personalInfo: PersonalInfo;
	experience: Experience[];
	education: Education[];
	projects: Project[];
	skills: string;
	selectedFont: string;
}
