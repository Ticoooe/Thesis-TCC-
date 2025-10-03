import OpenAI from 'openai';
import { json } from '@sveltejs/kit';
import { OPENAI_API_KEY } from '$env/dynamic/private';

// cache em memória (ok para 1 instância; em produção distribuída use KV/Redis)
const cache = new Map();    // word -> payload
const inFlight = new Map(); // word -> Promise

const ONLY_LETTERS_5 = /^[\p{L}]{5}$/u;

const openai = new OpenAI({ 
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: OPENAI_API_KEY,
});

async function callOpenAI(word) {
  console.log('callOpenAI', word);
  const sys = `
  Você é um explicador de palavras em português do Brasil, com tom leve, acolhedor e curioso — pensado para o público do Grupo Ninho (crianças, adolescentes e suas famílias).
  Explique de forma simples, sem formalidade excessiva nem jargões.

  RETORNE APENAS JSON com as chaves:
  - "definicao_curta": 1-2 frases, até ~50 palavras. Sem tautologia (não defina usando a própria palavra).
  - "exemplos": array com 2 frases curtas e naturais usando a palavra no cotidiano (escola, casa, amigos).
  - "sinonimos": 3-6 itens comuns (se não houver, retorne []).
  - "observacoes": 1 frase opcional com curiosidade, variação regional OU dica rápida. Pode usar a quantidade de emojis que quiser e aonde achar que é mais apropriado 🙂.

  Regras:
  - Escreva em pt-BR, claro e gentil.
  - Evite termos sensíveis, ofensivos ou muito técnicos.
  - Não ultrapasse ~100 palavras no total da resposta.
  `;

  const user = `Palavra: ${word}`;

  let attempt = 0;
  // até 5 tentativas com backoff exponencial simples
  // respeitando Retry-After quando existir
    try {
      const r = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        response_format: { type: 'json_object' },
        temperature: 0.3,
        messages: [
          { role: 'system', content: sys },
          { role: 'user', content: user }
        ]
      });
      const content = r.choices?.[0]?.message?.content || '{}';
      return JSON.parse(content);
    } catch (e) {
      const status = e?.status || e?.response?.status;
      const retryAfterSec =
        Number(e?.response?.headers?.get?.('retry-after')) ||
        Number(e?.headers?.['retry-after']) || 0;

      // se não for 429/503, propaga
       if (!(status === 429 || status === 503)) throw e;

      attempt++;
      if (attempt > 4) throw e;

      const backoff = retryAfterSec ? retryAfterSec * 1000 : Math.min(1000 * 2 ** attempt, 8000);
      await new Promise((r) => setTimeout(r, backoff));
    }
}

export async function GET({ url, setHeaders }) {
  try {
    const raw = String(url.searchParams.get('word') || '').trim();
    if (!ONLY_LETTERS_5.test(raw)) {
      return json({ error: 'Palavra inválida (5 letras)' }, { status: 400 });
    }

    const word = raw; // mantenha acentos aqui se quiser exibir bonito

    // 1) cache hit
    if (cache.has(word)) {
      setHeaders({ 'Cache-Control': 'public, max-age=3600' });
      return json({ word, ...cache.get(word) });
    }

    // 2) dedup: se já tem chamada em andamento pra mesma palavra
    if (inFlight.has(word)) {
      const data = await inFlight.get(word);
      setHeaders({ 'Cache-Control': 'public, max-age=3600' });
      return json({ word, ...data });
    }

    const p = callOpenAI(word)
      .then((data) => {
        cache.set(word, data);
        inFlight.delete(word);
        return data;
      })
      .catch((err) => {
        inFlight.delete(word);
        throw err;
      });

    inFlight.set(word, p);
    const data = await p;

    setHeaders({ 'Cache-Control': 'public, max-age=3600' });
    return json({ word, ...data });
  } catch (e) {
    const status = e?.status || e?.response?.status || 500;
    const msg = e?.message || 'Erro ao obter definição';
    return json({ error: msg }, { status });
  }
}
