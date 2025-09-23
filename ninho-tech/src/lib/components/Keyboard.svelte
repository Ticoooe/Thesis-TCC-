<script>
    import { deleteLetter, guessLetter, guessWord, letterStatuses } from "../../lib/stores/gameStore";
    import CONSTANTS from "../../lib/utils/constants";
  
    $: bgClass = (letter) => {
      const key = letter?.toUpperCase?.() ?? '';
      const status = $letterStatuses?.[key];
      return CONSTANTS.LETTER_STATUS_TO_BG_MAP?.[status] ?? '';
    };
  
    const handleClick = (letter) => {
        if (letter === 'DEL') deleteLetter();
        else guessLetter(letter);
    };

  </script>
  
  <div>
    {#each CONSTANTS.KEYBOARD_ROWS_ARR as row}
      <div class="flex gap-2 justify-center mb-2">
        {#each row as letter}
          <button
            type="button"
            on:click={() => handleClick(letter)}
            class={`p-3 h-12 rounded-md flex items-center justify-center border-2 border-gray-100 text-lg font-semibold ${bgClass(letter)}`}
          >
            {letter}
          </button>
        {/each}
      </div>
    {/each}
  </div>
  