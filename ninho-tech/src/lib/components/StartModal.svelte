<script>
  import { createEventDispatcher } from 'svelte';
  
  const dispatch = createEventDispatcher();
  
  let inputValue = '';
  
  function handleStart() {
    dispatch('start', { value: inputValue });
  }
</script>

<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
  <div class="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl border border-slate-700">
    <h2 class="text-3xl font-bold text-white text-center mb-6">
      Bem-vindo ao Ninho de Letras! 🪺
    </h2>
    
    <div class="mb-6">
      <label for="playerInput" class="block text-white text-sm font-medium mb-2">
        Qual o tema do jogo?
      </label>
      <input
        id="playerInput"
        type="text"
        bind:value={inputValue}
        placeholder="Ex: Segunda Guerra Mundial, Fotossíntese, etc."
        class="w-full px-4 py-3 bg-slate-700 text-white rounded-lg border-2 border-slate-600 focus:border-blue-500 focus:outline-none transition-colors"
        on:keydown={(e) => e.key === 'Enter' && handleStart()}
        
      />
    </div>
    
    <button
      on:click={handleStart}
      class="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-4 px-6 rounded-lg transition-all transform hover:scale-105 active:scale-95 shadow-lg"
    >
      COMEÇAR
    </button>
  </div>
</div>

