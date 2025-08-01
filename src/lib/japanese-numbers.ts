// Japanese number conversion utilities

export interface JapaneseNumber {
	number: number;
	kanji: string;
	hiragana: string;
	romaji: string;
}

// Utility function to format numbers with commas
export function formatNumberWithCommas(num: number): string {
	return num.toLocaleString();
}

// Basic number mappings
const basicNumbers: Record<number, JapaneseNumber> = {
	0: { number: 0, kanji: "零", hiragana: "れい", romaji: "rei" },
	1: { number: 1, kanji: "一", hiragana: "いち", romaji: "ichi" },
	2: { number: 2, kanji: "二", hiragana: "に", romaji: "ni" },
	3: { number: 3, kanji: "三", hiragana: "さん", romaji: "san" },
	4: { number: 4, kanji: "四", hiragana: "よん", romaji: "yon" },
	5: { number: 5, kanji: "五", hiragana: "ご", romaji: "go" },
	6: { number: 6, kanji: "六", hiragana: "ろく", romaji: "roku" },
	7: { number: 7, kanji: "七", hiragana: "なな", romaji: "nana" },
	8: { number: 8, kanji: "八", hiragana: "はち", romaji: "hachi" },
	9: { number: 9, kanji: "九", hiragana: "きゅう", romaji: "kyuu" },
	10: { number: 10, kanji: "十", hiragana: "じゅう", romaji: "juu" },
	11: {
		number: 11,
		kanji: "十一",
		hiragana: "じゅういち",
		romaji: "juuichi",
	},
	12: { number: 12, kanji: "十二", hiragana: "じゅうに", romaji: "juuni" },
	13: {
		number: 13,
		kanji: "十三",
		hiragana: "じゅうさん",
		romaji: "juusan",
	},
	14: {
		number: 14,
		kanji: "十四",
		hiragana: "じゅうよん",
		romaji: "juuyon",
	},
	15: { number: 15, kanji: "十五", hiragana: "じゅうご", romaji: "juugo" },
	16: {
		number: 16,
		kanji: "十六",
		hiragana: "じゅうろく",
		romaji: "juuroku",
	},
	17: {
		number: 17,
		kanji: "十七",
		hiragana: "じゅうなな",
		romaji: "juunana",
	},
	18: {
		number: 18,
		kanji: "十八",
		hiragana: "じゅうはち",
		romaji: "juuhachi",
	},
	19: {
		number: 19,
		kanji: "十九",
		hiragana: "じゅうきゅう",
		romaji: "juukyuu",
	},
	20: { number: 20, kanji: "二十", hiragana: "にじゅう", romaji: "nijuu" },
	30: {
		number: 30,
		kanji: "三十",
		hiragana: "さんじゅう",
		romaji: "sanjuu",
	},
	40: {
		number: 40,
		kanji: "四十",
		hiragana: "よんじゅう",
		romaji: "yonjuu",
	},
	50: { number: 50, kanji: "五十", hiragana: "ごじゅう", romaji: "gojuu" },
	60: {
		number: 60,
		kanji: "六十",
		hiragana: "ろくじゅう",
		romaji: "rokujuu",
	},
	70: {
		number: 70,
		kanji: "七十",
		hiragana: "ななじゅう",
		romaji: "nanajuu",
	},
	80: {
		number: 80,
		kanji: "八十",
		hiragana: "はちじゅう",
		romaji: "hachijuu",
	},
	90: {
		number: 90,
		kanji: "九十",
		hiragana: "きゅうじゅう",
		romaji: "kyuujuu",
	},
	100: { number: 100, kanji: "百", hiragana: "ひゃく", romaji: "hyaku" },
};

/**
 * Convert a number (0-9999) to Japanese representations
 */
