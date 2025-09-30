"use client";

import { useLang } from "@/lib/lang";
import React from "react";
import translations from "@/lib/translations";
import { CheckCircleIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Poppins } from "next/font/google";
import { motion, Variants } from "framer-motion";

const poppins = Poppins({
	subsets: ["latin"],
	weight: ["600", "700"],
	variable: "--font-poppins",
});

export default function LandingHero() {
	const { lang } = useLang();
	const t = translations[lang];
	const isRtl = lang === "ar";
	const features = [
		{ title: t.feature1Title, desc: t.feature1Desc },
		{ title: t.feature2Title, desc: t.feature2Desc },
		{ title: t.feature3Title, desc: t.feature3Desc },
	];

	const handleScroll = () => {
		const cvMakerElement = document.getElementById("cvMaker");
		if (cvMakerElement) {
			cvMakerElement.scrollIntoView({
				behavior: "smooth",
				block: "start",
			});
		}
	};

	// Variants for staggered animations
	const containerVariants: Variants = {
		hidden: { opacity: 0 },
		show: {
			opacity: 1,
			transition: {
				staggerChildren: 0.2,
				delay: 0.15,
			},
		},
	};

	const itemVariants: Variants = {
		hidden: { opacity: 0, y: 20 },
		show: {
			opacity: 1,
			y: 0,
			transition: { duration: 0.6, ease: "easeOut", delay: 0.15 },
		},
	};

	return (
		<div className="pt-5 lg:pt-10" dir={isRtl ? "rtl" : "ltr"}>
			<div className="container mx-auto  px-6 lg:px-8 py-24 sm:py-32">
				<div className="grid items-center gap-12 lg:grid-cols-2">
					{/* Left Column */}
					<motion.div
						className="flex flex-col items-start"
						variants={containerVariants}
						initial="hidden"
						animate="show">
						<motion.h1
							className={`${poppins.className} text-4xl sm:text-5xl max-w-2xl font-extrabold text-transparent bg-clip-text
								bg-gradient-to-br
								from-zinc-900 via-indigo-800 to-pink-500
								dark:from-zinc-200 dark:via-rose-200 dark:to-pink-900
								drop-shadow-sm uppercase`}
							variants={itemVariants}>
							{t.landingTitle}
						</motion.h1>

						<motion.p className="mt-6 max-w-xl text-lg" variants={itemVariants}>
							{t.landingSubtitle}
						</motion.p>

						<motion.ul
							className="mt-8 space-y-4 text-left"
							variants={containerVariants}>
							{features.map((f, i) => (
								<motion.li
									key={i}
									className="flex items-center gap-3"
									variants={itemVariants}>
									<CheckCircleIcon className="h-6 w-6 text-sky-500" />
									<span className="text-slate-700 dark:text-slate-300">
										{f.title}: {f.desc}
									</span>
								</motion.li>
							))}
						</motion.ul>

						<motion.div variants={itemVariants}>
							<Button className="mt-6" size="default" onClick={handleScroll}>
								{t.landingCta}
							</Button>
						</motion.div>
					</motion.div>

					{/* Right Column */}
					<motion.div
						className="flex items-center justify-center"
						initial={{ opacity: 0, scale: 0.9 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ duration: 0.8, ease: "easeOut" }}>
						<div className="relative w-full max-w-2xl">
							<motion.div
								className="w-full rounded-xl border border-slate-200 bg-gray-200 p-1"
								animate={{ y: [0, -15, 0] }}
								transition={{
									repeat: Infinity,
									duration: 6,
									ease: "easeInOut",
								}}>
								<Image
									width={1600}
									height={900}
									className="rounded-lg"
									alt="CV Maker"
									src={"/assets/CVmakerMainImg.png"}
								/>
							</motion.div>
						</div>
					</motion.div>
				</div>
			</div>
		</div>
	);
}
