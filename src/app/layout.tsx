import type { Metadata } from "next";
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

export const metadata: Metadata = {
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
	viewport: { width: "device-width", initialScale: 1 },
	robots: { index: true, follow: true },
	colorScheme: "light dark",
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
	},
	icons: {
		icon: "/favicon.ico",
		shortcut: "/favicon.ico",
		apple: "/apple-touch-icon.png",
	},
	themeColor: [
		{ media: "(prefers-color-scheme: light)", color: "#ffffff" },
		{ media: "(prefers-color-scheme: dark)", color: "#0f172a" },
	],
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
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
