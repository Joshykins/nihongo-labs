// Theme configuration for consistent dark/light mode styling
export const themeStyles = {
	// Page backgrounds
	page: {
		main: "min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-cyan-50 dark:from-gray-900 dark:via-purple-900 dark:to-cyan-900",
		section: "bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm",
		sectionAlt: "bg-gray-50/40 dark:bg-gray-900/40 backdrop-blur-sm",
	},

	// Text colors
	text: {
		primary: "text-gray-800 dark:text-gray-100",
		secondary: "text-gray-700 dark:text-gray-200",
		muted: "text-gray-500 dark:text-gray-400",
		heading: "text-gray-800 dark:text-gray-100",
		body: "text-gray-700 dark:text-gray-200",
	},

	// Card styles
	card: {
		base: "bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl",
		hover: "hover:shadow-2xl transition-all duration-300",
		feature: "bg-gradient-to-br shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl border-0",
		interactive:
			"bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl",
	},

	// Button styles
	button: {
		floating:
			"bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg transition-all hover:shadow-xl",
		floatingHover: "hover:bg-white dark:hover:bg-gray-700",
		outline: "border-gray-300 dark:border-gray-600 bg-white/80 dark:bg-gray-800/80",
	},

	// Badge/tag styles
	badge: {
		difficulty:
			"bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300",
		status: "bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300",
	},

	// Feature card gradients with dark mode
	featureCards: {
		pink: "from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20",
		purple: "from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20",
		cyan: "from-cyan-50 to-cyan-100 dark:from-cyan-900/20 dark:to-cyan-800/20",
		yellow: "from-yellow-50 to-orange-100 dark:from-yellow-900/20 dark:to-orange-800/20",
	},

	// Navigation
	navigation: {
		backButton:
			"text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400",
		link: "text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400",
	},

	// Form elements
	form: {
		input: "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100",
		label: "text-gray-700 dark:text-gray-300",
		select: "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100",
	},

	// Game/practice specific
	game: {
		correct: "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300",
		incorrect:
			"bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300",
		neutral: "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200",
	},

	// Layout components
	layout: {
		container: "container mx-auto px-4",
		section: "py-20",
		sectionSmall: "py-12",
	},
} as const;

// Utility function to combine theme classes
export function cn(...classes: (string | undefined | null | false)[]): string {
	return classes.filter(Boolean).join(" ");
}

// Common component variants
export const componentVariants = {
	heading: {
		h1: "font-black text-6xl tracking-tight sm:text-7xl lg:text-8xl",
		h2: "font-bold text-2xl sm:text-3xl lg:text-4xl",
		h3: "font-bold text-4xl",
		h4: "font-semibold text-xl",
	},
	spacing: {
		section: "space-y-8",
		card: "space-y-6",
		list: "space-y-3",
	},
} as const;