export function convertToJapanese(num: number): JapaneseNumber {
	// Handle basic numbers directly
	if (basicNumbers[num]) {
		return basicNumbers[num];
	}

	// Validate range - now supporting up to 999 trillion
	if (num < 0 || num > 999999999999999) {
		return {
			number: num,
			kanji: "?",
			hiragana: "?",
			romaji: "?",
		};
	}

	// Handle numbers 21-99 not in the basic list
	if (num > 20 && num < 100) {
		const tens = Math.floor(num / 10) * 10;
		const ones = num % 10;

		if (ones === 0) {
			const tensJapanese = basicNumbers[tens];
			if (!tensJapanese) {
				return {
					number: num,
					kanji: "?",
					hiragana: "?",
					romaji: "?",
				};
			}
			return tensJapanese;
		}

		const tensJapanese = basicNumbers[tens];
		const onesJapanese = basicNumbers[ones];

		if (!tensJapanese || !onesJapanese) {
			return { number: num, kanji: "?", hiragana: "?", romaji: "?" };
		}

		return {
			number: num,
			kanji: tensJapanese.kanji + onesJapanese.kanji,
			hiragana: tensJapanese.hiragana + onesJapanese.hiragana,
			romaji: tensJapanese.romaji + onesJapanese.romaji,
		};
	}

	// Handle hundreds (100-999)
	if (num >= 100 && num < 1000) {
		return convertHundreds(num);
	}

	// Handle thousands (1000-9999)
	if (num >= 1000 && num < 10000) {
		return convertThousands(num);
	}

	// Handle ten thousands (10000-99999) - man (万)
	if (num >= 10000 && num < 100000) {
		return convertTenThousands(num);
	}

	// Handle hundred thousands (100000-999999)
	if (num >= 100000 && num <= 999999) {
		return convertHundredThousands(num);
	}

	// Handle one million exactly
	if (num === 1000000) {
		return {
			number: num,
			kanji: "百万",
			hiragana: "ひゃくまん",
			romaji: "hyakuman",
		};
	}

	// Handle millions (1000000-9999999)
	if (num >= 1000000 && num < 10000000) {
		return convertMillions(num);
	}

	// Handle ten millions (10000000-99999999)
	if (num >= 10000000 && num < 100000000) {
		return convertTenMillions(num);
	}

	// Handle hundred millions (100000000-999999999) - oku (億)
	if (num >= 100000000 && num < 1000000000) {
		return convertHundredMillions(num);
	}

	// Handle billions (1000000000-9999999999)
	if (num >= 1000000000 && num < 10000000000) {
		return convertBillions(num);
	}

	// Handle ten billions (10000000000-99999999999)
	if (num >= 10000000000 && num < 100000000000) {
		return convertTenBillions(num);
	}

	// Handle hundred billions (100000000000-999999999999)
	if (num >= 100000000000 && num < 1000000000000) {
		return convertHundredBillions(num);
	}

	// Handle one trillion exactly
	if (num === 1000000000000) {
		return {
			number: num,
			kanji: "一兆",
			hiragana: "いっちょう",
			romaji: "icchou",
		};
	}

	// Handle trillions (1000000000000-9999999999999)
	if (num >= 1000000000000 && num < 10000000000000) {
		return convertTrillions(num);
	}

	// Handle ten trillions (10000000000000-99999999999999)
	if (num >= 10000000000000 && num < 100000000000000) {
		return convertTenTrillions(num);
	}

	// Handle hundred trillions (100000000000000-999999999999999)
	if (num >= 100000000000000 && num < 1000000000000000) {
		return convertHundredTrillions(num);
	}

	// Fallback for unsupported numbers
	return {
		number: num,
		kanji: "?",
		hiragana: "?",
		romaji: "?",
	};
}

/**
 * Helper function to convert hundreds (100-999)
 */
function convertHundreds(num: number): JapaneseNumber {
	const hundreds = Math.floor(num / 100);
	const remainder = num % 100;

	let hundredsKanji: string;
	let hundredsHiragana: string;
	let hundredsRomaji: string;

	// Handle special pronunciations for hundreds
	switch (hundreds) {
		case 1:
			hundredsKanji = "百";
			hundredsHiragana = "ひゃく";
			hundredsRomaji = "hyaku";
			break;
		case 2:
			hundredsKanji = "二百";
			hundredsHiragana = "にひゃく";
			hundredsRomaji = "nihyaku";
			break;
		case 3:
			hundredsKanji = "三百";
			hundredsHiragana = "さんびゃく"; // sound change
			hundredsRomaji = "sanbyaku";
			break;
		case 4:
			hundredsKanji = "四百";
			hundredsHiragana = "よんひゃく";
			hundredsRomaji = "yonhyaku";
			break;
		case 5:
			hundredsKanji = "五百";
			hundredsHiragana = "ごひゃく";
			hundredsRomaji = "gohyaku";
			break;
		case 6:
			hundredsKanji = "六百";
			hundredsHiragana = "ろっぴゃく"; // sound change
			hundredsRomaji = "roppyaku";
			break;
		case 7:
			hundredsKanji = "七百";
			hundredsHiragana = "ななひゃく";
			hundredsRomaji = "nanahyaku";
			break;
		case 8:
			hundredsKanji = "八百";
			hundredsHiragana = "はっぴゃく"; // sound change
			hundredsRomaji = "happyaku";
			break;
		case 9:
			hundredsKanji = "九百";
			hundredsHiragana = "きゅうひゃく";
			hundredsRomaji = "kyuuhyaku";
			break;
		default:
			return {
				number: num,
				kanji: "?",
				hiragana: "?",
				romaji: "?",
			};
	}

	// Handle remainder (0-99)
	if (remainder === 0) {
		return {
			number: num,
			kanji: hundredsKanji,
			hiragana: hundredsHiragana,
			romaji: hundredsRomaji,
		};
	}

	const remainderJapanese = convertToJapanese(remainder);
	if (remainderJapanese.kanji === "?") {
		return {
			number: num,
			kanji: "?",
			hiragana: "?",
			romaji: "?",
		};
	}

	return {
		number: num,
		kanji: hundredsKanji + remainderJapanese.kanji,
		hiragana: hundredsHiragana + remainderJapanese.hiragana,
		romaji: hundredsRomaji + remainderJapanese.romaji,
	};
}

