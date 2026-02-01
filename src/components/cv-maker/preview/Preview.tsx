// components/cv-maker/preview/Preview.tsx
"use client";

import React, { forwardRef } from "react";
import { useCV } from "../CVContext";
import { useLang } from "@/lib/lang";
import translations from "@/lib/translations";
import MailIcon from "@/icons/MailIcon";
import PhoneIcon from "@/icons/PhoneIcon";
import GlobeIcon from "@/icons/GlobeIcon";
import { GithubIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

const ensureAbsoluteUrl = (url?: string) => {
	if (!url) return "";
	if (url.startsWith("http://") || url.startsWith("https://")) return url;
	return `https://${url}`;
};

const displayUrl = (url?: string) => {
	if (!url) return "";
	return url
		.replace(/^https?:\/\//i, "")
		.replace(/^www\./i, "")
		.replace(/\/+$/g, "");
};

// ---------------- CV PREVIEW ----------------
const CVPreview = forwardRef<HTMLDivElement>((_, ref) => {
	const { state } = useCV();
	const {
		personalInfo,
		experience,
		education,
		projects,
		skills,
		selectedFont,
	} = state;

	const { lang } = useLang();
	const t = translations[lang];
	const isRtl = lang === "ar";

	return (
		<div ref={ref} className="relative lg:col-span-3 w-full">
			<Card className="shadow-lg overflow-scroll min-h-[99vh] flex justify-center">
				<article
					style={{
						fontFamily: selectedFont,
						direction: isRtl ? "rtl" : "ltr",
					}}
					className="w-full max-w-full h-full min-h-[297mm] rounded-md bg-white text-black p-4 sm:p-8 lg:p-[20mm] text-sm transition-transform duration-300">
					<header className="text-center mb-8 border-b border-slate-200 pb-6 flex flex-col items-center">
						{personalInfo.portrait && (
							<img
								src={personalInfo.portrait}
								alt="Portrait"
								className="w-28 h-28 rounded-full object-cover mb-4 border-4 border-rose-400"
							/>
						)}
						<h1 className="text-4xl font-bold tracking-tight uppercase">
							{personalInfo.name || "Your Name"}
						</h1>
						<h2 className="text-xl font-medium opacity-85 mt-1">
							{personalInfo.title || "Your Title"}
						</h2>

						{/* Contacts */}
						<div className="flex justify-center items-center gap-x-6 gap-y-2 flex-wrap mt-4 text-xs">
							{personalInfo.email && (
								<span className="flex items-center gap-1.5">
									<MailIcon className="h-3 w-3" />
									{personalInfo.email}
								</span>
							)}

							{personalInfo.phone && (
								<span className="flex items-center gap-1.5">
									<PhoneIcon className="h-3 w-3" />
									{personalInfo.phone}
								</span>
							)}

							{personalInfo.website && (
								<a
									href={ensureAbsoluteUrl(personalInfo.website)}
									target="_blank"
									rel="noopener noreferrer"
									className="flex items-center text-blue-600 hover:text-blue-700 transition-all gap-1.5">
									<GlobeIcon className="h-3 w-3" />
									{displayUrl(ensureAbsoluteUrl(personalInfo.website))}
								</a>
							)}

							{personalInfo.github && (
								<a
									href={ensureAbsoluteUrl(personalInfo.github)}
									target="_blank"
									rel="noopener noreferrer"
									className="flex items-center text-blue-600 hover:text-blue-700 transition-all gap-1.5">
									<GithubIcon className="h-3 w-3" />
									{displayUrl(ensureAbsoluteUrl(personalInfo.github))}
								</a>
							)}
						</div>
					</header>

					<main>
						{/* Summary */}
						<section>
							<h3 className="text-sm font-bold uppercase tracking-wider border-b-2 border-slate-200 pb-1 mb-3">
								{t.summary}
							</h3>
							<p className="leading-relaxed break-words">
								{personalInfo.summary || "A brief summary about yourself."}
							</p>
						</section>

						{/* Experience */}
						<section className="mt-8">
							<h3 className="text-sm font-bold uppercase tracking-wider border-b-2 border-slate-200 pb-1 mb-4">
								{t.experience}
							</h3>

							<div className="space-y-6">
								{experience.map((exp) => {
									const companyUrl = ensureAbsoluteUrl(exp.companyUrl);
									const hasCompanyUrl = !!exp.companyUrl?.trim();

									return (
										<div key={exp.id}>
											<div className="flex justify-between items-baseline">
												<h4 className="font-semibold">
													{exp.position || "Position"}
												</h4>
												<p className="text-xs font-medium">
													{exp.startDate || "Start"} - {exp.endDate || "End"}
												</p>
											</div>

											{/* Company row: left name (clickable) + right URL like Projects */}
											<div className="flex justify-between items-baseline gap-3">
												{hasCompanyUrl ? (
													<a
														href={companyUrl}
														target="_blank"
														rel="noopener noreferrer"
														className="opacity-85 italic text-sm text-blue-700 hover:underline">
														{exp.company || "Company Name"}
													</a>
												) : (
													<p className="opacity-85 italic text-sm">
														{exp.company || "Company Name"}
													</p>
												)}

												{hasCompanyUrl ? (
													<a
														href={companyUrl}
														target="_blank"
														rel="noopener noreferrer"
														className="text-xs font-medium text-blue-600 hover:underline">
														{displayUrl(companyUrl)}
													</a>
												) : null}
											</div>

											{/* Slightly more spacing before bullets (matches PDF change) */}
											<ul className="mt-3 leading-relaxed list-disc list-inside space-y-1">
												{(exp.description || "").split("\n").map((item, i) => {
													const cleaned = item.replace("•", "").trim();
													if (!cleaned) return null;
													return (
														<li key={i} className="pl-2">
															{cleaned}
														</li>
													);
												})}
											</ul>
										</div>
									);
								})}
							</div>
						</section>

						{/* Projects */}
						<section className="mt-8">
							<h3 className="text-sm font-bold uppercase tracking-wider border-b-2 border-slate-200 pb-1 mb-4">
								{t.projects}
							</h3>

							<div className="space-y-6">
								{projects.map((proj) => {
									const projUrl = ensureAbsoluteUrl(proj.link);
									return (
										<div key={proj.id}>
											<div className="flex justify-between items-baseline gap-3">
												<h4 className="font-semibold">
													{proj.name || "Project Name"}
												</h4>

												{proj.link ? (
													<a
														href={projUrl}
														target="_blank"
														rel="noopener noreferrer"
														className="text-xs font-medium text-blue-600 hover:underline">
														{displayUrl(projUrl)}
													</a>
												) : null}
											</div>

											<p className="opacity-85 italic text-sm text-gray-600 mb-1">
												{proj.technologies || "Technologies Used"}
											</p>

											<ul className="mt-2 leading-relaxed list-disc list-inside space-y-1">
												{(proj.description || "").split("\n").map((item, i) => {
													const cleaned = item.replace("•", "").trim();
													if (!cleaned) return null;
													return (
														<li key={i} className="pl-2">
															{cleaned}
														</li>
													);
												})}
											</ul>
										</div>
									);
								})}
							</div>
						</section>

						{/* Education */}
						<section className="mt-8">
							<h3 className="text-sm font-bold uppercase tracking-wider border-b-2 border-slate-200 pb-1 mb-4">
								{t.education}
							</h3>

							<div className="space-y-4">
								{education.map((edu) => (
									<div key={edu.id}>
										<div className="flex justify-between items-baseline">
											<h4 className="font-semibold">
												{edu.institution || "Institution Name"}
											</h4>
											<p className="text-xs font-medium">
												{edu.startDate || "Start"} - {edu.endDate || "End"}
											</p>
										</div>
										<p className="opacity-85 italic text-sm">
											{edu.degree || "Degree / Field of Study"}
										</p>
									</div>
								))}
							</div>
						</section>

						{/* Skills */}
						<section className="mt-8">
							<h3 className="text-sm font-bold uppercase tracking-wider border-b-2 border-slate-200 pb-1 mb-3">
								{t.skills}
							</h3>

							<div className="flex flex-wrap gap-2">
								{(skills || "")
									.split(",")
									.map((skill, i) => skill.trim())
									.filter(Boolean)
									.map((skill, i) => (
										<span
											key={`${skill}-${i}`}
											className="bg-sky-200 opacity-85 text-xs font-medium px-2.5 py-1 rounded-full">
											{skill}
										</span>
									))}
							</div>
						</section>
					</main>
				</article>
			</Card>
		</div>
	);
});

CVPreview.displayName = "CVPreview";

// ---------------- WRAPPER ----------------
export default function Preview() {
	return <CVPreview />;
}
