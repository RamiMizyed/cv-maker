"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Eye, Github, Languages, LayoutTemplate, Sparkles } from "lucide-react";
import { useLang } from "@/lib/lang";
import translations from "@/lib/translations";
import { Button } from "@/components/ui/button";
import CVDocument from "@/components/cv-maker/document/CVDocument";
import { sampleCV } from "@/lib/cv/defaults";
import { CVData, TemplateId } from "@/types/cv";
import { cn } from "@/lib/utils";

const SHEET_W = 794; // A4 at 96dpi
const SHEET_H = 1123;

const variant = (template: TemplateId, accentColor: string): CVData => {
	const cv = sampleCV();
	cv.settings.template = template;
	cv.settings.accentColor = accentColor;
	return cv;
};

/** A real CVDocument, scaled down. `--s` is the scale, set per breakpoint by the caller. */
function Sheet({ cv, className }: { cv: CVData; className?: string }) {
	return (
		<div
			className={cn(
				"overflow-hidden rounded-md bg-white shadow-[0_30px_80px_-20px_rgb(0_0_0/0.45)] ring-1 ring-black/10",
				className,
			)}
			style={{
				width: `calc(${SHEET_W}px * var(--s))`,
				height: `calc(${SHEET_H}px * var(--s))`,
			}}>
			<div
				className="pointer-events-none origin-top-left select-none"
				style={{ width: SHEET_W, transform: "scale(var(--s))" }}
				dir="ltr">
				<CVDocument cv={cv} />
			</div>
		</div>
	);
}

export default function LandingHero() {
	const { lang } = useLang();
	const t = translations[lang];
	const isRtl = lang === "ar";

	const sheets = useMemo(
		() => ({
			classic: variant("classic", "#2563eb"),
			modern: variant("modern", "#e11d48"),
			minimal: variant("minimal", "#0f766e"),
		}),
		[],
	);

	const features = [
		{ icon: Eye, title: t.feature1Title, desc: t.feature1Desc },
		{ icon: LayoutTemplate, title: t.feature2Title, desc: t.feature2Desc },
		{ icon: Sparkles, title: t.feature3Title, desc: t.feature3Desc },
		{ icon: Languages, title: t.feature4Title, desc: t.feature4Desc },
	];

	const start = () =>
		document.getElementById("cvMaker")?.scrollIntoView({ behavior: "smooth", block: "start" });

	const fadeUp = (delay: number) => ({
		initial: { opacity: 0, y: 14 },
		animate: { opacity: 1, y: 0 },
		transition: { duration: 0.5, ease: "easeOut" as const, delay },
	});

	return (
		<section className="relative isolate overflow-hidden" dir={isRtl ? "rtl" : "ltr"}>
			{/* Soft glow and a faint grid behind the headline. */}
			<div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
				<div className="absolute left-1/2 top-[-18rem] h-[36rem] w-[60rem] -translate-x-1/2 rounded-full bg-primary/20 blur-[120px] dark:bg-primary/25" />
				<div className="absolute inset-0 bg-[linear-gradient(to_right,rgb(127_127_127/0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgb(127_127_127/0.08)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_70%)]" />
			</div>

			<div className="mx-auto max-w-6xl px-6 pt-32 sm:pt-40">
				<div className="mx-auto max-w-3xl text-center">
					<motion.p
						{...fadeUp(0)}
						className="mx-auto inline-flex items-center gap-2 rounded-full border bg-background/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
						<span className="size-1.5 rounded-full bg-emerald-500" />
						{t.landingBadge}
					</motion.p>

					<motion.h1
						{...fadeUp(0.05)}
						className="mt-6 text-5xl font-semibold leading-[1.05] tracking-tight text-balance sm:text-7xl">
						{t.landingTitleA}{" "}
						<span className="text-primary">{t.landingTitleB}</span>
					</motion.h1>

					<motion.p
						{...fadeUp(0.1)}
						className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground text-pretty">
						{t.landingSubtitle}
					</motion.p>

					<motion.div
						{...fadeUp(0.15)}
						className="mt-9 flex flex-wrap items-center justify-center gap-3">
						<Button size="lg" onClick={start} className="h-11 px-6 text-base">
							{t.landingCta}
							<ArrowRight className="rtl:rotate-180" />
						</Button>
						<Button asChild size="lg" variant="outline" className="h-11 px-6 text-base">
							<a href="https://github.com/RamiMizyed/cv-maker" target="_blank" rel="noopener noreferrer">
								<Github /> {t.landingGithub}
							</a>
						</Button>
					</motion.div>
				</div>

				{/* Template fan: three real documents, cropped and faded at the bottom. */}
				<motion.div
					initial={{ opacity: 0, y: 40 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8, ease: "easeOut", delay: 0.25 }}
					aria-hidden
					dir="ltr"
					className="relative mx-auto mt-16 h-[300px] overflow-hidden [--s:0.38] sm:mt-20 sm:h-[440px] sm:[--s:0.5] lg:h-[500px] lg:[--s:0.56]">
					<div className="absolute left-1/2 top-10 hidden -translate-x-[112%] -rotate-6 opacity-90 sm:block">
						<Sheet cv={sheets.classic} />
					</div>
					<div className="absolute left-1/2 top-10 hidden translate-x-[12%] rotate-6 opacity-90 sm:block">
						<Sheet cv={sheets.minimal} />
					</div>
					<div className="absolute left-1/2 top-0 -translate-x-1/2">
						<Sheet cv={sheets.modern} />
					</div>
					<div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-b from-transparent to-background" />
				</motion.div>

				<div className="relative grid gap-8 border-t py-14 sm:grid-cols-2 lg:grid-cols-4">
					{features.map(({ icon: Icon, title, desc }) => (
						<div key={title}>
							<Icon className="size-5 text-primary" />
							<h3 className="mt-3 font-semibold">{title}</h3>
							<p className="mt-1 text-sm leading-relaxed text-muted-foreground">{desc}</p>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
