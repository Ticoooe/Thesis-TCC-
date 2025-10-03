<script lang="ts">
	import { fade } from 'svelte/transition';
	import { onMount, onDestroy } from 'svelte';
	import { setAndSaveGameState } from '../../lib/stores/gameStore';
	import CONSTANTS from '../../lib/utils/constants';
  
	let panelEl: HTMLDivElement;
	let prevFocus: HTMLElement | null = null;
	let prevOverflow = '';
  
	const handleClose = () => {
	  setAndSaveGameState(CONSTANTS.GAME_STATES.PLAYING);
	  // restaura scroll e foco
	  document.body.style.overflow = prevOverflow ?? '';
	  prevFocus?.focus?.();
	};

	const handleOverlayClick = (e: MouseEvent) => {
		if (e.currentTarget === e.target) {
			handleClose();
		}
	};

	const handleOverlayKey = (e: KeyboardEvent) => {
		if (e.currentTarget === e.target && (e.key === 'Enter' || e.key === ' ')) {
			handleClose();
		}
	};
  
	onMount(() => {
	  // guarda foco atual e bloqueia scroll do body
	  prevFocus = document.activeElement as HTMLElement;
	  prevOverflow = document.body.style.overflow;
	  document.body.style.overflow = 'hidden';
	  // foca o modal no próximo tick
	  setTimeout(() => panelEl?.focus(), 0);
	});
  
	onDestroy(() => {
	  // fallback caso o modal seja desmontado sem chamar handleClose
	  document.body.style.overflow = prevOverflow ?? '';
	});
  
	const onKeydown = (e: KeyboardEvent) => {
	  if (e.key === 'Escape') {
		e.preventDefault();
		handleClose();
	  }
	};
  </script>
  
  <svelte:window on:keydown={onKeydown} />
  
  <!-- Overlay de tela inteira com fundo translúcido -->
  <div
	class="fixed inset-0 w-screen h-screen text-white flex justify-center items-center bg-black/50"
	transition:fade
	on:click={handleOverlayClick}
	role="button"
	tabindex="0"
	aria-label="Fechar"
	on:keydown={handleOverlayKey}
  >
	<!-- Painel do modal -->
	<div
	  bind:this={panelEl}
	  tabindex="-1"
	  role="dialog"
	  aria-modal="true"
	  aria-labelledby="modal-title"
	  class="bg-gray-900 text-white rounded-md px-8 py-10 relative w-[90vw] max-w-lg max-h-[85vh] overflow-auto shadow-xl"
	>
	  <h2 id="modal-title" class="sr-only">Janela de instruções</h2>
  
	  <button
		class="absolute top-2 right-3 text-4xl text-gray-300 hover:-translate-y-0.5 transition-transform"
		aria-label="Fechar"
		on:click={handleClose}
	  >&times;</button>
  
	  <slot />
	</div>
  </div>
  