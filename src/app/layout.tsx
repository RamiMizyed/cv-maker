import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LangProvider } from "@/lib/lang";
import SmoothScroll from "@/lib/SmoothScroll";
import { ThemeProvider } from "next-themes";
import NavBar from "@/components/ui/navBar";
import { Analytics } from "@vercel/analytics/next";
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
	metadataBase: new URL("https://cvmaker.ramimizyed.dev"),
	title: "CV Maker: Free AI CV Builder",
	description:
		"Free CV builder with four templates, AI job tailoring, a CV check and PDF export. English, Turkish and Arabic. No sign-up; your data stays in your browser.",
	applicationName: "CV Maker",
	keywords: [
		"CV",
		"resume",
		"cv maker",
		"resume builder",
		"Rami Mizyed",
		"multilingual",
		"ATS",
		"cover letter",
		"AI resume",
		"Arabic",
		"Turkish",
		"English",
	],
	authors: [{ name: "Rami Mizyed", url: "https://ramimizyed.dev" }],
	creator: "Rami Mizyed",
	publisher: "Rami Mizyed",
	robots: { index: true, follow: true },
	openGraph: {
		title: "CV Maker by Rami Mizyed",
		description:
			"Build, tailor and export a job-ready CV in English, Arabic or Turkish, right in your browser.",
		url: "https://cvmaker.ramimizyed.dev",
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
		title: "CV Maker by Rami Mizyed",
		description:
			"Build, tailor and export a job-ready CV in English, Arabic or Turkish, right in your browser.",
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
					<Analytics />
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