/**
 * Helper function to convert thousands (1000-9999)
 */
function convertThousands(num: number): JapaneseNumber {
	const thousands = Math.floor(num / 1000);
	const remainder = num % 1000;

	let thousandsKanji: string;
	let thousandsHiragana: string;
	let thousandsRomaji: string;

	// Handle special pronunciations for thousands
	switch (thousands) {
		case 1:
			thousandsKanji = "千";
			thousandsHiragana = "せん";
			thousandsRomaji = "sen";
			break;
		case 2:
			thousandsKanji = "二千";
			thousandsHiragana = "にせん";
			thousandsRomaji = "nisen";
			break;
		case 3:
			thousandsKanji = "三千";
			thousandsHiragana = "さんぜん"; // sound change
			thousandsRomaji = "sanzen";
			break;
		case 4:
			thousandsKanji = "四千";
			thousandsHiragana = "よんせん";
			thousandsRomaji = "yonsen";
			break;
		case 5:
			thousandsKanji = "五千";
			thousandsHiragana = "ごせん";
			thousandsRomaji = "gosen";
			break;
		case 6:
			thousandsKanji = "六千";
			thousandsHiragana = "ろくせん";
			thousandsRomaji = "rokusen";
			break;
		case 7:
			thousandsKanji = "七千";
			thousandsHiragana = "ななせん";
			thousandsRomaji = "nanasen";
			break;
		case 8:
			thousandsKanji = "八千";
			thousandsHiragana = "はっせん"; // sound change
			thousandsRomaji = "hassen";
			break;
		case 9:
			thousandsKanji = "九千";
			thousandsHiragana = "きゅうせん";
			thousandsRomaji = "kyuusen";
			break;
		default:
			return {
				number: num,
				kanji: "?",
				hiragana: "?",
				romaji: "?",
			};
	}

	// Handle remainder (0-999)
	if (remainder === 0) {
		return {
			number: num,
			kanji: thousandsKanji,
			hiragana: thousandsHiragana,
			romaji: thousandsRomaji,
		};
	}

	const remainderJapanese = convertToJapanese(remainder);
	if (remainderJapanese.kanji === "?") {
		return {
			number: num,
			kanji: "?",
			hiragana: "?",
			romaji: "?",
		};
	}

	return {
		number: num,
		kanji: thousandsKanji + remainderJapanese.kanji,
		hiragana: thousandsHiragana + remainderJapanese.hiragana,
		romaji: thousandsRomaji + remainderJapanese.romaji,
	};
}

/**
 * Generate a random number for practice (0-999,999,999,999,999) with realistic rounding
 */
export function generateRandomNumber(): number {
	const rawNumber = Math.floor(Math.random() * 1000000000000000); // 0-999,999,999,999,999

	// Apply realistic rounding based on magnitude
	return roundToRealistic(rawNumber);
}

/**
 * Round numbers to realistic values based on their magnitude
 */
