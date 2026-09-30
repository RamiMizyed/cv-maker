import {
	CV_SCHEMA_VERSION,
	CVData,
	CVSettings,
	SectionConfig,
	SectionId,
	TemplateId,
} from "@/types/cv";
import { defaultSettings, SECTION_ORDER, uid } from "./defaults";

/* eslint-disable @typescript-eslint/no-explicit-any */

const str = (v: unknown, max = 5000): string =>
	typeof v === "string" ? v.slice(0, max) : typeof v === "number" ? String(v) : "";

const lines = (v: unknown): string =>
	Array.isArray(v) ? v.map((x) => str(x)).filter(Boolean).join("\n") : str(v);

const arr = (v: unknown): any[] => (Array.isArray(v) ? v.slice(0, 50) : []);

/** Keeps existing string ids (so AI suggestions map back to entries), replacing missing or duplicate ones. */
const withIds = <T,>(items: any[], build: (e: any) => T): (T & { id: string })[] => {
	const seen = new Set<string>();
	return items.map((e) => {
		let id = typeof e?.id === "string" && e.id ? e.id.slice(0, 64) : "";
		if (!id || seen.has(id)) id = uid();
		seen.add(id);
		return { ...build(e), id };
	});
};

const TEMPLATES: TemplateId[] = ["classic", "modern", "minimal", "ats"];

const splitSkills = (v: unknown): string[] => {
	const raw = Array.isArray(v)
		? v.flatMap((s: any) =>
				typeof s === "string" ? [s] : Array.isArray(s?.items) ? s.items : [s?.name],
			)
		: str(v).split(",");
	const seen = new Set<string>();
	const out: string[] = [];
	for (const s of raw) {
		const t = str(s, 80).trim();
		if (t && !seen.has(t.toLowerCase())) {
			seen.add(t.toLowerCase());
			out.push(t);
		}
	}
	return out.slice(0, 60);
};

const normalizeSections = (v: unknown): SectionConfig[] => {
	const given = arr(v).filter(
		(s: any) => s && SECTION_ORDER.includes(s.id as SectionId),
	);
	const seen = new Set<SectionId>();
	const out: SectionConfig[] = [];
	for (const s of given) {
		if (seen.has(s.id)) continue;
		seen.add(s.id);
		out.push({ id: s.id, visible: s.visible !== false, title: str(s.title, 60) });
	}
	// Append any section missing from older saves so nothing is lost.
	for (const id of SECTION_ORDER) {
		if (!seen.has(id)) out.push({ id, visible: true, title: "" });
	}
	return out;
};

const normalizeSettings = (v: any, fallbackFont: string): CVSettings => {
	const d = defaultSettings(fallbackFont);
	const s = v && typeof v === "object" ? v : {};
	const size = Number(s.fontSize);
	return {
		template: TEMPLATES.includes(s.template) ? s.template : d.template,
		language: ["en", "tr", "ar"].includes(s.language) ? s.language : d.language,
		accentColor: /^#[0-9a-f]{6}$/i.test(s.accentColor) ? s.accentColor : d.accentColor,
		font: str(s.font, 60) || d.font,
		fontSize: size >= 8 && size <= 13 ? size : d.fontSize,
		spacing: ["compact", "normal", "relaxed"].includes(s.spacing) ? s.spacing : d.spacing,
		pageFormat: s.pageFormat === "letter" ? "letter" : "a4",
		showPhoto: s.showPhoto !== false,
		sections: normalizeSections(s.sections),
	};
};

/**
 * Accepts anything that looks like a CV and returns a valid v2 CVData:
 * - v2 CVData (current)
 * - v1 CVData (numeric ids, skills as a comma string, top-level selectedFont)
 * - the older "resume-json" export (meta.format === "resume-json")
 * - partial objects returned by the AI importer
 * Returns null when the input is not recognisable at all.
 */
export function normalizeCV(input: unknown, fallbackFont = "Roboto"): CVData | null {
	if (!input || typeof input !== "object") return null;
	const p = input as any;

	if (p.meta?.format === "resume-json") return fromResumeJson(p, fallbackFont);

	const info = p.personalInfo;
	if (!info || typeof info !== "object") return null;

	const settings = normalizeSettings(
		p.settings ?? { font: p.selectedFont },
		str(p.selectedFont) || fallbackFont,
	);

	return {
		version: CV_SCHEMA_VERSION,
		personalInfo: {
			name: str(info.name, 120),
			title: str(info.title, 160),
			email: str(info.email, 120),
			phone: str(info.phone, 60),
			location: str(info.location, 120),
			website: str(info.website, 200),
			github: str(info.github, 200),
			linkedin: str(info.linkedin, 200),
			summary: str(info.summary, 3000),
			// Old saves pointed at a demo image that no longer ships.
			portrait:
				typeof info.portrait === "string" &&
				(info.portrait.startsWith("data:image/") || info.portrait.startsWith("/")) &&
				info.portrait !== "/assets/Cat_01.png"
					? info.portrait
					: "",
		},
		experience: withIds(arr(p.experience), (e: any) => ({
			company: str(e?.company, 160),
			companyUrl: str(e?.companyUrl, 200),
			position: str(e?.position, 160),
			location: str(e?.location, 120),
			startDate: str(e?.startDate, 40),
			endDate: str(e?.endDate, 40),
			description: lines(e?.description ?? e?.highlights),
		})),
		education: withIds(arr(p.education), (e: any) => ({
			institution: str(e?.institution, 160),
			degree: str(e?.degree, 160),
			startDate: str(e?.startDate, 40),
			endDate: str(e?.endDate, 40),
			details: lines(e?.details),
		})),
		projects: withIds(arr(p.projects), (e: any) => ({
			name: str(e?.name, 160),
			link: str(e?.link ?? e?.url, 200),
			technologies: Array.isArray(e?.technologies)
				? e.technologies.join(", ")
				: str(e?.technologies, 200),
			description: lines(e?.description ?? e?.highlights),
		})),
		skills: splitSkills(p.skills),
		languages: withIds(arr(p.languages), (e: any) => ({
			name: str(e?.name ?? e?.language, 60),
			level: str(e?.level ?? e?.fluency, 60),
		})),
		certifications: withIds(arr(p.certifications), (e: any) => ({
			name: str(e?.name, 160),
			issuer: str(e?.issuer, 160),
			date: str(e?.date, 40),
			link: str(e?.link ?? e?.url, 200),
		})),
		settings,
	};
}

function fromResumeJson(p: any, fallbackFont: string): CVData | null {
	const basics = p.basics || {};
	const github =
		arr(basics.profiles).find((x: any) => str(x?.network).toLowerCase() === "github")
			?.url || basics.github;
	return normalizeCV(
		{
			personalInfo: {
				name: basics.name,
				title: basics.headline,
				email: basics.email,
				phone: basics.phone,
				website: basics.website,
				github,
				summary: p.summary,
			},
			experience: p.experience,
			education: arr(p.education).map((x: any) => ({
				...x,
				degree: [x?.studyType, x?.area].filter(Boolean).join(" - "),
			})),
			projects: arr(p.projects).map((x: any) => ({ ...x, technologies: x?.tech })),
			skills: p.skills,
		},
		fallbackFont,
	);
}
