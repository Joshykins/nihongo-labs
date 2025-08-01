"use client";

import {
	ArrowLeft,
	Check,
	Eye,
	EyeOff,
	Play,
	RefreshCw,
	Settings,
	Target,
	Volume2,
	X,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import { DarkModeToggle } from "~/components/dark-mode-toggle";
import { Button } from "~/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "~/components/ui/card";
import {
	type JapaneseNumber,
	convertToEnglish,
	convertToJapanese,
	formatNumberWithCommas,
	isAnswerCorrect,
	roundToRealistic,
} from "~/lib/japanese-numbers";
import { themeStyles } from "~/lib/theme";

// Game flow states
type GameState = "configuration" | "playing" | "results";

interface PracticeConfiguration {
	practiceType:
		| "number-to-japanese"
		| "kanji-to-japanese"
		| "kanji-to-english-or-romanization";
	practiceLevel:
		| "basic"
		| "compound"
		| "complex"
		| "advanced"
		| "master"
		| "millions"
		| "billions"
		| "trillions"
		| "custom";
	rangeMin: number;
	rangeMax: number;
	questionCount: number;
	timeLimit?: number; // in seconds, optional
	pronunciationSettings: {
		autoPlay: boolean;
		playSpeed: number;
		voice: "standard" | "alternative";
	};
}

interface GameSession {
	configuration: PracticeConfiguration;
	startTime: Date;
	endTime?: Date;
	totalQuestions: number;
	correctAnswers: number;
	answers: Array<{
		question: string;
		correctAnswer: string;
		userAnswer: string;
		timeMs: number;
		isCorrect: boolean;
	}>;
}

// Import existing practice components
const ConfigurationStep = ({
	onStart,
}: { onStart: (config: PracticeConfiguration) => void }) => {
	const [config, setConfig] = useState<PracticeConfiguration>({
		practiceType: "number-to-japanese",
		practiceLevel: "basic",
		rangeMin: 1,
		rangeMax: 19,
		questionCount: 10,
		pronunciationSettings: {
			autoPlay: true,
			playSpeed: 0.8,
			voice: "standard",
		},
	});

	return (
		<>
			{/* Floating Back Button - Outside transition container */}
			<div className="fade-in-0 fixed top-6 left-6 z-50 animate-in delay-300 duration-500">
				<Link
					href="/"
					className="flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-gray-600 shadow-lg backdrop-blur-sm transition-all hover:bg-white hover:text-purple-600 hover:shadow-xl dark:bg-gray-800/80 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-purple-400"
				>
					<ArrowLeft className="h-4 w-4" />
				</Link>
			</div>

			{/* Dark Mode Toggle */}
			<div className="fade-in-0 fixed top-6 right-6 z-50 animate-in delay-300 duration-500">
				<DarkModeToggle />
			</div>

			<div
				className="fade-in-0 slide-in-from-bottom-4 mx-auto max-w-2xl animate-in space-y-6 duration-700"
				style={{ viewTransitionName: "config-step" }}
			>
				<div className="text-center">
					<h2 className={`mb-4 font-bold text-3xl ${themeStyles.text.primary}`}>
						Configure Your Practice Session
					</h2>
					<p className={themeStyles.text.secondary}>
						Set up your 数字-Dash practice session. Choose your difficulty and
						preferences.
					</p>
				</div>

				<Card className="shadow-xl">
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Settings className="h-5 w-5 text-purple-600" />
							Practice Settings
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-6">
						{/* Practice Type */}
						<div className="space-y-3">
							<h3 className={`font-medium text-sm ${themeStyles.text.primary}`}>
								Practice Type
							</h3>
							<div className="grid grid-cols-1 gap-3">
								{[
									{
										id: "number-to-japanese",
										label: "Number → Japanese",
										description: "See: 42 → Answer: よんじゅうに",
									},
									{
										id: "kanji-to-japanese",
										label: "Kanji → Japanese",
										description: "See: 四十二 → Answer: よんじゅうに",
									},
									{
										id: "kanji-to-english-or-romanization",
										label: "Kanji → English/Number",
										description: "See: 四十二 → Answer: forty-two OR 42",
									},
								].map((type) => (
									<Button
										key={type.id}
										variant={
											config.practiceType === type.id ? "default" : "outline"
										}
										onClick={() =>
											setConfig((prev) => ({
												...prev,
												practiceType:
													type.id as PracticeConfiguration["practiceType"],
											}))
										}
										className="h-auto justify-start p-4"
									>
										<div className="text-left">
											<div className="font-semibold">{type.label}</div>
											<div className="mt-1 text-xs opacity-75">
												{type.description}
											</div>
										</div>
									</Button>
								))}
							</div>
						</div>

						{/* Practice Level */}
						<div className="space-y-3">
							<h3 className={`font-medium text-sm ${themeStyles.text.primary}`}>
								Difficulty Level
							</h3>
							<div className="grid grid-cols-2 gap-3">
								{[
									{
										id: "basic",
										label: "Basic",
										range: "1-19",
										description: "Simple sounds",
									},
									{
										id: "compound",
										label: "Compound",
										range: "20-99",
										description: "Two-part numbers",
									},
									{
										id: "complex",
										label: "Complex",
										range: "100-999",
										description: "Sound changes",
									},
									{
										id: "advanced",
										label: "Advanced",
										range: "1000-9999",
										description: "Long compounds",
									},
									{
										id: "master",
										label: "Master",
										range: "10000+",
										description: "万 notation",
									},
									{
										id: "custom",
										label: "Custom",
										range: "Your choice",
										description: "Set your own range",
									},
								].map((level) => (
									<Button
										key={level.id}
										variant={
											config.practiceLevel === level.id ? "default" : "outline"
										}
										onClick={() => {
											setConfig((prev) => {
												const newConfig = {
													...prev,
													practiceLevel:
														level.id as PracticeConfiguration["practiceLevel"],
												};
												// Set default ranges based on level
												if (level.id === "basic") {
													newConfig.rangeMin = 1;
													newConfig.rangeMax = 19;
												} else if (level.id === "compound") {
													newConfig.rangeMin = 20;
													newConfig.rangeMax = 99;
												} else if (level.id === "complex") {
													newConfig.rangeMin = 100;
													newConfig.rangeMax = 999;
												} else if (level.id === "advanced") {
													newConfig.rangeMin = 1000;
													newConfig.rangeMax = 9999;
												} else if (level.id === "master") {
													newConfig.rangeMin = 10000;
													newConfig.rangeMax = 99999;
												}
												return newConfig;
											});
										}}
										className="h-auto justify-start p-3 text-left"
									>
										<div>
											<div className="font-semibold text-sm">{level.label}</div>
											<div className="text-xs opacity-75">{level.range}</div>
											<div className="text-xs opacity-60">
												{level.description}
											</div>
										</div>
									</Button>
								))}
							</div>
						</div>

						{/* Custom Range (if custom level selected) */}
						{config.practiceLevel === "custom" && (
							<div className="space-y-3">
								<h3
									className={`font-medium text-sm ${themeStyles.text.primary}`}
								>
									Custom Range
								</h3>
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
											max="999999999999999"
											value={config.rangeMin}
											onChange={(e) =>
												setConfig((prev) => ({
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
											max="999999999999999"
											value={config.rangeMax}
											onChange={(e) =>
												setConfig((prev) => ({
													...prev,
													rangeMax: Math.max(
														prev.rangeMin,
														Number.parseInt(e.target.value) || 100,
													),
												}))
											}
											className="w-full rounded border px-3 py-2 text-sm"
										/>
									</div>
								</div>
							</div>
						)}

						{/* Session Settings */}
						<div className="space-y-3">
							<h3 className={`font-medium text-sm ${themeStyles.text.primary}`}>
								Session Length
							</h3>
							<div className="grid grid-cols-3 gap-3">
								{[
									{ count: 5, label: "Quick (5)" },
									{ count: 10, label: "Standard (10)" },
									{ count: 20, label: "Extended (20)" },
								].map((session) => (
									<Button
										key={session.count}
										variant={
											config.questionCount === session.count
												? "default"
												: "outline"
										}
										onClick={() =>
											setConfig((prev) => ({
												...prev,
												questionCount: session.count,
											}))
										}
										size="sm"
									>
										{session.label}
									</Button>
								))}
							</div>
						</div>

						{/* Start Button */}
						<div className="border-t pt-4">
							<Button
								onClick={() => onStart(config)}
								className="w-full transform bg-gradient-to-r from-purple-500 to-blue-600 text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
								size="lg"
							>
								<Play className="mr-2 h-4 w-4" />
								Start Practice Session
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>
		</>
	);
};

const GamePlayStep = ({
	config,
	onComplete,
	onBack,
}: {
	config: PracticeConfiguration;
	onComplete: (session: GameSession) => void;
	onBack: () => void;
}) => {
	const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
	const [currentNumber, setCurrentNumber] = useState<number>(0);
	const [userGuess, setUserGuess] = useState<string>("");
	const [showAnswer, setShowAnswer] = useState<boolean>(false);
	const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
	const [startTime, setStartTime] = useState<number>(Date.now());
	const [questionStartTime, setQuestionStartTime] = useState<number>(
		Date.now(),
	);
	const [answers, setAnswers] = useState<
		Array<{
			question: string;
			correctAnswer: string;
			userAnswer: string;
			timeMs: number;
			isCorrect: boolean;
		}>
	>([]);

	const inputRef = useRef<HTMLInputElement>(null);

	// Generate number based on configuration
	const generateNumber = useCallback(() => {
		const { rangeMin, rangeMax } = config;
		const rawNumber =
			Math.floor(Math.random() * (rangeMax - rangeMin + 1)) + rangeMin;
		return roundToRealistic(rawNumber);
	}, [config]);

	// Initialize first question
	useEffect(() => {
		const firstNumber = generateNumber();
		setCurrentNumber(firstNumber);
		setStartTime(Date.now());
		setQuestionStartTime(Date.now());
		inputRef.current?.focus();
	}, [generateNumber]);

	const japaneseNumber: JapaneseNumber = convertToJapanese(currentNumber);

	// Get the question display based on practice type
	const getQuestionDisplay = () => {
		switch (config.practiceType) {
			case "number-to-japanese":
				return formatNumberWithCommas(currentNumber);
			case "kanji-to-japanese":
			case "kanji-to-english-or-romanization":
				return japaneseNumber.kanji;
			default:
				return formatNumberWithCommas(currentNumber);
		}
	};

	// Get the correct answer(s) based on practice type
	const getCorrectAnswers = () => {
		switch (config.practiceType) {
			case "number-to-japanese":
			case "kanji-to-japanese":
				return [
					japaneseNumber.hiragana,
					japaneseNumber.romaji,
					japaneseNumber.kanji,
				];
			case "kanji-to-english-or-romanization":
				return [convertToEnglish(currentNumber), currentNumber.toString()];
			default:
				return [japaneseNumber.hiragana, japaneseNumber.romaji];
		}
	};

	// Check if answer is correct based on practice type
	const checkAnswerForType = (guess: string) => {
		const normalizedGuess = guess.toLowerCase().trim();

		switch (config.practiceType) {
			case "number-to-japanese":
			case "kanji-to-japanese":
				return isAnswerCorrect(normalizedGuess, japaneseNumber);
			case "kanji-to-english-or-romanization": {
				const englishAnswer = convertToEnglish(currentNumber).toLowerCase();
				const numberAnswer = currentNumber.toString();
				return (
					normalizedGuess === englishAnswer || normalizedGuess === numberAnswer
				);
			}
			default:
				return false;
		}
	};

	const speakJapanese = () => {
		if (
			"speechSynthesis" in window &&
			(config.practiceType === "number-to-japanese" ||
				config.practiceType === "kanji-to-japanese")
		) {
			window.speechSynthesis.cancel();

			let textToSpeak = japaneseNumber.hiragana;
			if (config.pronunciationSettings.voice === "alternative") {
				textToSpeak = japaneseNumber.romaji;
			}

			const utterance = new SpeechSynthesisUtterance(textToSpeak);
			utterance.lang =
				config.pronunciationSettings.voice === "alternative"
					? "en-US"
					: "ja-JP";
			utterance.rate = config.pronunciationSettings.playSpeed;
			utterance.pitch = 1.0;

			const voices = window.speechSynthesis.getVoices();
			if (config.pronunciationSettings.voice === "standard") {
				const japaneseVoice = voices.find((voice) => voice.lang.includes("ja"));
				if (japaneseVoice) utterance.voice = japaneseVoice;
			} else {
				const englishVoice = voices.find((voice) => voice.lang.includes("en"));
				if (englishVoice) utterance.voice = englishVoice;
			}

			window.speechSynthesis.speak(utterance);
		}
	};

	const checkAnswer = () => {
		const endTime = Date.now();
		const timeMs = endTime - questionStartTime;
		const guess = userGuess.trim();
		const correct = checkAnswerForType(guess);

		setIsCorrect(correct);
		setShowAnswer(true);

		// Record the answer
		const newAnswer = {
			question: getQuestionDisplay(),
			correctAnswer: getCorrectAnswers().join(" / "),
			userAnswer: guess,
			timeMs,
			isCorrect: correct,
		};

		setAnswers((prev) => [...prev, newAnswer]);

		// Auto-play pronunciation if enabled and Japanese practice
		if (
			config.pronunciationSettings.autoPlay &&
			(config.practiceType === "number-to-japanese" ||
				config.practiceType === "kanji-to-japanese")
		) {
			setTimeout(() => {
				speakJapanese();
			}, 300);
		}
	};

	const nextQuestion = () => {
		const nextIndex = currentQuestionIndex + 1;

		if (nextIndex >= config.questionCount) {
			// Session complete
			const session: GameSession = {
				configuration: config,
				startTime: new Date(startTime),
				endTime: new Date(),
				totalQuestions: config.questionCount,
				correctAnswers:
					answers.filter((a) => a.isCorrect).length + (isCorrect ? 1 : 0),
				answers: [
					...answers,
					{
						question: getQuestionDisplay(),
						correctAnswer: getCorrectAnswers().join(" / "),
						userAnswer: userGuess.trim(),
						timeMs: Date.now() - questionStartTime,
						isCorrect: isCorrect || false,
					},
				],
			};
			onComplete(session);
		} else {
			// Next question
			setCurrentQuestionIndex(nextIndex);
			const newNumber = generateNumber();
			setCurrentNumber(newNumber);
			setUserGuess("");
			setShowAnswer(false);
			setIsCorrect(null);
			setQuestionStartTime(Date.now());

			setTimeout(() => {
				inputRef.current?.focus();
			}, 100);
		}
	};

	const handleKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" && !showAnswer) {
			e.preventDefault();
			checkAnswer();
		} else if (e.key === "Enter" && showAnswer) {
			e.preventDefault();
			nextQuestion();
		}
	};

	const getQuestionPrompt = () => {
		switch (config.practiceType) {
			case "number-to-japanese":
				return "What is this number in Japanese?";
			case "kanji-to-japanese":
				return "How do you read this kanji number?";
			case "kanji-to-english-or-romanization":
				return "What is this kanji number in English or as a number?";
			default:
				return "Answer the question";
		}
	};

	return (
		<>
			{/* Floating Back Button - Outside transition container */}
			<div className="fade-in-0 fixed top-6 left-6 z-50 animate-in delay-300 duration-500">
				<button
					type="button"
					onClick={onBack}
					className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white/80 text-gray-600 shadow-lg backdrop-blur-sm transition-all hover:bg-white hover:text-purple-600 hover:shadow-xl"
				>
					<ArrowLeft className="h-4 w-4" />
				</button>
			</div>

			<div
				className="fade-in-0 slide-in-from-right-4 mx-auto max-w-4xl animate-in space-y-6 duration-700"
				style={{ viewTransitionName: "game-step" }}
			>
				{/* Progress Header */}
				<div className="text-center">
					<h2 className={`mb-2 font-bold text-3xl ${themeStyles.text.primary}`}>
						Question {currentQuestionIndex + 1} of {config.questionCount}
					</h2>
					<div className="mx-auto mb-4 h-2 w-full max-w-md rounded-full bg-gray-200 dark:bg-gray-700">
						<div
							className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-blue-600 transition-all duration-300"
							style={{
								width: `${((currentQuestionIndex + 1) / config.questionCount) * 100}%`,
							}}
						/>
					</div>
					<p className={themeStyles.text.secondary}>
						{config.practiceType.replace("-", " → ")} • {config.practiceLevel}{" "}
						level
					</p>
				</div>

				{/* Question Card */}
				<Card
					className={`shadow-xl transition-all duration-500 ${
						showAnswer
							? isCorrect
								? "border-green-400 bg-green-50/50 dark:bg-green-950/50"
								: "border-red-400 bg-red-50/50 dark:bg-red-950/50"
							: ""
					}`}
				>
					<CardContent className="p-8">
						<h3
							className={`mb-4 text-center text-xl ${themeStyles.text.primary}`}
						>
							{showAnswer
								? isCorrect
									? "✅ Correct!"
									: "❌ Not quite right"
								: getQuestionPrompt()}
						</h3>

						{/* Question Display */}
						<div
							className={`mb-6 break-all text-center font-black transition-all duration-300 ${
								showAnswer && isCorrect ? "scale-110" : ""
							} ${
								getQuestionDisplay().length <= 3
									? "text-8xl sm:text-9xl"
									: getQuestionDisplay().length <= 6
										? "text-6xl sm:text-8xl"
										: getQuestionDisplay().length <= 9
											? "text-4xl sm:text-6xl"
											: getQuestionDisplay().length <= 12
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
								{getQuestionDisplay()}
							</span>
						</div>

						{/* Answer Display */}
						{showAnswer && (
							<div className="mb-6 rounded-lg bg-gray-50 p-4 text-center dark:bg-gray-800">
								<p
									className={`font-medium text-lg ${themeStyles.text.primary}`}
								>
									Correct answer: {getCorrectAnswers().join(" / ")}
								</p>
								{!isCorrect && userGuess && (
									<p className="mt-2 text-red-600 text-sm">
										You answered: {userGuess}
									</p>
								)}
							</div>
						)}

						{/* Input */}
						<div className="space-y-4">
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
										: "Type your answer here..."
								}
								className={`w-full rounded-lg border-2 px-4 py-3 text-lg backdrop-blur-sm transition-all duration-300 ${
									showAnswer
										? isCorrect
											? "border-green-300 bg-green-50/50 text-green-800 dark:border-green-600 dark:bg-green-950/50 dark:text-green-200"
											: "border-red-300 bg-red-50/50 text-red-800 dark:border-red-600 dark:bg-red-950/50 dark:text-red-200"
										: "border-purple-200 bg-white/80 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200 dark:border-purple-700 dark:bg-gray-800/80 dark:text-white dark:focus:border-purple-400 dark:focus:ring-purple-400/50"
								} ${showAnswer ? "cursor-pointer" : ""}`}
							/>

							{/* Action Buttons */}
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
										onClick={nextQuestion}
										className={`flex-1 transform rounded-lg px-6 py-3 font-semibold text-white shadow-lg transition hover:scale-105 ${
											isCorrect
												? "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
												: "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
										}`}
									>
										<RefreshCw className="mr-2 h-4 w-4" />
										{currentQuestionIndex + 1 >= config.questionCount
											? "Complete Session"
											: "Next Question"}
									</Button>
								)}

								<Button
									variant="outline"
									onClick={() => setShowAnswer(!showAnswer)}
									className="rounded-lg border-2 border-purple-300 px-4 py-3 text-purple-600 hover:border-purple-400 hover:bg-purple-50"
								>
									{showAnswer ? (
										<EyeOff className="h-4 w-4" />
									) : (
										<Eye className="h-4 w-4" />
									)}
								</Button>

								{(config.practiceType === "number-to-japanese" ||
									config.practiceType === "kanji-to-japanese") && (
									<Button
										variant="outline"
										onClick={speakJapanese}
										className="rounded-lg border-2 border-purple-300 px-4 py-3 text-purple-600 hover:border-purple-400 hover:bg-purple-50"
									>
										<Volume2 className="h-4 w-4" />
									</Button>
								)}
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Quick Stats */}
				<div className="text-center">
					<div className="inline-flex items-center gap-4 rounded-lg border border-purple-100 bg-white/80 px-6 py-3 shadow-lg backdrop-blur-sm">
						<span className="text-gray-600 text-sm">
							Correct: {answers.filter((a) => a.isCorrect).length}/
							{answers.length}
						</span>
						{answers.length > 0 && (
							<span className="font-medium text-purple-600 text-sm">
								(
								{(
									(answers.filter((a) => a.isCorrect).length / answers.length) *
									100
								).toFixed(1)}
								%)
							</span>
						)}
					</div>
				</div>
			</div>
		</>
	);
};

const ResultsStep = ({
	session,
	onRestart,
	onBackToMenu,
}: {
	session: GameSession;
	onRestart: () => void;
	onBackToMenu: () => void;
}) => {
	const accuracy = (session.correctAnswers / session.totalQuestions) * 100;
	const sessionTime =
		session.endTime && session.startTime
			? (session.endTime.getTime() - session.startTime.getTime()) / 1000
			: 0;

	return (
		<>
			{/* Floating Back Button - Outside transition container */}
			<div className="fade-in-0 fixed top-6 left-6 z-50 animate-in delay-300 duration-500">
				<Link
					href="/"
					className="flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-gray-600 shadow-lg backdrop-blur-sm transition-all hover:bg-white hover:text-purple-600 hover:shadow-xl"
				>
					<ArrowLeft className="h-4 w-4" />
				</Link>
			</div>

			<div
				className="fade-in-0 slide-in-from-bottom-4 mx-auto max-w-2xl animate-in space-y-6 duration-700"
				style={{ viewTransitionName: "results-step" }}
			>
				<div className="text-center">
					<h2 className={`mb-4 font-bold text-3xl ${themeStyles.text.primary}`}>
						Practice Session Complete!
					</h2>
					<p className={themeStyles.text.secondary}>Here's how you performed</p>
				</div>

				<Card className={themeStyles.card.base}>
					<CardHeader>
						<CardTitle className="text-center text-2xl">
							{accuracy >= 90
								? "🎉 Excellent!"
								: accuracy >= 70
									? "👏 Great job!"
									: accuracy >= 50
										? "👍 Good work!"
										: "💪 Keep practicing!"}
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-6">
						{/* Stats Grid */}
						<div className="grid grid-cols-2 gap-4">
							<div className="rounded-lg bg-green-50 dark:bg-green-900/20 p-4 text-center">
								<div className="font-bold text-2xl text-green-600 dark:text-green-400">
									{session.correctAnswers}/{session.totalQuestions}
								</div>
								<div className="text-green-700 text-sm dark:text-green-300">Correct Answers</div>
							</div>
							<div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 p-4 text-center">
								<div className="font-bold text-2xl text-blue-600 dark:text-blue-400">
									{accuracy.toFixed(1)}%
								</div>
								<div className="text-blue-700 text-sm dark:text-blue-300">Accuracy</div>
							</div>
							<div className="rounded-lg bg-purple-50 dark:bg-purple-900/20 p-4 text-center">
								<div className="font-bold text-2xl text-purple-600 dark:text-purple-400">
									{sessionTime.toFixed(1)}s
								</div>
								<div className="text-purple-700 text-sm dark:text-purple-300">Total Time</div>
							</div>
							<div className="rounded-lg bg-orange-50 dark:bg-orange-900/20 p-4 text-center">
								<div className="font-bold text-2xl text-orange-600 dark:text-orange-400">
									{(sessionTime / session.totalQuestions).toFixed(1)}s
								</div>
								<div className="text-orange-700 text-sm dark:text-orange-300">Avg per Question</div>
							</div>
						</div>

						{/* Practice Type Summary */}
						<div className={`rounded-lg p-4 ${themeStyles.page.sectionAlt}`}>
							<h4 className={`mb-2 font-semibold ${themeStyles.text.primary}`}>
								Session Details
							</h4>
							<div className={`space-y-1 text-sm ${themeStyles.text.secondary}`}>
								<div>
									Practice Type:{" "}
									{session.configuration.practiceType.replace("-", " → ")}
								</div>
								<div>Difficulty: {session.configuration.practiceLevel}</div>
								<div>
									Range: {session.configuration.rangeMin} -{" "}
									{session.configuration.rangeMax}
								</div>
							</div>
						</div>

						{/* Action Buttons */}
						<div className="grid grid-cols-2 gap-4">
							<Button
								onClick={onRestart}
								className="bg-gradient-to-r from-purple-500 to-blue-600 text-white"
								size="lg"
							>
								<Target className="mr-2 h-4 w-4" />
								Practice Again
							</Button>
							<Button onClick={onBackToMenu} variant="outline" size="lg">
								<ArrowLeft className="mr-2 h-4 w-4" />
								Back to Menu
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>
		</>
	);
};

export default function PracticePage() {
	const [gameState, setGameState] = useState<GameState>("configuration");
	const [currentConfig, setCurrentConfig] =
		useState<PracticeConfiguration | null>(null);
	const [currentSession, setCurrentSession] = useState<GameSession | null>(
		null,
	);

	// Keyboard shortcuts for navigation
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			// ESC to go back
			if (e.key === "Escape") {
				if (gameState === "playing") {
					handleBackToConfiguration();
				} else if (gameState === "results") {
					handleRestart();
				}
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [gameState]);

	// Helper function to transition between states using View Transitions API
	const transitionToState = (newState: GameState, callback: () => void) => {
		if ("startViewTransition" in document) {
			// @ts-ignore - View Transitions API is experimental
			document.startViewTransition(() => {
				callback();
			});
		} else {
			// Fallback for browsers without View Transitions API
			callback();
		}
	};

	const handleStartPractice = (config: PracticeConfiguration) => {
		transitionToState("playing", () => {
			setCurrentConfig(config);
			setGameState("playing");
		});
	};

	const handleCompleteSession = (session: GameSession) => {
		transitionToState("results", () => {
			setCurrentSession(session);
			setGameState("results");
		});
	};

	const handleBackToConfiguration = () => {
		transitionToState("configuration", () => {
			setGameState("configuration");
			setCurrentConfig(null);
			setCurrentSession(null);
		});
	};

	const handleRestart = () => {
		transitionToState("configuration", () => {
			setGameState("configuration");
			setCurrentConfig(null);
			setCurrentSession(null);
		});
	};

	const handleBackToMenu = () => {
		transitionToState("configuration", () => {
			// Navigate back to main menu (home page)
			window.location.href = "/";
		});
	};

	return (
		<main className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-cyan-50 dark:from-gray-900 dark:via-purple-900 dark:to-cyan-900">
			{/* View Transition Styles */}
			<style jsx global>{`
				@media (prefers-reduced-motion: no-preference) {
					::view-transition-old(root),
					::view-transition-new(root) {
						animation-duration: 0.5s;
					}
					
					::view-transition-old(config-step) {
						animation: slide-out-left 0.4s ease-in-out;
					}
					
					::view-transition-new(game-step) {
						animation: slide-in-right 0.4s ease-in-out;
					}
					
					::view-transition-old(game-step) {
						animation: slide-out-right 0.4s ease-in-out;
					}
					
					::view-transition-new(results-step) {
						animation: slide-in-up 0.4s ease-in-out;
					}
					
					::view-transition-old(results-step) {
						animation: slide-out-down 0.4s ease-in-out;
					}
					
					::view-transition-new(config-step) {
						animation: slide-in-left 0.4s ease-in-out;
					}
				}
				
				@keyframes slide-out-left {
					to { transform: translateX(-100%); opacity: 0; }
				}
				
				@keyframes slide-in-right {
					from { transform: translateX(100%); opacity: 0; }
				}
				
				@keyframes slide-out-right {
					to { transform: translateX(100%); opacity: 0; }
				}
				
				@keyframes slide-in-left {
					from { transform: translateX(-100%); opacity: 0; }
				}
				
				@keyframes slide-in-up {
					from { transform: translateY(50px); opacity: 0; }
				}
				
				@keyframes slide-out-down {
					to { transform: translateY(-50px); opacity: 0; }
				}
			`}</style>

			{/* Background decorative elements */}
			<div className="pointer-events-none fixed inset-0 overflow-hidden">
				<div className="-top-40 -right-32 absolute h-80 w-80 rounded-full bg-gradient-to-br from-pink-300/30 to-purple-400/30 blur-3xl" />
				<div className="-bottom-32 -left-32 absolute h-80 w-80 rounded-full bg-gradient-to-br from-cyan-300/30 to-blue-400/30 blur-3xl" />
				<div className="-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 h-96 w-96 transform rounded-full bg-gradient-to-br from-yellow-300/20 to-orange-400/20 blur-3xl" />
			</div>

			<div className="container relative mx-auto px-4 py-16">
				{/* Header */}
				<div className="mb-12 text-center">
					<h1 className="font-black text-4xl sm:text-5xl">
						<span className="bg-gradient-to-r from-pink-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
							数字-Dash
						</span>
					</h1>
					<p className="mt-2 text-lg text-primary">
						Master Japanese numbers with focused practice sessions
					</p>
					{/* Step indicator */}
					<div className="mt-4 flex justify-center">
						<div className="flex items-center gap-2">
							<div
								className={`h-2 w-8 rounded-full transition-all duration-300 ${
									gameState === "configuration"
										? "bg-purple-600"
										: "bg-gray-300"
								}`}
							/>
							<div
								className={`h-2 w-8 rounded-full transition-all duration-300 ${
									gameState === "playing" ? "bg-purple-600" : "bg-gray-300"
								}`}
							/>
							<div
								className={`h-2 w-8 rounded-full transition-all duration-300 ${
									gameState === "results" ? "bg-purple-600" : "bg-gray-300"
								}`}
							/>
						</div>
					</div>
				</div>

				{/* Game Flow */}
				{gameState === "configuration" && (
					<ConfigurationStep onStart={handleStartPractice} />
				)}

				{gameState === "playing" && currentConfig && (
					<GamePlayStep
						config={currentConfig}
						onComplete={handleCompleteSession}
						onBack={handleBackToConfiguration}
					/>
				)}

				{gameState === "results" && currentSession && (
					<ResultsStep
						session={currentSession}
						onRestart={handleRestart}
						onBackToMenu={handleBackToMenu}
					/>
				)}
			</div>
		</main>
	);
}
