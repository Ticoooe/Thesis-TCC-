/**
 * Scores a guess against a target word, returning letter results for each position
 * @param {string} target - The target word to guess
 * @param {string} guess - The guess word
 * @param {boolean} normalizeAccents - Whether to normalize accents (default: true)
 * @returns {('correct'|'present'|'absent')[]} Array of results for each position
 * @throws {Error} If target and guess have different lengths
 */
export function scoreGuess(target, guess, normalizeAccents = true) {
  // Normalize inputs first
  const normalizedTarget = normalizeAccents ? normalizeWord(target) : target.toUpperCase();
  const normalizedGuess = normalizeAccents ? normalizeWord(guess) : guess.toUpperCase();
  
  // Basic validation
  if (normalizedTarget.length !== normalizedGuess.length) {
    throw new Error(`Target and guess must have the same length.`);
  }
  if (normalizedTarget.length !== 5) {
    throw new Error(`Only 5-letter words are supported.`);
  }
  
  const result = new Array(normalizedTarget.length).fill(null);
  const targetLetterCounts = {};

  // Count letters in the target word for accurate 'present' scoring
  for (const letter of normalizedTarget) {
    targetLetterCounts[letter] = (targetLetterCounts[letter] || 0) + 1;
  }

  // First pass: mark 'correct' letters (green)
  // This pass is crucial to ensure 'correct' letters are prioritized over 'present' ones.
  for (let i = 0; i < normalizedGuess.length; i++) {
    if (normalizedGuess[i] === normalizedTarget[i]) {
      result[i] = 'correct';
      targetLetterCounts[normalizedGuess[i]]--;
    }
  }

  // Second pass: mark 'present' (yellow) and 'absent' (gray) letters
  // This pass handles the remaining letters.
  for (let i = 0; i < normalizedGuess.length; i++) {
    // Skip letters that are already marked as 'correct'
    if (result[i] === 'correct') {
      continue;
    }

    // If the letter exists in the target and we haven't used all of them up
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
 * @param {string} word - The word to normalize
 * @returns {string} Normalized word
 */
function normalizeWord(word) {
  return word
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}