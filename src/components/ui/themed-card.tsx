import type { ReactNode } from "react";

import {
	Card as BaseCard,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "~/components/ui/card";
import { cn, themeStyles } from "~/lib/theme";

interface ThemedCardProps {
	children: ReactNode;
	className?: string;
	variant?: "base" | "interactive" | "feature";
	featureColor?: "pink" | "purple" | "cyan" | "yellow";
}

export function ThemedCard({
	children,
	className,
	variant = "base",
	featureColor,
}: ThemedCardProps) {
	let cardClasses = "";

	switch (variant) {
		case "interactive":
			cardClasses = cn(
				"group overflow-hidden",
				themeStyles.card.interactive,
				"hover:scale-105",
			);
			break;
		case "feature": {
			const gradientClass = featureColor
				? themeStyles.featureCards[featureColor]
				: themeStyles.featureCards.pink;
			cardClasses = cn(
				"transform",
				themeStyles.card.feature,
				`bg-gradient-to-br ${gradientClass}`,
			);
			break;
		}
		default:
			cardClasses = cn(themeStyles.card.base, themeStyles.card.hover);
	}

	return <BaseCard className={cn(cardClasses, className)}>{children}</BaseCard>;
}

interface ThemedCardHeaderProps {
	icon?: ReactNode;
	title: string;
	description?: string;
	difficulty?: string;
	status?: "available" | "coming-soon";
	className?: string;
}

export function ThemedCardHeader({
	icon,
	title,
	description,
	difficulty,
	status,
	className,
}: ThemedCardHeaderProps) {
	return (
		<CardHeader className={cn("pb-4", className)}>
			{(icon || difficulty || status) && (
				<div className="flex items-start justify-between">
					{icon && (
						<div className="flex h-16 w-16 items-center justify-center rounded-2xl shadow-lg">
							{icon}
						</div>
					)}
					{(difficulty || status) && (
						<div className="text-right">
							{difficulty && (
								<div
									className={cn(
										"rounded-full px-3 py-1 font-medium text-xs",
										themeStyles.badge.difficulty,
									)}
								>
									{difficulty}
								</div>
							)}
							{status === "coming-soon" && (
								<div
									className={cn(
										"mt-2 rounded-full px-3 py-1 font-medium text-xs",
										themeStyles.badge.status,
									)}
								>
									Coming Soon
								</div>
							)}
						</div>
					)}
				</div>
			)}
			<CardTitle
				className={cn("text-left font-bold text-2xl", themeStyles.text.heading)}
			>
				{title}
			</CardTitle>
			{description && (
				<CardDescription
					className={cn("text-left text-lg", themeStyles.text.secondary)}
				>
					{description}
				</CardDescription>
			)}
		</CardHeader>
	);
}

interface ThemedCardContentProps {
	children: ReactNode;
	className?: string;
}

export function ThemedCardContent({
	children,
	className,
}: ThemedCardContentProps) {
	return (
		<CardContent className={cn(themeStyles.layout.section, className)}>
			{children}
		</CardContent>
	);
}

interface FeatureListProps {
	features: string[];
	className?: string;
}

export function FeatureList({ features, className }: FeatureListProps) {
	return (
		<div className={cn("space-y-3", className)}>
			<h4
				className={cn(
					"text-left font-semibold text-sm",
					themeStyles.text.heading,
				)}
			>
				Features:
			</h4>
			<div className="grid grid-cols-1 gap-2">
				{features.map((feature) => (
					<div key={feature} className="flex items-center gap-2">
						<div className="h-1.5 w-1.5 rounded-full bg-purple-400" />
						<span className={cn("text-sm", themeStyles.text.muted)}>
							{feature}
						</span>
					</div>
				))}
			</div>
		</div>
	);
}
