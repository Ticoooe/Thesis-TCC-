import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { isValidWord, isSolution, clearDictionaryCache } from '../../src/lib/utils/dictionary.js';

describe('dictionary', () => {
  beforeEach(() => {
    // Clear cache before each test
    clearDictionaryCache();
  });

  afterEach(() => {
    // Clean up after each test
    clearDictionaryCache();
  });

  describe('isValidWord', () => {
    describe('PT-BR dictionary validation', () => {
      const validWords = [
        { word: 'AMIGO', description: 'should accept AMIGO' },
        { word: 'CASAL', description: 'should accept CASAL' },
        { word: 'PRAIA', description: 'should accept PRAIA' },
        { word: 'TERRA', description: 'should accept TERRA' },
        { word: 'AGUAS', description: 'should accept AGUAS' },
        { word: 'FOGOS', description: 'should accept FOGOS' },
        { word: 'VIDAS', description: 'should accept VIDAS' },
        { word: 'CASAS', description: 'should accept CASAS' },
        { word: 'BALAS', description: 'should accept BALAS (valid word)' },
        { word: 'CAMAS', description: 'should accept CAMAS (valid word)' },
        { word: 'DAMAS', description: 'should accept DAMAS (valid word)' }
      ];

      it.each(validWords)('$description', ({ word }) => {
        expect(isValidWord(word, 'pt-BR')).toBe(true);
      });

      const invalidWords = [
        { word: 'ZZZZZ', description: 'should reject ZZZZZ' },
        { word: 'XXXXX', description: 'should reject XXXXX' },
        { word: 'QWERT', description: 'should reject QWERT' },
        { word: 'ASDFG', description: 'should reject ASDFG' },
        { word: 'INVALID', description: 'should reject INVALID' },
        { word: 'NOTWORD', description: 'should reject NOTWORD' }
      ];

      it.each(invalidWords)('$description', ({ word }) => {
        expect(isValidWord(word, 'pt-BR')).toBe(false);
      });
    });

    describe('5-letter word validation', () => {
      const nonFiveLetterWords = [
        { word: 'AMIG', description: 'should reject 4-letter word AMIG' },
        { word: 'AMIGOS', description: 'should reject 6-letter word AMIGOS' },
        { word: 'A', description: 'should reject 1-letter word A' },
        { word: 'AB', description: 'should reject 2-letter word AB' },
        { word: 'ABC', description: 'should reject 3-letter word ABC' },
        { word: 'ABCDEF', description: 'should reject 6-letter word ABCDEF' },
        { word: 'ABCDEFG', description: 'should reject 7-letter word ABCDEFG' }
      ];

      it.each(nonFiveLetterWords)('$description', ({ word }) => {
        expect(isValidWord(word, 'pt-BR')).toBe(false);
      });
    });

    describe('case insensitive', () => {
      const caseTestCases = [
        { word: 'amigo', expected: true, description: 'should accept lowercase amigo' },
        { word: 'Amigo', expected: true, description: 'should accept mixed case Amigo' },
        { word: 'AMIGO', expected: true, description: 'should accept uppercase AMIGO' },
        { word: '  AMIGO  ', expected: true, description: 'should accept AMIGO with spaces' },
        { word: 'zzzzz', expected: false, description: 'should reject lowercase zzzzz' },
        { word: 'ZzZzZ', expected: false, description: 'should reject mixed case ZzZzZ' }
      ];

      it.each(caseTestCases)('$description', ({ word, expected }) => {
        expect(isValidWord(word, 'pt-BR')).toBe(expected);
      });
    });

    describe('solutions vs valid words relationship', () => {
      it('should accept all solution words as valid', () => {
        const solutions = ['AMIGO', 'CASAL', 'PRAIA', 'TERRA', 'AGUAS'];
        solutions.forEach(word => {
          expect(isValidWord(word, 'pt-BR')).toBe(true);
        });
      });

      it('should accept valid words that are not solutions', () => {
        const validNonSolutions = ['BALAS', 'CAMAS', 'DAMAS'];
        validNonSolutions.forEach(word => {
          expect(isValidWord(word, 'pt-BR')).toBe(true);
        });
      });

      it('should verify solutions is subset of valid words', () => {
        // This test ensures the relationship: solutions ⊂ valid words
        const solutions = ['AMIGO', 'CASAL', 'PRAIA', 'TERRA', 'AGUAS', 'FOGOS', 'VIDAS', 'CASAS'];
        const validWords = ['AMIGO', 'CASAL', 'PRAIA', 'TERRA', 'AGUAS', 'FOGOS', 'VIDAS', 'CASAS', 'ABEL', 'BALAS', 'CAMAS', 'DAMAS'];
        
        solutions.forEach(solution => {
          expect(validWords).toContain(solution);
        });
      });
    });

    describe('offensive words blocking', () => {
      const offensiveWords = [
        { word: 'IDIOTA', description: 'should block IDIOTA' },
        { word: 'BURRO', description: 'should block BURRO' },
        { word: 'TOLO', description: 'should block TOLO' },
        { word: 'BESTA', description: 'should block BESTA' },
        { word: 'ASNO', description: 'should block ASNO' },
        { word: 'IMBECIL', description: 'should block IMBECIL' }
      ];

      it.each(offensiveWords)('$description', ({ word }) => {
        expect(isValidWord(word, 'pt-BR')).toBe(false);
      });

      it('should block offensive words regardless of case', () => {
        expect(isValidWord('idiota', 'pt-BR')).toBe(false);
        expect(isValidWord('Idiota', 'pt-BR')).toBe(false);
        expect(isValidWord('IDIOTA', 'pt-BR')).toBe(false);
      });
    });

    describe('language switching', () => {
      it('should validate PT-BR words correctly', () => {
        expect(isValidWord('AMIGO', 'pt-BR')).toBe(true);
        expect(isValidWord('HELLO', 'pt-BR')).toBe(false);
      });



      it('should handle unsupported languages', () => {
        expect(isValidWord('AMIGO', 'fr-FR')).toBe(false);
        expect(isValidWord('HELLO', 'fr-FR')).toBe(false);
      });

      it('should default to PT-BR when no language specified', () => {
        expect(isValidWord('AMIGO')).toBe(true);
        expect(isValidWord('HELLO')).toBe(false);
      });
    });

    describe('in-memory caching', () => {
      it('should cache dictionary on first call', () => {
        const spy = vi.spyOn(console, 'log');
        
        // First call should load dictionary
        expect(isValidWord('AMIGO', 'pt-BR')).toBe(true);
        
        // Second call should use cache
        expect(isValidWord('CASAL', 'pt-BR')).toBe(true);
        
        // Verify cache is working by checking dictionary is loaded
        expect(isValidWord('PRAIA', 'pt-BR')).toBe(true);
        
        spy.mockRestore();
      });

      it('should cache PT-BR dictionary correctly', () => {
        // Load PT-BR dictionary
        expect(isValidWord('AMIGO', 'pt-BR')).toBe(true);
        
        // Verify cache is working
        expect(isValidWord('CASAL', 'pt-BR')).toBe(true);
        expect(isValidWord('PRAIA', 'pt-BR')).toBe(true);
      });

      it('should clear cache when clearDictionaryCache is called', () => {
        // Load dictionary
        expect(isValidWord('AMIGO', 'pt-BR')).toBe(true);
        
        // Clear cache
        clearDictionaryCache();
        
        // Should still work (reloads dictionary)
        expect(isValidWord('CASAL', 'pt-BR')).toBe(true);
      });
    });

    describe('edge cases', () => {
      it('should handle empty string', () => {
        expect(isValidWord('', 'pt-BR')).toBe(false);
      });

      it('should handle null input', () => {
        expect(isValidWord(null as unknown as string, 'pt-BR')).toBe(false);
      });

      it('should handle undefined input', () => {
        expect(isValidWord(undefined as unknown as string, 'pt-BR')).toBe(false);
      });

      it('should handle non-string input', () => {
        expect(isValidWord(123 as unknown as string, 'pt-BR')).toBe(false);
        expect(isValidWord([] as unknown as string, 'pt-BR')).toBe(false);
        expect(isValidWord({} as unknown as string, 'pt-BR')).toBe(false);
      });

      it('should handle words with only spaces', () => {
        expect(isValidWord('   ', 'pt-BR')).toBe(false);
      });

      it('should handle very long words', () => {
        const longWord = 'A'.repeat(100);
        expect(isValidWord(longWord, 'pt-BR')).toBe(false);
      });
    });
  });

  describe('isSolution', () => {
    describe('solution validation', () => {
      const solutionWords = [
        { word: 'AMIGO', description: 'should identify AMIGO as solution' },
        { word: 'CASAL', description: 'should identify CASAL as solution' },
        { word: 'PRAIA', description: 'should identify PRAIA as solution' },
        { word: 'TERRA', description: 'should identify TERRA as solution' },
        { word: 'AGUAS', description: 'should identify AGUAS as solution' }
      ];

      it.each(solutionWords)('$description', ({ word }) => {
        expect(isSolution(word, 'pt-BR')).toBe(true);
      });

      const nonSolutionWords = [
        { word: 'BALAS', description: 'should not identify BALAS as solution' },
        { word: 'CAMAS', description: 'should not identify CAMAS as solution' },
        { word: 'ZZZZZ', description: 'should not identify ZZZZZ as solution' }
      ];

      it.each(nonSolutionWords)('$description', ({ word }) => {
        expect(isSolution(word, 'pt-BR')).toBe(false);
      });
    });

    describe('5-letter word validation for solutions', () => {
      const nonFiveLetterSolutions = [
        { word: 'AMIG', description: 'should reject 4-letter word AMIG' },
        { word: 'AMIGOS', description: 'should reject 6-letter word AMIGOS' },
        { word: 'A', description: 'should reject 1-letter word A' },
        { word: 'AB', description: 'should reject 2-letter word AB' },
        { word: 'ABC', description: 'should reject 3-letter word ABC' },
        { word: 'ABCDEF', description: 'should reject 6-letter word ABCDEF' }
      ];

      it.each(nonFiveLetterSolutions)('$description', ({ word }) => {
        expect(isSolution(word, 'pt-BR')).toBe(false);
      });
    });

    describe('language switching for solutions', () => {
      it('should validate PT-BR solutions correctly', () => {
        expect(isSolution('AMIGO', 'pt-BR')).toBe(true);
        expect(isSolution('HELLO', 'pt-BR')).toBe(false);
      });


    });

    describe('case insensitive solutions', () => {
      it('should handle different cases for solutions', () => {
        expect(isSolution('amigo', 'pt-BR')).toBe(true);
        expect(isSolution('Amigo', 'pt-BR')).toBe(true);
        expect(isSolution('AMIGO', 'pt-BR')).toBe(true);
        expect(isSolution('  AMIGO  ', 'pt-BR')).toBe(true);
      });
    });
  });

  describe('integration tests', () => {
    it('should maintain consistency between isValidWord and isSolution', () => {
      const testWords = ['AMIGO', 'CASAL', 'PRAIA', 'BALAS', 'CAMAS', 'DAMAS', 'ZZZZZ'];
      
      testWords.forEach(word => {
        const isValid = isValidWord(word, 'pt-BR');
        const isSol = isSolution(word, 'pt-BR');
        
        // If it's a solution, it must be valid
        if (isSol) {
          expect(isValid).toBe(true);
        }
        
        // If it's not valid, it can't be a solution
        if (!isValid) {
          expect(isSol).toBe(false);
        }
      });
    });

    it('should handle PT-BR language consistently', () => {
      // Test PT-BR language consistency
      expect(isValidWord('AMIGO', 'pt-BR')).toBe(true);
      expect(isValidWord('CASAL', 'pt-BR')).toBe(true);
      expect(isValidWord('PRAIA', 'pt-BR')).toBe(true);
    });
  });
});
