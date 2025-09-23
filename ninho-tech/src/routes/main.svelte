<script>
  import { onMount } from "svelte";
  import { slide } from "svelte/transition";
  import Alert from "../lib/components/Alert.svelte";
  import InstructionsSidebar from "../lib/components/InstructionsSidebar.svelte";
  import Keyboard from "../lib/components/Keyboard.svelte";
  import Overlay from "../lib/components/Overlay.svelte";
  import LetterInput from "../lib/components/LetterInput.svelte";
  import { deleteLetter, gameState, guessLetter, guessWord, initializeGame, userGuessesArray } from "../lib/stores/gameStore";
  import CONSTANTS from "../lib/utils/constants";
    
    let loaded = false;
    let showInstructions = true;

    onMount(async () => {
        // Clear storage on every page load to ensure a fresh start
        localStorage.removeItem(CONSTANTS.ID_NAME);
        localStorage.removeItem(CONSTANTS.GUESSES_NAME);
        localStorage.removeItem(CONSTANTS.LAST_PLAYED_NAME);
        localStorage.removeItem(CONSTANTS.CURRENT_WORD_INDEX_NAME);
        localStorage.removeItem(CONSTANTS.CURRENT_LETTER_INDEX_NAME);
        localStorage.removeItem(CONSTANTS.GAME_STATE_NAME);
        localStorage.removeItem(CONSTANTS.CORRECT_WORD_NAME);

        await initializeGame();
        loaded = true;
    })

    const handleKeydown = (e) => {
        if($gameState !== CONSTANTS.GAME_STATES.PLAYING || e.shiftKey || e.ctrlKey){
            return;
        }
        
        const {key} = e;
        if(e.code === "Backspace") {
            deleteLetter();
        }
        else if(e.code === "Enter"){
            guessWord();
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
    
    <div class="flex flex-col gap-y-1 max-w-2xl h-full justify-between items-center">
      <Alert/>
      <div class="grow">
        {#each $userGuessesArray as lettersArr, i}
          <div class="flex mx-auto space-x-1 mb-1 text-white">
            {#each lettersArr as letter, j}
              <LetterInput letter={letter} wordIndex={i} letterIndex={j} />
            {/each}
          </div>
        {/each}
      </div>
      <Keyboard/>
    </div>
  </div>
{/if}