import { describe, it, expect } from 'vitest';
import { scoreGuess } from '../../src/lib/utils/scoreGuess.js';

describe('scoreGuess', () => {
  describe('Perfect match', () => {
    it('should return all correct for identical words', () => {
      expect(scoreGuess('CASAS', 'CASAS')).toEqual(['correct', 'correct', 'correct', 'correct', 'correct']);
    });

    it('should return all correct for identical words with different case', () => {
      expect(scoreGuess('casas', 'CASAS')).toEqual(['correct', 'correct', 'correct', 'correct', 'correct']);
      expect(scoreGuess('CASAS', 'casas')).toEqual(['correct', 'correct', 'correct', 'correct', 'correct']);
    });
  });

  describe('Repeated letters', () => {
    it('should handle repeated letters correctly - CASAS vs SALAS', () => {
      // CASAS: C(0), A(1), S(2), A(3), S(4)
      // SALAS: S(0), A(1), L(2), A(3), S(4)
      // Expected: S(present), A(correct), L(absent), A(correct), S(present)
      expect(scoreGuess('CASAS', 'SALAS')).toEqual(['present', 'correct', 'absent', 'correct', 'present']);
    });

    it('should handle repeated letters - AMIGO vs GOMIA', () => {
      // AMIGO: A(0), M(1), I(2), G(3), O(4)
      // GOMIA: G(0), O(1), M(2), I(3), A(4)
      // Expected: G(present), O(present), M(present), I(present), A(present)
      expect(scoreGuess('AMIGO', 'GOMIA')).toEqual(['present', 'present', 'present', 'present', 'present']);
    });

    it('should handle triple letters - AAAAB vs AABAA', () => {
      // AAAAB: A(0), A(1), A(2), A(3), B(4)
      // AABAA: A(0), A(1), B(2), A(3), A(4)
      // Expected: A(correct), A(correct), B(present), A(correct), A(present)
      expect(scoreGuess('AAAAB', 'AABAA')).toEqual(['correct', 'correct', 'present', 'correct', 'present']);
    });
  });

  describe('User-specific case: Repeated letters in guess, not enough in target', () => {
    it('should correctly mark extra letters as absent', () => {
      // Target: JOGAR (1 'A')
      // Guess:  ARARA (3 'A's)
      // Expected: A(present), R(present), A(absent), R(correct), A(absent) -> Wait, R is not correct.
      // Let's re-trace:
      // Target: J O G A R
      // Guess:  A R A R A
      // Correct pass: none.
      // Present pass:
      // Guess A at 0 -> present, JOGAR has one A. A count becomes 0.
      // Guess R at 1 -> present, JOGAR has one R. R count becomes 0.
      // Guess A at 2 -> absent, JOGAR has no more As.
      // Guess R at 3 -> absent, JOGAR has no more Rs.
      // Guess A at 4 -> absent, JOGAR has no more As.
      // So, the result for 'ARARA' should be ['present', 'present', 'absent', 'absent', 'absent']
      expect(scoreGuess('JOGAR', 'ARARA')).toEqual(['present', 'present', 'absent', 'absent', 'absent']);
    });

    it('should handle one correct, one present, one absent for letter E', () => {
      // Target: VERDE (2 'E's)
      // Guess:  ERESE (3 'E's)
      // Correct pass: E at pos 2 is correct. Target E count becomes 1.
      // Present pass:
      // Guess E at pos 0 -> present. Target E count becomes 0.
      // Guess E at pos 4 -> absent. No more Es in target.
      expect(scoreGuess('VERDE', 'ERESE')).toEqual(['present', 'absent', 'correct', 'absent', 'absent']);
    });
  });

  describe('No letters present', () => {
    it('should return all absent when no letters match', () => {
      expect(scoreGuess('CASAS', 'PATOZ')).toEqual(['absent', 'absent', 'absent', 'absent', 'absent']);
    });

    it('should return all absent for completely different words', () => {
      expect(scoreGuess('AMIGO', 'ZEBRA')).toEqual(['absent', 'absent', 'absent', 'absent', 'absent']);
    });
  });

  describe('All letters present but wrong positions', () => {
    it('should return all present for anagrams', () => {
      expect(scoreGuess('AMIGO', 'GOMIA')).toEqual(['present', 'present', 'present', 'present', 'present']);
    });

    it('should return all present for scrambled letters', () => {
      expect(scoreGuess('CASAS', 'ASACS')).toEqual(['present', 'present', 'present', 'present', 'present']);
    });
  });

  describe('Different lengths', () => {
    it('should throw error for different length words', () => {
      expect(() => scoreGuess('CASAS', 'CASASX')).toThrow('Target and guess must have the same length. Target: 5, Guess: 6');
    });

    it('should throw error when target is longer', () => {
      expect(() => scoreGuess('CASASX', 'CASAS')).toThrow('Target and guess must have the same length. Target: 6, Guess: 5');
    });

    it('should throw error for empty vs non-empty', () => {
      expect(() => scoreGuess('', 'CASAS')).toThrow('Target and guess must have the same length. Target: 0, Guess: 5');
    });
  });

  describe('5-letter word validation', () => {
    it('should throw error for 4-letter words', () => {
      expect(() => scoreGuess('CASA', 'CASA')).toThrow('Only 5-letter words are supported. Target: 4, Guess: 4');
    });

    it('should not throw error for 5-letter words', () => {
      expect(() => scoreGuess('CASAS', 'CASAS')).not.toThrow();
    });

    it('should throw error for 6-letter words', () => {
      expect(() => scoreGuess('CASASX', 'CASASX')).toThrow('Only 5-letter words are supported. Target: 6, Guess: 6');
    });

    it('should throw error for 3-letter words', () => {
      expect(() => scoreGuess('ABC', 'ABC')).toThrow('Only 5-letter words are supported. Target: 3, Guess: 3');
    });
  });

  describe('Case insensitive', () => {
    it('should work with mixed case', () => {
      expect(scoreGuess('CaSaS', 'cAsAs')).toEqual(['correct', 'correct', 'correct', 'correct', 'correct']);
    });

    it('should work with lowercase target and uppercase guess', () => {
      expect(scoreGuess('casas', 'CASAS')).toEqual(['correct', 'correct', 'correct', 'correct', 'correct']);
    });
  });

  describe('Diacritics support', () => {
    describe('with normalizeAccents=true (default)', () => {
      it('should normalize Ç to C', () => {
        expect(scoreGuess('AÇAÍS', 'ACAIS')).toEqual(['correct', 'correct', 'correct', 'correct', 'correct']);
        expect(scoreGuess('ACAIS', 'AÇAÍS')).toEqual(['correct', 'correct', 'correct', 'correct', 'correct']);
      });

      it('should normalize Ã to A', () => {
        expect(scoreGuess('CÃMAR', 'CAMAR')).toEqual(['correct', 'correct', 'correct', 'correct', 'correct']);
        expect(scoreGuess('CAMAR', 'CÃMAR')).toEqual(['correct', 'correct', 'correct', 'correct', 'correct']);
      });

      it('should normalize Õ to O', () => {
        expect(scoreGuess('CORÃÇ', 'CORAC')).toEqual(['correct', 'correct', 'correct', 'correct', 'correct']);
        expect(scoreGuess('CORAC', 'CORÃÇ')).toEqual(['correct', 'correct', 'correct', 'correct', 'correct']);
      });

      it('should normalize Ê to E', () => {
        expect(scoreGuess('ÊXITO', 'EXITO')).toEqual(['correct', 'correct', 'correct', 'correct', 'correct']);
        expect(scoreGuess('EXITO', 'ÊXITO')).toEqual(['correct', 'correct', 'correct', 'correct', 'correct']);
      });

      it('should normalize Ô to O', () => {
        expect(scoreGuess('AVÔS', 'AVOS')).toEqual(['correct', 'correct', 'correct', 'correct', 'correct']);
        expect(scoreGuess('AVOS', 'AVÔS')).toEqual(['correct', 'correct', 'correct', 'correct', 'correct']);
      });

      it('should handle mixed diacritics', () => {
        expect(scoreGuess('AÇÃÕS', 'ACAOS')).toEqual(['correct', 'correct', 'correct', 'correct', 'correct']);
        expect(scoreGuess('ACAOS', 'AÇÃÕS')).toEqual(['correct', 'correct', 'correct', 'correct', 'correct']);
      });
    });

    describe('with normalizeAccents=false', () => {
      it('should treat diacritics as different letters', () => {
        expect(scoreGuess('AÇAÍS', 'ACAIS', false)).toEqual(['correct', 'correct', 'correct', 'correct', 'correct']);
        expect(scoreGuess('CÃMAR', 'CAMAR', false)).toEqual(['correct', 'correct', 'correct', 'correct', 'correct']);
      });

      it('should still be case insensitive', () => {
        expect(scoreGuess('AÇAÍS', 'açaís', false)).toEqual(['correct', 'correct', 'correct', 'correct', 'correct']);
      });
    });
  });

  describe('Snapshot matrix for 3 scenarios', () => {
    it('should match snapshot for scenario 1: Perfect match', () => {
      const result = scoreGuess('CASAS', 'CASAS');
      expect(result).toMatchSnapshot();
    });

    it('should match snapshot for scenario 2: Repeated letters', () => {
      const result = scoreGuess('CASAS', 'SALAS');
      expect(result).toMatchSnapshot();
    });

    it('should match snapshot for scenario 3: Mixed results', () => {
      const result = scoreGuess('AMIGO', 'GOMIA');
      expect(result).toMatchSnapshot();
    });
  });

  describe('Edge cases', () => {
    it('should handle words with only repeated letters', () => {
      expect(scoreGuess('AAAAA', 'AAAAA')).toEqual(['correct', 'correct', 'correct', 'correct', 'correct']);
      expect(scoreGuess('AAAAA', 'AAAAB')).toEqual(['correct', 'correct', 'correct', 'correct', 'absent']);
    });

    it('should handle words with all same letter in different positions', () => {
      expect(scoreGuess('AAAAA', 'BBBBB')).toEqual(['absent', 'absent', 'absent', 'absent', 'absent']);
    });
  });
});
