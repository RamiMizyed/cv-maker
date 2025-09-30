"use client";

import { useLang } from "@/lib/lang";
import React from "react";
import translations from "@/lib/translations";
import { CheckCircleIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Poppins } from "next/font/google";
const poppins = Poppins({
	subsets: ["latin"],
	weight: ["600", "700"],
	variable: "--font-poppins",
});
export default function LandingHero() {
	const { lang } = useLang();
	const t = translations[lang];
	const isRtl = lang === "ar";

	const handleScroll = () => {
		const cvMakerElement = document.getElementById("cvMaker");
		if (cvMakerElement) {
			cvMakerElement.scrollIntoView({
				behavior: "smooth",
				block: "start",
			});
		}
	};

	return (
		<div className="" dir={isRtl ? "rtl" : "ltr"}>
			{/* Replaced min-h-screen with vertical padding for a section feel */}
			<div className="container mx-auto px-6 lg:px-8 py-24 sm:py-32">
				<div className="grid items-center gap-12 lg:grid-cols-2">
					{/* Left Column: Text Content & CTA */}
					<div className="flex flex-col items-start ">
						<h1
							className={`${poppins.className} text-4xl sm:text-5xl max-w-2xl font-extrabold text-transparent bg-clip-text
								bg-gradient-to-br
								from-sky-700 via-indigo-600 to-pink-500
								dark:from-pink-300 dark:via-indigo-100 dark:to-pink-200
								drop-shadow-sm uppercase`}>
							{t.landingTitle}
						</h1>
						<p className="mt-6 max-w-xl text-lg ">{t.landingSubtitle}</p>

						{/* Benefit-focused feature list */}
						<ul className="mt-8 space-y-4 text-left">
							<li className="flex items-center gap-3">
								<CheckCircleIcon className="h-6 w-6 text-sky-500" />
								<span className="text-slate-700 dark:text-slate-300">
									{t.feature1Title}: {t.feature1Desc}
								</span>
							</li>
							<li className="flex items-center gap-3">
								<CheckCircleIcon className="h-6 w-6 text-sky-500" />
								<span className="text-slate-700 dark:text-slate-300">
									{t.feature2Title}: {t.feature2Desc}
								</span>
							</li>
							<li className="flex items-center gap-3">
								<CheckCircleIcon className="h-6 w-6 text-sky-500" />
								<span className="text-slate-700 dark:text-slate-300">
									{t.feature3Title}: {t.feature3Desc}
								</span>
							</li>
						</ul>

						<Button
							className="mt-6"
							// keep component from applying its own bg
							size="default" // let our classes control sizing
							onClick={handleScroll}>
							{t.landingCta}
						</Button>
					</div>

					{/* Right Column: Animated Visual */}
					<div className="flex items-center justify-center">
						<div className="relative w-full max-w-2xl">
							<div
								className="w-full rounded-xl border border-slate-200 bg-gray-200 p-1  "
								style={{ animation: "float 6s ease-in-out infinite" }}>
								<Image
									width={1600}
									height={900}
									className="rounded-lg"
									alt="CV Maker"
									src={"/assets/CVmakerMainImg.png"}
								/>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
