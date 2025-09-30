"use client";
import React, { useState, useEffect, useRef } from "react";
import { gsap, Power3 } from "gsap";

const Loading = () => {
	const [hydrated, setHydrated] = useState(false);
	const [isVisible, setIsVisible] = useState(true);

	const loadingRef = useRef<HTMLDivElement>(null);

	// Detect hydration
	useEffect(() => {
		setHydrated(true);
	}, []);

	// Exit animation after hydration
	useEffect(() => {
		if (hydrated && loadingRef.current) {
			const exitTl = gsap.timeline({
				onComplete: () => setIsVisible(false),
			});

			exitTl.to(loadingRef.current, {
				duration: 0.6,
				y: "100%",
				opacity: 0,
				ease: Power3.easeInOut,
			});
		}
	}, [hydrated]);

	if (!isVisible) return null;

	return (
		<div
			ref={loadingRef}
			className="fixed inset-0 z-[99999] flex flex-col gap-10 items-center justify-center bg-black text-white text-3xl font-bold">
			<div className="w-12 h-12 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
			<h3>Loading ...</h3>
		</div>
	);
};

export default Loading;
