// const mem = new Map();
// const inFlight = new Map();

// export async function fetchDefinition(word) {
//   if (mem.has(word)) return mem.get(word);
//   if (inFlight.has(word)) return inFlight.get(word);

//   const p = (async () => {
//     const r = await fetch(`/api/definition?word=${encodeURIComponent(word)}`);
    
//     if (r.status === 429) {
//       const data = {
//         word,
//         definicao_curta: 'Definição indisponível no momento (limite da API atingido).',
//       };
//       mem.set(word, data);
//       return data;
//     }
//     if (!r.ok) {
//       const msg = (await r.json().catch(() => ({}))).error || 'Falha ao obter definição';
//       throw new Error(msg);
//     }
//     const data = await r.json();
//     mem.set(word, data);
//     return data;
//   })();

//   inFlight.set(word, p);
//   try { return await p; } finally { inFlight.delete(word); }
// }
