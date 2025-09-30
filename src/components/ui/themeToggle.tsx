"use client";
import { useTheme } from "next-themes";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { useEffect, useState } from "react";
import { useLang, Lang } from "@/lib/lang";

const LANGUAGES: { code: Lang; label: string; flag: string }[] = [
	{ code: "en", label: "English", flag: "🇺🇸" },
	{ code: "tr", label: "Turkish", flag: "🇹🇷" },
	{ code: "ar", label: "Arabic", flag: "🇸🇦" },
];

export default function SettingsToggle() {
	const { lang, setLang } = useLang();
	const { theme, setTheme, resolvedTheme } = useTheme();

	const [mounted, setMounted] = useState(false);

	// dropdown state (was the cause of the invalid hook when placed outside component)
	const [langDropdownOpen, setLangDropdownOpen] = useState(false);

	// main transition state
	const [isTransitioning, setIsTransitioning] = useState(false);

	// next values to apply when animation finishes
	const [nextLang, setNextLang] = useState(lang);
	const [nextTheme, setNextTheme] = useState(theme);

	// control when children start animating inside the overlay
	const [showChildren, setShowChildren] = useState(false);

	useEffect(() => setMounted(true), []);

	// When children finish animating we apply changes and close overlay.
	// Using a timeout based on the stagger + item duration yields a reliable "wow" moment.
	useEffect(() => {
		if (!showChildren) return;
		// timings: delayChildren (0.06) + stagger*(items-1) + childDuration (0.4) ≈ 0.7s
		const timeout = setTimeout(() => {
			// apply theme/lang
			if (nextLang !== lang) setLang(nextLang);
			if (nextTheme && nextTheme !== theme) setTheme(nextTheme);
			// close overlay, triggering exit animation
			setIsTransitioning(false);
		}, 700);

		return () => clearTimeout(timeout);
	}, [showChildren, nextLang, nextTheme, lang, theme, setLang, setTheme]);

	if (!mounted || !resolvedTheme) return null;

	const handleLangChange = (newLang: typeof lang) => {
		if (newLang === lang || isTransitioning) return;
		setNextLang(newLang);
		setShowChildren(false);
		setIsTransitioning(true);
	};

	const toggleTheme = () => {
		if (isTransitioning) return;
		setNextTheme(resolvedTheme === "dark" ? "light" : "dark");
		setShowChildren(false);
		setIsTransitioning(true);
	};

	// Variants for staggered container and items
	const containerVariants: Variants = {
		hidden: {},
		show: {
			transition: {
				staggerChildren: 0.12,
				delayChildren: 0.06,
			},
		},
	};

	const itemVariants: Variants = {
		hidden: { y: 10, opacity: 0, scale: 1 },
		show: {
			y: 0,
			opacity: 1,
			scale: 1,
			transition: { duration: 0.38, ease: "easeOut" },
		},
	};

	return (
		<div className="flex items-center gap-3 relative">
			<div className="relative">
				<button
					onClick={() => setLangDropdownOpen((s) => !s)}
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
							transition={{ duration: 0.16 }}
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

			{/* ---------- START: Staggered Children Reveal Overlay ---------- */}
			<AnimatePresence>
				{isTransitioning && (
					<div className="w-full h-[120svh] fixed inset-0 z-[999997] pointer-events-none">
						{/* Soft glow layer */}
						<motion.div
							key="glow"
							className="fixed w-full h-[120svh] inset-0 z-[999998] pointer-events-none"
							style={{ background: "rgba(0,0,0,0.65)" }}
							initial={{ opacity: 0 }}
							animate={{ opacity: 0.46 }}
							exit={{ opacity: 0 }}
							transition={{ duration: 0.5, ease: [0.76, 0, 0.24, 1] }}
						/>

						{/* Main mask overlay - diagonal sweep open/close */}
						<motion.div
							key="mask"
							className="fixed h-[120svh] inset-0 z-[999999] bg-zinc-900 flex items-center justify-center overflow-hidden"
							initial={{ clipPath: "polygon(0 0, 100% 0, 100% 0, 0 0)" }}
							animate={{
								clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
							}}
							exit={{ clipPath: "polygon(0 0, 100% 0, 100% 0, 0 0)" }}
							transition={{ duration: 0.69, ease: [0.76, 0, 0.24, 1] }} // nice
							onAnimationComplete={() => {
								// start children only after mask opens
								setShowChildren(true);
							}}>
							{/* Inner content container that staggers children */}
							<div className="w-full max-w-xl px-6">
								<motion.div
									variants={containerVariants}
									initial="hidden"
									animate={showChildren ? "show" : "hidden"}
									className="flex flex-col items-center gap-3">
									{/* Icon / Emoji */}
									<motion.div
										variants={itemVariants}
										className="rounded-full bg-zinc-800/60 border border-zinc-700 p-3 text-2xl"
										aria-hidden>
										{resolvedTheme === "dark" ? "🌙" : "☀️"}
									</motion.div>

									{/* Message */}
									<motion.div
										variants={itemVariants}
										className="text-center text-sm text-zinc-200/90 font-medium">
										Switching ...
									</motion.div>

									{/* Decorative staggered bars for extra flair */}
									<motion.div
										variants={itemVariants}
										className="flex items-center gap-2 mt-2"
										aria-hidden>
										<span className="h-1 w-16 rounded-full bg-zinc-700/60 block" />
										<span className="h-1 w-10 rounded-full bg-zinc-700/40 block" />
										<span className="h-1 w-6 rounded-full bg-zinc-700/30 block" />
									</motion.div>
								</motion.div>
							</div>
						</motion.div>
					</div>
				)}
			</AnimatePresence>
			{/* ---------- END: Staggered Children Reveal Overlay ---------- */}

			<button
				onClick={toggleTheme}
				className="relative flex hover:cursor-pointer transition-all duration-300 group h-10 w-10 items-center justify-center hover:bg-primary rounded-full bg-secondary text-secondary-foreground overflow-hidden">
				<motion.span
					key={resolvedTheme}
					initial={{ rotate: -180, opacity: 0 }}
					animate={{ rotate: 0, opacity: 1 }}
					exit={{ rotate: 180, opacity: 0 }}
					transition={{ duration: 0.45, ease: "easeInOut" }}
					className="text-lg relative z-10">
					{resolvedTheme === "dark" ? "🌙" : "☀️"}
				</motion.span>
			</button>
		</div>
	);
}
