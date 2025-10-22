<script>
  import { onMount } from "svelte";
  import { slide } from "svelte/transition";
  import Alert from "../lib/components/Alert.svelte";
  import InstructionsSidebar from "../lib/components/InstructionsSidebar.svelte";
  import Keyboard from "../lib/components/Keyboard.svelte";
  import LetterInput from "../lib/components/LetterInput.svelte";
  import DefinitionSidebar from "../lib/components/DefinitionSidebar.svelte";
  import StartModal from "../lib/components/StartModal.svelte";
import { deleteLetter, gameState, guessLetter, guessWord, initializeGame, moveCursorLeft, moveCursorRight, userGuessesArray, wordDefinition } from "../lib/stores/gameStore";
  import { generateWordFromTheme } from "../lib/api/generateWord.js";
  import { displayAlert, ALERT_TYPES } from "../lib/stores/alertStore";
  import CONSTANTS from "../lib/utils/constants";
    
    let loaded = false;
    let showInstructions = true;
    let gameStarted = false;
    let showStartModal = false;
    let isGeneratingWord = false;
    let theme = '';

    onMount(async () => {
        // Clear storage on every page load to ensure a fresh start
        localStorage.removeItem(CONSTANTS.ID_NAME);
        localStorage.removeItem(CONSTANTS.GUESSES_NAME);
        localStorage.removeItem(CONSTANTS.LAST_PLAYED_NAME);
        localStorage.removeItem(CONSTANTS.CURRENT_WORD_INDEX_NAME);
        localStorage.removeItem(CONSTANTS.CURRENT_LETTER_INDEX_NAME);
        localStorage.removeItem(CONSTANTS.GAME_STATE_NAME);
        localStorage.removeItem(CONSTANTS.CORRECT_WORD_NAME);
        
        loaded = true;
    })

    async function handleStartClick() {
        showStartModal = true;
    }

    async function handleModalStart(event) {
        theme = event.detail.value.trim();
        
        if (!theme) {
            displayAlert('Por favor, digite um tema.', ALERT_TYPES.INFO, 2000);
            return;
        }

        showStartModal = false;
        isGeneratingWord = true;

        try {
            displayAlert(`Gerando palavra relacionada a: ${theme}...`, ALERT_TYPES.INFO, 3000);
            const result = await generateWordFromTheme(theme);
            await initializeGame(result.word);
            gameStarted = true;
            isGeneratingWord = false;
            displayAlert(`Tema: ${theme} ✓`, ALERT_TYPES.SUCCESS, 2000);
        } catch (error) {
            isGeneratingWord = false;
            displayAlert(error.message || 'Erro ao gerar palavra. Tente novamente.', ALERT_TYPES.INFO, 3000);
            showStartModal = true;
        }
    }

    const handleKeydown = (e) => {
        if(!gameStarted || $gameState !== CONSTANTS.GAME_STATES.PLAYING || e.shiftKey || e.ctrlKey){
            return;
        }
        
        const {key} = e;
        if(e.code === "Backspace") {
            deleteLetter();
        }
        else if(e.code === "Enter"){
            guessWord();
        }
        else if(e.code === "ArrowLeft") {
            e.preventDefault();
            moveCursorLeft();
        }
        else if(e.code === "ArrowRight") {
            e.preventDefault();
            moveCursorRight();
        }
        else if(isLetter(e.key)){
            guessLetter(key)
        }
    }

    function isLetter(str) {
        return str.length === 1 && str.match(/[a-z]/i);
    }

</script>
<svelte:window on:keydown={handleKeydown}/>
{#if loaded }
    {#if !gameStarted}
        {#if isGeneratingWord}
            <!-- Loading indicator -->
            <div class="flex flex-col items-center justify-center w-full h-screen">
                <div class="animate-spin rounded-full h-16 w-16 border-b-2 border-white mb-4"></div>
                <p class="text-white text-xl">Gerando palavra...</p>
            </div>
        {:else}
            <!-- Botão COMEÇAR grande no centro -->
            <div class="flex items-center justify-center w-full h-screen">
                <button
                    on:click={handleStartClick}
                    class="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold text-4xl py-8 px-16 rounded-2xl transition-all transform hover:scale-110 active:scale-95 shadow-2xl"
                >
                    COMEÇAR
                </button>
            </div>

            {#if showStartModal}
                <StartModal on:start={handleModalStart} />
            {/if}
        {/if}
    {:else}
    <div class="flex flex-row justify-center items-start w-full h-screen">
        <div class="w-full h-screen text-white mx-auto max-w-10 py-10 flex flex-col items-center relative">
            <!-- Instructions sidebar -->
            {#if showInstructions}
              <div
                class="fixed left-0 top-0 h-full w-80 bg-gray-900 text-white p-6 overflow-y-auto z-20"
                transition:slide={{ axis: 'x', duration: 300 }}
              >
                <div class="flex justify-between items-center mb-4">
                  <h2 class="text-xl font-bold">Instruções</h2>
                  <button
                    class="text-gray-300 hover:text-white text-2xl"
                    on:click={() => showInstructions = false}
                  >
                    ×
                  </button>
                </div>
                <InstructionsSidebar/>
              </div>
            {:else}
              <!-- Instructions button on the extreme left when sidebar is closed -->
              <button 
                class="fixed top-4 left-4 bg-gray-700 hover:bg-gray-600 text-white w-8 h-8 rounded-full flex items-center justify-center transition-colors text-sm z-10"
                on:click={() => showInstructions = true}
                title="Instructions"
              >
                ?
              </button>
            {/if}

            <div class="flex-column items-center h-50">
              <h1 class="text-5xl font-extrabold text-center whitespace-nowrap font-display">
                Ninho Tech 
              </h1>
              <br/>
              <h1 class="text-4xl font-extrabold text-center whitespace-nowrap font-display">
                Ninho de Letras
              </h1>
            </div>
            
            <div class="flex flex-col gap-y-1 max-w-2xl h-full items-center">
              <Alert/>
              <div class="flex flex-col justify-start mt-4">
                {#each $userGuessesArray as lettersArr, i}
                  <div class="flex mx-auto space-x-1 mb-1 text-white">
                    {#each lettersArr as letter, j}
                      <LetterInput letter={letter} wordIndex={i} letterIndex={j} />
                    {/each}
                  </div>
                {/each}
              </div>
              <div class="mt-auto pt-8">
                <Keyboard/>
              </div>
            </div>
        </div>
        
        {#if $gameState !== CONSTANTS.GAME_STATES.PLAYING && $wordDefinition}
            <DefinitionSidebar />
        {/if}
    </div>
    {/if}
{/if}