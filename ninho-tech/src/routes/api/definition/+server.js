import OpenAI from 'openai';
import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

// cache em memória (ok para 1 instância; em produção distribuída use KV/Redis)
const cache = new Map();    // word -> payload
const inFlight = new Map(); // word -> Promise

function getOpenAI() {
  const apiKey = env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY não configurada');
  }
  return new OpenAI({ 
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: apiKey,
  });
}

async function callOpenAI(word) {
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

  const openai = getOpenAI();
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
}

export async function GET({ url, setHeaders }) {
  try {
    const word = String(url.searchParams.get('word') || '').trim();
    
    if (!/[\p{L}]{5}/u.test(word)) {
      return json({ error: 'Palavra inválida (5 letras)' }, { status: 400 });
    }

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
  } catch (err) {
    const msg = err?.message || 'internal error';
    const status = /quota|rate|429/i.test(msg) ? 429 : 500;
    return json({ error: msg }, { status });
  }
}

