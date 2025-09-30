"use client";

import CVMaker from "@/components/cv-maker/CVMaker";
import LandingHero from "./Landing";
import Loading from "@/components/ui/loader";

export default function Home() {
	return (
		<main className="bg-gradient-to-br  min-h-screen from-rose-100 via-background to-sky-300 dark:from-rose-900/10 dark:via-background dark:to-sky-900/20	">
			<Loading />
			<LandingHero />
			<CVMaker />
		</main>
	);
}
