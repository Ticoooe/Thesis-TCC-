<script>
    import { deleteLetter, guessLetter, guessWord, letterStatuses } from "../../lib/stores/gameStore";
    import CONSTANTS from "../../lib/utils/constants";

    $: bgClass = (letter) => {
        return CONSTANTS.LETTER_STATUS_TO_BG_MAP[$letterStatuses[letter.toUpperCase()]];
    }
    
    const handleClick = (letter) => {
        if(letter === 'ENTER'){
            guessWord();
        }else if(letter === 'DEL') {
            deleteLetter();
        }else {
            guessLetter(letter);
        }
    }
</script>
<div>
    {#each CONSTANTS.KEYBOARD_ROWS_ARR as row }
    <div class="flex gap-2 justify-center mb-2">
        {#each row as letter }
            <button on:click={() => handleClick(letter)} 
                class={`p-3 h-12 rounded-md flex items-center justify-center border-2 border-gray-100 text-lg font-semibold ${bgClass(letter)}`}>{letter}
            </button>
        {/each}
        </div>
    {/each}
</div>