"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { Button } from "~/components/ui/button";

export function DarkModeToggle() {
	const [mounted, setMounted] = useState(false);
	const { theme, setTheme } = useTheme();

	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) {
		return (
			<Button
				variant="outline"
				size="icon"
				className="h-9 w-9 border-gray-300 bg-white/80 backdrop-blur-sm dark:border-gray-600 dark:bg-gray-800/80"
			>
				<Sun className="h-4 w-4" />
			</Button>
		);
	}

	return (
		<Button
			variant="outline"
			size="icon"
			onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
			className="h-9 w-9 border-gray-300 bg-white/80 backdrop-blur-sm transition-all duration-200 hover:bg-white dark:border-gray-600 dark:bg-gray-800/80 dark:hover:bg-gray-700"
		>
			{theme === "dark" ? (
				<Sun className="h-4 w-4 text-white" />
			) : (
				<Moon className="h-4 w-4 text-gray-600" />
			)}
			<span className="sr-only">Toggle dark mode</span>
		</Button>
	);
}
