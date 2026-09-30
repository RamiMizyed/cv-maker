// components/cv-maker/document/CVDocument.tsx
// The single renderer for a CV. The on-screen preview and the printed PDF both
// use this component, so what you see is exactly what you download.
import React from "react";
import {
	Github,
	Globe,
	Linkedin,
	Mail,
	MapPin,
	Phone,
	type LucideIcon,
} from "lucide-react";
import { CVData, SectionConfig, SectionId } from "@/types/cv";
import translations, { Translation } from "@/lib/translations";
import { absUrl, displayUrl, toBullets } from "@/lib/cv/format";
import "./cv-document.css";

// ---------------- helpers ----------------

const dateRange = (start: string, end: string, t: Translation) => {
	const s = start.trim();
	const e = end.trim();
	if (!s && !e) return "";
	if (!e) return `${s} - ${t.present}`;
	if (!s) return e;
	return `${s} - ${e}`;
};

const SIDE_SECTIONS: SectionId[] = ["skills", "languages", "certifications"];

const sectionTitle = (s: SectionConfig, t: Translation) =>
	s.title.trim() || t[s.id];

/** A section with no content is skipped entirely instead of printing an empty heading. */
const hasContent = (id: SectionId, cv: CVData): boolean => {
	switch (id) {
		case "summary":
			return !!cv.personalInfo.summary.trim();
		case "skills":
			return cv.skills.length > 0;
		case "experience":
			return cv.experience.some((e) => e.position || e.company || e.description);
		case "education":
			return cv.education.some((e) => e.institution || e.degree);
		case "projects":
			return cv.projects.some((e) => e.name || e.description);
		case "languages":
			return cv.languages.some((e) => e.name);
		case "certifications":
			return cv.certifications.some((e) => e.name);
	}
};

// ---------------- building blocks ----------------

const Link = ({ href, children }: { href: string; children: React.ReactNode }) =>
	href ? (
		<a href={href} target="_blank" rel="noopener noreferrer">
			{children}
		</a>
	) : (
		<>{children}</>
	);

type ContactItem = { icon: LucideIcon; text: string; href: string };

const contactItems = (cv: CVData): ContactItem[] => {
	const p = cv.personalInfo;
	const items: ContactItem[] = [
		{ icon: Mail, text: p.email, href: p.email ? `mailto:${p.email.trim()}` : "" },
		{ icon: Phone, text: p.phone, href: p.phone ? `tel:${p.phone.replace(/[^\d+]/g, "")}` : "" },
		{ icon: MapPin, text: p.location, href: "" },
		{ icon: Globe, text: displayUrl(p.website), href: absUrl(p.website) },
		{ icon: Linkedin, text: displayUrl(p.linkedin), href: absUrl(p.linkedin) },
		{ icon: Github, text: displayUrl(p.github), href: absUrl(p.github) },
	];
	return items.filter((i) => i.text.trim());
};

const Contacts = ({
	cv,
	icons = true,
	className = "cv-contacts",
}: {
	cv: CVData;
	icons?: boolean;
	className?: string;
}) => {
	const items = contactItems(cv);
	if (!items.length) return null;
	return (
		<ul className={className}>
			{items.map(({ icon: Icon, text, href }) => (
				<li key={text}>
					{icons && <Icon aria-hidden className="cv-icon" />}
					<Link href={href}>
						<span dir="ltr">{text}</span>
					</Link>
				</li>
			))}
		</ul>
	);
};

const Photo = ({ cv }: { cv: CVData }) =>
	cv.settings.showPhoto && cv.personalInfo.portrait ? (
		// eslint-disable-next-line @next/next/no-img-element
		<img className="cv-photo" src={cv.personalInfo.portrait} alt="" />
	) : null;

const Bullets = ({ text }: { text: string }) => {
	const items = toBullets(text);
	if (!items.length) return null;
	return (
		<ul className="cv-bullets">
			{items.map((b, i) => (
				<li key={i}>{b}</li>
			))}
		</ul>
	);
};

