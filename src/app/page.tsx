import {
	BookOpen,
	Calculator,
	Calendar,
	Github,
	Play,
	Sparkles,
	Target,
	Timer,
	TrendingUp,
	Zap,
} from "lucide-react";
import Link from "next/link";

import { Heading, PageLayout, Section } from "~/components/layout/page-layout";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "~/components/ui/card";
import { componentVariants, themeStyles } from "~/lib/theme";

interface LearningTool {
	id: string;
	title: string;
	description: string;
	longDescription: string;
	icon: React.ReactNode;
	href: string;
	difficulty: "Beginner" | "Intermediate" | "Advanced";
	features: string[];
	color: string;
	status: "available" | "coming-soon";
}

const learningTools: LearningTool[] = [
	{
		id: "suji-dash",
		title: "数字-Dash (Suuji-Dash)",
		description: "Master Japanese numbers with speed practice",
		longDescription:
			"Learn to read and pronounce Japanese numbers from 1 to 999 trillion with instant feedback and pronunciation guides.",
		icon: <Calculator className="h-8 w-8" />,
		href: "/suji-dash",
		difficulty: "Beginner",
		features: [
			"Number → Japanese conversion",
			"Kanji → Reading practice",
			"Pronunciation with TTS",
			"Progressive difficulty levels",
			"Real-time feedback",
			"Performance analytics",
		],
		color: "from-purple-500 to-blue-600",
		status: "available",
	},
	{
		id: "date-dash",
		title: "日付-Dash (Hidzuke-Dash)",
		description: "Master Japanese dates, days, and months",
		longDescription:
			"Learn to express dates, days of the week, months, and time expressions in Japanese with interactive practice.",
		icon: <Calendar className="h-8 w-8" />,
		href: "/hidzuke-dash",
		difficulty: "Beginner",
		features: [
			"Days of the week practice",
			"Month names and counters",
			"Date expressions",
			"Time-related vocabulary",
			"Real calendar integration",
			"Audio pronunciation",
		],
		color: "from-emerald-500 to-teal-600",
		status: "available",
	},
];

