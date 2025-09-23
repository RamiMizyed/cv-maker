"use client";

import CVMaker from "@/components/cv-maker/CVMaker";
import LandingHero from "./Landing";

export default function Home() {
	return (
		<main className="bg-gradient-to-br  min-h-screen from-background via-background to-sky-900">
			<LandingHero />
			<CVMaker />
		</main>
	);
}
