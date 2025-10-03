/**
 * Normalizes Portuguese text by handling diacritics and accents
 * @param {string} input - The input string to normalize
 * @param {string} mode - Whether to strip diacritics or keep them
 * @returns {string} Normalized string
 */
export function normalize(input, mode) {
  // Handle default case - only when mode is truly not provided
  if (arguments.length === 1) {
    mode = 'strip';
  }
  
  if (mode === 'keep') {
    return input;
  }
  
  if (mode === 'strip') {
    return input
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove combining diacritical marks
      .replace(/Ç/g, 'C')
      .replace(/ç/g, 'c');
  }
  
  throw new Error(`Invalid mode: ${mode}. Must be 'strip' or 'keep'`);
}