const EntryHead = ({
	title,
	subtitle,
	subtitleHref,
	meta,
	metaSub,
}: {
	title: string;
	subtitle?: string;
	subtitleHref?: string;
	meta?: React.ReactNode;
	metaSub?: string;
}) => (
	<div className="cv-entry-head">
		<div className="cv-entry-main">
			{title && <h3 className="cv-entry-title">{title}</h3>}
			{subtitle && (
				<p className="cv-entry-sub">
					<Link href={subtitleHref || ""}>{subtitle}</Link>
				</p>
			)}
		</div>
		{(meta || metaSub) && (
			<div className="cv-entry-meta">
				{meta && <p>{meta}</p>}
				{metaSub && <p>{metaSub}</p>}
			</div>
		)}
	</div>
);

// ---------------- sections ----------------

function SectionBody({ id, cv, t }: { id: SectionId; cv: CVData; t: Translation }) {
	switch (id) {
		case "summary":
			return <p className="cv-summary">{cv.personalInfo.summary}</p>;

		case "experience":
			return (
				<>
					{cv.experience
						.filter((e) => e.position || e.company || e.description)
						.map((e) => (
							<article key={e.id} className="cv-entry">
								<EntryHead
									title={e.position}
									subtitle={e.company}
									subtitleHref={absUrl(e.companyUrl)}
									meta={dateRange(e.startDate, e.endDate, t)}
									metaSub={e.location}
								/>
								<Bullets text={e.description} />
							</article>
						))}
				</>
			);

		case "projects":
			return (
				<>
					{cv.projects
						.filter((p) => p.name || p.description)
						.map((p) => (
							<article key={p.id} className="cv-entry">
								<EntryHead
									title={p.name}
									subtitle={p.technologies}
									meta={
										p.link ? (
											<Link href={absUrl(p.link)}>
												<span dir="ltr">{displayUrl(p.link)}</span>
											</Link>
										) : null
									}
								/>
								<Bullets text={p.description} />
							</article>
						))}
				</>
			);

		case "education":
			return (
				<>
					{cv.education
						.filter((e) => e.institution || e.degree)
						.map((e) => (
							<article key={e.id} className="cv-entry">
								<EntryHead
									title={e.degree}
									subtitle={e.institution}
									meta={dateRange(e.startDate, e.endDate, t)}
								/>
								<Bullets text={e.details} />
							</article>
						))}
				</>
			);

		case "skills":
			return (
				<ul className="cv-skills">
					{cv.skills.map((s) => (
						<li key={s}>{s}</li>
					))}
				</ul>
			);

		case "languages":
			return (
				<ul className="cv-langs">
					{cv.languages
						.filter((l) => l.name)
						.map((l) => (
							<li key={l.id}>
								<span className="cv-lang-name">{l.name}</span>
								{l.level && <span className="cv-lang-level">{l.level}</span>}
							</li>
						))}
				</ul>
			);

		case "certifications":
			return (
				<ul className="cv-certs">
					{cv.certifications
						.filter((c) => c.name)
						.map((c) => (
							<li key={c.id}>
								<span className="cv-cert-name">
									<Link href={absUrl(c.link)}>{c.name}</Link>
								</span>
								{(c.issuer || c.date) && (
									<span className="cv-cert-meta">
										{[c.issuer, c.date].filter(Boolean).join(", ")}
									</span>
								)}
							</li>
						))}
				</ul>
			);
	}
}

const Section = ({ s, cv, t }: { s: SectionConfig; cv: CVData; t: Translation }) => (
	<section className={`cv-section cv-section-${s.id}`}>
		<h2 className="cv-h2">{sectionTitle(s, t)}</h2>
		<SectionBody id={s.id} cv={cv} t={t} />
	</section>
);

// ---------------- templates ----------------

const NameBlock = ({ cv }: { cv: CVData }) => (
	<div className="cv-name-block">
		<h1 className="cv-name">{cv.personalInfo.name}</h1>
		{cv.personalInfo.title && <p className="cv-title">{cv.personalInfo.title}</p>}
	</div>
);

