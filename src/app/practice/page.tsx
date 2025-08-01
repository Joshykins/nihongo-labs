"use client";

import {
	ArrowDown,
	ArrowUp,
	BarChart3,
	Check,
	Clock,
	Crown,
	Eye,
	EyeOff,
	RefreshCw,
	RotateCcw,
	Settings,
	Sliders,
	Sparkles,
	Target,
	Timer,
	TrendingUp,
	Trophy,
	Volume2,
	X,
	Zap,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "~/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "~/components/ui/dialog";
import {
	type JapaneseNumber,
	convertToJapanese,
	formatNumberWithCommas,
	generateRandomNumber,
	isAnswerCorrect,
	roundToRealistic,
} from "~/lib/japanese-numbers";

interface PracticeAttempt {
	number: number;
	japanese: JapaneseNumber;
	userGuess: string;
	isCorrect: boolean;
	timeMs: number;
	timestamp: Date;
	practiceLevel: PracticeLevel;
}

interface Stats {
	totalAttempts: number;
	correctAttempts: number;
	averageTime: number;
	accuracy: number;
}

interface PronunciationSettings {
	autoPlay: boolean;
	playSpeed: number; // 0.5 to 2.0
	voice: "standard" | "alternative"; // for numbers with multiple pronunciations
}

interface PracticeModeSettings {
	displayMode: "number-to-japanese" | "kanji-to-japanese";
	rangeMin: number;
	rangeMax: number;
	customRanges: Array<{ label: string; min: number; max: number }>;
}

type PracticeLevel =
	| "basic"
	| "compound"
	| "complex"
	| "advanced"
	| "master"
	| "millions"
	| "billions"
	| "trillions";

interface PracticeLevelConfig {
	label: string;
	description: string;
	minNumber: number;
	maxNumber: number;
	icon: React.ReactNode;
	tips?: string[];
}

const practiceLevelConfigs: Record<PracticeLevel, PracticeLevelConfig> = {
	basic: {
		label: "Basic",
		description: "1-19 (Simple sounds)",
		minNumber: 1,
		maxNumber: 19,
		icon: <Target className="h-4 w-4" />,
		tips: [
			"Numbers 1-10 have unique sounds: いち, に, さん, よん/し, ご, ろく, しち/なな, はち, きゅう/く, じゅう",
			"Most numbers are straightforward: いち (ichi), に (ni), さん (san)",
			"Some have alternative pronunciations: 4 = よん (yon) or し (shi), 7 = なな (nana) or しち (shichi)",
		],
	},
	compound: {
		label: "Compound",
		description: "20-99 (Two-part numbers)",
		minNumber: 20,
		maxNumber: 99,
		icon: <TrendingUp className="h-4 w-4" />,
		tips: [
			"Pattern: [tens] + [ones] → にじゅう + さん = にじゅうさん (23)",
			"Tens use じゅう: にじゅう (20), さんじゅう (30), よんじゅう (40)",
			"Just combine: ごじゅうなな (57) = 'fifty-seven' in Japanese",
		],
	},
	complex: {
		label: "Complex",
		description: "100-999 (Sound changes)",
		minNumber: 100,
		maxNumber: 999,
		icon: <Zap className="h-4 w-4" />,
		tips: [
			"Watch for sound changes: ひゃく (100) → さんびゃく (300), ろっぴゃく (600), はっぴゃく (800)",
			"300 = さんびゃく (not さんひゃく), 600 = ろっぴゃく (not ろくひゃく)",
			"800 = はっぴゃく (not はちひゃく) - these make pronunciation easier!",
		],
	},
	advanced: {
		label: "Advanced",
		description: "1000-9999 (Long compounds)",
		minNumber: 1000,
		maxNumber: 9999,
		icon: <Trophy className="h-4 w-4" />,
		tips: [
			"Thousands use せん: いっせん (1000), にせん (2000)",
			"More sound changes: 3000 = さんぜん (not さんせん), 8000 = はっせん (not はちせん)",
			"Pattern: [thousands]せん + [hundreds]ひゃく + [tens/ones]",
		],
	},
	master: {
		label: "Master",
		description: "10000-99999 (万 notation)",
		minNumber: 10000,
		maxNumber: 99999,
		icon: <Crown className="h-4 w-4" />,
		tips: [
			"Ten thousands use 万 (まん): いちまん (10,000), にまん (20,000)",
			"Pattern: [number] + まん → さんまん (30,000), ごまん (50,000)",
			"Combined: さんまんごせん (35,000) = 'three-ten-thousand five-thousand'",
		],
	},
	millions: {
		label: "Millions",
		description: "100000-99999999 (百万 scale)",
		minNumber: 100000,
		maxNumber: 99999999,
		icon: <Sparkles className="h-4 w-4" />,
		tips: [
			"Millions use ひゃくまん: いちひゃくまん (1,000,000)",
			"Large numbers: ごひゃくまん (5,000,000) = 'five-hundred-ten-thousands'",
			"Think in groups of 万: 50万 = ごじゅうまん",
		],
	},
	billions: {
		label: "Billions",
		description: "100000000-999999999999 (億 scale)",
		minNumber: 100000000,
		maxNumber: 999999999999,
		icon: <Zap className="h-4 w-4" />,
		tips: [
			"Hundred millions use 億 (おく): いちおく (100,000,000)",
			"Pattern: [number] + おく → じゅうおく (1 billion)",
			"Massive scale: いっちょう (1 trillion) = 一兆 uses 兆 (ちょう)",
		],
	},
	trillions: {
		label: "Trillions",
		description: "1000000000000-999999999999999 (兆 scale)",
		minNumber: 1000000000000,
		maxNumber: 999999999999999,
		icon: <Crown className="h-4 w-4" />,
		tips: [
			"Trillions use 兆 (ちょう): いっちょう (1,000,000,000,000)",
			"Pattern: [number] + ちょう → にちょう (2 trillion), じゅっちょう (10 trillion)",
			"Ultimate scale: 999兆 is the highest level in this practice system",
		],
	},
};

const generateNumberForLevel = (level: PracticeLevel): number => {
	const config = practiceLevelConfigs[level];
	const rawNumber = 
		Math.floor(Math.random() * (config.maxNumber - config.minNumber + 1)) +
		config.minNumber;
	
	// Apply realistic rounding to make numbers more practical
	return roundToRealistic(rawNumber);
};

const generateNumberBasedOnSettings = (
	practiceModeSettings: PracticeModeSettings,
	level?: PracticeLevel,
): number => {
	// If level is specified, use that (for level selector)
	if (level) {
		return generateNumberForLevel(level);
	}

	// Otherwise, use practice mode settings for range
	const { rangeMin, rangeMax } = practiceModeSettings;
	const rawNumber = Math.floor(Math.random() * (rangeMax - rangeMin + 1)) + rangeMin;
	
	// Apply realistic rounding to make numbers more practical
	return roundToRealistic(rawNumber);
};

export default function PracticePage() {
	const [currentNumber, setCurrentNumber] = useState<number>(
		generateRandomNumber(),
	);
	const [userGuess, setUserGuess] = useState<string>("");
	const [showAnswer, setShowAnswer] = useState<boolean>(false);
	const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
	const [startTime, setStartTime] = useState<number>(Date.now());
	const [attempts, setAttempts] = useState<PracticeAttempt[]>([]);
	const [currentTime, setCurrentTime] = useState<number>(Date.now());
	const [currentLevel, setCurrentLevel] = useState<PracticeLevel>("basic");
	const [currentStreak, setCurrentStreak] = useState<number>(0);
	const [bestStreak, setBestStreak] = useState<number>(0);
	const [showCelebration, setShowCelebration] = useState<boolean>(false);
	const [celebrationMessage, setCelebrationMessage] = useState<string>("");
	const [isPracticeModeDialogOpen, setIsPracticeModeDialogOpen] = useState<boolean>(false);
	const [pronunciationSettings, setPronunciationSettings] =
		useState<PronunciationSettings>({
			autoPlay: true,
			playSpeed: 0.8,
			voice: "standard",
		});
	const [practiceModeSettings, setPracticeModeSettings] =
		useState<PracticeModeSettings>({
			displayMode: "number-to-japanese",
			rangeMin: 1,
			rangeMax: 100,
			customRanges: [
				{ label: "1-20 (Basic)", min: 1, max: 20 },
				{ label: "1-100 (Extended)", min: 1, max: 100 },
				{ label: "1-500 (Intermediate)", min: 1, max: 500 },
				{ label: "1-1000 (Advanced)", min: 1, max: 1000 },
				{ label: "1-9999 (Expert)", min: 1, max: 9999 },
				{ label: "1-99999 (Ten Thousands)", min: 1, max: 99999 },
				{ label: "1-999999 (Hundred Thousands)", min: 1, max: 999999 },
				{ label: "1-9999999 (Millions)", min: 1, max: 9999999 },
				{ label: "1-99999999 (Ten Millions)", min: 1, max: 99999999 },
				{ label: "1-999999999 (Hundreds Millions)", min: 1, max: 999999999 },
				{ label: "1-999999999999 (Billions)", min: 1, max: 999999999999 },
				{ label: "1-999999999999999 (Trillions)", min: 1, max: 999999999999999 },
				{ label: "100-999 (Hundreds Only)", min: 100, max: 999 },
				{ label: "1000-9999 (Thousands Only)", min: 1000, max: 9999 },
				{ label: "10000-99999 (Ten Thousands Only)", min: 10000, max: 99999 },
				{
					label: "100000-999999 (Hundred Thousands Only)",
					min: 100000,
					max: 999999,
				},
				{
					label: "1000000-9999999 (Millions Only)",
					min: 1000000,
					max: 9999999,
				},
				{
					label: "100000000-999999999 (Hundreds Millions Only)",
					min: 100000000,
					max: 999999999,
				},
				{
					label: "1000000000000-999999999999999 (Trillions Only)",
					min: 1000000000000,
					max: 999999999999999,
				},
			],
		});
	const inputRef = useRef<HTMLInputElement>(null);

	const japaneseNumber: JapaneseNumber = convertToJapanese(currentNumber);

	// Calculate stats for different ranges
	const calculateStats = (count?: number): Stats => {
		const relevantAttempts = count ? attempts.slice(-count) : attempts;
		const totalAttempts = relevantAttempts.length;
		const correctAttempts = relevantAttempts.filter((a) => a.isCorrect).length;
		const averageTime =
			totalAttempts > 0
				? relevantAttempts.reduce((sum, a) => sum + a.timeMs, 0) / totalAttempts
				: 0;
		const accuracy =
			totalAttempts > 0 ? (correctAttempts / totalAttempts) * 100 : 0;

		return {
			totalAttempts,
			correctAttempts,
			averageTime,
			accuracy,
		};
	};

	// Helper function to calculate average time for last N attempts
	const averageTimeOfLast = (count: number): number => {
		if (attempts.length < count) return 0;
		const lastAttempts = attempts.slice(-count);
		return (
			lastAttempts.reduce((sum, attempt) => sum + attempt.timeMs, 0) / count
		);
	};

	const speakJapanese = () => {
		if ("speechSynthesis" in window) {
			// Cancel any ongoing speech
			window.speechSynthesis.cancel();

			// Choose text based on voice setting
			let textToSpeak = japaneseNumber.hiragana;
			if (pronunciationSettings.voice === "alternative") {
				// For alternative voice, use romaji for clearer pronunciation
				textToSpeak = japaneseNumber.romaji;
			}

			const utterance = new SpeechSynthesisUtterance(textToSpeak);
			utterance.lang =
				pronunciationSettings.voice === "alternative" ? "en-US" : "ja-JP";
			utterance.rate = pronunciationSettings.playSpeed;
			utterance.pitch = 1.0;

			// Try to find a specific voice if available
			const voices = window.speechSynthesis.getVoices();
			if (pronunciationSettings.voice === "standard") {
				const japaneseVoice = voices.find((voice) => voice.lang.includes("ja"));
				if (japaneseVoice) utterance.voice = japaneseVoice;
			} else {
				const englishVoice = voices.find((voice) => voice.lang.includes("en"));
				if (englishVoice) utterance.voice = englishVoice;
			}

			window.speechSynthesis.speak(utterance);
		}
	};

	const showCelebrationEffect = (streak: number, isCorrect: boolean) => {
		if (!isCorrect) return;

		let message = "";
		if (streak >= 10) {
			message = "🔥 ON FIRE! Amazing streak!";
		} else if (streak >= 5) {
			message = "⚡ Fantastic! Keep it up!";
		} else if (streak >= 3) {
			message = "🎯 Great job!";
		} else if (streak >= 2) {
			message = "✨ Nice work!";
		} else {
			message = "👍 Good!";
		}

		setCelebrationMessage(message);
		setShowCelebration(true);

		// Auto-hide celebration after 2 seconds
		setTimeout(() => {
			setShowCelebration(false);
		}, 2000);
	};

	const checkAnswer = () => {
		const endTime = Date.now();
		const timeMs = endTime - startTime;
		const guess = userGuess.toLowerCase().trim();
		const correct = isAnswerCorrect(guess, japaneseNumber);

		setIsCorrect(correct);
		setShowAnswer(true);

		// Update streak
		let newStreak = 0;
		if (correct) {
			newStreak = currentStreak + 1;
			setCurrentStreak(newStreak);
			if (newStreak > bestStreak) {
				setBestStreak(newStreak);
			}
			showCelebrationEffect(newStreak, true);
		} else {
			setCurrentStreak(0);
		}

		// Add to attempts history
		const attempt: PracticeAttempt = {
			number: currentNumber,
			japanese: japaneseNumber,
			userGuess: guess,
			isCorrect: correct,
			timeMs,
			timestamp: new Date(),
			practiceLevel: currentLevel,
		};

		setAttempts((prev) => [...prev, attempt]);

		// Auto-play pronunciation when answer is revealed if enabled
		if (pronunciationSettings.autoPlay) {
			setTimeout(() => {
				speakJapanese();
			}, 300); // Small delay for better UX
		}

		// Note: No auto-advance - user controls when to move to next question
	};

	const nextNumber = () => {
		const newNumber = generateNumberForLevel(currentLevel);
		setCurrentNumber(newNumber);
		setUserGuess("");
		setShowAnswer(false);
		setIsCorrect(null);
		setStartTime(Date.now());

		// Maintain focus on input field
		setTimeout(() => {
			inputRef.current?.focus();
		}, 100);
	};

	const toggleAnswer = () => {
		setShowAnswer(!showAnswer);
	};

	const handleKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" && !showAnswer) {
			e.preventDefault();
			checkAnswer();
		} else if (e.key === "Enter" && showAnswer) {
			e.preventDefault();
			nextNumber();
		} else if (showAnswer) {
			// Prevent typing when answer is shown (readonly mode)
			e.preventDefault();
		}
	};

	// Initialize start time when component mounts
	useEffect(() => {
		const newNumber = generateNumberForLevel(currentLevel);
		setCurrentNumber(newNumber);
		setStartTime(Date.now());

		// Note: No auto-pronunciation on load - user can click speak button if needed

		// Focus input field on initial load
		inputRef.current?.focus();
	}, [currentLevel]);

	// Live timer effect
	useEffect(() => {
		if (!showAnswer) {
			const interval = setInterval(() => {
				setCurrentTime(Date.now());
			}, 100); // Update every 100ms for smooth display
			return () => clearInterval(interval);
		}
	}, [showAnswer]);

	const formatTime = (ms: number) => {
		return `${(ms / 1000).toFixed(1)}s`;
	};

	// Performance comparison functions
	const getPerformanceComparison = (
		currentAvg: number,
		previousAvg: number,
	) => {
		if (previousAvg === 0) return { trend: "neutral", percentage: 0 };
		const improvement = ((previousAvg - currentAvg) / previousAvg) * 100;
		if (improvement > 5) return { trend: "better", percentage: improvement };
		if (improvement < -5)
			return { trend: "worse", percentage: Math.abs(improvement) };
		return { trend: "neutral", percentage: Math.abs(improvement) };
	};

	const currentElapsedTime = currentTime - startTime;

	const stats = {
		last10: calculateStats(10),
		last15: calculateStats(15),
		last25: calculateStats(25),
		total: calculateStats(),
	};

	return (
		<main className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-cyan-50">
			{/* Background decorative elements */}
			<div className="absolute inset-0 overflow-hidden">
				<div className="-top-40 -right-32 absolute h-80 w-80 rounded-full bg-gradient-to-br from-pink-300/30 to-purple-400/30 blur-3xl" />
				<div className="-bottom-32 -left-32 absolute h-80 w-80 rounded-full bg-gradient-to-br from-cyan-300/30 to-blue-400/30 blur-3xl" />
				<div className="-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 h-96 w-96 transform rounded-full bg-gradient-to-br from-yellow-300/20 to-orange-400/20 blur-3xl" />
			</div>

			{/* Celebration Animation - Subtle Border Effect */}
			{showCelebration && (
				<div className="pointer-events-none fixed inset-4 z-30">
					<div
						className="h-full w-full animate-pulse rounded-3xl border-4 border-green-400 shadow-2xl"
						style={{
							borderImage:
								"linear-gradient(45deg, #10b981, #06d6a0, #059669) 1",
							boxShadow:
								"0 0 20px rgba(16, 185, 129, 0.4), 0 0 40px rgba(6, 214, 160, 0.2)",
							animation: "pulse 1s ease-in-out",
						}}
					/>
				</div>
			)}

			<div className="container relative mx-auto px-4 py-8">
				<div className="mx-auto max-w-6xl space-y-6">
					{/* Header */}
					<div className="text-center">
						<h1 className="font-black text-4xl sm:text-5xl">
							<span className="bg-gradient-to-r from-pink-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
								数字-Dash Practice
							</span>
						</h1>
						<p className="mt-2 text-gray-600 text-lg">
							Practice Japanese numbers with instant feedback
						</p>
					</div>

					{/* Live Stats Bar */}
					<div className="mb-8 flex flex-wrap items-center justify-center gap-4">
						{/* Live Timer */}
						<div className="flex items-center gap-2 rounded-full border border-purple-200 bg-white/80 px-4 py-2 shadow-lg backdrop-blur-sm">
							<Timer className="h-4 w-4 text-purple-600" />
							<span className="text-gray-600 text-sm">Current:</span>
							<span className="font-bold text-purple-700">
								{!showAnswer ? formatTime(currentElapsedTime) : "—"}
							</span>
						</div>

						{/* Current Streak */}
						<div className="flex items-center gap-2 rounded-full border border-green-200 bg-white/80 px-4 py-2 shadow-lg backdrop-blur-sm">
							<Zap className="h-4 w-4 text-green-600" />
							<span className="text-gray-600 text-sm">Streak:</span>
							<span className="font-bold text-green-700">{currentStreak}</span>
						</div>

						{/* Best Streak */}
						<div className="flex items-center gap-2 rounded-full border border-yellow-200 bg-white/80 px-4 py-2 shadow-lg backdrop-blur-sm">
							<Trophy className="h-4 w-4 text-yellow-600" />
							<span className="text-gray-600 text-sm">Best:</span>
							<span className="font-bold text-yellow-700">{bestStreak}</span>
						</div>

						{/* Stats and Settings Toggle */}
						<div className="flex gap-3">
							<Dialog>
								<DialogTrigger asChild>
									<Button
										variant="outline"
										className="rounded-full border-2 border-purple-300 px-4 py-2 text-purple-600 hover:border-purple-400 hover:bg-purple-50"
									>
										<BarChart3 className="mr-2 h-4 w-4" />
										Show Stats
									</Button>
								</DialogTrigger>
								<DialogContent className="max-h-[90vh] max-w-6xl overflow-y-auto">
									<DialogHeader>
										<DialogTitle className="flex items-center justify-center gap-2 text-gray-800">
											<BarChart3 className="h-5 w-5 text-purple-600" />
											<span className="bg-gradient-to-r from-pink-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
												Performance Analytics
											</span>
										</DialogTitle>
									</DialogHeader>
									{/* Stats content will go here */}
									<div className="pt-6">
										{/* Overview Stats */}
										<div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
											{/* Overall Performance */}
											<div className="rounded-xl border border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100 p-6 text-center shadow-lg">
												<div className="font-black text-3xl text-purple-600">
													{stats.total.totalAttempts}
												</div>
												<div className="font-semibold text-purple-700 text-sm">
													Total Attempts
												</div>
												<div className="font-medium text-purple-600 text-xs">
													{stats.total.accuracy.toFixed(1)}% accuracy
												</div>
											</div>

											{/* Current Streak */}
											<div className="rounded-xl border border-green-200 bg-gradient-to-br from-green-50 to-green-100 p-6 text-center shadow-lg">
												<div className="font-black text-3xl text-green-600">
													{currentStreak}
												</div>
												<div className="font-semibold text-green-700 text-sm">
													Current Streak
												</div>
												<div className="font-medium text-green-600 text-xs">
													Best: {bestStreak}
												</div>
											</div>

											{/* Average Speed */}
											<div className="rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 p-6 text-center shadow-lg">
												<div className="font-black text-3xl text-blue-600">
													{stats.total.averageTime > 0
														? formatTime(stats.total.averageTime)
														: "—"}
												</div>
												<div className="font-semibold text-blue-700 text-sm">
													Avg Speed
												</div>
												<div className="font-medium text-blue-600 text-xs">
													All attempts
												</div>
											</div>

											{/* Best Time */}
											<div className="rounded-xl border border-yellow-200 bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 text-center shadow-lg">
												<div className="font-black text-3xl text-yellow-600">
													{attempts.length > 0
														? formatTime(
																Math.min(
																	...attempts
																		.filter((a) => a.isCorrect)
																		.map((a) => a.timeMs),
																),
															)
														: "—"}
												</div>
												<div className="font-semibold text-sm text-yellow-700">
													Best Time
												</div>
												<div className="font-medium text-xs text-yellow-600">
													Fastest correct
												</div>
											</div>
										</div>

										{/* Performance by Level */}
										<div className="mb-8">
											<h3 className="mb-4 font-semibold text-gray-800 text-lg">
												Performance by Practice Level
											</h3>
											<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
												{Object.entries(practiceLevelConfigs).map(
													([key, config]) => {
														const levelAttempts = attempts.filter(
															(a) => a.practiceLevel === key,
														);
														const correctAttempts = levelAttempts.filter(
															(a) => a.isCorrect,
														);
														const accuracy =
															levelAttempts.length > 0
																? (correctAttempts.length /
																		levelAttempts.length) *
																	100
																: 0;
														const avgTime =
															levelAttempts.length > 0
																? levelAttempts.reduce(
																		(sum, a) => sum + a.timeMs,
																		0,
																	) / levelAttempts.length
																: 0;

														return (
															<div
																key={key}
																className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
															>
																<div className="mb-2 flex items-center gap-2">
																	{config.icon}
																	<span className="font-medium text-gray-800">
																		{config.label}
																	</span>
																	<span className="text-gray-500 text-xs">
																		({config.description})
																	</span>
																</div>
																<div className="space-y-1">
																	<div className="flex justify-between text-sm">
																		<span className="text-gray-600">
																			Attempts:
																		</span>
																		<span className="font-medium">
																			{levelAttempts.length}
																		</span>
																	</div>
																	<div className="flex justify-between text-sm">
																		<span className="text-gray-600">
																			Accuracy:
																		</span>
																		<span className="font-medium">
																			{accuracy.toFixed(1)}%
																		</span>
																	</div>
																	<div className="flex justify-between text-sm">
																		<span className="text-gray-600">
																			Avg Time:
																		</span>
																		<span className="font-medium">
																			{avgTime > 0 ? formatTime(avgTime) : "—"}
																		</span>
																	</div>
																</div>
															</div>
														);
													},
												)}
											</div>
										</div>

										{/* Recent Performance Trends */}
										<div className="mb-6">
											<h3 className="mb-4 font-semibold text-gray-800 text-lg">
												Recent Performance
											</h3>
											<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
												{/* Last 10 */}
												<div className="rounded-lg border border-pink-200 bg-gradient-to-br from-pink-50 to-pink-100 p-4 shadow-sm">
													<div className="mb-2 flex items-center gap-2">
														<TrendingUp className="h-4 w-4 text-pink-600" />
														<span className="font-medium text-pink-800">
															Last 10
														</span>
													</div>
													<div className="space-y-1">
														<div className="flex justify-between text-sm">
															<span className="text-pink-700">Accuracy:</span>
															<span className="font-medium">
																{stats.last10.accuracy.toFixed(1)}%
															</span>
														</div>
														<div className="flex justify-between text-sm">
															<span className="text-pink-700">Avg Time:</span>
															<span className="font-medium">
																{formatTime(stats.last10.averageTime)}
															</span>
														</div>
														<div className="flex justify-between text-sm">
															<span className="text-pink-700">Correct:</span>
															<span className="font-medium">
																{stats.last10.correctAttempts}/
																{stats.last10.totalAttempts}
															</span>
														</div>
													</div>
												</div>

												{/* Last 25 */}
												<div className="rounded-lg border border-cyan-200 bg-gradient-to-br from-cyan-50 to-cyan-100 p-4 shadow-sm">
													<div className="mb-2 flex items-center gap-2">
														<Target className="h-4 w-4 text-cyan-600" />
														<span className="font-medium text-cyan-800">
															Last 25
														</span>
													</div>
													<div className="space-y-1">
														<div className="flex justify-between text-sm">
															<span className="text-cyan-700">Accuracy:</span>
															<span className="font-medium">
																{stats.last25.accuracy.toFixed(1)}%
															</span>
														</div>
														<div className="flex justify-between text-sm">
															<span className="text-cyan-700">Avg Time:</span>
															<span className="font-medium">
																{formatTime(stats.last25.averageTime)}
															</span>
														</div>
														<div className="flex justify-between text-sm">
															<span className="text-cyan-700">Correct:</span>
															<span className="font-medium">
																{stats.last25.correctAttempts}/
																{stats.last25.totalAttempts}
															</span>
														</div>
													</div>
												</div>

												{/* Session Summary */}
												<div className="rounded-lg border border-indigo-200 bg-gradient-to-br from-indigo-50 to-indigo-100 p-4 shadow-sm">
													<div className="mb-2 flex items-center gap-2">
														<Sparkles className="h-4 w-4 text-indigo-600" />
														<span className="font-medium text-indigo-800">
															Session
														</span>
													</div>
													<div className="space-y-1">
														<div className="flex justify-between text-sm">
															<span className="text-indigo-700">Total:</span>
															<span className="font-medium">
																{stats.total.totalAttempts}
															</span>
														</div>
														<div className="flex justify-between text-sm">
															<span className="text-indigo-700">Accuracy:</span>
															<span className="font-medium">
																{stats.total.accuracy.toFixed(1)}%
															</span>
														</div>
														<div className="flex justify-between text-sm">
															<span className="text-indigo-700">
																Best Streak:
															</span>
															<span className="font-medium">{bestStreak}</span>
														</div>
													</div>
												</div>
											</div>
										</div>
									</div>
								</DialogContent>
							</Dialog>
							<Dialog>
								<DialogTrigger asChild>
									<Button
										variant="outline"
										className="rounded-full border-2 border-blue-300 px-4 py-2 text-blue-600 hover:border-blue-400 hover:bg-blue-50"
									>
										<Settings className="mr-2 h-4 w-4" />
										Settings
									</Button>
								</DialogTrigger>
								<DialogContent className="max-w-2xl">
									<DialogHeader>
										<DialogTitle className="font-bold text-2xl text-blue-600">
											<Settings className="mr-2 inline h-6 w-6" />
											Pronunciation Settings
										</DialogTitle>
									</DialogHeader>
									<div className="space-y-6 pt-6">
										{/* Auto-play Setting */}
										<div className="flex items-center justify-between">
											<div>
												<span className="font-medium text-gray-700 text-sm">
													Auto-play Pronunciation
												</span>
												<p className="text-gray-500 text-xs">
													Automatically pronounce numbers when they appear
												</p>
											</div>
											<Button
												variant={
													pronunciationSettings.autoPlay ? "default" : "outline"
												}
												size="sm"
												onClick={() =>
													setPronunciationSettings((prev) => ({
														...prev,
														autoPlay: !prev.autoPlay,
													}))
												}
											>
												{pronunciationSettings.autoPlay ? "On" : "Off"}
											</Button>
										</div>

										{/* Play Speed Setting */}
										<div>
											<span className="mb-2 block font-medium text-gray-700 text-sm">
												Pronunciation Speed
											</span>
											<div className="flex items-center gap-4">
												<span className="text-gray-500 text-xs">Slow</span>
												<input
													type="range"
													min="0.3"
													max="1.5"
													step="0.1"
													value={pronunciationSettings.playSpeed}
													onChange={(e) =>
														setPronunciationSettings((prev) => ({
															...prev,
															playSpeed: Number.parseFloat(e.target.value),
														}))
													}
													className="h-2 flex-1 cursor-pointer appearance-none rounded-lg bg-gray-200"
												/>
												<span className="text-gray-500 text-xs">Fast</span>
											</div>
											<p className="mt-1 text-gray-500 text-xs">
												Current: {pronunciationSettings.playSpeed}x
											</p>
										</div>

										{/* Voice Type Setting */}
										<div>
											<span className="mb-2 block font-medium text-gray-700 text-sm">
												Voice Type
											</span>
											<div className="grid grid-cols-2 gap-3">
												<Button
													variant={
														pronunciationSettings.voice === "standard"
															? "default"
															: "outline"
													}
													size="sm"
													onClick={() =>
														setPronunciationSettings((prev) => ({
															...prev,
															voice: "standard",
														}))
													}
												>
													Standard
												</Button>
												<Button
													variant={
														pronunciationSettings.voice === "alternative"
															? "default"
															: "outline"
													}
													size="sm"
													onClick={() =>
														setPronunciationSettings((prev) => ({
															...prev,
															voice: "alternative",
														}))
													}
												>
													Alternative
												</Button>
											</div>
											<p className="mt-2 text-gray-500 text-xs">
												{pronunciationSettings.voice === "standard"
													? "Standard: Uses Japanese TTS with hiragana (ひゃく)"
													: "Alternative: Uses English TTS with romaji (hyaku) for clearer pronunciation"}
											</p>
										</div>

										{/* Test Pronunciation */}
										<div className="border-gray-200 border-t pt-4">
											<Button
												onClick={speakJapanese}
												className="w-full bg-blue-600 text-white hover:bg-blue-700"
											>
												<Volume2 className="mr-2 h-4 w-4" />
												Test Current Pronunciation
											</Button>
										</div>
									</div>
								</DialogContent>
							</Dialog>
						</div>
					</div>

					{/* Practice Level Selector */}
					<div className="mb-6 flex flex-wrap items-center justify-center gap-3">
						<span className="font-medium text-gray-600 text-sm">
							Practice Level:
						</span>
						<Dialog open={isPracticeModeDialogOpen} onOpenChange={setIsPracticeModeDialogOpen}>
							<DialogTrigger asChild>
								<Button
									variant="outline"
									className="rounded-full border-2 border-orange-300 px-4 py-2 text-orange-600 hover:border-orange-400 hover:bg-orange-50"
								>
									<Sliders className="mr-2 h-4 w-4" />
									Practice Mode
								</Button>
							</DialogTrigger>
							<DialogContent className="max-w-3xl">
								<DialogHeader>
									<DialogTitle className="font-bold text-2xl text-orange-600">
										<Sliders className="mr-2 inline h-6 w-6" />
										Practice Mode Configuration
									</DialogTitle>
								</DialogHeader>
								<div className="space-y-6 pt-6">
									{/* Display Mode Setting */}
									<div>
										<span className="mb-3 block font-medium text-gray-700 text-sm">
											Display Mode
										</span>
										<div className="grid grid-cols-1 gap-3">
											<Button
												variant={
													practiceModeSettings.displayMode ===
													"number-to-japanese"
														? "default"
														: "outline"
												}
												size="sm"
												onClick={() =>
													setPracticeModeSettings((prev) => ({
														...prev,
														displayMode: "number-to-japanese",
													}))
												}
												className="h-auto justify-start p-4"
											>
												<div className="text-left">
													<div className="font-semibold">Number → Japanese</div>
													<div className="mt-1 text-xs opacity-75">
														Show: <span className="font-mono text-lg">42</span>{" "}
														→ Answer: "よんじゅうに" or "四十二"
													</div>
												</div>
											</Button>
											<Button
												variant={
													practiceModeSettings.displayMode ===
													"kanji-to-japanese"
														? "default"
														: "outline"
												}
												size="sm"
												onClick={() =>
													setPracticeModeSettings((prev) => ({
														...prev,
														displayMode: "kanji-to-japanese",
													}))
												}
												className="h-auto justify-start p-4"
											>
												<div className="text-left">
													<div className="font-semibold">Kanji → Japanese</div>
													<div className="mt-1 text-xs opacity-75">
														Show:{" "}
														<span className="font-mono text-lg">四十二</span> →
														Answer: "よんじゅうに" or "yonjuuni"
													</div>
												</div>
											</Button>
										</div>
									</div>

									{/* Number Range Setting */}
									<div>
										<span className="mb-3 block font-medium text-gray-700 text-sm">
											Number Range
										</span>
										<div className="mb-4 grid grid-cols-2 gap-3">
											{practiceModeSettings.customRanges.map((range) => (
												<Button
													key={`${range.min}-${range.max}`}
													variant={
														practiceModeSettings.rangeMin === range.min &&
														practiceModeSettings.rangeMax === range.max
															? "default"
															: "outline"
													}
													size="sm"
													onClick={() =>
														setPracticeModeSettings((prev) => ({
															...prev,
															rangeMin: range.min,
															rangeMax: range.max,
														}))
													}
													className="justify-start text-left"
												>
													{range.label}
												</Button>
											))}
										</div>
										{/* Custom Range Input */}
										<div className="rounded-lg border bg-gray-50 p-4">
											<div className="mb-3 font-medium text-gray-700 text-sm">
												Custom Range
											</div>
											<div className="flex items-center gap-4">
												<div className="flex-1">
													<label
														htmlFor="range-min"
														className="text-gray-500 text-xs"
													>
														Min
													</label>
													<input
														id="range-min"
														type="number"
														min="1"
														max="9999"
														value={practiceModeSettings.rangeMin}
														onChange={(e) =>
															setPracticeModeSettings((prev) => ({
																...prev,
																rangeMin: Math.max(
																	1,
																	Number.parseInt(e.target.value) || 1,
																),
															}))
														}
														className="w-full rounded border px-3 py-2 text-sm"
													/>
												</div>
												<span className="mt-4 text-gray-400">to</span>
												<div className="flex-1">
													<label
														htmlFor="range-max"
														className="text-gray-500 text-xs"
													>
														Max
													</label>
													<input
														id="range-max"
														type="number"
														min="1"
														max="9999"
														value={practiceModeSettings.rangeMax}
														onChange={(e) =>
															setPracticeModeSettings((prev) => ({
																...prev,
																rangeMax: Math.min(
																	9999,
																	Math.max(
																		prev.rangeMin,
																		Number.parseInt(e.target.value) || 100,
																	),
																),
															}))
														}
														className="w-full rounded border px-3 py-2 text-sm"
													/>
												</div>
											</div>
											<p className="mt-2 text-gray-500 text-xs">
												Current range: {practiceModeSettings.rangeMin} -{" "}
												{practiceModeSettings.rangeMax}(
												{practiceModeSettings.rangeMax -
													practiceModeSettings.rangeMin +
													1}{" "}
												numbers)
											</p>
										</div>
									</div>

									{/* Start Custom Practice */}
									<div className="border-gray-200 border-t pt-4">
										<Button
											onClick={() => {
												const newNumber =
													generateNumberBasedOnSettings(practiceModeSettings);
												setCurrentNumber(newNumber);
												setUserGuess("");
												setShowAnswer(false);
												setIsCorrect(null);
												setStartTime(Date.now());

												// Close the dialog
												setIsPracticeModeDialogOpen(false);

												// Auto-play if enabled
												if (pronunciationSettings.autoPlay) {
													setTimeout(() => {
														speakJapanese();
													}, 300);
												}

												// Focus input
												setTimeout(() => {
													inputRef.current?.focus();
												}, 100);
											}}
											className="w-full bg-orange-600 text-white hover:bg-orange-700"
										>
											<Sparkles className="mr-2 h-4 w-4" />
											Start Custom Practice ({practiceModeSettings.rangeMin}-
											{practiceModeSettings.rangeMax})
										</Button>
									</div>
								</div>
							</DialogContent>
						</Dialog>
						{Object.entries(practiceLevelConfigs).map(([key, config]) => (
							<Button
								key={key}
								variant={currentLevel === key ? "default" : "outline"}
								onClick={() => {
									setCurrentLevel(key as PracticeLevel);
									setCurrentNumber(
										generateNumberForLevel(key as PracticeLevel),
									);
									setStartTime(Date.now());
								}}
								className={`rounded-lg px-3 py-2 text-sm ${
									currentLevel === key
										? "bg-gradient-to-r from-purple-500 to-blue-600 text-white"
										: "border-purple-300 text-purple-600 hover:border-purple-400 hover:bg-purple-50"
								}`}
								title={`${config.description} - Click to see pronunciation tips!`}
							>
								{config.icon}
								<span className="ml-1">{config.label}</span>
								<span className="ml-1 text-xs opacity-75">
									({config.description})
								</span>
							</Button>
						))}
					</div>
					<div className="mb-6 text-center">
						<p className="mx-auto mb-4 max-w-2xl text-gray-600 text-xs">
							💡 Practice levels are organized by pronunciation complexity and
							Japanese number scale.
						</p>
						{/* Show current level tips */}
						{practiceLevelConfigs[currentLevel]?.tips && (
							<Dialog>
								<DialogTrigger asChild>
									<Button
										variant="outline"
										size="sm"
										className="border-blue-300 text-blue-600 text-xs hover:bg-blue-50"
									>
										📚 See {practiceLevelConfigs[currentLevel].label} Level Tips
									</Button>
								</DialogTrigger>
								<DialogContent className="max-w-2xl">
									<DialogHeader>
										<DialogTitle className="flex items-center gap-2">
											{practiceLevelConfigs[currentLevel].icon}
											{practiceLevelConfigs[currentLevel].label} Level -
											Pronunciation Tips
										</DialogTitle>
									</DialogHeader>
									<div className="space-y-4 pt-4">
										<div className="rounded-lg bg-blue-50 p-4">
											<h4 className="mb-2 font-semibold text-blue-800">
												Range: {practiceLevelConfigs[currentLevel].description}
											</h4>
											<div className="space-y-3">
												{practiceLevelConfigs[currentLevel].tips?.map((tip) => (
													<div
														key={tip.slice(0, 20)}
														className="flex items-start gap-3"
													>
														<span className="font-bold text-blue-600">•</span>
														<p className="text-blue-700 text-sm">{tip}</p>
													</div>
												))}
											</div>
										</div>
									</div>
								</DialogContent>
							</Dialog>
						)}
					</div>

					{/* Main Question Display - Outside the card */}
					<div className="mb-8 text-center">
						<div
							className={`mx-auto max-w-4xl rounded-2xl border bg-white/90 p-8 shadow-2xl backdrop-blur-sm transition-all duration-500 ${
								showAnswer
									? isCorrect
										? "border-green-400 bg-green-50/50"
										: "border-red-400 bg-red-50/50"
									: "border-purple-100"
							}`}
						>
							<h2 className="mb-4 text-gray-700 text-xl">
								{showAnswer
									? isCorrect
										? "✅ Correct!"
										: "❌ Not quite right"
									: practiceModeSettings.displayMode === "kanji-to-japanese"
										? "What is this kanji number in Japanese?"
										: "What is this number in Japanese?"}
							</h2>
							<div
								className={`break-all font-black transition-all duration-300 ${
									showAnswer && isCorrect ? "scale-110" : ""
								} ${
									// Responsive text sizing based on number length
									currentNumber.toString().length <= 3
										? "text-8xl sm:text-9xl"
										: currentNumber.toString().length <= 6
											? "text-6xl sm:text-8xl"
											: currentNumber.toString().length <= 9
												? "text-4xl sm:text-6xl"
												: currentNumber.toString().length <= 12
													? "text-3xl sm:text-5xl"
													: "text-2xl sm:text-4xl"
								}`}
							>
								<span
									className={`bg-gradient-to-r bg-clip-text text-transparent ${
										showAnswer
											? isCorrect
												? "from-green-500 via-emerald-500 to-teal-500"
												: "from-red-500 via-pink-500 to-rose-500"
											: "from-pink-600 via-purple-600 to-cyan-600"
									}`}
								>
									{practiceModeSettings.displayMode === "kanji-to-japanese"
										? japaneseNumber.kanji
										: formatNumberWithCommas(currentNumber)}
								</span>
							</div>
							{showAnswer && (
								<div className="mt-4 rounded-lg bg-gray-50 p-4">
									{practiceModeSettings.displayMode === "kanji-to-japanese" ? (
										<>
											<p className="text-gray-600 text-sm">
												Original Number:{" "}
												<span className="font-bold font-mono">
													{formatNumberWithCommas(currentNumber)}
												</span>
											</p>
											<p className="font-medium text-gray-800 text-lg">
												{japaneseNumber.hiragana} ({japaneseNumber.romaji})
											</p>
										</>
									) : (
										<>
											<p className="font-medium text-gray-800 text-lg">
												{japaneseNumber.hiragana} ({japaneseNumber.romaji})
											</p>
											<p className="font-bold text-2xl text-gray-900">
												{japaneseNumber.kanji}
											</p>
										</>
									)}
								</div>
							)}
						</div>
					</div>

					{/* Input Card */}
					<Card
						className={`mx-auto max-w-2xl border-0 shadow-xl backdrop-blur-sm transition-all duration-500 ${
							showAnswer
								? isCorrect
									? "border-green-200 bg-green-50/90"
									: "border-red-200 bg-red-50/90"
								: "bg-white/80"
						}`}
					>
						<CardContent className="space-y-4 pt-6">
							<div className="flex flex-col space-y-2">
								<input
									ref={inputRef}
									type="text"
									value={userGuess}
									onChange={(e) => setUserGuess(e.target.value)}
									onKeyDown={handleKeyPress}
									readOnly={showAnswer}
									placeholder={
										showAnswer
											? "Press Enter for next question..."
											: "Type juu, jyuu, ju, etc. - different styles accepted!"
									}
									className={`w-full rounded-lg border-2 px-4 py-3 text-lg backdrop-blur-sm transition-all duration-300 ${
										showAnswer
											? isCorrect
												? "border-green-300 bg-green-50/50 text-green-800"
												: "border-red-300 bg-red-50/50 text-red-800"
											: "border-purple-200 bg-white/80 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
									} ${showAnswer ? "cursor-pointer" : ""}`}
								/>
								{!showAnswer && (
									<p className="font-medium text-gray-600 text-sm">
										✓ Accepts multiple romanization styles (juu/jyuu, ku/kyu)
										<br />✓ Works with hiragana (ひらがな) and kanji (漢字) too
									</p>
								)}
								{showAnswer && (
									<div
										className={`rounded-lg p-3 ${isCorrect ? "bg-green-100" : "bg-red-100"}`}
									>
										<p
											className={`font-medium text-sm ${isCorrect ? "text-green-800" : "text-red-800"}`}
										>
											{isCorrect
												? "🎉 Perfect! Moving to next question..."
												: `❌ You typed: "${userGuess}" • Correct answer shown above`}
										</p>
									</div>
								)}
								<div className="flex flex-wrap gap-3">
									{!showAnswer ? (
										<Button
											onClick={checkAnswer}
											disabled={!userGuess.trim()}
											className="flex-1 transform rounded-lg bg-gradient-to-r from-pink-500 to-purple-600 px-6 py-3 font-semibold text-white shadow-lg transition hover:scale-105 hover:from-pink-600 hover:to-purple-700 disabled:transform-none disabled:cursor-not-allowed disabled:opacity-50"
										>
											<Check className="mr-2 h-4 w-4" />
											Check Answer
										</Button>
									) : (
										<Button
											onClick={nextNumber}
											className={`flex-1 transform rounded-lg px-6 py-3 font-semibold text-white shadow-lg transition hover:scale-105 ${
												isCorrect
													? "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
													: "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
											}`}
										>
											<RefreshCw className="mr-2 h-4 w-4" />
											Next Number
										</Button>
									)}
									<Button
										variant="outline"
										onClick={toggleAnswer}
										className="rounded-lg border-2 border-purple-300 px-4 py-3 text-purple-600 hover:border-purple-400 hover:bg-purple-50"
									>
										{showAnswer ? (
											<EyeOff className="h-4 w-4" />
										) : (
											<Eye className="h-4 w-4" />
										)}
									</Button>
									<Button
										variant="outline"
										onClick={speakJapanese}
										className="rounded-lg border-2 border-purple-300 px-4 py-3 text-purple-600 hover:border-purple-400 hover:bg-purple-50"
									>
										<Volume2 className="h-4 w-4" />
									</Button>
								</div>
							</div>

							{showAnswer && (
								<div className="space-y-3 rounded-lg bg-gray-50 p-4">
									<div className="flex items-center justify-between">
										<span className="font-medium">Result:</span>
										{isCorrect ? (
											<Badge
												variant="default"
												className="bg-green-100 text-green-800"
											>
												<Check className="mr-1 h-3 w-3" />
												Correct! (+{formatTime(Date.now() - startTime)})
											</Badge>
										) : (
											<Badge variant="destructive">
												<X className="mr-1 h-3 w-3" />
												Incorrect
											</Badge>
										)}
									</div>
									{!isCorrect && (
										<div className="text-gray-600 text-sm">
											<div>
												<span className="font-medium">Your answer:</span>{" "}
												{userGuess}
											</div>
											<div className="mt-1">
												<span className="font-medium">Correct answers:</span>{" "}
												{japaneseNumber.kanji}, {japaneseNumber.hiragana},{" "}
												{japaneseNumber.romaji}
											</div>
										</div>
									)}
								</div>
							)}
						</CardContent>
					</Card>

					{/* Results History - Outside the input card */}
					{attempts.length > 0 && (
						<Card className="mx-auto max-w-4xl border-0 bg-white/80 shadow-xl backdrop-blur-sm">
							<CardHeader>
								<CardTitle className="flex items-center justify-between">
									<div className="flex items-center gap-2">
										<Clock className="h-5 w-5 text-purple-600" />
										<span className="bg-gradient-to-r from-pink-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
											Results History
										</span>
									</div>
									<span className="font-normal text-gray-500 text-sm">
										{attempts.length} attempt{attempts.length !== 1 ? "s" : ""}
									</span>
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="max-h-64 space-y-2 overflow-y-auto">
									{attempts
										.slice(-20)
										.reverse()
										.map((attempt, index) => (
											<div
												key={`${attempt.timestamp.getTime()}-${index}`}
												className={`flex items-center justify-between rounded-lg p-3 transition-colors ${
													attempt.isCorrect
														? "border border-green-200 bg-green-50"
														: "border border-red-200 bg-red-50"
												}`}
											>
												<div className="flex items-center gap-4">
													<div className="flex items-center gap-1">
														{practiceLevelConfigs[attempt.practiceLevel]?.icon}
														<span className="font-medium text-gray-500 text-xs uppercase">
															{attempt.practiceLevel}
														</span>
													</div>
													<span className="min-w-[3rem] font-bold font-mono text-lg">
														{attempt.number}
													</span>
													<div className="flex flex-col gap-1">
														<div className="flex items-center gap-2 text-sm">
															<span className="font-medium">
																{attempt.japanese.kanji}
															</span>
															<span className="text-gray-400">•</span>
															<span>{attempt.japanese.hiragana}</span>
															<span className="text-gray-400">•</span>
															<span>{attempt.japanese.romaji}</span>
														</div>
														{!attempt.isCorrect && attempt.userGuess && (
															<div className="text-red-600 text-xs">
																Your answer: {attempt.userGuess}
															</div>
														)}
													</div>
												</div>
												<div className="flex items-center gap-3">
													<span className="font-mono text-gray-500 text-sm">
														{formatTime(attempt.timeMs)}
													</span>
													{attempt.isCorrect ? (
														<div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500">
															<Check className="h-3 w-3 text-white" />
														</div>
													) : (
														<div className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500">
															<X className="h-3 w-3 text-white" />
														</div>
													)}
												</div>
											</div>
										))}
								</div>
							</CardContent>
						</Card>
					)}

					{/* Quick Session Summary */}
					<div className="text-center">
						<div className="inline-flex items-center gap-4 rounded-lg border border-purple-100 bg-white/80 px-6 py-3 shadow-lg backdrop-blur-sm">
							<span className="text-gray-600 text-sm">
								Session: {stats.total.correctAttempts}/
								{stats.total.totalAttempts}
							</span>
							{stats.total.totalAttempts > 0 && (
								<>
									<span className="font-medium text-purple-600 text-sm">
										({stats.total.accuracy.toFixed(1)}%)
									</span>
									<span className="text-gray-600 text-sm">
										• Streak: {currentStreak}
									</span>
								</>
							)}
						</div>
					</div>
				</div>
			</div>
		</main>
	);
}
