import "~/styles/globals.css";
import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { Geist } from "next/font/google";

import { ThemeProvider } from "~/components/theme-provider";
import { TRPCReactProvider } from "~/trpc/react";

export const metadata: Metadata = {
	title: "日本語-Labs | Master Japanese Numbers & Dates Fast",
	description:
		"Master Japanese numbers and dates with 数字-Dash (Suji-Dash) and 日付-Dash (Hidzuke-Dash). Interactive practice tools for learning Japanese numbers, dates, days, and months with speed and accuracy.",
	keywords: [
		"Japanese",
		"numbers",
		"dates",
		"learning",
		"typing",
		"speed",
		"accuracy",
		"language learning",
		"suji",
		"hidzuke",
		"数字",
		"日付",
		"nihongo",
		"practice",
		"days of week",
		"months",
	],
	authors: [{ name: "Nihongo Labs" }],
	openGraph: {
		title: "日本語-Labs | Master Japanese Numbers & Dates",
		description:
			"Interactive practice tools for Japanese numbers and dates. Master 数字 (numbers) and 日付 (dates) with engaging exercises designed for learners.",
		type: "website",
		locale: "en_US",
		siteName: "Nihongo Labs",
	},
	twitter: {
		card: "summary_large_image",
		title: "日本語-Labs | Master Japanese Numbers & Dates",
		description:
			"Interactive practice tools for Japanese numbers and dates. Master 数字 and 日付 with speed and accuracy.",
	},
	icons: [
		{ rel: "icon", url: "/favicon.svg", type: "image/svg+xml" },
		{ rel: "apple-touch-icon", url: "/apple-touch-icon.svg", sizes: "180x180" },
	],
	manifest: "/manifest.json",
	robots: "index, follow",
};

export const viewport = {
	width: "device-width",
	initialScale: 1,
};

const geist = Geist({
	subsets: ["latin"],
	variable: "--font-geist-sans",
});

export default function RootLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<html lang="en" className={`${geist.variable}`} suppressHydrationWarning>
			<body>
				<ThemeProvider
					attribute="class"
					defaultTheme="light"
					enableSystem
					disableTransitionOnChange
				>
					<TRPCReactProvider>{children}</TRPCReactProvider>
					<Analytics />
				</ThemeProvider>
			</body>
		</html>
	);
}