function SingleColumn({ cv, t, sections }: TemplateProps) {
	const ats = cv.settings.template === "ats";
	return (
		<>
			<header className="cv-header">
				{!ats && <Photo cv={cv} />}
				<NameBlock cv={cv} />
				<Contacts cv={cv} icons={!ats} />
			</header>
			{sections.map((s) => (
				<Section key={s.id} s={s} cv={cv} t={t} />
			))}
		</>
	);
}

function Modern({ cv, t, sections }: TemplateProps) {
	const side = sections.filter((s) => SIDE_SECTIONS.includes(s.id));
	const main = sections.filter((s) => !SIDE_SECTIONS.includes(s.id));
	return (
		<div className="cv-columns">
			{/* Repeats on every printed page so the sidebar colour runs the full height. */}
			<div className="cv-side-bg" aria-hidden />
			<aside className="cv-side">
				<Photo cv={cv} />
				<Contacts cv={cv} className="cv-contacts cv-contacts-stack" />
				{side.map((s) => (
					<Section key={s.id} s={s} cv={cv} t={t} />
				))}
			</aside>
			<div className="cv-main">
				<header className="cv-header">
					<NameBlock cv={cv} />
				</header>
				{main.map((s) => (
					<Section key={s.id} s={s} cv={cv} t={t} />
				))}
			</div>
		</div>
	);
}

type TemplateProps = { cv: CVData; t: Translation; sections: SectionConfig[] };

// ---------------- document ----------------

const SPACING = { compact: 0.75, normal: 1, relaxed: 1.3 };

export const PAGE_SIZE = {
	a4: { width: "210mm", height: "297mm", widthPx: 793.7, heightPx: 1122.5 },
	letter: { width: "8.5in", height: "11in", widthPx: 816, heightPx: 1056 },
};

export default function CVDocument({ cv }: { cv: CVData }) {
	const { settings } = cv;
	const t = translations[settings.language];
	const rtl = settings.language === "ar";
	const sections = settings.sections.filter(
		(s) => s.visible && hasContent(s.id, cv),
	);
	const style = {
		"--cv-accent": settings.accentColor,
		"--cv-fs": `${settings.fontSize}pt`,
		"--cv-gap": SPACING[settings.spacing],
		"--cv-page-w": PAGE_SIZE[settings.pageFormat].width,
		fontFamily: `"${settings.font}", ${rtl ? '"Amiri", ' : ""}system-ui, sans-serif`,
	} as React.CSSProperties;

	return (
		<div
			className={`cv cv-tpl-${settings.template}`}
			dir={rtl ? "rtl" : "ltr"}
			lang={settings.language}
			style={style}>
			{settings.template === "modern" ? (
				<Modern cv={cv} t={t} sections={sections} />
			) : (
				<SingleColumn cv={cv} t={t} sections={sections} />
			)}
		</div>
	);
}

// ---------------- cover letter ----------------

/** A one-page letter that shares the CV's header, font and accent colour. */
export function LetterDocument({ cv, body }: { cv: CVData; body: string }) {
	const { settings } = cv;
	const rtl = settings.language === "ar";
	const date = new Date().toLocaleDateString(settings.language, {
		year: "numeric",
		month: "long",
		day: "numeric",
	});
	const style = {
		"--cv-accent": settings.template === "ats" ? "#111111" : settings.accentColor,
		"--cv-fs": `${Math.max(settings.fontSize, 10.5)}pt`,
		"--cv-gap": 1,
		"--cv-page-w": PAGE_SIZE[settings.pageFormat].width,
		fontFamily: `"${settings.font}", ${rtl ? '"Amiri", ' : ""}system-ui, sans-serif`,
	} as React.CSSProperties;

	return (
		<div
			className="cv cv-tpl-classic cv-letter"
			dir={rtl ? "rtl" : "ltr"}
			lang={settings.language}
			style={style}>
			<header className="cv-header">
				<NameBlock cv={cv} />
				<Contacts cv={cv} icons={settings.template !== "ats"} />
			</header>
			<p className="cv-letter-date">{date}</p>
			<div className="cv-letter-body">
				{body
					.split(/\n{2,}/)
					.map((para) => para.trim())
					.filter(Boolean)
					.map((para, i) => (
						<p key={i}>{para}</p>
					))}
			</div>
		</div>
	);
}
