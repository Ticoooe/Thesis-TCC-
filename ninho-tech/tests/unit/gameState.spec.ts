import { describe, it, expect, vi, beforeEach } from 'vitest';
import { get } from 'svelte/store';
import * as gameStore from '../../src/lib/stores/gameStore.js';
import CONSTANTS from '../../src/lib/utils/constants.js';

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => {
      store[key] = value.toString();
    },
    clear: () => {
      store = {};
    },
    removeItem: (key) => {
      delete store[key];
    },
  };
})();
Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
});

// Mock alertStore
vi.mock('../../src/lib/stores/alertStore.js', () => ({
  displayAlert: vi.fn(),
  ALERT_TYPES: {
    INFO: 'info',
    SUCCESS: 'success',
    ERROR: 'error'
  }
}));

describe('GameState API', () => {

  beforeEach(async () => {
    localStorage.clear();
    vi.clearAllMocks();
    // Set a predictable word for testing
    gameStore.correctWord.set('TESTE');
    await gameStore.resetGame(false);
  });

  describe('Serialization and Restoration', () => {
    it('should serialize and restore the game state with grid and keyboard hints intact', async () => {
      // 1. Play a couple of rounds
      gameStore.guessLetter('C');
      gameStore.guessLetter('A');
      gameStore.guessLetter('R');
      gameStore.guessLetter('R');
      gameStore.guessLetter('O');
      gameStore.guessWord(); // Submits CARRO

      gameStore.guessLetter('T');
      gameStore.guessLetter('E');
      gameStore.guessLetter('S');
      gameStore.guessLetter('L');
      gameStore.guessLetter('A');
      gameStore.guessWord(); // Submits TESLA

      const originalState = {
        guesses: JSON.parse(JSON.stringify(get(gameStore.userGuessesArray))),
        wordIndex: get(gameStore.currentWordIndex),
        letterIndex: get(gameStore.currentLetterIndex),
        gameState: get(gameStore.gameState),
        statuses: JSON.parse(JSON.stringify(get(gameStore.letterStatuses))),
      };

      // 2. Simulate page reload by re-initializing the game
      await gameStore.initializeGame();
      
      const restoredState = {
        guesses: get(gameStore.userGuessesArray),
        wordIndex: get(gameStore.currentWordIndex),
        letterIndex: get(gameStore.currentLetterIndex),
        gameState: get(gameStore.gameState),
        statuses: get(gameStore.letterStatuses),
      };
      
      // 3. Assert that the restored state matches the original
      expect(restoredState.guesses).toEqual(originalState.guesses);
      expect(restoredState.wordIndex).toBe(originalState.wordIndex);
      expect(restoredState.letterIndex).toBe(originalState.letterIndex);
      expect(restoredState.gameState).toBe(originalState.gameState);
      expect(restoredState.statuses).toEqual(originalState.statuses);
    });
  });

  describe('Win/Loss Conditions', () => {
    it('should change status to "WIN" on the 3rd attempt and block new guesses', async () => {
      // 1st guess
      "AUDIO".split('').forEach(l => gameStore.guessLetter(l));
      gameStore.guessWord();
      expect(get(gameStore.gameState)).toBe(CONSTANTS.GAME_STATES.PLAYING);

      // 2nd guess
      "PALCO".split('').forEach(l => gameStore.guessLetter(l));
      gameStore.guessWord();
      expect(get(gameStore.gameState)).toBe(CONSTANTS.GAME_STATES.PLAYING);

      // 3rd guess (correct word)
      "TESTE".split('').forEach(l => gameStore.guessLetter(l));
      gameStore.guessWord();
      
      // Assert win state
      expect(get(gameStore.gameState)).toBe(CONSTANTS.GAME_STATES.WIN);
      
      // Try to submit another letter
      const currentGuesses = JSON.parse(JSON.stringify(get(gameStore.userGuessesArray)));
      gameStore.guessLetter('A');
      
      // Assert that the grid has not changed
      expect(get(gameStore.userGuessesArray)).toEqual(currentGuesses);
    });

    it('should change status to "LOSE" after the final attempt', async () => {
        const incorrectWord = "AUDIO";
        for (let i = 0; i < CONSTANTS.MAX_GUESSES; i++) {
            expect(get(gameStore.gameState)).toBe(CONSTANTS.GAME_STATES.PLAYING);
            incorrectWord.split('').forEach(l => gameStore.guessLetter(l));
            gameStore.guessWord();
        }

        // Assert lose state after the last guess
        expect(get(gameStore.gameState)).toBe(CONSTANTS.GAME_STATES.LOSE);
    });
  });
  
  // Hard mode and Daily mode are not implemented in the current gameStore.
  // These tests are placeholders for when/if that functionality is added.
  describe.skip('Hard Mode', () => {
    it('should enforce reusing revealed letters', () => {
      // This would require a config setting for hard mode
      // and logic in `guessWord` to validate the guess against previous hints.
    });
  });

  describe.skip('Daily Mode', () => {
    it('should be immutable for the same seed/day', () => {
      // This would require a seeded random number generator for word selection
      // and a way to pass the seed into the initialization.
    });
  });
});
