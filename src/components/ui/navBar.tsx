"use client";
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useLang } from "@/lib/lang"; // Assuming your lang hook is here
import { Button } from "../ui/button";
import SettingsToggle from "./themeToggle";
import { GitBranch, Star } from "lucide-react";

// --- TRANSLATIONS ---
const translations = {
	projects: {
		en: "Projects",
		tr: "Projeler",
		ar: "المشاريع",
	},
	contact: {
		en: "Contact",
		tr: "İletişim",
		ar: "تواصل",
	},
};

const NavBar = () => {
	const { lang } = useLang();
	const [isScrolled, setIsScrolled] = useState(false);
	const [isScrollingDown, setIsScrollingDown] = useState(false);
	const lastScrollY = useRef(0);

	// GitHub repo (moved to component scope so JSX can access it)
	const repo = "RamiMizyed/cv-maker";

	// GitHub stars
	const [starCount, setStarCount] = useState<number>(3);
	const [starsLoading, setStarsLoading] = useState(false);
	useEffect(() => {
		let mounted = true;
		const url = `https://api.github.com/repos/${repo}`;
		setStarsLoading(true);
		fetch(url)
			.then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
			.then((data) => {
				if (mounted && typeof data.stargazers_count === "number") {
					setStarCount(data.stargazers_count);
				}
			})
			.catch(() => {
				if (mounted) setStarCount(3); // Default/fallback value
			})
			.finally(() => {
				if (mounted) setStarsLoading(false);
			});
		return () => {
			mounted = false;
		};
	}, [repo]);

	// --- Helper for smooth scrolling ---
	const scrollToSection = (sectionId: string) => {
		const section = document.getElementById(sectionId);
		if (section) {
			const offset = 100; // Offset to account for the navbar height
			const bodyRect = document.body.getBoundingClientRect().top;
			const elementRect = section.getBoundingClientRect().top;
			const elementPosition = elementRect - bodyRect;
			const offsetPosition = elementPosition - offset;

			window.scrollTo({
				top: offsetPosition,
				behavior: "smooth",
			});
		}
	};

	// --- Optimized Scroll Handler ---
	useEffect(() => {
		const handleScroll = () => {
			const currentScrollY = window.scrollY;
			// Hide navbar when scrolling down, show when scrolling up
			if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
				setIsScrollingDown(true);
			} else {
				setIsScrollingDown(false);
			}
			// Add background when scrolled past the top
			setIsScrolled(currentScrollY > 0);
			lastScrollY.current = currentScrollY;
		};

		window.addEventListener("scroll", handleScroll, { passive: true });
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	return (
		<header
			className={`fixed top-0 w-full z-50 transition-transform duration-300
                ${isScrollingDown ? "-translate-y-full" : "translate-y-0"}
                ${
									isScrolled
										? "bg-background/80 backdrop-blur-lg border-b border-border"
										: "bg-transparent border-b border-transparent"
								}`}>
			{/* ✅ This inner container matches your content's max-width */}
			<div className="mx-auto relative flex h-20 container items-center justify-between px-6 sm:px-8">
				{/* Centered GitHub star button */}
				<div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden sm:block">
					<Button
						className="flex items-center gap-2"
						onClick={() => window.open(`https://github.com/${repo}`, "_blank")}
						disabled={starsLoading}
						title={`Star ${repo} on GitHub`}>
						<GitBranch />
						<span>Star repo</span>
						<div className="w-[1px] h-full bg-white"></div>
						<Star className=" h-4 w-4" />
						<span className=" text-sm ">
							{starCount !== null
								? new Intl.NumberFormat().format(starCount)
								: "—"}
						</span>
					</Button>
				</div>

				{/* Logo */}
				<Link href="http://ramimizyed.dev/" aria-label="Back to homepage">
					<svg
						className="w-10 fill-foreground"
						viewBox="0 0 114 86"
						xmlns="http://www.w3.org/2000/svg">
						{/* Your SVG path data here... */}
						<path d="M42.2301 85.2846H43.3858V60.8996C43.3858 58.126 42.9235 55.8532 41.9989 54.0811C41.0744 52.3091 39.8417 50.9222 38.3007 49.9206C36.8369 48.842 35.1419 48.1101 33.2157 47.7248C31.2896 47.2626 29.3634 47.0314 27.4373 47.0314H25.5882V71.532C25.5882 74.3826 26.089 76.694 27.0906 78.4661C28.0922 80.2381 29.3634 81.625 30.9044 82.6266C32.5223 83.6282 34.2944 84.3216 36.2205 84.7068C38.2237 85.092 40.2269 85.2846 42.2301 85.2846Z" />
						<path d="M29.7486 0.803955H28.2462V24.9578C28.2462 25.8053 28.2077 26.7684 28.1306 27.847C28.1306 28.8486 27.9766 29.7732 27.6684 30.6207C27.4372 31.4682 27.0135 32.2001 26.3971 32.8165C25.8578 33.3558 25.0874 33.6254 24.0857 33.6254C22.6989 33.6254 21.7744 33.5484 21.3121 33.3943C20.8498 33.1632 20.349 32.8165 19.8097 32.3542C19.8097 33.741 20.0023 35.1664 20.3875 36.6302C20.7728 38.017 21.3891 39.3268 22.2366 40.5596C23.1612 41.7152 24.3554 42.6783 25.8193 43.4488C27.2832 44.2192 29.0937 44.6044 31.251 44.6044H32.06C35.6042 44.4504 38.6088 43.0635 41.0743 40.444C43.6169 37.8244 44.8881 33.9721 44.8881 28.8871V16.7524C44.8881 11.5904 43.4628 7.66102 40.612 4.96442C37.7613 2.19078 34.1403 0.803955 29.7486 0.803955Z" />
						<path d="M17.4654 70.9541C17.4654 73.6507 16.9261 75.885 15.8475 77.6571C14.7688 79.4291 13.4206 80.8545 11.8026 81.9331C10.1846 82.9347 8.37409 83.6667 6.37085 84.1289C4.44466 84.5912 2.59564 84.8224 0.823547 84.8224V17.677C0.823547 12.2838 2.05624 8.12331 4.52176 5.19557C6.98728 2.26783 10.5312 0.803955 15.1541 0.803955C17.4655 0.803955 19.353 1.18918 20.8169 1.95964C22.2808 2.7301 23.3979 3.73169 24.1684 4.96442C25.0159 6.19716 25.5937 7.54546 25.9019 9.00933C26.2101 10.3962 26.3642 11.7445 26.3642 13.0542C26.3642 13.7476 26.2872 14.2484 26.1331 14.5566C25.1315 13.7091 23.9373 13.2854 22.5505 13.2854C21.3948 13.2854 20.4702 13.5165 19.7768 13.9788C19.1604 14.364 18.2744 15.5967 18.2744 15.5967C18.2744 15.5967 17.7351 16.945 17.581 17.7925C17.504 18.6401 17.4654 19.5261 17.4654 20.4506V70.9541Z" />
						<path d="M63.6271 85.103H64.6177V25.0733C64.6177 22.6959 64.2545 20.7478 63.528 19.2289C62.8016 17.71 61.844 16.5213 60.6553 15.6627C59.4665 14.7382 58.1127 14.1108 56.5938 13.7806C55.0748 13.3844 53.5229 13.1863 51.9379 13.1863H50.3529V73.315C50.3529 75.7584 50.7161 77.7396 51.4426 79.2585C52.2351 80.7774 53.2257 81.9661 54.4144 82.8246C55.6692 83.6831 57.0891 84.2775 58.6741 84.6077C60.259 84.9379 61.9101 85.103 63.6271 85.103Z" />
						<path d="M99.5523 27.6489C99.6844 28.3753 99.7505 29.1017 99.7505 29.8282V72.8197C99.7505 75.5933 100.147 77.8056 100.939 79.4566C101.732 81.1076 102.788 82.3624 104.109 83.2209C105.496 84.0133 107.015 84.5417 108.666 84.8058C110.383 85.07 112.133 85.202 113.916 85.202V26.5592C113.916 22.3988 112.827 19.1298 110.647 16.7524C108.468 14.375 105.397 13.1863 101.435 13.1863C99.6514 13.1863 98.1325 13.4504 96.8777 13.9788C95.689 14.441 94.6984 15.0684 93.9059 15.8609C93.1134 16.6533 92.519 17.5779 92.1228 18.6345C91.7926 19.6251 91.6274 20.6487 91.6274 21.7053C91.6274 22.5639 91.8256 23.5214 92.2218 24.578C93.0804 23.7856 94.137 23.3893 95.3918 23.3893C96.3824 23.3893 97.1418 23.5875 97.6702 23.9837C98.2645 24.3799 98.6938 24.9082 98.958 25.5686C99.2882 26.163 99.4863 26.8564 99.5523 27.6489Z" />
						<path d="M74.9858 29.8282C74.9858 29.1017 74.9198 28.3753 74.7877 27.6489C74.7216 26.8564 74.5235 26.163 74.1933 25.5686C73.9291 24.9082 73.4999 24.3799 72.9055 23.9837C72.3772 23.5875 71.6177 23.3893 70.6271 23.3893C69.3723 23.3893 68.3157 23.7856 67.4571 24.578C67.0609 23.5214 66.8628 22.5639 66.8628 21.7053C66.8628 20.6487 67.0279 19.6251 67.3581 18.6345C67.7543 17.5779 68.3487 16.6533 69.1412 15.8609C69.9336 15.0684 70.9243 14.441 72.113 13.9788C73.3678 13.4504 74.8867 13.1863 76.6698 13.1863C80.6323 13.1863 83.7032 14.375 85.8825 16.7524C88.0619 19.1298 89.1515 22.3988 89.1515 26.5592V85.202C87.3684 85.202 85.6184 85.07 83.9013 84.8058C82.2503 84.5417 80.7313 84.0133 79.3445 83.2209C78.0236 82.3624 76.967 81.1076 76.1745 79.4566C75.382 77.8057 74.9858 75.5933 74.9858 72.8197V29.8282Z" />
					</svg>
				</Link>

				{/* Navigation and Settings */}
				<div className="flex items-center gap-4 relative">
					{/* Desktop Navigation Links */}

					{/* Settings (Theme & Language) */}
					<SettingsToggle />

					{/* Mobile Menu can be added here later */}
				</div>
			</div>
		</header>
	);
};

export default NavBar;
