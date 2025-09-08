/**
 * Scores a guess against a target word, returning letter results for each position
 * @param {string} target - The target word to guess
 * @param {string} guess - The guess word
 * @param {boolean} normalizeAccents - Whether to normalize accents (default: true)
 * @returns {('correct'|'present'|'absent')[]} Array of results for each position
 * @throws {Error} If target and guess have different lengths
 */
export function scoreGuess(target, guess, normalizeAccents = true) {
  // Normalize inputs
  const normalizedTarget = normalizeAccents ? normalizeWord(target) : target.toUpperCase();
  const normalizedGuess = normalizeAccents ? normalizeWord(guess) : guess.toUpperCase();
  
  // Check lengths
  if (normalizedTarget.length !== normalizedGuess.length) {
    throw new Error(`Target and guess must have the same length. Target: ${target.length}, Guess: ${guess.length}`);
  }
  
  // Only accept 4-letter or 5-letter words
  if (normalizedTarget.length !== 4 && normalizedTarget.length !== 5) {
    throw new Error(`Only 4-letter or 5-letter words are supported. Target: ${target.length}, Guess: ${guess.length}`);
  }
  
  const result = new Array(normalizedTarget.length).fill('absent');
  const targetLetters = normalizedTarget.split('');
  const guessLetters = normalizedGuess.split('');
  
  // First pass: mark correct positions
  for (let i = 0; i < targetLetters.length; i++) {
    if (targetLetters[i] === guessLetters[i]) {
      result[i] = 'correct';
      targetLetters[i] = null; // Mark as used
      guessLetters[i] = null; // Mark as used
    }
  }
  
  // Second pass: mark present letters (prioritize earlier positions)
  for (let i = 0; i < guessLetters.length; i++) {
    if (guessLetters[i] !== null && result[i] !== 'correct') {
      // Find the leftmost available matching letter in target
      const targetIndex = targetLetters.findIndex(letter => letter === guessLetters[i]);
      if (targetIndex !== -1) {
        result[i] = 'present';
        targetLetters[targetIndex] = null; // Mark as used
      }
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
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/Ç/g, 'C')
    .replace(/Ã/g, 'A')
    .replace(/Õ/g, 'O')
    .replace(/Ê/g, 'E')
    .replace(/Ô/g, 'O');
}
