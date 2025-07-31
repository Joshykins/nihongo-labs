import "~/styles/globals.css";

import type { Metadata } from "next";
import { Geist } from "next/font/google";

import { TRPCReactProvider } from "~/trpc/react";

export const metadata: Metadata = {
	title: "数字-Dash | Suji-Dash - Master Japanese Numbers Fast",
	description: "The fun way to master Japanese number reading and typing. Improve your speed, accuracy, and progress with engaging exercises designed for English speakers learning Japanese.",
	keywords: ["Japanese", "numbers", "learning", "typing", "speed", "accuracy", "language learning", "suji", "数字"],
	authors: [{ name: "Suji-Dash Team" }],
	openGraph: {
		title: "数字-Dash | Suji-Dash - Master Japanese Numbers Fast",
		description: "The fun way to master Japanese number reading and typing. Speed • Accuracy • Progress",
		type: "website",
		locale: "en_US",
	},
	twitter: {
		card: "summary_large_image",
		title: "数字-Dash | Suji-Dash - Master Japanese Numbers Fast",
		description: "The fun way to master Japanese number reading and typing. Speed • Accuracy • Progress",
	},
	icons: [
		{ rel: "icon", url: "/favicon.svg", type: "image/svg+xml" },
		{ rel: "icon", url: "/favicon.ico" },
		{ rel: "apple-touch-icon", url: "/apple-touch-icon.svg", sizes: "180x180" }
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
		<html lang="en" className={`${geist.variable}`}>
			<body>
				<TRPCReactProvider>{children}</TRPCReactProvider>
			</body>
		</html>
	);
}