export function roundToRealistic(num: number): number {
	if (num < 1000) {
		// Keep small numbers exact (0-999)
		return num;
	}
	if (num < 10000) {
		// Round to nearest 100 for thousands (1,000-9,999)
		return Math.round(num / 100) * 100;
	}
	if (num < 100000) {
		// Round to nearest 500 for ten thousands (10,000-99,999)
		return Math.round(num / 500) * 500;
	}
	if (num < 1000000) {
		// Round to nearest 1,000 for hundred thousands (100,000-999,999)
		return Math.round(num / 1000) * 1000;
	}
	if (num < 10000000) {
		// Round to nearest 10,000 for millions (1,000,000-9,999,999)
		return Math.round(num / 10000) * 10000;
	}
	if (num < 100000000) {
		// Round to nearest 50,000 for ten millions (10,000,000-99,999,999)
		return Math.round(num / 50000) * 50000;
	}
	if (num < 1000000000) {
		// Round to nearest 100,000 for hundred millions (100,000,000-999,999,999)
		return Math.round(num / 100000) * 100000;
	}
	if (num < 10000000000) {
		// Round to nearest 1,000,000 for billions (1,000,000,000-9,999,999,999)
		return Math.round(num / 1000000) * 1000000;
	}
	if (num < 100000000000) {
		// Round to nearest 5,000,000 for ten billions (10,000,000,000-99,999,999,999)
		return Math.round(num / 5000000) * 5000000;
	}
	if (num < 1000000000000) {
		// Round to nearest 10,000,000 for hundred billions (100,000,000,000-999,999,999,999)
		return Math.round(num / 10000000) * 10000000;
	}
	// Round to nearest 100,000,000 for trillions (1,000,000,000,000+)
	return Math.round(num / 100000000) * 100000000;
}

/**
 * Get all supported numbers for practice
 */
export function getSupportedNumbers(): number[] {
	const supported: number[] = [];

	// Add all basic numbers
	supported.push(...Object.keys(basicNumbers).map(Number));

	// Add compound numbers 21-99
	for (let i = 21; i < 100; i++) {
		if (!basicNumbers[i]) {
			supported.push(i);
		}
	}

	return supported.sort((a, b) => a - b);
}

/**
 * Generate alternative romanization variants for a given romaji string
 * Handles common romanization differences like:
 * - Long vowels: uu <-> u, ou <-> o
 * - Y-variations: jyu <-> ju, kyu <-> ku, etc.
 * - N variations: n <-> nn before certain consonants
 */
function generateRomajiVariants(romaji: string): string[] {
	const variants = new Set([romaji]);

	// Long vowel variations (uu <-> u, ou <-> o, etc.)
	const longVowelMappings = [
		{ long: "uu", short: "u" },
		{ long: "ou", short: "o" },
		{ long: "aa", short: "a" },
		{ long: "ii", short: "i" },
		{ long: "ee", short: "e" },
	];

	for (const mapping of longVowelMappings) {
		// Add variant with long vowel replaced by short
		if (romaji.includes(mapping.long)) {
			variants.add(
				romaji.replace(new RegExp(mapping.long, "g"), mapping.short)
			);
		}
		// Add variant with short vowel replaced by long (for words that typically have long vowels)
		if (
			romaji.includes(mapping.short) &&
			!romaji.includes(mapping.long)
		) {
			// Only replace if it's a standalone vowel or at the end
			const longVariant = romaji.replace(
				new RegExp(`${mapping.short}(?![aeiou])`, "g"),
				mapping.long
			);
			if (longVariant !== romaji) {
				variants.add(longVariant);
			}
		}
	}

	// Y-sound variations (jyu <-> ju, kyu <-> ku, etc.)
	const ySoundMappings = [
		{ with_y: "jyu", without_y: "ju" },
		{ with_y: "kyu", without_y: "ku" },
		{ with_y: "syu", without_y: "su" },
		{ with_y: "tyu", without_y: "tu" },
		{ with_y: "nyu", without_y: "nu" },
		{ with_y: "hyu", without_y: "hu" },
		{ with_y: "myu", without_y: "mu" },
		{ with_y: "ryu", without_y: "ru" },
		{ with_y: "gyu", without_y: "gu" },
		{ with_y: "zyu", without_y: "zu" },
		{ with_y: "dyu", without_y: "du" },
		{ with_y: "byu", without_y: "bu" },
		{ with_y: "pyu", without_y: "pu" },
	];

	// Apply y-sound variations to all current variants
	const currentVariants = Array.from(variants);
	for (const variant of currentVariants) {
		for (const mapping of ySoundMappings) {
			if (variant.includes(mapping.with_y)) {
				variants.add(
					variant.replace(
						new RegExp(mapping.with_y, "g"),
						mapping.without_y
					)
				);
			}
			if (variant.includes(mapping.without_y)) {
				variants.add(
					variant.replace(
						new RegExp(mapping.without_y, "g"),
						mapping.with_y
					)
				);
			}
		}
	}

	// N variations (nn <-> n)
	const finalVariants = Array.from(variants);
	for (const variant of finalVariants) {
		// Add double n variant
		variants.add(variant.replace(/n(?=[bpmfv])/g, "nn"));
		// Add single n variant
		variants.add(variant.replace(/nn/g, "n"));
	}

	return Array.from(variants);
}

