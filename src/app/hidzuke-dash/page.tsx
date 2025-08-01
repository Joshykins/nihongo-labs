"use client";

import {
	ArrowLeft,
	Calendar,
	Check,
	Eye,
	EyeOff,
	Play,
	RefreshCw,
	Settings,
	Target,
	Volume2,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { DarkModeToggle } from "~/components/dark-mode-toggle";
import { PageLayout } from "~/components/layout/page-layout";
import { Button } from "~/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "~/components/ui/card";
import { themeStyles } from "~/lib/theme";

// Game flow states
type GameState = "configuration" | "playing" | "results";

// Practice types and configuration
type PracticeType = "days-of-week" | "months" | "dates" | "mixed";
type PracticeDirection = "japanese-to-english" | "english-to-japanese" | "both";

interface DateConfiguration {
	practiceType: PracticeType;
	practiceDirection: PracticeDirection;
	questionCount: number;
	showReadings: boolean;
}

interface Question {
	type: "days-of-week" | "months" | "dates";
	prompt: string;
	correctAnswer: string;
	acceptedAnswers: string[]; // Multiple accepted variations
	kanji?: string;
	hiragana?: string;
	romaji?: string;
	explanation?: string;
}

interface GameSession {
	configuration: DateConfiguration;
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

// Simple hiragana to romaji conversion
const romanizeReading = (hiragana: string): string => {
	const hiraganaToRomaji: Record<string, string> = {
		あ: "a",
		い: "i",
		う: "u",
		え: "e",
		お: "o",
		か: "ka",
		き: "ki",
		く: "ku",
		け: "ke",
		こ: "ko",
		が: "ga",
		ぎ: "gi",
		ぐ: "gu",
		げ: "ge",
		ご: "go",
		さ: "sa",
		し: "shi",
		す: "su",
		せ: "se",
		そ: "so",
		ざ: "za",
		じ: "ji",
		ず: "zu",
		ぜ: "ze",
		ぞ: "zo",
		た: "ta",
		ち: "chi",
		つ: "tsu",
		て: "te",
		と: "to",
		だ: "da",
		ぢ: "ji",
		づ: "zu",
		で: "de",
		ど: "do",
		な: "na",
		に: "ni",
		ぬ: "nu",
		ね: "ne",
		の: "no",
		は: "ha",
		ひ: "hi",
		ふ: "fu",
		へ: "he",
		ほ: "ho",
		ば: "ba",
		び: "bi",
		ぶ: "bu",
		べ: "be",
		ぼ: "bo",
		ぱ: "pa",
		ぴ: "pi",
		ぷ: "pu",
		ぺ: "pe",
		ぽ: "po",
		ま: "ma",
		み: "mi",
		む: "mu",
		め: "me",
		も: "mo",
		や: "ya",
		ゆ: "yu",
		よ: "yo",
		ら: "ra",
		り: "ri",
		る: "ru",
		れ: "re",
		ろ: "ro",
		わ: "wa",
		ゐ: "wi",
		ゑ: "we",
		を: "wo",
		ん: "n",
		ー: "-",
		ゃ: "ya",
		ゅ: "yu",
		ょ: "yo",
		っ: "",
	};

	return hiragana
		.split("")
		.map((char) => hiraganaToRomaji[char] || char)
		.join("");
};

// Data arrays
const daysOfWeek = [
	{ japanese: "月曜日", reading: "げつようび", english: "Monday" },
	{ japanese: "火曜日", reading: "かようび", english: "Tuesday" },
	{ japanese: "水曜日", reading: "すいようび", english: "Wednesday" },
	{ japanese: "木曜日", reading: "もくようび", english: "Thursday" },
	{ japanese: "金曜日", reading: "きんようび", english: "Friday" },
	{ japanese: "土曜日", reading: "どようび", english: "Saturday" },
	{ japanese: "日曜日", reading: "にちようび", english: "Sunday" },
];

const months = [
	{ japanese: "一月", reading: "いちがつ", english: "January", number: 1 },
	{ japanese: "二月", reading: "にがつ", english: "February", number: 2 },
	{ japanese: "三月", reading: "さんがつ", english: "March", number: 3 },
	{ japanese: "四月", reading: "しがつ", english: "April", number: 4 },
	{ japanese: "五月", reading: "ごがつ", english: "May", number: 5 },
	{ japanese: "六月", reading: "ろくがつ", english: "June", number: 6 },
	{ japanese: "七月", reading: "しちがつ", english: "July", number: 7 },
	{ japanese: "八月", reading: "はちがつ", english: "August", number: 8 },
	{ japanese: "九月", reading: "くがつ", english: "September", number: 9 },
	{ japanese: "十月", reading: "じゅうがつ", english: "October", number: 10 },
	{
		japanese: "十一月",
		reading: "じゅういちがつ",
		english: "November",
		number: 11,
	},
	{
		japanese: "十二月",
		reading: "じゅうにがつ",
		english: "December",
		number: 12,
	},
];

const dateCounters = [
	{ number: 1, japanese: "一日", reading: "ついたち", english: "1st" },
	{ number: 2, japanese: "二日", reading: "ふつか", english: "2nd" },
	{ number: 3, japanese: "三日", reading: "みっか", english: "3rd" },
	{ number: 4, japanese: "四日", reading: "よっか", english: "4th" },
	{ number: 5, japanese: "五日", reading: "いつか", english: "5th" },
	{ number: 6, japanese: "六日", reading: "むいか", english: "6th" },
	{ number: 7, japanese: "七日", reading: "なのか", english: "7th" },
	{ number: 8, japanese: "八日", reading: "ようか", english: "8th" },
	{ number: 9, japanese: "九日", reading: "ここのか", english: "9th" },
	{ number: 10, japanese: "十日", reading: "とおか", english: "10th" },
	{
		number: 11,
		japanese: "十一日",
		reading: "じゅういちにち",
		english: "11th",
	},
	{ number: 12, japanese: "十二日", reading: "じゅうににち", english: "12th" },
	{
		number: 13,
		japanese: "十三日",
		reading: "じゅうさんにち",
		english: "13th",
	},
	{ number: 14, japanese: "十四日", reading: "じゅうよっか", english: "14th" },
	{ number: 15, japanese: "十五日", reading: "じゅうごにち", english: "15th" },
	{
		number: 16,
		japanese: "十六日",
		reading: "じゅうろくにち",
		english: "16th",
	},
	{
		number: 17,
		japanese: "十七日",
		reading: "じゅうしちにち",
		english: "17th",
	},
	{
		number: 18,
		japanese: "十八日",
		reading: "じゅうはちにち",
		english: "18th",
	},
	{
		number: 19,
		japanese: "十九日",
		reading: "じゅうくにち",
		english: "19th",
	},
	{ number: 20, japanese: "二十日", reading: "はつか", english: "20th" },
	{
		number: 21,
		japanese: "二十一日",
		reading: "にじゅういちにち",
		english: "21st",
	},
	{
		number: 22,
		japanese: "二十二日",
		reading: "にじゅうににち",
		english: "22nd",
	},
	{
		number: 23,
		japanese: "二十三日",
		reading: "にじゅうさんにち",
		english: "23rd",
	},
	{
		number: 24,
		japanese: "二十四日",
		reading: "にじゅうよっか",
		english: "24th",
	},
	{
		number: 25,
		japanese: "二十五日",
		reading: "にじゅうごにち",
		english: "25th",
	},
	{
		number: 26,
		japanese: "二十六日",
		reading: "にじゅうろくにち",
		english: "26th",
	},
	{
		number: 27,
		japanese: "二十七日",
		reading: "にじゅうしちにち",
		english: "27th",
	},
	{
		number: 28,
		japanese: "二十八日",
		reading: "にじゅうはちにち",
		english: "28th",
	},
	{
		number: 29,
		japanese: "二十九日",
		reading: "にじゅうくにち",
		english: "29th",
	},
	{
		number: 30,
		japanese: "三十日",
		reading: "さんじゅうにち",
		english: "30th",
	},
	{
		number: 31,
		japanese: "三十一日",
		reading: "さんじゅういちにち",
		english: "31st",
	},
];

// Generate questions based on configuration
const generateQuestion = (
	type: "days-of-week" | "months" | "dates",
	direction: PracticeDirection,
): Question => {
	const actualDirection =
		direction === "both"
			? Math.random() > 0.5
				? "japanese-to-english"
				: "english-to-japanese"
			: direction;

	switch (type) {
		case "days-of-week": {
			const dayIndex = Math.floor(Math.random() * daysOfWeek.length);
			const day = daysOfWeek[dayIndex];
			if (!day) throw new Error("Invalid day index");

			if (actualDirection === "english-to-japanese") {
				return {
					type,
					prompt: day.english,
					correctAnswer: day.japanese,
					acceptedAnswers: [
						day.japanese.toLowerCase(),
						day.reading.toLowerCase(),
						romanizeReading(day.reading).toLowerCase(),
					],
					kanji: day.japanese,
					hiragana: day.reading,
					romaji: romanizeReading(day.reading),
					explanation: `${day.english} can be written as ${day.japanese} (kanji), ${day.reading} (hiragana), or ${romanizeReading(day.reading)} (romaji)`,
				};
			}

			return {
				type,
				prompt: day.japanese,
				correctAnswer: day.english,
				acceptedAnswers: [day.english.toLowerCase()],
				kanji: day.japanese,
				hiragana: day.reading,
				romaji: romanizeReading(day.reading),
				explanation: `${day.japanese} (${day.reading} / ${romanizeReading(day.reading)}) means ${day.english}`,
			};
		}

		case "months": {
			const monthIndex = Math.floor(Math.random() * months.length);
			const month = months[monthIndex];
			if (!month) throw new Error("Invalid month index");

			if (actualDirection === "english-to-japanese") {
				return {
					type,
					prompt: month.english,
					correctAnswer: month.japanese,
					acceptedAnswers: [
						month.japanese.toLowerCase(),
						month.reading.toLowerCase(),
						romanizeReading(month.reading).toLowerCase(),
					],
					kanji: month.japanese,
					hiragana: month.reading,
					romaji: romanizeReading(month.reading),
					explanation: `${month.english} can be written as ${month.japanese} (kanji), ${month.reading} (hiragana), or ${romanizeReading(month.reading)} (romaji)`,
				};
			}

			return {
				type,
				prompt: month.japanese,
				correctAnswer: month.english,
				acceptedAnswers: [month.english.toLowerCase()],
				kanji: month.japanese,
				hiragana: month.reading,
				romaji: romanizeReading(month.reading),
				explanation: `${month.japanese} (${month.reading} / ${romanizeReading(month.reading)}) means ${month.english}`,
			};
		}

		case "dates": {
			const dateIndex = Math.floor(Math.random() * dateCounters.length);
			const date = dateCounters[dateIndex];
			if (!date) throw new Error("Invalid date index");

			if (actualDirection === "english-to-japanese") {
				return {
					type,
					prompt: date.english,
					correctAnswer: date.japanese,
					acceptedAnswers: [
						date.japanese.toLowerCase(),
						date.reading.toLowerCase(),
						romanizeReading(date.reading).toLowerCase(),
					],
					kanji: date.japanese,
					hiragana: date.reading,
					romaji: romanizeReading(date.reading),
					explanation: `${date.english} can be written as ${date.japanese} (kanji), ${date.reading} (hiragana), or ${romanizeReading(date.reading)} (romaji)`,
				};
			}

			return {
				type,
				prompt: date.japanese,
				correctAnswer: date.english,
				acceptedAnswers: [date.english.toLowerCase()],
				kanji: date.japanese,
				hiragana: date.reading,
				romaji: romanizeReading(date.reading),
				explanation: `${date.japanese} (${date.reading} / ${romanizeReading(date.reading)}) means ${date.english}`,
			};
		}

		default:
			throw new Error(`Unsupported practice type: ${type}`);
	}
};

// Configuration Step Component
const ConfigurationStep = ({
	onStart,
}: { onStart: (config: DateConfiguration) => void }) => {
	const [config, setConfig] = useState<DateConfiguration>({
		practiceType: "days-of-week",
		practiceDirection: "japanese-to-english",
		questionCount: 10,
		showReadings: true,
	});

	return (
		<>
			<div
				className="fade-in-0 slide-in-from-bottom-4 mx-auto max-w-2xl animate-in space-y-6 duration-700"
				style={{ viewTransitionName: "config-step" }}
			>
				<div className="text-center">
					<h2 className={`mb-4 font-bold text-3xl ${themeStyles.text.primary}`}>
						Configure Your Practice Session
					</h2>
					<p className={themeStyles.text.secondary}>
						Set up your 日付-Dash practice session. Master Japanese dates, days,
						and months.
					</p>
				</div>

				<Card className="shadow-xl">
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Settings className="h-5 w-5 text-emerald-600" />
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
										id: "days-of-week",
										label: "Days of the Week",
										description: "Monday, Tuesday, Wednesday...",
									},
									{
										id: "months",
										label: "Months",
										description: "January, February, March...",
									},
									{
										id: "dates",
										label: "Date Counters",
										description: "1st, 2nd, 3rd... (1-31)",
									},
									{
										id: "mixed",
										label: "Mixed Practice",
										description: "Random mix of all types",
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
												practiceType: type.id as PracticeType,
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

						{/* Practice Direction */}
						<div className="space-y-3">
							<h3 className={`font-medium text-sm ${themeStyles.text.primary}`}>
								Practice Direction
							</h3>
							<div className="grid grid-cols-1 gap-3">
								{[
									{
										id: "japanese-to-english",
										label: "Japanese → English",
										description: "See: 月曜日 → Answer: Monday",
									},
									{
										id: "english-to-japanese",
										label: "English → Japanese",
										description: "See: Monday → Answer: 月曜日",
									},
									{
										id: "both",
										label: "Mixed Directions",
										description: "Random mix of both directions",
									},
								].map((direction) => (
									<Button
										key={direction.id}
										variant={
											config.practiceDirection === direction.id
												? "default"
												: "outline"
										}
										onClick={() =>
											setConfig((prev) => ({
												...prev,
												practiceDirection: direction.id as PracticeDirection,
											}))
										}
										className="h-auto justify-start p-4"
									>
										<div className="text-left">
											<div className="font-semibold">{direction.label}</div>
											<div className="mt-1 text-xs opacity-75">
												{direction.description}
											</div>
										</div>
									</Button>
								))}
							</div>
						</div>

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

						{/* Show Readings Toggle */}
						<div className="space-y-3">
							<h3 className={`font-medium text-sm ${themeStyles.text.primary}`}>
								Reading Hints
							</h3>
							<div className="flex items-center space-x-3">
								<input
									type="checkbox"
									id="showReadings"
									checked={config.showReadings}
									onChange={(e) =>
										setConfig((prev) => ({
											...prev,
											showReadings: e.target.checked,
										}))
									}
									className="h-4 w-4 cursor-pointer rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
								/>
								<label htmlFor="showReadings" className={`cursor-pointer text-sm ${themeStyles.text.primary}`}>
									Show hiragana readings for Japanese prompts
								</label>
							</div>
						</div>

						{/* Start Button */}
						<div className="border-t pt-4">
							<Button
								onClick={() => onStart(config)}
								className="w-full transform bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
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

// Game Play Step Component
const GamePlayStep = ({
	config,
	onComplete,
	onBack,
}: {
	config: DateConfiguration;
	onComplete: (session: GameSession) => void;
	onBack: () => void;
}) => {
	const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
	const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
	const [userInput, setUserInput] = useState<string>("");
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

	// Generate question based on configuration
	const generateQuestionForStep = useCallback(() => {
		if (config.practiceType === "mixed") {
			const types: ("days-of-week" | "months" | "dates")[] = [
				"days-of-week",
				"months",
				"dates",
			];
			const randomType =
				types[Math.floor(Math.random() * types.length)] ?? "days-of-week";
			return generateQuestion(randomType, config.practiceDirection);
		}
		return generateQuestion(config.practiceType, config.practiceDirection);
	}, [config]);

	// Initialize first question
	useEffect(() => {
		const firstQuestion = generateQuestionForStep();
		setCurrentQuestion(firstQuestion);
		setStartTime(Date.now());
		setQuestionStartTime(Date.now());
		inputRef.current?.focus();
	}, [generateQuestionForStep]);

	const checkAnswer = () => {
		if (!currentQuestion) return;

		const endTime = Date.now();
		const timeMs = endTime - questionStartTime;
		const guess = userInput.trim().toLowerCase();
		const correct = currentQuestion.acceptedAnswers.some(
			(answer) => answer.toLowerCase() === guess,
		);

		setIsCorrect(correct);
		setShowAnswer(true);

		// Record the answer
		const newAnswer = {
			question: currentQuestion.prompt,
			correctAnswer: currentQuestion.correctAnswer,
			userAnswer: userInput.trim(),
			timeMs,
			isCorrect: correct,
		};

		setAnswers((prev) => [...prev, newAnswer]);
	};

	const speakText = (text: string, isJapanese = false) => {
		if ("speechSynthesis" in window) {
			window.speechSynthesis.cancel();
			const utterance = new SpeechSynthesisUtterance(text);
			utterance.lang = isJapanese ? "ja-JP" : "en-US";
			utterance.rate = 0.8;
			utterance.pitch = 1.0;

			const voices = window.speechSynthesis.getVoices();
			const voice = voices.find((v) =>
				v.lang.includes(isJapanese ? "ja" : "en"),
			);
			if (voice) utterance.voice = voice;

			window.speechSynthesis.speak(utterance);
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
						question: currentQuestion?.prompt || "",
						correctAnswer: currentQuestion?.correctAnswer || "",
						userAnswer: userInput.trim(),
						timeMs: Date.now() - questionStartTime,
						isCorrect: isCorrect || false,
					},
				],
			};
			onComplete(session);
		} else {
			// Next question
			setCurrentQuestionIndex(nextIndex);
			const newQuestion = generateQuestionForStep();
			setCurrentQuestion(newQuestion);
			setUserInput("");
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

	if (!currentQuestion) {
		return <div>Loading...</div>;
	}

	const getQuestionPrompt = () => {
		const isJapaneseToEnglish =
			/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(currentQuestion.prompt);
		if (isJapaneseToEnglish) {
			return "What does this mean in English?";
		}
		return "How do you write this in Japanese?";
	};

	return (
		<>
			{/* Floating Back Button - Outside transition container */}
			<div className="fade-in-0 fixed top-6 left-6 z-50 animate-in delay-300 duration-500">
				<button
					type="button"
					onClick={onBack}
					className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white/80 text-gray-600 shadow-lg backdrop-blur-sm transition-all hover:bg-white hover:text-emerald-600 hover:shadow-xl"
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
							className="h-2 rounded-full bg-gradient-to-r from-emerald-500 to-green-600 transition-all duration-300"
							style={{
								width: `${((currentQuestionIndex + 1) / config.questionCount) * 100}%`,
							}}
						/>
					</div>
					<p className={themeStyles.text.secondary}>
						{config.practiceType.replace("-", " ")} •{" "}
						{config.practiceDirection.replace("-", " → ")}
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
						<h3 className={`mb-4 text-center text-xl ${themeStyles.text.primary}`}>
							{showAnswer
								? isCorrect
									? "✅ Correct!"
									: "❌ Not quite right"
								: getQuestionPrompt()}
						</h3>

						{/* Question Display */}
						<div className="mb-6 flex items-center justify-center gap-4">
							<div
								className={`break-all text-center font-black transition-all duration-300 ${
									showAnswer && isCorrect ? "scale-110" : ""
								} ${
									currentQuestion.prompt.length <= 3
										? "text-8xl sm:text-9xl"
										: currentQuestion.prompt.length <= 6
											? "text-6xl sm:text-8xl"
											: currentQuestion.prompt.length <= 9
												? "text-4xl sm:text-6xl"
												: currentQuestion.prompt.length <= 12
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
											: "from-emerald-600 via-green-600 to-teal-600"
									}`}
								>
									{currentQuestion.prompt}
								</span>
							</div>
							<Button
								size="sm"
								variant="outline"
								onClick={() => {
									const isJapanese =
										/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(
											currentQuestion.prompt,
										);
									speakText(currentQuestion.prompt, isJapanese);
								}}
								className="border-emerald-600 text-emerald-600 hover:bg-emerald-50"
							>
								<Volume2 className="h-4 w-4" />
							</Button>
						</div>

						{/* Show Reading Hints */}
						{config.showReadings &&
							currentQuestion.hiragana &&
							/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(
								currentQuestion.prompt,
							) && (
								<div className={`mb-6 text-center text-xl ${themeStyles.text.secondary}`}>
									({currentQuestion.hiragana})
								</div>
							)}

						{/* Answer Display */}
						{showAnswer && (
							<div className="mb-6 rounded-lg bg-gray-50 p-4 text-center dark:bg-gray-800">
								<div className="space-y-3">
									<div className="text-center">
										<div className={`mb-2 text-sm ${themeStyles.text.secondary}`}>
											Answer forms:
										</div>

										{currentQuestion.kanji && (
											<div className="mb-2">
												<span className={`block text-xs ${themeStyles.text.muted}`}>
													Kanji
												</span>
												<span className={`font-bold text-2xl ${themeStyles.text.primary}`}>
													{currentQuestion.kanji}
												</span>
												<Button
													size="sm"
													variant="ghost"
													onClick={() =>
														speakText(currentQuestion.kanji || "", true)
													}
													className="ml-2 h-auto p-1"
												>
													<Volume2 className="h-3 w-3" />
												</Button>
											</div>
										)}

										{currentQuestion.hiragana && (
											<div className="mb-2">
												<span className={`block text-xs ${themeStyles.text.muted}`}>
													Hiragana
												</span>
												<span className={`text-xl ${themeStyles.text.secondary}`}>
													{currentQuestion.hiragana}
												</span>
												<Button
													size="sm"
													variant="ghost"
													onClick={() =>
														speakText(currentQuestion.hiragana || "", true)
													}
													className="ml-2 h-auto p-1"
												>
													<Volume2 className="h-3 w-3" />
												</Button>
											</div>
										)}

										{currentQuestion.romaji && (
											<div className="mb-2">
												<span className={`block text-xs ${themeStyles.text.muted}`}>
													Romaji
												</span>
												<span className={`text-lg ${themeStyles.text.secondary}`}>
													{currentQuestion.romaji}
												</span>
											</div>
										)}

										<div className="mt-3 border-gray-200 border-t pt-3">
											<span className={`block text-xs ${themeStyles.text.muted}`}>
												English
											</span>
											<span className={`font-medium text-lg ${themeStyles.text.primary}`}>
												{currentQuestion.correctAnswer}
											</span>
										</div>
									</div>
								</div>
								{!isCorrect && userInput && (
									<p className="mt-2 text-red-600 text-sm">
										You answered: {userInput}
									</p>
								)}
							</div>
						)}

						{/* Explanation */}
						{showAnswer && currentQuestion.explanation && (
							<div className="mb-6 rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
								<p className={`text-sm ${themeStyles.text.secondary}`}>
									{currentQuestion.explanation}
								</p>
							</div>
						)}

						{/* Input */}
						<div className="space-y-4">
							<input
								ref={inputRef}
								type="text"
								value={userInput}
								onChange={(e) => setUserInput(e.target.value)}
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
										: "border-emerald-200 bg-white/80 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 dark:border-emerald-700 dark:bg-gray-800/80 dark:text-white dark:focus:border-emerald-400 dark:focus:ring-emerald-400/50"
								} ${showAnswer ? "cursor-pointer" : ""}`}
							/>

							{/* Action Buttons */}
							<div className="flex flex-wrap gap-3">
								{!showAnswer ? (
									<Button
										onClick={checkAnswer}
										disabled={!userInput.trim()}
										className="flex-1 transform rounded-lg bg-gradient-to-r from-emerald-500 to-green-600 px-6 py-3 font-semibold text-white shadow-lg transition hover:scale-105 hover:from-emerald-600 hover:to-green-700 disabled:transform-none disabled:cursor-not-allowed disabled:opacity-50"
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
												: "bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700"
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
									className="rounded-lg border-2 border-emerald-300 px-4 py-3 text-emerald-600 hover:border-emerald-400 hover:bg-emerald-50"
								>
									{showAnswer ? (
										<EyeOff className="h-4 w-4" />
									) : (
										<Eye className="h-4 w-4" />
									)}
								</Button>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Quick Stats */}
				<div className="text-center">
					<div className="inline-flex items-center gap-4 rounded-lg border border-emerald-100 bg-white/80 px-6 py-3 shadow-lg backdrop-blur-sm dark:border-emerald-700 dark:bg-gray-800/80">
						<span className={`text-sm ${themeStyles.text.secondary}`}>
							Correct: {answers.filter((a) => a.isCorrect).length}/
							{answers.length}
						</span>
						{answers.length > 0 && (
							<span className="font-medium text-emerald-600 text-sm">
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

// Results Step Component
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
					className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white/80 text-gray-600 shadow-lg backdrop-blur-sm transition-all hover:bg-white hover:text-emerald-600 hover:shadow-xl"
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
							<div className="rounded-lg bg-green-50 p-4 text-center dark:bg-green-900/20">
								<div className="font-bold text-2xl text-green-600 dark:text-green-400">
									{session.correctAnswers}/{session.totalQuestions}
								</div>
								<div className="text-sm text-green-700 dark:text-green-300">Correct Answers</div>
							</div>
							<div className="rounded-lg bg-emerald-50 p-4 text-center dark:bg-emerald-900/20">
								<div className="font-bold text-2xl text-emerald-600 dark:text-emerald-400">
									{accuracy.toFixed(1)}%
								</div>
								<div className="text-sm text-emerald-700 dark:text-emerald-300">Accuracy</div>
							</div>
							<div className="rounded-lg bg-teal-50 p-4 text-center dark:bg-teal-900/20">
								<div className="font-bold text-2xl text-teal-600 dark:text-teal-400">
									{sessionTime.toFixed(1)}s
								</div>
								<div className="text-sm text-teal-700 dark:text-teal-300">Total Time</div>
							</div>
							<div className="rounded-lg bg-cyan-50 p-4 text-center dark:bg-cyan-900/20">
								<div className="font-bold text-2xl text-cyan-600 dark:text-cyan-400">
									{(sessionTime / session.totalQuestions).toFixed(1)}s
								</div>
								<div className="text-sm text-cyan-700 dark:text-cyan-300">Avg per Question</div>
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
									{session.configuration.practiceType.replace("-", " ")}
								</div>
								<div>
									Direction:{" "}
									{session.configuration.practiceDirection.replace("-", " → ")}
								</div>
								<div>Questions: {session.configuration.questionCount}</div>
							</div>
						</div>

						{/* Action Buttons */}
						<div className="grid grid-cols-2 gap-4">
							<Button
								onClick={onRestart}
								className="bg-gradient-to-r from-emerald-500 to-green-600 text-white"
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

// Main Component
export default function DateDashPage() {
	const [gameState, setGameState] = useState<GameState>("configuration");
	const [currentConfig, setCurrentConfig] = useState<DateConfiguration | null>(
		null,
	);
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

	const handleStartPractice = (config: DateConfiguration) => {
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
		<PageLayout showBackButton={true} backHref="/">
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
				<div className="-top-40 -right-32 absolute h-80 w-80 rounded-full bg-gradient-to-br from-emerald-300/30 to-green-400/30 blur-3xl" />
				<div className="-bottom-32 -left-32 absolute h-80 w-80 rounded-full bg-gradient-to-br from-teal-300/30 to-emerald-400/30 blur-3xl" />
				<div className="-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 h-96 w-96 transform rounded-full bg-gradient-to-br from-green-300/20 to-teal-400/20 blur-3xl" />
			</div>

			<div className="container relative mx-auto px-4 py-16">
				{/* Header */}
				<div className="mb-12 text-center">
					<h1 className="font-black text-4xl sm:text-5xl">
						<span className="bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 bg-clip-text text-transparent">
							日付-Dash
						</span>
					</h1>
					<p className="mt-2 text-lg text-primary">
						Master Japanese dates, days, and months with focused practice
						sessions
					</p>
					{/* Step indicator */}
					<div className="mt-4 flex justify-center">
						<div className="flex items-center gap-2">
							<div
								className={`h-2 w-8 rounded-full transition-all duration-300 ${
									gameState === "configuration"
										? "bg-emerald-600"
										: "bg-gray-300"
								}`}
							/>
							<div
								className={`h-2 w-8 rounded-full transition-all duration-300 ${
									gameState === "playing" ? "bg-emerald-600" : "bg-gray-300"
								}`}
							/>
							<div
								className={`h-2 w-8 rounded-full transition-all duration-300 ${
									gameState === "results" ? "bg-emerald-600" : "bg-gray-300"
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
		</PageLayout>
	);
}
