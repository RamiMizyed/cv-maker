import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LangProvider } from "@/lib/lang";
import SmoothScroll from "@/lib/SmoothScroll";
import { ThemeProvider } from "next-themes";
import NavBar from "@/components/ui/navBar";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

// ✅ Fix: set metadataBase so OG/Twitter images resolve properly
export const metadata: Metadata = {
	metadataBase: new URL("https://ramimizyed.dev"),
	title: "CV Maker - Client Side CV Builder",
	description:
		"Browser-side CV builder by Rami Mizyed. Create professional CVs with multilingual support (English, Arabic, Turkish).",
	applicationName: "CV Maker",
	keywords: [
		"CV",
		"resume",
		"cv maker",
		"resume builder",
		"Rami Mizyed",
		"multilingual",
		"Arabic",
		"Turkish",
		"English",
	],
	authors: [{ name: "Rami Mizyed", url: "https://ramimizyed.dev" }],
	creator: "Rami Mizyed",
	publisher: "Rami Mizyed",
	robots: { index: true, follow: true },
	openGraph: {
		title: "CV Maker — Rami Mizyed",
		description:
			"Create professional CVs in English, Arabic and Turkish — all in the browser.",
		url: "https://ramimizyed.dev/cv-maker",
		siteName: "CV Maker",
		images: [
			{
				url: "/assets/CVmakerMainImg.png",
				width: 1200,
				height: 630,
				alt: "CV Maker by Rami Mizyed",
			},
		],
		locale: "en_US",
		type: "website",
	},
	twitter: {
		card: "summary_large_image",
		title: "CV Maker — Rami Mizyed",
		description:
			"Create professional CVs in English, Arabic and Turkish — all in the browser.",
		creator: "@RamiMizyed",
		images: ["/assets/CVmakerMainImg.png"],
	},
	icons: {
		icon: "/favicon.ico",
		shortcut: "/favicon.ico",
		apple: "/apple-touch-icon.png",
	},
};

// ✅ Fix: Move viewport & themeColor out of metadata
export const viewport: Viewport = {
	width: "device-width",
	initialScale: 1,
	colorScheme: "light dark",
	themeColor: [
		{ media: "(prefers-color-scheme: light)", color: "#ffffff" },
		{ media: "(prefers-color-scheme: dark)", color: "#0f172a" },
	],
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
				<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
					<LangProvider>
						<SmoothScroll>
							<NavBar />
							<main className="min-h-screen">{children}</main>
						</SmoothScroll>
					</LangProvider>
				</ThemeProvider>
			</body>
		</html>
	);
}