/**
 * Check if a user's romanization input matches the correct answer
 * Accounts for different romanization styles and common variations
 */
export function isRomajiMatch(
	userInput: string,
	correctRomaji: string
): boolean {
	const normalizedInput = userInput.toLowerCase().trim();
	const normalizedCorrect = correctRomaji.toLowerCase().trim();

	// Exact match
	if (normalizedInput === normalizedCorrect) {
		return true;
	}

	// Generate and check variants
	const variants = generateRomajiVariants(normalizedCorrect);
	return variants.some((variant) => variant === normalizedInput);
}

/**
 * Check if user input matches any valid representation of the Japanese number
 */
export function isAnswerCorrect(
	userInput: string,
	japaneseNumber: JapaneseNumber
): boolean {
	const normalizedInput = userInput.toLowerCase().trim();

	// Check hiragana match
	if (normalizedInput === japaneseNumber.hiragana) {
		return true;
	}

	// Check kanji match
	if (normalizedInput === japaneseNumber.kanji) {
		return true;
	}

	// Check romaji match with variants
	return isRomajiMatch(normalizedInput, japaneseNumber.romaji);
}

/**
 * Helper function to convert ten thousands (10000-99999) using 万 (man)
 */
function convertTenThousands(num: number): JapaneseNumber {
	const tenThousands = Math.floor(num / 10000);
	const remainder = num % 10000;

	let tenThousandsKanji: string;
	let tenThousandsHiragana: string;
	let tenThousandsRomaji: string;

	// Get the ten thousands part
	if (tenThousands === 1) {
		tenThousandsKanji = "一万";
		tenThousandsHiragana = "いちまん";
		tenThousandsRomaji = "ichiman";
	} else {
		const tenThousandsJapanese = convertToJapanese(tenThousands);
		tenThousandsKanji = `${tenThousandsJapanese.kanji}万`;
		tenThousandsHiragana = `${tenThousandsJapanese.hiragana}まん`;
		tenThousandsRomaji = `${tenThousandsJapanese.romaji}man`;
	}

	// Handle remainder if exists
	if (remainder === 0) {
		return {
			number: num,
			kanji: tenThousandsKanji,
			hiragana: tenThousandsHiragana,
			romaji: tenThousandsRomaji,
		};
	}

	const remainderJapanese = convertToJapanese(remainder);
	return {
		number: num,
		kanji: tenThousandsKanji + remainderJapanese.kanji,
		hiragana: tenThousandsHiragana + remainderJapanese.hiragana,
		romaji: tenThousandsRomaji + remainderJapanese.romaji,
	};
}

/**
 * Helper function to convert hundred thousands (100000-999999)
 */
function convertHundredThousands(num: number): JapaneseNumber {
	const hundredThousands = Math.floor(num / 10000); // Get the X in X0000
	const remainder = num % 10000;

	// Convert the hundred thousands part (this will be 10-99)
	const hundredThousandsJapanese = convertToJapanese(hundredThousands);
	const baseKanji = `${hundredThousandsJapanese.kanji}万`;
	const baseHiragana = `${hundredThousandsJapanese.hiragana}まん`;
	const baseRomaji = `${hundredThousandsJapanese.romaji}man`;

	// Handle remainder if exists
	if (remainder === 0) {
		return {
			number: num,
			kanji: baseKanji,
			hiragana: baseHiragana,
			romaji: baseRomaji,
		};
	}

	const remainderJapanese = convertToJapanese(remainder);
	return {
		number: num,
		kanji: baseKanji + remainderJapanese.kanji,
		hiragana: baseHiragana + remainderJapanese.hiragana,
		romaji: baseRomaji + remainderJapanese.romaji,
	};
}

