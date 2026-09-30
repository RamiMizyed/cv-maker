"use client";

import CVMaker from "@/components/cv-maker/CVMaker";
import LandingHero from "./Landing";
import Loading from "@/components/ui/loader";

export default function Home() {
	return (
		<main className="min-h-screen bg-background">
			<Loading />
			<LandingHero />
			<CVMaker />
		</main>
	);
}
