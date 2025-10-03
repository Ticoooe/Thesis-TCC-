<script>
    import { wordDefinition, correctWord } from '../stores/gameStore';

    $: definition = $wordDefinition;
    $: examples = Array.isArray(definition?.exemplos)
        ? definition.exemplos.filter(Boolean)
        : definition?.exemplos
            ? [definition.exemplos]
            : [];
    $: synonyms = Array.isArray(definition?.sinonimos)
        ? definition.sinonimos.filter(Boolean)
        : definition?.sinonimos
            ? String(definition.sinonimos).split(/[,;\n]/).map((s) => s.trim()).filter(Boolean)
            : [];
    $: observations = definition?.observacoes?.trim() ?? '';
</script>

{#if definition}
<div class="fixed right-0 top-0 h-full w-80 bg-gray-900 text-white p-6 overflow-y-auto z-20">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-xl font-bold">Definição</h2>
    </div>
    <div>
        <h3 class="text-lg font-bold capitalize mb-2">{$correctWord}</h3>
        <p class="mb-4">{definition.definicao_curta}</p>
        
        <h4 class="font-bold mt-4">Exemplos:</h4>
        {#if examples.length}
            <ul class="list-disc pl-5">
                {#each examples as exemplo}
                    <li>{exemplo}</li>
                {/each}
            </ul>
        {:else}
            <p class="text-sm text-gray-300">Nenhum exemplo disponível.</p>
        {/if}

        <h4 class="font-bold mt-4">Sinônimos:</h4>
        {#if synonyms.length}
            <p>{synonyms.join(', ')}</p>
        {:else}
            <p class="text-sm text-gray-300">Nenhum sinônimo encontrado.</p>
        {/if}

        <h4 class="font-bold mt-4">Observações:</h4>
        {#if observations}
            <p>{observations}</p>
        {:else}
            <p class="text-sm text-gray-300">Sem observações adicionais.</p>
        {/if}
    </div>
</div>
{/if}