// Convert millions (1,000,000 - 9,999,999)
function convertMillions(num: number): JapaneseNumber {
	const millions = Math.floor(num / 1000000);
	const remainder = num % 1000000;

	const millionsJapanese = convertToJapanese(millions);
	const baseKanji = `${millionsJapanese.kanji}百万`;
	const baseHiragana = `${millionsJapanese.hiragana}ひゃくまん`;
	const baseRomaji = `${millionsJapanese.romaji}hyakuman`;

	if (remainder === 0) {
		return {
			number: num,
			kanji: baseKanji,
			hiragana: baseHiragana,
			romaji: baseRomaji,
		};
	}

	const remainderJapanese = convertToJapanese(remainder);
	return {
		number: num,
		kanji: baseKanji + remainderJapanese.kanji,
		hiragana: baseHiragana + remainderJapanese.hiragana,
		romaji: baseRomaji + remainderJapanese.romaji,
	};
}

// Convert ten millions (10,000,000 - 99,999,999)
function convertTenMillions(num: number): JapaneseNumber {
	const tenMillions = Math.floor(num / 1000000);
	const remainder = num % 1000000;

	const tenMillionsJapanese = convertToJapanese(tenMillions);
	const baseKanji = `${tenMillionsJapanese.kanji}百万`;
	const baseHiragana = `${tenMillionsJapanese.hiragana}ひゃくまん`;
	const baseRomaji = `${tenMillionsJapanese.romaji}hyakuman`;

	if (remainder === 0) {
		return {
			number: num,
			kanji: baseKanji,
			hiragana: baseHiragana,
			romaji: baseRomaji,
		};
	}

	const remainderJapanese = convertToJapanese(remainder);
	return {
		number: num,
		kanji: baseKanji + remainderJapanese.kanji,
		hiragana: baseHiragana + remainderJapanese.hiragana,
		romaji: baseRomaji + remainderJapanese.romaji,
	};
}

// Convert hundred millions (100,000,000 - 999,999,999) - oku (億)
function convertHundredMillions(num: number): JapaneseNumber {
	const hundredMillions = Math.floor(num / 100000000);
	const remainder = num % 100000000;

	const hundredMillionsJapanese = convertToJapanese(hundredMillions);
	const baseKanji = `${hundredMillionsJapanese.kanji}億`;
	const baseHiragana = `${hundredMillionsJapanese.hiragana}おく`;
	const baseRomaji = `${hundredMillionsJapanese.romaji}oku`;

	if (remainder === 0) {
		return {
			number: num,
			kanji: baseKanji,
			hiragana: baseHiragana,
			romaji: baseRomaji,
		};
	}

	const remainderJapanese = convertToJapanese(remainder);
	return {
		number: num,
		kanji: baseKanji + remainderJapanese.kanji,
		hiragana: baseHiragana + remainderJapanese.hiragana,
		romaji: baseRomaji + remainderJapanese.romaji,
	};
}

// Convert billions (1,000,000,000 - 9,999,999,999)
function convertBillions(num: number): JapaneseNumber {
	const billions = Math.floor(num / 100000000);
	const remainder = num % 100000000;

	const billionsJapanese = convertToJapanese(billions);
	const baseKanji = `${billionsJapanese.kanji}億`;
	const baseHiragana = `${billionsJapanese.hiragana}おく`;
	const baseRomaji = `${billionsJapanese.romaji}oku`;

	if (remainder === 0) {
		return {
			number: num,
			kanji: baseKanji,
			hiragana: baseHiragana,
			romaji: baseRomaji,
		};
	}

	const remainderJapanese = convertToJapanese(remainder);
	return {
		number: num,
		kanji: baseKanji + remainderJapanese.kanji,
		hiragana: baseHiragana + remainderJapanese.hiragana,
		romaji: baseRomaji + remainderJapanese.romaji,
	};
}

// Convert ten billions (10,000,000,000 - 99,999,999,999)
function convertTenBillions(num: number): JapaneseNumber {
	const tenBillions = Math.floor(num / 100000000);
	const remainder = num % 100000000;

	const tenBillionsJapanese = convertToJapanese(tenBillions);
	const baseKanji = `${tenBillionsJapanese.kanji}億`;
	const baseHiragana = `${tenBillionsJapanese.hiragana}おく`;
	const baseRomaji = `${tenBillionsJapanese.romaji}oku`;

	if (remainder === 0) {
		return {
			number: num,
			kanji: baseKanji,
			hiragana: baseHiragana,
			romaji: baseRomaji,
		};
	}

	const remainderJapanese = convertToJapanese(remainder);
	return {
		number: num,
		kanji: baseKanji + remainderJapanese.kanji,
		hiragana: baseHiragana + remainderJapanese.hiragana,
		romaji: baseRomaji + remainderJapanese.romaji,
	};
}

