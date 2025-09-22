import { get, writable } from "svelte/store";
import { v4 as uuidv4 } from 'uuid';
import answers from "../../lib/utils/answers.js";
import CONSTANTS from "../../lib/utils/constants.js";
import { ALERT_TYPES, displayAlert } from "./alertStore.js";

export const correctWord = writable();
export const userGuessesArray = writable([]);
export const currentWordIndex = writable(0);
export const currentLetterIndex = writable(0);
export const gameState = writable(CONSTANTS.GAME_STATES.PLAYING);
export const letterStatuses = writable({});
const userId = writable();

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

const loadCurrentWord = async () => {
  const randomNum = Math.floor(Math.random() * answers.length);
  const selectedWord = answers[randomNum].toUpperCase();
  console.log("Selected word:", selectedWord);
  return selectedWord;
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

    // Find the next empty position, skipping over letters that are already written
    let nextPos = currentPos + 1;
    const currentGuesses = get(userGuessesArray);
    const currentWord = currentGuesses[get(currentWordIndex)];
    
    // Skip over positions that already have letters
    while (nextPos < CONSTANTS.MAX_LETTERS && currentWord[nextPos] && currentWord[nextPos].trim() !== '') {
        nextPos++;
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
    const currentWord = get(userGuessesArray)[get(currentWordIndex)];

    // If the cursor is on a square that already has a letter, delete that letter
    // and effectively "deselect" all squares by moving the cursor out of bounds.
    if (letterIndex < CONSTANTS.MAX_LETTERS && currentWord[letterIndex] && currentWord[letterIndex].trim() !== '') {
        userGuessesArray.update(prev => {
            prev[get(currentWordIndex)][letterIndex] = "";
            return prev;
        });

        // Move cursor to a non-existent index to remove the highlight from all squares.
        setAndSaveCurrentLetterIndex(CONSTANTS.MAX_LETTERS);

    } else {
        // Otherwise, behave like a standard backspace, deleting the character before the cursor.
        const posToDelete = letterIndex - 1;
        if (posToDelete >= 0) {
            userGuessesArray.update(prev => {
                prev[get(currentWordIndex)][posToDelete] = "";
                return prev;
            });
            // Move the cursor to the now-empty position.
            setAndSaveCurrentLetterIndex(posToDelete);
        }
    }
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

    // if(!guesses.includes(guessStr.toLowerCase())){
    //     return displayAlert('Not a word in the list.', ALERT_TYPES.INFO, 2000);
    // }

    const updatedGameState = getUpdatedGameState(guessStr, get(currentWordIndex));
    setAndSaveGameState(updatedGameState);
    displayFeedback(updatedGameState);

    setAndSaveCurrentWordIndex(get(currentWordIndex) + 1);
    setAndSaveCurrentLetterIndex(0);
    updateLetterStatuses(guessesArr, get(correctWord));
    
    localStorage.setItem(CONSTANTS.LAST_PLAYED_NAME, new Date());
}

const getUpdatedGameState = (guessStr, wordIndex) => {
    if(guessStr === get(correctWord)){
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
    const today = new Date();

    if (!lastPlayed || lastPlayed.getDate() !== today.getDate()) {
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

const updateLetterStatuses = (guessesArray, correctWord) => {
  letterStatuses.update(prevLetterStatuses => {
    guessesArray.forEach( singleGuessArray => {
      singleGuessArray.forEach((letter, i) => {
        if(prevLetterStatuses[letter] === CONSTANTS.LETTER_STATES.CORRECT_SPOT){
          return;
        }
        if(letter.toUpperCase() === correctWord[i]){
          prevLetterStatuses[letter] =  CONSTANTS.LETTER_STATES.CORRECT_SPOT;
        }else if( correctWord.includes(letter)){
          prevLetterStatuses[letter] = CONSTANTS.LETTER_STATES.WRONG_SPOT;
        }
        else{
          prevLetterStatuses[letter] = CONSTANTS.LETTER_STATES.NOT_FOUND
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



