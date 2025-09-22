"use client";

import CVMaker from "@/components/cv-maker/CVMaker";
import LandingHero from "./Landing";

export default function Home() {
	return (
		<main className=" min-h-screen">
			<LandingHero />
			<CVMaker />
		</main>
	);
}