// Convert hundred billions (100,000,000,000 - 999,999,999,999)
function convertHundredBillions(num: number): JapaneseNumber {
	const hundredBillions = Math.floor(num / 100000000);
	const remainder = num % 100000000;

	const hundredBillionsJapanese = convertToJapanese(hundredBillions);
	const baseKanji = `${hundredBillionsJapanese.kanji}億`;
	const baseHiragana = `${hundredBillionsJapanese.hiragana}おく`;
	const baseRomaji = `${hundredBillionsJapanese.romaji}oku`;

	if (remainder === 0) {
		return {
			number: num,
			kanji: baseKanji,
			hiragana: baseHiragana,
			romaji: baseRomaji,
		};
	}

	const remainderJapanese = convertToJapanese(remainder);
	return {
		number: num,
		kanji: baseKanji + remainderJapanese.kanji,
		hiragana: baseHiragana + remainderJapanese.hiragana,
		romaji: baseRomaji + remainderJapanese.romaji,
	};
}

// Convert trillions (1,000,000,000,000 - 9,999,999,999,999)
function convertTrillions(num: number): JapaneseNumber {
	const trillions = Math.floor(num / 1000000000000);
	const remainder = num % 1000000000000;

	const trillionsJapanese = convertToJapanese(trillions);
	const baseKanji = `${trillionsJapanese.kanji}兆`;
	const baseHiragana = `${trillionsJapanese.hiragana}ちょう`;
	const baseRomaji = `${trillionsJapanese.romaji}chou`;

	if (remainder === 0) {
		return {
			number: num,
			kanji: baseKanji,
			hiragana: baseHiragana,
			romaji: baseRomaji,
		};
	}

	const remainderJapanese = convertToJapanese(remainder);
	return {
		number: num,
		kanji: baseKanji + remainderJapanese.kanji,
		hiragana: baseHiragana + remainderJapanese.hiragana,
		romaji: baseRomaji + remainderJapanese.romaji,
	};
}

// Convert ten trillions (10,000,000,000,000 - 99,999,999,999,999)
function convertTenTrillions(num: number): JapaneseNumber {
	const tenTrillions = Math.floor(num / 1000000000000);
	const remainder = num % 1000000000000;

	const tenTrillionsJapanese = convertToJapanese(tenTrillions);
	const baseKanji = `${tenTrillionsJapanese.kanji}兆`;
	const baseHiragana = `${tenTrillionsJapanese.hiragana}ちょう`;
	const baseRomaji = `${tenTrillionsJapanese.romaji}chou`;

	if (remainder === 0) {
		return {
			number: num,
			kanji: baseKanji,
			hiragana: baseHiragana,
			romaji: baseRomaji,
		};
	}

	const remainderJapanese = convertToJapanese(remainder);
	return {
		number: num,
		kanji: baseKanji + remainderJapanese.kanji,
		hiragana: baseHiragana + remainderJapanese.hiragana,
		romaji: baseRomaji + remainderJapanese.romaji,
	};
}

// Convert hundred trillions (100,000,000,000,000 - 999,999,999,999,999)
function convertHundredTrillions(num: number): JapaneseNumber {
	const hundredTrillions = Math.floor(num / 1000000000000);
	const remainder = num % 1000000000000;

	const hundredTrillionsJapanese = convertToJapanese(hundredTrillions);
	const baseKanji = `${hundredTrillionsJapanese.kanji}兆`;
	const baseHiragana = `${hundredTrillionsJapanese.hiragana}ちょう`;
	const baseRomaji = `${hundredTrillionsJapanese.romaji}chou`;

	if (remainder === 0) {
		return {
			number: num,
			kanji: baseKanji,
			hiragana: baseHiragana,
			romaji: baseRomaji,
		};
	}

	const remainderJapanese = convertToJapanese(remainder);
	return {
		number: num,
		kanji: baseKanji + remainderJapanese.kanji,
		hiragana: baseHiragana + remainderJapanese.hiragana,
		romaji: baseRomaji + remainderJapanese.romaji,
	};
}
