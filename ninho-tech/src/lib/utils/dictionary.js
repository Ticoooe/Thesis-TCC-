// Mock PT-BR dictionaries (5-letter words only)
const SOLUTIONS = [
  'AMIGO', 'CASAL', 'PRAIA', 'TERRA', 'AGUAS', 'FOGOS', 'VIDAS', 'CASAS',
  'GATOS', 'HORAS', 'JOGOS', 'LAGOS', 'MAIOR', 'NADAS', 'OLHOS',
  'PATOS', 'RATOS', 'SALAS', 'TELAS', 'URSOS', 'VACAS', 'ZONAS'
];

const VALID_WORDS = [
  ...SOLUTIONS,
  'BALAS', 'CAMAS', 'DAMAS', 'ELEFA', 'FACAS', 'GALAS', 'HINOS',
  'IRMAS', 'JATOS', 'LATAS', 'MALAS', 'NAVES', 'ONDAS', 'PALAS', 'QUIMS',
  'ROSAS', 'SAPOS', 'TACOS', 'UVAS', 'VIDAS', 'ZONAS', 'ABACO', 'BABAS',
  'CACAS', 'DADAS', 'EITAS', 'FAFAS', 'GAGAS', 'HAHAS', 'IAIAS', 'JAJAS',
  'KAKAS', 'LALAS', 'MAMAS', 'NANAS', 'OAOAS', 'PAPAS', 'QAQAS', 'RARAS',
  'SASAS', 'TATAS', 'UAUAS', 'VAVAS', 'WAWAS', 'XAXAS', 'YAYAS', 'ZAZAS'
];

const OFFENSIVE_WORDS = [
  'IDIOTA', 'BURRO', 'TOLO', 'BESTA', 'ASNO', 'IMBECIL'
];

// Cache for loaded dictionaries
const dictionaryCache = new Map();

/**
 * Checks if a word is valid in the specified language
 * @param {string} word - The word to validate
 * @param {string} lang - The language code (e.g., 'pt-BR')
 * @returns {boolean} True if the word is valid
 */
export function isValidWord(word, lang = 'pt-BR') {
  if (!word || typeof word !== 'string') {
    return false;
  }

  const normalizedWord = word.toUpperCase().trim();
  
  // Only accept 5-letter words
  if (normalizedWord.length !== 5) {
    return false;
  }
  
  // Check offensive words first
  if (isOffensiveWord(normalizedWord)) {
    return false;
  }

  // Load dictionary for language (with caching)
  const dictionary = loadDictionary(lang);
  
  return dictionary.includes(normalizedWord);
}

/**
 * Checks if a word is in the solutions list
 * @param {string} word - The word to check
 * @param {string} lang - The language code
 * @returns {boolean} True if the word is a solution
 */
export function isSolution(word, lang = 'pt-BR') {
  if (!word || typeof word !== 'string') {
    return false;
  }

  const normalizedWord = word.toUpperCase().trim();
  
  // Only accept 5-letter words
  if (normalizedWord.length !== 5) {
    return false;
  }
  
  const solutions = loadSolutions(lang);
  
  return solutions.includes(normalizedWord);
}

/**
 * Loads dictionary for a language with caching
 * @param {string} lang - The language code
 * @returns {string[]} Array of valid words
 */
function loadDictionary(lang) {
  if (dictionaryCache.has(lang)) {
    return dictionaryCache.get(lang);
  }

  let dictionary;
  switch (lang) {
    case 'pt-BR':
      dictionary = VALID_WORDS;
      break;

    default:
      dictionary = [];
  }

  dictionaryCache.set(lang, dictionary);
  return dictionary;
}

/**
 * Loads solutions for a language
 * @param {string} lang - The language code
 * @returns {string[]} Array of solution words
 */
function loadSolutions(lang) {
  switch (lang) {
    case 'pt-BR':
      return SOLUTIONS;

    default:
      return [];
  }
}

/**
 * Checks if a word is offensive
 * @param {string} word - The word to check
 * @returns {boolean} True if the word is offensive
 */
function isOffensiveWord(word) {
  return OFFENSIVE_WORDS.includes(word);
}

/**
 * Clears the dictionary cache (useful for testing)
 */
export function clearDictionaryCache() {
  dictionaryCache.clear();
}
