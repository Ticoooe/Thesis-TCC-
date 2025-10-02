/**
 * Scores a guess against a target word, returning letter results for each position
 * @param {string} target
 * @param {string} guess
 * @param {boolean} normalizeAccents
 * @returns {('correct'|'present'|'absent')[]}
 */
export function scoreGuess(target, guess, normalizeAccents = true) {
  const normalizedTarget = normalizeAccents ? normalizeWord(target) : target.toUpperCase();
  const normalizedGuess = normalizeAccents ? normalizeWord(guess) : guess.toUpperCase();

  if (normalizedTarget.length !== normalizedGuess.length) {
    throw new Error(`Target and guess must have the same length. Target: ${normalizedTarget.length}, Guess: ${normalizedGuess.length}`);
  }
  if (normalizedTarget.length !== 5) {
    throw new Error(`Only 5-letter words are supported. Target: ${normalizedTarget.length}, Guess: ${normalizedGuess.length}`);
  }

  const n = normalizedTarget.length;
  const result = new Array(n).fill('absent');

  // 1) Passo verde: marca e registra posições do alvo já consumidas
  const targetUsed = new Array(n).fill(false);
  for (let i = 0; i < n; i++) {
    if (normalizedGuess[i] === normalizedTarget[i]) {
      result[i] = 'correct';
      targetUsed[i] = true;
    }
  }

  // 2) Reconta o alvo considerando apenas posições NÃO usadas pelos verdes
  const remainingCounts = Object.create(null);
  for (let i = 0; i < n; i++) {
    if (!targetUsed[i]) {
      const ch = normalizedTarget[i];
      remainingCounts[ch] = (remainingCounts[ch] || 0) + 1;
    }
  }

// Para cada posição não-green do palpite, tenta achar MESMA LETRA em alguma posição do alvo ainda não usada
  for (let i = 0; i < n; i++) {
    if (result[i] !== 'correct') {
      const ch = normalizedGuess[i];
      let found = false;
      for (let j = 0; j < n; j++) {
        if (!targetUsed[j] && normalizedTarget[j] === ch) {
          result[i] = 'present';
          targetUsed[j] = true; // consome essa posição do alvo
          found = true;
          break;
        }
      }
      if (!found) result[i] = 'absent';
    }
  }

  return result;
}

function normalizeWord(word) {
  return word
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}