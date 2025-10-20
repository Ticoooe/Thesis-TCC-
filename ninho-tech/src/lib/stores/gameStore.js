import { get, writable } from "svelte/store";
import { v4 as uuidv4 } from 'uuid';
import answers from "../../lib/utils/answers.js";
import allowedGuesses from "../../lib/utils/allowedGuesses.js";
import CONSTANTS from "../../lib/utils/constants.js";
import { ALERT_TYPES, displayAlert } from "./alertStore.js";
import { fetchDefinition } from "../api/definition.js";

export const correctWord = writable();
export const wordDefinition = writable(null);
export const userGuessesArray = writable([]);
export const currentWordIndex = writable(0);
export const currentLetterIndex = writable(0);
export const gameState = writable(CONSTANTS.GAME_STATES.PLAYING);
export const letterStatuses = writable({});
const userId = writable();

const normalize = (word = "") => word.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
const allowedWordSet = new Set([
  ...answers.map((word) => normalize(word)),
  ...allowedGuesses.map((word) => normalize(word)),
]);

const getLetterKey = (letter = "") => normalize(letter).toUpperCase();

//SETTERS
const setAndSaveUserId = (id) => {
    localStorage.setItem(CONSTANTS.ID_NAME, id)
    userId.set(id);
}

const setAndSaveUserGuessesArray = (guesses) => {
  userGuessesArray.set(guesses);
  localStorage.setItem(CONSTANTS.GUESSES_NAME, JSON.stringify(guesses));
}

const setAndSaveCurrentLetterIndex = (index) => {
    currentLetterIndex.set(index);
    localStorage.setItem(CONSTANTS.CURRENT_LETTER_INDEX_NAME, index);
}

const setAndSaveCurrentWordIndex = (index) => {
  currentWordIndex.set(index);
  localStorage.setItem(CONSTANTS.CURRENT_WORD_INDEX_NAME, index);
}

const setAndSaveCorrectWord = (word) => {
  localStorage.setItem(CONSTANTS.CORRECT_WORD_NAME, word);
  correctWord.set(word);
}

export const setAndSaveGameState = (state) => {
  gameState.set(state);
  localStorage.setItem(CONSTANTS.GAME_STATE_NAME, state);
}

export const setCurrentPosition = (letterIndex) => {
  if(get(gameState) === CONSTANTS.GAME_STATES.PLAYING) {
    // Set the cursor to the clicked position
    // This allows clicking on any square in the current row
    setAndSaveCurrentLetterIndex(letterIndex);
  }
}

const getCurrentWord = () => {
  const guesses = get(userGuessesArray) || [];
  return guesses[get(currentWordIndex)] || [];
};

const findLastFilledIndex = (letters = []) => {
  for (let i = CONSTANTS.MAX_LETTERS - 1; i >= 0; i--) {
    const value = letters[i];
    if (value && value.trim && value.trim() !== "") {
      return i;
    }
  }
  return 0;
};

const findFirstEmptyIndex = (letters = []) => {
  for (let i = 0; i < CONSTANTS.MAX_LETTERS; i++) {
    const value = letters[i];
    if (!value || (value.trim && value.trim() === "")) {
      return i;
    }
  }
  return CONSTANTS.MAX_LETTERS - 1;
};

export const moveCursorLeft = () => {
  if (get(gameState) !== CONSTANTS.GAME_STATES.PLAYING) {
    return;
  }

  const currentIndex = get(currentLetterIndex);
  const letters = getCurrentWord();

  if (currentIndex >= CONSTANTS.MAX_LETTERS) {
    const target = findLastFilledIndex(letters);
    setAndSaveCurrentLetterIndex(target);
    return;
  }

  const wrappedIndex = currentIndex <= 0 ? CONSTANTS.MAX_LETTERS - 1 : currentIndex - 1;
  setAndSaveCurrentLetterIndex(wrappedIndex);
};

export const moveCursorRight = () => {
  if (get(gameState) !== CONSTANTS.GAME_STATES.PLAYING) {
    return;
  }

  const currentIndex = get(currentLetterIndex);
  const letters = getCurrentWord();
  if (currentIndex >= CONSTANTS.MAX_LETTERS) {
    const target = findFirstEmptyIndex(letters);
    setAndSaveCurrentLetterIndex(target);
    return;
  }

  const wrappedIndex = currentIndex >= CONSTANTS.MAX_LETTERS - 1 ? 0 : currentIndex + 1;
  setAndSaveCurrentLetterIndex(wrappedIndex);
};

//LOADERS
const loadGameState = () => {
  const loadedState = localStorage.getItem(CONSTANTS.GAME_STATE_NAME);
  if( !loadedState || !Object.keys(CONSTANTS.GAME_STATES).includes(loadedState)){
    return CONSTANTS.GAME_STATES.PLAYING;
  }  
  return loadedState;
}


const loadLastPlayedDate = () => {
    const existingDateStr = localStorage.getItem(CONSTANTS.LAST_PLAYED_NAME);
    if(existingDateStr){
        return new Date(existingDateStr);
    }
    return null;
}

