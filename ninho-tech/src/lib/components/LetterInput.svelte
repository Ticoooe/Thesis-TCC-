<script>
    export let letter;
    export let letterIndex;
    export let wordIndex;
    import { fade } from 'svelte/transition';
    import { correctWord, currentLetterIndex, currentWordIndex, setCurrentPosition, userGuessesArray } from "../../lib/stores/gameStore";

    const stripAccents = (value = '') => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const normalizeLetter = (value = '') => stripAccents(value).toUpperCase();

    $: normalizedCorrectWord = ($correctWord || '').split('').map(normalizeLetter).join('');
    $: normalizedLetter = normalizeLetter(letter || '');

    $: showResults = wordIndex < $currentWordIndex;
    $: isExactMatch = showResults && normalizedLetter === normalizedCorrectWord[letterIndex];
    $: isPresent = showResults && !isExactMatch && normalizedCorrectWord.includes(normalizedLetter);

    $: bgClass = () => {
    if (isExactMatch) return "bg-green-500";
    if (isPresent)    return "bg-yellow-500";
    if (showResults)  return "bg-gray-500";
    return "bg-transparent";
  };

    const handleClick = () => {
        // Only allow clicking on the current word row
        if (wordIndex === $currentWordIndex) {
            setCurrentPosition(letterIndex);
        }
    }

    // Determine the border style for the current active row
    $: isSelected = wordIndex === $currentWordIndex && letterIndex === $currentLetterIndex;
    $: currentRow = $userGuessesArray[$currentWordIndex] || [];
    $: isCurrentRowEmpty = Array.isArray(currentRow) && currentRow.every(l => !l || l.trim?.() === '');
    $: activeBorderClass = isSelected && !isCurrentRowEmpty ? 'border-gray-400' : 'border-gray-600';
</script>
{#if wordIndex < $currentWordIndex }
<!-- Linhas passadas: resultado visível -->
<div 
class={`w-14 h-14 ${bgClass()} flex items-center justify-center`} 
in:fade={{ delay: 100 * letterIndex }}>
    <span  class={`text-4xl font-bold`}>{letter}</span>  
</div>
{:else if wordIndex === $currentWordIndex}
<!-- Current row - all squares should be clickable -->
<div class="w-14 h-14 border-2 {activeBorderClass} cursor-pointer hover:border-gray-400 transition-colors flex items-center justify-center" on:click={handleClick} on:keydown={(e) => e.key === 'Enter' && handleClick()} role="button" tabindex="0">
    <span class="text-4xl font-bold" in:fade={{}}>{letter}</span>          
</div>
{:else}
<!-- Future rows - not clickable -->
<span class="w-14 h-14 border-2 border-gray-600">{letter}</span>          
{/if}
    