export default function Home() {
	return (
		<PageLayout>
			{/* Hero Section */}
			<section className="relative overflow-hidden">
				{/* Background decorative elements */}
				<div className="absolute inset-0 overflow-hidden">
					<div className="-right-32 -top-40 absolute h-80 w-80 rounded-full bg-gradient-to-br from-pink-300/30 to-purple-400/30 blur-3xl" />
					<div className="-bottom-32 -left-32 absolute h-80 w-80 rounded-full bg-gradient-to-br from-cyan-300/30 to-blue-400/30 blur-3xl" />
					<div className="-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 h-96 w-96 transform rounded-full bg-gradient-to-br from-yellow-300/20 to-orange-400/20 blur-3xl" />
				</div>

				<div className="container relative mx-auto px-4 py-20 sm:py-32">
					<div className={componentVariants.spacing.section}>
						{/* Badge */}
						<div className="text-center">
							<Badge className="bg-gradient-to-r from-pink-500 to-purple-600 px-4 py-2 font-medium text-sm text-white">
								<Sparkles className="mr-2 h-4 w-4" />
								Japanese Learning Platform
							</Badge>
						</div>

						{/* Main Heading */}
						<div className="space-y-4 text-center">
							<Heading level="h1" centered>
								<span className="bg-gradient-to-r from-pink-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
									日本語<span>-Labs</span>
								</span>
							</Heading>
							<Heading level="h2" centered className={themeStyles.text.primary}>
								Interactive Japanese Learning Tools
							</Heading>
							<p
								className={`mx-auto max-w-3xl text-xl leading-relaxed sm:text-2xl ${themeStyles.text.secondary}`}
							>
								Master Japanese with focused practice tools designed for modern
								learners.
								<br />
								<span className="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text font-semibold text-transparent">
									Choose your learning adventure
								</span>
							</p>
						</div>

						<div className="mx-auto max-w-6xl pt-16">
							<div className="grid grid-cols-1 gap-8 md:grid-cols-2">
								{learningTools.map((tool) => (
									<Card key={tool.id} className={themeStyles.card.interactive}>
										<CardHeader>
											<div className="flex items-start gap-4">
												<div
													className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${tool.color} text-white shadow-lg`}
												>
													{tool.icon}
												</div>
												<div className="flex-1 space-y-2">
													<div className="flex items-center gap-2">
														<CardTitle className={themeStyles.text.primary}>
															{tool.title}
														</CardTitle>
														<Badge
															variant={
																tool.difficulty === "Beginner"
																	? "secondary"
																	: tool.difficulty === "Intermediate"
																		? "default"
																		: "destructive"
															}
															className="text-xs"
														>
															{tool.difficulty}
														</Badge>
														{tool.status === "coming-soon" && (
															<Badge variant="outline" className="text-xs">
																Coming Soon
															</Badge>
														)}
													</div>
													<CardDescription
														className={themeStyles.text.secondary}
													>
														{tool.description}
													</CardDescription>
												</div>
											</div>
										</CardHeader>
										<CardContent>
											<p
												className={`text-left text-sm leading-relaxed ${themeStyles.text.body}`}
											>
												{tool.longDescription}
											</p>

											<div className="mt-4 space-y-2">
												{tool.features.map((feature) => (
													<div
														key={feature}
														className="flex items-center gap-2"
													>
														<div className="h-1.5 w-1.5 rounded-full bg-purple-500" />
														<span
															className={`text-sm ${themeStyles.text.body}`}
														>
															{feature}
														</span>
													</div>
												))}
											</div>

											{tool.status === "available" ? (
												<Link href={tool.href}>
													<Button
														className={`mt-6 w-full transform bg-gradient-to-r ${tool.color} text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl`}
														size="lg"
													>
														<Zap className="mr-2 h-4 w-4" />
														Start Learning
													</Button>
												</Link>
											) : (
												<Button
													disabled
													className="mt-6 w-full"
													size="lg"
													variant="outline"
												>
													<BookOpen className="mr-2 h-4 w-4" />
													Coming Soon
												</Button>
											)}
										</CardContent>
									</Card>
								))}
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Features Section */}
			<Section>
				<div className="mb-16 text-center">
					<Heading level="h3" centered className="mb-4">
						What Makes <span className="text-purple-600">日本語-labs</span>{" "}
						Different?
					</Heading>
					<p
						className={`mx-auto max-w-2xl text-xl ${themeStyles.text.secondary}`}
					>
						Purpose-built learning tools by a developer learning Japanese, for
						fellow learners
					</p>
				</div>

				<div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-2 lg:grid-cols-4">
					<Card className={themeStyles.card.feature}>
						<CardHeader>
							<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-pink-600">
								<Zap className="h-6 w-6 text-white" />
							</div>
							<CardTitle className={themeStyles.text.primary}>
								Lightning Fast
							</CardTitle>
							<CardDescription className={themeStyles.text.secondary}>
								Improve your Japanese skills with focused, speed-based practice
								sessions
							</CardDescription>
						</CardHeader>
					</Card>

					<Card className={themeStyles.card.feature}>
						<CardHeader>
							<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-purple-600">
								<Target className="h-6 w-6 text-white" />
							</div>
							<CardTitle className={themeStyles.text.primary}>
								Accuracy First
							</CardTitle>
							<CardDescription className={themeStyles.text.secondary}>
								Build muscle memory with immediate feedback on your answers
							</CardDescription>
						</CardHeader>
					</Card>

					<Card className={themeStyles.card.feature}>
						<CardHeader>
							<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-cyan-600">
								<TrendingUp className="h-6 w-6 text-white" />
							</div>
							<CardTitle className={themeStyles.text.primary}>
								Track Progress
							</CardTitle>
							<CardDescription className={themeStyles.text.secondary}>
								See your improvement over time with simple progress tracking
							</CardDescription>
						</CardHeader>
					</Card>

					<Card className={themeStyles.card.feature}>
						<CardHeader>
							<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-yellow-500 to-orange-500">
								<Timer className="h-6 w-6 text-white" />
							</div>
							<CardTitle className={themeStyles.text.primary}>
								Timed Practice
							</CardTitle>
							<CardDescription className={themeStyles.text.secondary}>
								Challenge yourself with time-based exercises to build speed
							</CardDescription>
						</CardHeader>
					</Card>
				</div>
			</Section>

			{/* Developer Story Section */}
			<Section variant="alt">
				<div className="mx-auto max-w-4xl text-center">
					<Heading level="h3" centered className="mb-8">
						Why I Built This
					</Heading>
					<div
						className={`space-y-6 text-lg leading-relaxed ${themeStyles.text.secondary}`}
					>
						<p>
							As a developer learning Japanese, I struggled with the
							fundamentals: number recognition, dates, days of the week. These
							basics were holding me back from real-world Japanese.
						</p>
						<p>
							Most language learning apps are bloated with features I didn't
							need. I wanted focused tools I could quickly open in my browser,
							practice for 5 minutes, and actually see progress.
						</p>
						<p>
							So I built a collection of modern, lightweight tools that each
							focus on
							<span className="font-semibold text-purple-600">
								{" "}
								mastering one essential Japanese skill at a time
							</span>
							.
						</p>
						<p className="font-semibold text-purple-600">
							No downloads, no sign-ups, just instant practice whenever you need
							it.
						</p>
					</div>
				</div>
			</Section>

			{/* CTA Section */}
			<section className="bg-gradient-to-r from-pink-500 via-purple-600 to-cyan-600 py-20">
				<div className="container mx-auto px-4 text-center">
					<div className="mx-auto max-w-3xl space-y-8">
						<Heading level="h3" className="text-white sm:text-5xl">
							Give It a Try
						</Heading>
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
								<Link href="/suji-dash">
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
									href="https://github.com/Joshykins/nihongo-labs"
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
		</PageLayout>
	);
}