const getRandomWord = () => {
  const randomNum = Math.floor(Math.random() * answers.length);
  const selectedWord = answers[randomNum].toUpperCase();
  console.log("Selected word:", selectedWord);
  return selectedWord;
}

const loadCorrectWord = () => {
    return localStorage.getItem(CONSTANTS.CORRECT_WORD_NAME);
}

const loadUserGuessesArray = () => {
    const userGuessesStr = localStorage.getItem(CONSTANTS.GUESSES_NAME);
    try {
        const loadedUserGuessesArray = JSON.parse(userGuessesStr);
        if(!loadedUserGuessesArray) return generateEmptyGuessesArray();

        return loadedUserGuessesArray;
    }catch(err){
        return generateEmptyGuessesArray()
    }
}

const loadUserId = () => {
    return localStorage.getItem(CONSTANTS.ID_NAME);
}

const loadCurrentLetterIndex = () => Number(localStorage.getItem(CONSTANTS.CURRENT_LETTER_INDEX_NAME)) || 0;
const loadCurrentWordIndex = () => Number(localStorage.getItem(CONSTANTS.CURRENT_WORD_INDEX_NAME)) || 0;

//GAME FUNCTIONALITY
export const guessLetter = (letter) => {
    if(letter.length > 1 || get(currentLetterIndex) >= CONSTANTS.MAX_LETTERS || get(gameState) !== CONSTANTS.GAME_STATES.PLAYING) {
        return;
    }

    const currentPos = get(currentLetterIndex);
    
    userGuessesArray.update( prev => {
        prev[get(currentWordIndex)][currentPos] = letter.toUpperCase();
        localStorage.setItem(CONSTANTS.GUESSES_NAME, JSON.stringify(prev));
        return prev;
    })

    let nextPos = currentPos + 1;
    if (nextPos > CONSTANTS.MAX_LETTERS) {
        nextPos = CONSTANTS.MAX_LETTERS;
    }
    
    setAndSaveCurrentLetterIndex(nextPos);

    // Auto-check word when all positions are filled
    if(nextPos >= CONSTANTS.MAX_LETTERS) {
        setTimeout(() => {
            guessWord();
        }, 100); // Small delay to ensure the letter is processed first
    }
}

export const deleteLetter = () => {
    if(get(gameState) !== CONSTANTS.GAME_STATES.PLAYING) {
        return;
    }

    const letterIndex = get(currentLetterIndex);
    const currentWordIndexValue = get(currentWordIndex);
    const guesses = get(userGuessesArray);
    const currentWord = guesses[currentWordIndexValue];

    if (!Array.isArray(currentWord)) {
      return;
    }

    let deletionOccurred = false;
    let clearedIndex = null;

    userGuessesArray.update(prev => {
        const row = prev[currentWordIndexValue];
        if (!row) {
            return prev;
        }

        if (letterIndex < CONSTANTS.MAX_LETTERS && row[letterIndex] && row[letterIndex].trim() !== '') {
            row[letterIndex] = "";
            clearedIndex = letterIndex;
            deletionOccurred = true;
        } else {
            const posToDelete = letterIndex - 1;
            if (posToDelete >= 0 && row[posToDelete] && row[posToDelete].trim() !== '') {
                row[posToDelete] = "";
                clearedIndex = posToDelete;
                deletionOccurred = true;
            }
        }

        if (deletionOccurred) {
            localStorage.setItem(CONSTANTS.GUESSES_NAME, JSON.stringify(prev));
        }

        return prev;
    });

    if (!deletionOccurred) {
        return;
    }

    const targetIndex = clearedIndex ?? 0;
    const normalizedTarget = Math.min(Math.max(targetIndex, 0), CONSTANTS.MAX_LETTERS - 1);

    setAndSaveCurrentLetterIndex(normalizedTarget);
}

export const guessWord = () => {
  if(get(gameState) !== CONSTANTS.GAME_STATES.PLAYING){
        return;
  }
    
  const guessesArr = get(userGuessesArray);
  const currentGuessArray = guessesArr[get(currentWordIndex)];
    
  // Check if all 5 positions have letters (no blanks)
  const hasAllLetters = currentGuessArray.every(letter => letter && letter.trim() !== '');
  if (!hasAllLetters) {
      return displayAlert('Por favor, preencha todos os 5 espaços.', ALERT_TYPES.INFO, 2000);
  }
  
  const guessStr = currentGuessArray.join('');
  const normalizedGuess = normalize(guessStr);

  if (!allowedWordSet.has(normalizedGuess)) {
      return displayAlert('Escreva uma palavra válida.', ALERT_TYPES.INFO, 2000);
  }

  const updatedGameState = getUpdatedGameState(guessStr, get(currentWordIndex));
  setAndSaveGameState(updatedGameState);
  displayFeedback(updatedGameState);

  if (updatedGameState !== CONSTANTS.GAME_STATES.PLAYING) {
      getWordDefinition();
  }

  setAndSaveCurrentWordIndex(get(currentWordIndex) + 1);
  setAndSaveCurrentLetterIndex(0);
  updateLetterStatuses(guessesArr, get(correctWord));
  
  localStorage.setItem(CONSTANTS.LAST_PLAYED_NAME, new Date());
}

