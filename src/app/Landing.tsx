"use client";

import React, { useMemo } from "react";
import { motion, Variants } from "framer-motion";
import { Poppins } from "next/font/google";
import { Eye, Languages, LayoutTemplate, Sparkles } from "lucide-react";
import { useLang } from "@/lib/lang";
import translations from "@/lib/translations";
import { Button } from "@/components/ui/button";
import CVDocument from "@/components/cv-maker/document/CVDocument";
import { sampleCV } from "@/lib/cv/defaults";

const poppins = Poppins({
	subsets: ["latin"],
	weight: ["600", "700"],
	variable: "--font-poppins",
});

const containerVariants: Variants = {
	hidden: { opacity: 0 },
	show: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

const itemVariants: Variants = {
	hidden: { opacity: 0, y: 16 },
	show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

// A4 at 96dpi, scaled down for the hero.
const SHEET_W = 794;
const SHEET_H = 1123;
const HERO_SCALE = 0.56;

export default function LandingHero() {
	const { lang } = useLang();
	const t = translations[lang];
	const isRtl = lang === "ar";

	const demo = useMemo(() => {
		const cv = sampleCV();
		cv.settings.template = "modern";
		cv.settings.accentColor = "#e11d48";
		return cv;
	}, []);

	const features = [
		{ icon: Eye, title: t.feature1Title, desc: t.feature1Desc },
		{ icon: LayoutTemplate, title: t.feature2Title, desc: t.feature2Desc },
		{ icon: Sparkles, title: t.feature3Title, desc: t.feature3Desc },
		{ icon: Languages, title: t.feature4Title, desc: t.feature4Desc },
	];

	const start = () =>
		document.getElementById("cvMaker")?.scrollIntoView({ behavior: "smooth", block: "start" });

	return (
		<div className="pt-20 lg:pt-24" dir={isRtl ? "rtl" : "ltr"}>
			<div className="container mx-auto px-6 py-16 lg:px-8 lg:py-24">
				<div className="grid items-center gap-14 lg:grid-cols-2">
					<motion.div
						className="flex flex-col items-start"
						variants={containerVariants}
						initial="hidden"
						animate="show">
						<motion.h1
							variants={itemVariants}
							className={`${poppins.className} max-w-2xl bg-gradient-to-br from-zinc-900 via-indigo-800 to-pink-500 bg-clip-text text-4xl font-extrabold uppercase text-transparent drop-shadow-sm sm:text-5xl dark:from-zinc-200 dark:via-zinc-100 dark:to-pink-300`}>
							{t.landingTitle}
						</motion.h1>

						<motion.p variants={itemVariants} className="mt-6 max-w-xl text-lg text-muted-foreground">
							{t.landingSubtitle}
						</motion.p>

						<motion.ul variants={containerVariants} className="mt-8 grid gap-4 sm:grid-cols-2">
							{features.map(({ icon: Icon, title, desc }) => (
								<motion.li key={title} variants={itemVariants} className="flex gap-3">
									<span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
										<Icon className="size-4.5" />
									</span>
									<span>
										<span className="block text-sm font-semibold">{title}</span>
										<span className="block text-sm text-muted-foreground">{desc}</span>
									</span>
								</motion.li>
							))}
						</motion.ul>

						<motion.div variants={itemVariants}>
							<Button className="mt-8" size="lg" onClick={start}>
								{t.landingCta}
							</Button>
						</motion.div>
					</motion.div>

					<motion.div
						className="hidden justify-center sm:flex"
						initial={{ opacity: 0, y: 24 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
						aria-hidden>
						<div
							className="relative overflow-hidden rounded-lg bg-white shadow-2xl ring-1 ring-black/5 lg:rotate-1"
							style={{ width: SHEET_W * HERO_SCALE, height: SHEET_H * HERO_SCALE }}>
							<div
								className="pointer-events-none origin-top-left select-none"
								style={{ width: SHEET_W, transform: `scale(${HERO_SCALE})` }}
								dir="ltr">
								<CVDocument cv={demo} />
							</div>
						</div>
					</motion.div>
				</div>
			</div>
		</div>
	);
}
