import { describe, it, expect } from 'vitest';
import { normalize } from '../../src/lib/utils/normalize.js';

describe('normalize', () => {
  describe('strip mode', () => {
    const stripTestCases = [
      // Basic Portuguese diacritics
      {
        input: 'PÃO',
        expected: 'PAO',
        description: 'should convert Ã to A'
      },
      {
        input: 'pão',
        expected: 'pao',
        description: 'should convert lowercase ã to a'
      },
      {
        input: 'AÇAÍ',
        expected: 'ACAI',
        description: 'should convert Ç to C'
      },
      {
        input: 'açaí',
        expected: 'acai',
        description: 'should convert lowercase ç to c'
      },
      {
        input: 'CORÃÇÃO',
        expected: 'CORACAO',
        description: 'should convert Ã and Ã to A'
      },
      {
        input: 'ÊXITO',
        expected: 'EXITO',
        description: 'should convert Ê to E'
      },
      {
        input: 'êxito',
        expected: 'exito',
        description: 'should convert lowercase ê to e'
      },
      {
        input: 'AVÔ',
        expected: 'AVO',
        description: 'should convert Ô to O'
      },
      {
        input: 'avô',
        expected: 'avo',
        description: 'should convert lowercase ô to o'
      },
      {
        input: 'CORAÇÃO',
        expected: 'CORACAO',
        description: 'should convert Ã to A'
      },
      {
        input: 'coração',
        expected: 'coracao',
        description: 'should convert lowercase ã to a'
      },
      {
        input: 'MÚSICA',
        expected: 'MUSICA',
        description: 'should convert Ú to U'
      },
      {
        input: 'música',
        expected: 'musica',
        description: 'should convert lowercase ú to u'
      },
      {
        input: 'ÍNDIO',
        expected: 'INDIO',
        description: 'should convert Í to I'
      },
      {
        input: 'índio',
        expected: 'indio',
        description: 'should convert lowercase í to i'
      },
      {
        input: 'ÓTIMO',
        expected: 'OTIMO',
        description: 'should convert Ó to O'
      },
      {
        input: 'ótimo',
        expected: 'otimo',
        description: 'should convert lowercase ó to o'
      },
      {
        input: 'ÕNIBUS',
        expected: 'ONIBUS',
        description: 'should convert Õ to O'
      },
      {
        input: 'ônibus',
        expected: 'onibus',
        description: 'should convert lowercase õ to o'
      },
      {
        input: 'ÁGUA',
        expected: 'AGUA',
        description: 'should convert Á to A'
      },
      {
        input: 'água',
        expected: 'agua',
        description: 'should convert lowercase á to a'
      },
      {
        input: 'ÀS',
        expected: 'AS',
        description: 'should convert À to A'
      },
      {
        input: 'às',
        expected: 'as',
        description: 'should convert lowercase à to a'
      },
      {
        input: 'ÂNGULO',
        expected: 'ANGULO',
        description: 'should convert Â to A'
      },
      {
        input: 'ângulo',
        expected: 'angulo',
        description: 'should convert lowercase â to a'
      },
      {
        input: 'É',
        expected: 'E',
        description: 'should convert É to E'
      },
      {
        input: 'é',
        expected: 'e',
        description: 'should convert lowercase é to e'
      }
    ];

    it.each(stripTestCases)('$description', ({ input, expected }) => {
      expect(normalize(input, 'strip')).toBe(expected);
    });

    describe('mixed strings with numbers and punctuation', () => {
      const mixedTestCases = [
        {
          input: 'PÃO123',
          expected: 'PAO123',
          description: 'should handle numbers'
        },
        {
          input: 'AÇAÍ!',
          expected: 'ACAI!',
          description: 'should handle exclamation marks'
        },
        {
          input: 'CORAÇÃO?',
          expected: 'CORACAO?',
          description: 'should handle question marks'
        },
        {
          input: 'MÚSICA,',
          expected: 'MUSICA,',
          description: 'should handle commas'
        },
        {
          input: 'ÍNDIO.',
          expected: 'INDIO.',
          description: 'should handle periods'
        },
        {
          input: 'ÓTIMO;',
          expected: 'OTIMO;',
          description: 'should handle semicolons'
        },
        {
          input: 'ÕNIBUS:',
          expected: 'ONIBUS:',
          description: 'should handle colons'
        },
        {
          input: 'ÁGUA-',
          expected: 'AGUA-',
          description: 'should handle hyphens'
        },
        {
          input: 'ÀS_',
          expected: 'AS_',
          description: 'should handle underscores'
        },
        {
          input: 'ÂNGULO+',
          expected: 'ANGULO+',
          description: 'should handle plus signs'
        },
        {
          input: 'É=',
          expected: 'E=',
          description: 'should handle equals signs'
        },
        {
          input: 'PÃO@AÇAÍ#CORAÇÃO$',
          expected: 'PAO@ACAI#CORACAO$',
          description: 'should handle multiple special characters'
        },
        {
          input: 'MÚSICA123!@#',
          expected: 'MUSICA123!@#',
          description: 'should handle mixed numbers and symbols'
        },
        {
          input: 'ÍNDIO-ÓTIMO_ÕNIBUS',
          expected: 'INDIO-OTIMO_ONIBUS',
          description: 'should handle multiple words with punctuation'
        }
      ];

      it.each(mixedTestCases)('$description', ({ input, expected }) => {
        expect(normalize(input, 'strip')).toBe(expected);
      });
    });

    describe('idempotence', () => {
      const idempotenceTestCases = [
        {
          input: 'PÃO',
          description: 'should be idempotent for PÃO'
        },
        {
          input: 'AÇAÍ',
          description: 'should be idempotent for AÇAÍ'
        },
        {
          input: 'CORAÇÃO',
          description: 'should be idempotent for CORAÇÃO'
        },
        {
          input: 'MÚSICA123!@#',
          description: 'should be idempotent for mixed string'
        },
        {
          input: 'ÍNDIO-ÓTIMO_ÕNIBUS',
          description: 'should be idempotent for complex string'
        }
      ];

      it.each(idempotenceTestCases)('$description', ({ input }) => {
        const firstResult = normalize(input, 'strip');
        const secondResult = normalize(firstResult, 'strip');
        expect(firstResult).toBe(secondResult);
      });
    });

    describe('edge cases', () => {
      it('should handle empty string', () => {
        expect(normalize('', 'strip')).toBe('');
      });

      it('should handle string with no diacritics', () => {
        expect(normalize('HELLO', 'strip')).toBe('HELLO');
      });

      it('should handle string with only numbers', () => {
        expect(normalize('123456', 'strip')).toBe('123456');
      });

      it('should handle string with only punctuation', () => {
        expect(normalize('!@#$%', 'strip')).toBe('!@#$%');
      });

      it('should handle string with only spaces', () => {
        expect(normalize('   ', 'strip')).toBe('   ');
      });

      it('should handle mixed case with diacritics', () => {
        expect(normalize('PãoAçAí', 'strip')).toBe('PaoAcAi');
      });
    });
  });

  describe('keep mode', () => {
    const keepTestCases = [
      {
        input: 'PÃO',
        expected: 'PÃO',
        description: 'should preserve Ã in keep mode'
      },
      {
        input: 'AÇAÍ',
        expected: 'AÇAÍ',
        description: 'should preserve Ç in keep mode'
      },
      {
        input: 'CORAÇÃO',
        expected: 'CORAÇÃO',
        description: 'should preserve Ã in keep mode'
      },
      {
        input: 'MÚSICA',
        expected: 'MÚSICA',
        description: 'should preserve Ú in keep mode'
      },
      {
        input: 'ÍNDIO',
        expected: 'ÍNDIO',
        description: 'should preserve Í in keep mode'
      },
      {
        input: 'ÓTIMO',
        expected: 'ÓTIMO',
        description: 'should preserve Ó in keep mode'
      },
      {
        input: 'ÕNIBUS',
        expected: 'ÕNIBUS',
        description: 'should preserve Õ in keep mode'
      },
      {
        input: 'ÁGUA',
        expected: 'ÁGUA',
        description: 'should preserve Á in keep mode'
      },
      {
        input: 'ÀS',
        expected: 'ÀS',
        description: 'should preserve À in keep mode'
      },
      {
        input: 'ÂNGULO',
        expected: 'ÂNGULO',
        description: 'should preserve Â in keep mode'
      },
      {
        input: 'É',
        expected: 'É',
        description: 'should preserve É in keep mode'
      },
      {
        input: 'ÊXITO',
        expected: 'ÊXITO',
        description: 'should preserve Ê in keep mode'
      },
      {
        input: 'AVÔ',
        expected: 'AVÔ',
        description: 'should preserve Ô in keep mode'
      },
      {
        input: 'PÃO123!@#',
        expected: 'PÃO123!@#',
        description: 'should preserve everything in keep mode'
      }
    ];

    it.each(keepTestCases)('$description', ({ input, expected }) => {
      expect(normalize(input, 'keep')).toBe(expected);
    });

    describe('idempotence in keep mode', () => {
      const keepIdempotenceTestCases = [
        {
          input: 'PÃO',
          description: 'should be idempotent for PÃO in keep mode'
        },
        {
          input: 'AÇAÍ',
          description: 'should be idempotent for AÇAÍ in keep mode'
        },
        {
          input: 'CORAÇÃO',
          description: 'should be idempotent for CORAÇÃO in keep mode'
        },
        {
          input: 'MÚSICA123!@#',
          description: 'should be idempotent for mixed string in keep mode'
        }
      ];

      it.each(keepIdempotenceTestCases)('$description', ({ input }) => {
        const firstResult = normalize(input, 'keep');
        const secondResult = normalize(firstResult, 'keep');
        expect(firstResult).toBe(secondResult);
      });
    });
  });

  describe('error handling', () => {
    it('should throw error for invalid mode', () => {
      expect(() => normalize('PÃO', 'invalid')).toThrow("Invalid mode: invalid. Must be 'strip' or 'keep'");
    });

    it('should throw error for null mode', () => {
      expect(() => normalize('PÃO', 'undefined')).toThrow("Invalid mode: undefined. Must be 'strip' or 'keep'");
    });

    it('should throw error for undefined mode', () => {
      expect(() => normalize('PÃO', 'undefined')).toThrow("Invalid mode: undefined. Must be 'strip' or 'keep'");
    });
  });

  describe('default behavior', () => {
    it('should default to strip mode when no mode is provided', () => {
      expect(normalize('PÃO', 'strip')).toBe('PAO');
    });

    it('should default to strip mode when mode is undefined', () => {
      expect(normalize('AÇAÍ', 'strip')).toBe('ACAI');
    });
  });

  describe('comprehensive mapping tests', () => {
    const mappingTestCases = [
      // Ç mapping
      { input: 'Ç', expected: 'C', description: 'should map Ç to C' },
      { input: 'ç', expected: 'c', description: 'should map ç to c' },
      
      // A variations
      { input: 'Á', expected: 'A', description: 'should map Á to A' },
      { input: 'á', expected: 'a', description: 'should map á to a' },
      { input: 'À', expected: 'A', description: 'should map À to A' },
      { input: 'à', expected: 'a', description: 'should map à to a' },
      { input: 'Ã', expected: 'A', description: 'should map Ã to A' },
      { input: 'ã', expected: 'a', description: 'should map ã to a' },
      { input: 'Â', expected: 'A', description: 'should map Â to A' },
      { input: 'â', expected: 'a', description: 'should map â to a' },
      
      // E variations
      { input: 'É', expected: 'E', description: 'should map É to E' },
      { input: 'é', expected: 'e', description: 'should map é to e' },
      { input: 'Ê', expected: 'E', description: 'should map Ê to E' },
      { input: 'ê', expected: 'e', description: 'should map ê to e' },
      
      // I variations
      { input: 'Í', expected: 'I', description: 'should map Í to I' },
      { input: 'í', expected: 'i', description: 'should map í to i' },
      
      // O variations
      { input: 'Ó', expected: 'O', description: 'should map Ó to O' },
      { input: 'ó', expected: 'o', description: 'should map ó to o' },
      { input: 'Ô', expected: 'O', description: 'should map Ô to O' },
      { input: 'ô', expected: 'o', description: 'should map ô to o' },
      { input: 'Õ', expected: 'O', description: 'should map Õ to O' },
      { input: 'õ', expected: 'o', description: 'should map õ to o' },
      
      // U variations
      { input: 'Ú', expected: 'U', description: 'should map Ú to U' },
      { input: 'ú', expected: 'u', description: 'should map ú to u' }
    ];

    it.each(mappingTestCases)('$description', ({ input, expected }) => {
      expect(normalize(input, 'strip')).toBe(expected);
    });
  });
});
