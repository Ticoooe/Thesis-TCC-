<script>
    export let letter;
    export let letterIndex;
    export let wordIndex;
    import { fade } from 'svelte/transition';
    import { correctWord, currentLetterIndex, currentWordIndex, setCurrentPosition } from "../../lib/stores/gameStore";

    $: bgClass = () => {
        const showResults = wordIndex < $currentWordIndex;
        if(showResults && letter === $correctWord[letterIndex]){
            return "bg-green-500";
        }else if(showResults && $correctWord.includes(letter)){
            return "bg-yellow-500";
        }else if(showResults){
            return "bg-gray-500";
        }
        else{
            return "bg-transparent"
        }
    }

    const handleClick = () => {
        // Only allow clicking on the current word row
        console.log('Click detected:', { wordIndex, letterIndex, currentWordIndex: $currentWordIndex, currentLetterIndex: $currentLetterIndex });
        if (wordIndex === $currentWordIndex) {
            setCurrentPosition(letterIndex);
        }
    }
</script>
{#if wordIndex < $currentWordIndex }
<div class={`w-14 h-14 ${bgClass()} flex items-center justify-center`} in:fade={{ delay: 100 * letterIndex }}>
    <span  class={`text-4xl font-bold`}>{letter}</span>  
</div>
{:else if wordIndex === $currentWordIndex}
<!-- Current row - all squares should be clickable -->
<div class="w-14 h-14 border-2 border-gray-600 cursor-pointer hover:border-gray-400 transition-colors flex items-center justify-center" on:click={handleClick} on:keydown={(e) => e.key === 'Enter' && handleClick()} role="button" tabindex="0">
    <span class="text-4xl font-bold" in:fade={{}}>{letter}</span>          
</div>
{:else}
<!-- Future rows - not clickable -->
<span class="w-14 h-14 border-2 border-gray-600">{letter}</span>          
{/if}
    