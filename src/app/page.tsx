import {
	BookOpen,
	Github,
	Play,
	Sparkles,
	Target,
	Timer,
	TrendingUp,
	Zap,
} from "lucide-react";
import Link from "next/link";

import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "~/components/ui/card";

export default function Home() {
	return (
		<main className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-cyan-50">
			{/* Hero Section */}
			<section className="relative overflow-hidden">
				{/* Background decorative elements */}
				<div className="absolute inset-0 overflow-hidden">
					<div className="-top-40 -right-32 absolute h-80 w-80 rounded-full bg-gradient-to-br from-pink-300/30 to-purple-400/30 blur-3xl" />
					<div className="-bottom-32 -left-32 absolute h-80 w-80 rounded-full bg-gradient-to-br from-cyan-300/30 to-blue-400/30 blur-3xl" />
					<div className="-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 h-96 w-96 transform rounded-full bg-gradient-to-br from-yellow-300/20 to-orange-400/20 blur-3xl" />
				</div>

				<div className="container relative mx-auto px-4 py-20 sm:py-32">
					<div className="space-y-8 text-center">
						{/* Badge */}
						<Badge className="bg-gradient-to-r from-pink-500 to-purple-600 px-4 py-2 font-medium text-sm text-white">
							<Sparkles className="mr-2 h-4 w-4" />A Developer's Learning Tool
						</Badge>

						{/* Main Heading */}
						<div className="space-y-4">
							<h1 className="font-black text-6xl tracking-tight sm:text-7xl lg:text-8xl">
								<span className="bg-gradient-to-r from-pink-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
									数字-Dash
								</span>
							</h1>
							<h2 className="font-bold text-2xl text-gray-800 sm:text-3xl lg:text-4xl">
								Suji-Dash
							</h2>
							<p className="mx-auto max-w-3xl text-gray-600 text-xl leading-relaxed sm:text-2xl">
								A modern web app I built to improve my Japanese number reading
								speed.
								<br />
								<span className="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text font-semibold text-transparent">
									Instant access • No downloads • Just practice
								</span>
							</p>
						</div>

						{/* CTA Buttons */}
						<div className="flex flex-col items-center justify-center gap-4 pt-8 sm:flex-row">
							<Button
								size="lg"
								className="transform bg-gradient-to-r from-pink-500 to-purple-600 px-8 py-4 font-semibold text-lg text-white shadow-lg transition-all duration-300 hover:scale-105 hover:from-pink-600 hover:to-purple-700 hover:shadow-xl"
								asChild
							>
								<Link href="/practice">
									<Play className="mr-2 h-5 w-5" />
									Try It Out
								</Link>
							</Button>
							<Button
								variant="outline"
								size="lg"
								className="border-2 border-gray-300 px-8 py-4 font-semibold text-gray-700 text-lg transition-all duration-300 hover:border-purple-400 hover:text-purple-700"
								asChild
							>
								<Link
									href="https://github.com/Joshykins/suji-dash"
									target="_blank"
									rel="noopener noreferrer"
								>
									<Github className="mr-2 h-5 w-5" />
									View on GitHub
								</Link>
							</Button>
						</div>
					</div>
				</div>
			</section>

			{/* Features Section */}
			<section className="bg-white/40 py-20 backdrop-blur-sm">
				<div className="container mx-auto px-4">
					<div className="mb-16 text-center">
						<h3 className="mb-4 font-bold text-4xl text-gray-800">
							What Makes <span className="text-purple-600">Suji-Dash</span>{" "}
							Different?
						</h3>
						<p className="mx-auto max-w-2xl text-gray-600 text-xl">
							Built by a developer learning Japanese, for fellow learners
						</p>
					</div>

					<div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-2 lg:grid-cols-4">
						<Card className="transform border-0 bg-gradient-to-br from-pink-50 to-pink-100 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl">
							<CardHeader>
								<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-pink-600">
									<Zap className="h-6 w-6 text-white" />
								</div>
								<CardTitle className="font-bold text-gray-800 text-xl">
									Lightning Fast
								</CardTitle>
								<CardDescription className="text-gray-600">
									Improve your number recognition speed with focused practice
								</CardDescription>
							</CardHeader>
						</Card>

						<Card className="transform border-0 bg-gradient-to-br from-purple-50 to-purple-100 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl">
							<CardHeader>
								<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-purple-600">
									<Target className="h-6 w-6 text-white" />
								</div>
								<CardTitle className="font-bold text-gray-800 text-xl">
									Accuracy First
								</CardTitle>
								<CardDescription className="text-gray-600">
									Build muscle memory with immediate feedback on your answers
								</CardDescription>
							</CardHeader>
						</Card>

						<Card className="transform border-0 bg-gradient-to-br from-cyan-50 to-cyan-100 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl">
							<CardHeader>
								<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-cyan-600">
									<TrendingUp className="h-6 w-6 text-white" />
								</div>
								<CardTitle className="font-bold text-gray-800 text-xl">
									Track Progress
								</CardTitle>
								<CardDescription className="text-gray-600">
									See your improvement over time with simple progress tracking
								</CardDescription>
							</CardHeader>
						</Card>

						<Card className="transform border-0 bg-gradient-to-br from-yellow-50 to-orange-100 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl">
							<CardHeader>
								<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-yellow-500 to-orange-500">
									<Timer className="h-6 w-6 text-white" />
								</div>
								<CardTitle className="font-bold text-gray-800 text-xl">
									Timed Practice
								</CardTitle>
								<CardDescription className="text-gray-600">
									Challenge yourself with time-based exercises to build speed
								</CardDescription>
							</CardHeader>
						</Card>
					</div>
				</div>
			</section>

			{/* Developer Story Section */}
			<section className="py-20">
				<div className="container mx-auto px-4">
					<div className="mx-auto max-w-4xl text-center">
						<h3 className="mb-8 font-bold text-4xl text-gray-800">
							Why I Built This
						</h3>
						<div className="space-y-6 text-gray-600 text-lg leading-relaxed">
							<p>
								As a developer learning Japanese, I struggled with number
								recognition speed. Reading prices, addresses, and dates was
								painfully slow.
							</p>
							<p>
								Most language learning apps are bloated with features I didn't
								need. I wanted something I could quickly open in my browser,
								practice for 5 minutes, and actually see progress.
							</p>
							<p>
								So I built a modern, lightweight web app that focuses on one
								thing:
								<span className="font-semibold text-purple-600">
									{" "}
									making Japanese number recognition fast and effortless
								</span>
								.
							</p>
							<p className="font-semibold text-purple-600">
								No downloads, no sign-ups, just instant practice whenever you
								need it.
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="bg-gradient-to-r from-pink-500 via-purple-600 to-cyan-600 py-20">
				<div className="container mx-auto px-4 text-center">
					<div className="mx-auto max-w-3xl space-y-8">
						<h3 className="font-bold text-4xl text-white sm:text-5xl">
							Give It a Try
						</h3>
						<p className="text-white/90 text-xl">
							A modern, responsive web app that works on any device. No
							downloads, no accounts - just bookmark and practice anywhere.
						</p>
						<div className="flex flex-col justify-center gap-4 sm:flex-row">
							<Button
								size="lg"
								className="transform bg-white px-8 py-4 font-semibold text-lg text-purple-600 shadow-lg transition-all duration-300 hover:scale-105 hover:bg-gray-100 hover:shadow-xl"
								asChild
							>
								<Link href="/practice">
									<Play className="mr-2 h-5 w-5" />
									Start Practicing
								</Link>
							</Button>
							<Button
								variant="outline"
								size="lg"
								className="border-2 border-white bg-transparent px-8 py-4 font-semibold text-lg text-white transition-all duration-300 hover:bg-white hover:text-purple-600"
								asChild
							>
								<Link
									href="https://github.com/Joshykins/suji-dash"
									target="_blank"
									rel="noopener noreferrer"
								>
									<Github className="mr-2 h-5 w-5" />
									View Source
								</Link>
							</Button>
						</div>
					</div>
				</div>
			</section>
		</main>
	);
}
