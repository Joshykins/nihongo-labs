"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { DarkModeToggle } from "~/components/dark-mode-toggle";
import { Button } from "~/components/ui/button";
import { cn, themeStyles } from "~/lib/theme";

interface PageLayoutProps {
	children: ReactNode;
	showBackButton?: boolean;
	backHref?: string;
	className?: string;
}

export function PageLayout({
	children,
	showBackButton = false,
	backHref = "/",
	className,
}: PageLayoutProps) {
	return (
		<main className={cn(themeStyles.page.main, className)}>
			{/* Floating Navigation */}
			<div className="absolute top-6 right-6 left-6 z-50 flex justify-between">
				{showBackButton ? (
					<div className="fade-in-0 animate-in delay-300 duration-500">
						<Button
							asChild
							variant="outline"
							size="icon"
							className={cn(
								"h-10 w-10 rounded-full shadow-lg",
								themeStyles.button.floating,
								themeStyles.button.floatingHover,
								themeStyles.navigation.backButton,
							)}
						>
							<Link href={backHref}>
								<ArrowLeft className="h-4 w-4" />
							</Link>
						</Button>
					</div>
				) : (
					<div />
				)}

				<div className="fade-in-0 animate-in delay-300 duration-500">
					<DarkModeToggle />
				</div>
			</div>

			{/* Page Content */}
			<div className="relative">{children}</div>
		</main>
	);
}

interface SectionProps {
	children: ReactNode;
	className?: string;
	variant?: "default" | "alt";
}

export function Section({
	children,
	className,
	variant = "default",
}: SectionProps) {
	const sectionClass =
		variant === "alt" ? themeStyles.page.sectionAlt : themeStyles.page.section;

	return (
		<section
			className={cn(sectionClass, themeStyles.layout.section, className)}
		>
			<div className={themeStyles.layout.container}>{children}</div>
		</section>
	);
}

interface HeadingProps {
	children: ReactNode;
	level: "h1" | "h2" | "h3" | "h4";
	className?: string;
	centered?: boolean;
}

export function Heading({
	children,
	level,
	className,
	centered = false,
}: HeadingProps) {
	const Component = level;
	const baseClasses = {
		h1: "font-black text-6xl tracking-tight sm:text-7xl lg:text-8xl",
		h2: "font-bold text-2xl sm:text-3xl lg:text-4xl",
		h3: "font-bold text-4xl",
		h4: "font-semibold text-xl",
	}[level];

	return (
		<Component
			className={cn(
				baseClasses,
				themeStyles.text.heading,
				centered && "text-center",
				className,
			)}
		>
			{children}
		</Component>
	);
}