export const getWordDefinition = async () => {
    if (get(wordDefinition)) return;

    try {
        const definition = await fetchDefinition(get(correctWord));
        wordDefinition.set(definition);
    } catch (e) {
        displayAlert(e.message, ALERT_TYPES.DANGER);
    }
}

const getUpdatedGameState = (guessStr, wordIndex) => {
    const normalizedGuess = normalize(guessStr);
    const normalizedCorrect = normalize(get(correctWord));

    if(normalizedGuess === normalizedCorrect){
        return CONSTANTS.GAME_STATES.WIN;
        
    }else if(wordIndex === CONSTANTS.MAX_GUESSES - 1){
        return CONSTANTS.GAME_STATES.LOSE;
    }
    else {
      return CONSTANTS.GAME_STATES.PLAYING
    }
}

const displayFeedback = (state) => { 
  const correctWordStr = get(correctWord);
  
  if(state === CONSTANTS.GAME_STATES.WIN) {
    displayAlert(`Parabéns! Você ganhou! A palavra era: ${correctWordStr}`, ALERT_TYPES.SUCCESS)
  }else if(state === CONSTANTS.GAME_STATES.LOSE){
    displayAlert(`Que pena! Você perdeu. A palavra era: ${correctWordStr}`, ALERT_TYPES.DANGER)
  }
}

const generateEmptyGuessesArray = () => {
    const emptyGuesses = [];
    for (let i = 0; i < CONSTANTS.MAX_GUESSES; i++) {
        emptyGuesses.push(Array(CONSTANTS.MAX_LETTERS).fill(""));
    }
    return emptyGuesses
}

export const initializeGame = async () => {
    const id = loadUserId() || uuidv4();
    setAndSaveUserId(id);

    const loadedState = loadGameState();

    if (loadedState === CONSTANTS.GAME_STATES.NEW_PLAYER) {
        return resetGame(true);
    }
    
    const lastPlayed = loadLastPlayedDate();

    localStorage.setItem(CONSTANTS.LAST_PLAYED_NAME, new Date().toISOString());

    const sameDay = (a, b) => a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate();
    if (!lastPlayed || !sameDay(lastPlayed, new Date())) {
      return resetGame(false); 
    }

    const savedWord = loadCorrectWord();
    if (!savedWord) {
        return resetGame(false);
    }

    correctWord.set(savedWord);
    userGuessesArray.set(loadUserGuessesArray());
    currentWordIndex.set(loadCurrentWordIndex());
    currentLetterIndex.set(loadCurrentLetterIndex());
    gameState.set(loadedState);
    updateLetterStatuses(get(userGuessesArray), get(correctWord));
};

const updateLetterStatuses = (guessesArray, correctWordValue) => {
  const normalizedCorrect = normalize(correctWordValue || "");
  letterStatuses.update(prevLetterStatuses => {
    guessesArray.forEach(singleGuessArray => {
      singleGuessArray.forEach((letter, i) => {
        const key = getLetterKey(letter);
        if(!key) return;
        if(prevLetterStatuses[key] === CONSTANTS.LETTER_STATES.CORRECT_SPOT){
          return;
        }
        const normalizedGuessLetter = normalize(letter || "");
        const correctLetterNormalized = normalizedCorrect[i] || "";
        if(normalizedGuessLetter === correctLetterNormalized){
          prevLetterStatuses[key] =  CONSTANTS.LETTER_STATES.CORRECT_SPOT;
        }else if( normalizedCorrect.includes(normalizedGuessLetter)){
          prevLetterStatuses[key] = CONSTANTS.LETTER_STATES.WRONG_SPOT;
        }
        else{
          prevLetterStatuses[key] = CONSTANTS.LETTER_STATES.NOT_FOUND
        }
      })
    })
    return prevLetterStatuses
  }) 
}

const generateInitialLetterStatuses = () => {
  const initialLetterStatuses = CONSTANTS.ALPHABET.reduce((acc, cur) => {
      acc[cur] = CONSTANTS.LETTER_STATES.AVAILABLE;
      return acc;
  },{})
  return initialLetterStatuses;
}

export const resetGame = async (isNewPlayer = false) => {
    setAndSaveCorrectWord(getRandomWord());
    setAndSaveCurrentLetterIndex(0);
    setAndSaveCurrentWordIndex(0);
    setAndSaveUserGuessesArray(generateEmptyGuessesArray());
    letterStatuses.set(generateInitialLetterStatuses());
    updateLetterStatuses(get(userGuessesArray), get(correctWord));
    if(isNewPlayer){
      setAndSaveGameState(CONSTANTS.GAME_STATES.NEW_PLAYER)
    }else {
      setAndSaveGameState(CONSTANTS.GAME_STATES.PLAYING)
    }
}

// const hasAlreadyPlayedToday = (lastPlayed) => {
//   if(!lastPlayed) return false;

//   const today = new Date();
//   return (lastPlayed.getFullYear() === today.getFullYear() &&
//     lastPlayed.getDate() === today.getDate() &&
//     lastPlayed.getMonth() === today.getMonth());
// }
