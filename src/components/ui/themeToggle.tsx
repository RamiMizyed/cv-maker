"use client";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { useLang, Lang } from "@/lib/lang";

const LANGUAGES: { code: Lang; label: string; flag: string }[] = [
	{ code: "en", label: "English", flag: "🇺🇸" },
	{ code: "tr", label: "Turkish", flag: "🇹🇷" },
	{ code: "ar", label: "Arabic", flag: "🇸🇦" },
];

export default function SettingsToggle() {
	const { lang, setLang } = useLang();
	// ✨ FIX: Destructure resolvedTheme from useTheme
	const { theme, setTheme, resolvedTheme } = useTheme();
	const [mounted, setMounted] = useState(false);
	const [isTransitioning, setIsTransitioning] = useState(false);
	const [nextLang, setNextLang] = useState(lang);
	// ✨ FIX: Initialize nextTheme with the actual theme state
	const [nextTheme, setNextTheme] = useState(theme);
	const [langDropdownOpen, setLangDropdownOpen] = useState(false);

	useEffect(() => setMounted(true), []);

	// ✨ FIX: Also check for resolvedTheme to prevent hydration issues
	if (!mounted || !resolvedTheme) return null;

	const handleLangChange = (newLang: typeof lang) => {
		if (newLang === lang || isTransitioning) return;
		setNextLang(newLang);
		setIsTransitioning(true);
	};

	const toggleTheme = () => {
		if (isTransitioning) return;
		// ✨ FIX: Base the toggle logic on resolvedTheme
		setNextTheme(resolvedTheme === "dark" ? "light" : "dark");
		setIsTransitioning(true);
	};

	const onAnimationComplete = () => {
		if (nextLang !== lang) setLang(nextLang);
		// ✨ FIX: Compare nextTheme with the actual theme
		if (nextTheme && nextTheme !== theme) setTheme(nextTheme);
		setIsTransitioning(false);
	};

	return (
		<div className="flex items-center gap-3 relative">
			<div className="relative">
				<button
					onClick={() => setLangDropdownOpen(!langDropdownOpen)}
					className="flex items-center gap-2 bg-secondary cursor-pointer text-secondary-foreground rounded-md px-3 py-2 text-sm font-medium hover:bg-secondary/80 transition">
					<span>{LANGUAGES.find((l) => l.code === lang)?.flag}</span>
					<span>{lang.toUpperCase()}</span>
					<svg
						className={`w-4 h-4 ml-1 transition-transform ${
							langDropdownOpen ? "rotate-180" : ""
						}`}
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24">
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M19 9l-7 7-7-7"
						/>
					</svg>
				</button>

				<AnimatePresence>
					{langDropdownOpen && (
						<motion.div
							initial={{ opacity: 0, y: -10 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -10 }}
							transition={{ duration: 0.2 }}
							className="absolute mt-1 w-32 bg-secondary text-secondary-foreground rounded-md shadow-lg overflow-hidden z-50">
							{LANGUAGES.map((l) => (
								<div
									key={l.code}
									onClick={() => {
										handleLangChange(l.code);
										setLangDropdownOpen(false);
									}}
									className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-secondary/70 cursor-pointer transition">
									<span>{l.flag}</span>
									<span>{l.label}</span>
								</div>
							))}
						</motion.div>
					)}
				</AnimatePresence>
			</div>
			<AnimatePresence>
				{isTransitioning && (
					<motion.div
						className="fixed w-full h-[120svh] bg-zinc-900   transition-all ease-in inset-0 z-[999999]"
						initial={{ clipPath: "circle(0% at 50% 50%)" }}
						animate={{ clipPath: "circle(150% at 50% 50%)" }} // 150% to cover corners
						exit={{ clipPath: "circle(0% at 50% 150%)" }}
						transition={{ duration: 0.8, ease: "easeInOut" }}
						onAnimationComplete={onAnimationComplete}
					/>
				)}
			</AnimatePresence>
			<button
				onClick={toggleTheme}
				className="relative flex hover:cursor-pointer transition-all duration-300 group  h-10 w-10 items-center justify-center hover:bg-primary rounded-full bg-secondary text-secondary-foreground overflow-hidden">
				<motion.span
					// ✨ FIX: Key the animation to resolvedTheme to ensure it runs correctly
					key={resolvedTheme}
					initial={{ rotate: -180, opacity: 0 }}
					animate={{ rotate: 0, opacity: 1 }}
					exit={{ rotate: 180, opacity: 0 }}
					transition={{ duration: 0.5, ease: "easeInOut" }}
					className="text-lg relative z-10 ">
					{/* ✨ FIX: Display the emoji based on resolvedTheme */}
					{resolvedTheme === "dark" ? "🌙" : "☀️"}
				</motion.span>
			</button>
		</div>
	);
}
