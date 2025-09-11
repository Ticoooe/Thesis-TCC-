/**
 * Scores a guess against a target word, returning letter results for each position
 * @param {string} target - The target word to guess
 * @param {string} guess - The guess word
 * @param {boolean} normalizeAccents - Whether to normalize accents (default: true)
 * @returns {('correct'|'present'|'absent')[]} Array of results for each position
 * @throws {Error} If target and guess have different lengths
 */
export function scoreGuess(target, guess, normalizeAccents = true) {
	// Always convert to uppercase first for consistent case handling
	const upperTarget = target.toUpperCase();
	const upperGuess = guess.toUpperCase();

	// Normalize inputs if required
	const normalizedTarget = normalizeAccents ? normalizeWord(upperTarget) : upperTarget;
	const normalizedGuess = normalizeAccents ? normalizeWord(upperGuess) : upperGuess;

	// Check lengths
	if (normalizedTarget.length !== normalizedGuess.length) {
		throw new Error(
			`Target and guess must have the same length. Target: ${target.length}, Guess: ${guess.length}`
		);
	}

	// Only accept 5-letter words
	if (normalizedTarget.length !== 5) {
		throw new Error(
			`Only 5-letter words are supported. Target: ${target.length}, Guess: ${guess.length}`
		);
	}

	const result = new Array(normalizedTarget.length);
	const targetLetterCounts = {};

	// Count letters in the target word
	for (const letter of normalizedTarget) {
		targetLetterCounts[letter] = (targetLetterCounts[letter] || 0) + 1;
	}

	// First pass: mark correct positions
	for (let i = 0; i < normalizedGuess.length; i++) {
		if (normalizedGuess[i] === normalizedTarget[i]) {
			result[i] = 'correct';
			targetLetterCounts[normalizedGuess[i]]--;
		}
	}

	// Second pass: mark present and absent letters
	for (let i = 0; i < normalizedGuess.length; i++) {
		if (result[i] === 'correct') {
			continue;
		}

		if (targetLetterCounts[normalizedGuess[i]] > 0) {
			result[i] = 'present';
			targetLetterCounts[normalizedGuess[i]]--;
		} else {
			result[i] = 'absent';
		}
	}

	return result;
}

/**
 * Normalizes Portuguese words by removing accents and converting to uppercase
 * @param {string} word - The word to normalize (should already be uppercased)
 * @returns {string} Normalized word
 */
function normalizeWord(word) {
	return word
  .toUpperCase()
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .replace(/Ç/g, 'C')
  .replace(/Ã/g, 'A')
  .replace(/Õ/g, 'O')
  .replace(/Ê/g, 'E')
  .replace(/Ô/g, 'O');
}