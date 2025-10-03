<script>
  import { fade } from "svelte/transition";
</script>

<div class="flex flex-col gap-2" transition:fade>
  <p>
    Bem-vindo ao <span class="font-bold">Ninho de Letras</span> — um jogo do
    <span class="font-bold">Grupo Ninho</span> para fortalecer vocabulário, leitura e diversão em comunidade.
  </p>

  <p class="mt-1">
    Adivinhe a palavra do dia em <span class="font-bold">seis tentativas</span>.
    Cada palpite deve ser uma <span class="font-bold">palavra válida de cinco letras</span>.
  </p>

  <p>
    Após cada palpite, a cor dos blocos mostra o quão perto você chegou:
  </p>

  <div class="border-[0.5px] my-2 border-gray-100"></div>

  <p class="font-bold">Exemplos</p>

  <p>
    A letra <span class="font-bold">C</span> está na palavra e na posição correta.
  </p>
  <div class="flex gap-1 mb-4">
    <div class="w-14 h-14 flex items-center justify-center border-2 bg-green-600">
      <span class="text-4xl font-bold text-white">C</span>
    </div>
    <div class="w-14 h-14 flex items-center justify-center border-2 border-gray-600">
      <span class="text-4xl font-bold">A</span>
    </div>
    <div class="w-14 h-14 flex items-center justify-center border-2 border-gray-600">
      <span class="text-4xl font-bold">L</span>
    </div>
    <div class="w-14 h-14 flex items-center justify-center border-2 border-gray-600">
      <span class="text-4xl font-bold">D</span>
    </div>
    <div class="w-14 h-14 flex items-center justify-center border-2 border-gray-600">
      <span class="text-4xl font-bold">O</span>
    </div>
  </div>

  <p>
    A letra <span class="font-bold">I</span> está na palavra, mas na posição errada.
  </p>
  <div class="flex gap-1 mb-4">
    <div class="w-14 h-14 flex items-center justify-center border-2 border-gray-600">
      <span class="text-4xl font-bold">T</span>
    </div>
    <div class="w-14 h-14 flex items-center justify-center border-2 bg-yellow-500">
      <span class="text-4xl font-bold text-white">I</span>
    </div>
    <div class="w-14 h-14 flex items-center justify-center border-2 border-gray-600">
      <span class="text-4xl font-bold">N</span>
    </div>
    <div class="w-14 h-14 flex items-center justify-center border-2 border-gray-600">
      <span class="text-4xl font-bold">T</span>
    </div>
    <div class="w-14 h-14 flex items-center justify-center border-2 border-gray-600">
      <span class="text-4xl font-bold">A</span>
    </div>
  </div>

  <p>
    A letra <span class="font-bold">U</span> não está na palavra em nenhuma posição.
  </p>
  <div class="flex gap-1 mb-4">
    <div class="w-14 h-14 flex items-center justify-center border-2 border-gray-600">
      <span class="text-4xl font-bold">V</span>
    </div>
    <div class="w-14 h-14 flex items-center justify-center border-2 border-gray-600">
      <span class="text-4xl font-bold">A</span>
    </div>
    <div class="w-14 h-14 flex items-center justify-center border-2 border-gray-600">
      <span class="text-4xl font-bold">C</span>
    </div>
    <div class="w-14 h-14 flex items-center justify-center border-2 bg-gray-600">
      <span class="text-4xl font-bold text-white">U</span>
    </div>
    <div class="w-14 h-14 flex items-center justify-center border-2 border-gray-600">
      <span class="text-4xl font-bold">O</span>
    </div>
  </div>

  <div class="border-[0.5px] my-2 border-gray-100"></div>

  <p class="font-bold">
    Um novo <span class="font-bold">Ninho de Letras</span> fica disponível todos os dias.
  </p>
  <p class="text-sm text-gray-600">
    Dica do Grupo Ninho: jogue em roda com amigos, turma ou família.
    <br/>
    Boa Sorte!
  </p>
</div>
