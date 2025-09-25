import fs from 'node:fs/promises';
import path from 'node:path';
import OpenAI from 'openai';

// ajuste o caminho conforme seu projeto
import answers from '../src/lib/utils/answers.js';

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const OUT_PATH = path.resolve('static/defs-pt.json');

// prompt curto e barato
const SYSTEM = `Explique palavras em português-BR.
Responda em JSON com as chaves: "definicao_curta".
Use até ~100 palavras no total. Seja simples e acolhedor.`;

async function loadExisting() {
  try {
    const buf = await fs.readFile(OUT_PATH, 'utf8');
    return JSON.parse(buf);
  } catch {
    return {};
  }
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function defineWord(word) {
  // até 3 tentativas leves para 429/503
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const r = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        response_format: { type: 'json_object' },
        temperature: 0.2,
        messages: [
          { role: 'system', content: SYSTEM },
          { role: 'user', content: `Palavra: ${word}\nRegras: não use tautologia; 2 exemplos curtos.` }
        ],
        // opcional: limite a saída
        max_tokens: 200
      });
      const content = r.choices?.[0]?.message?.content || '{}';
      return JSON.parse(content);
    } catch (e) {
      const status = e?.status || e?.response?.status;
      const retryAfter =
        Number(e?.response?.headers?.get?.('retry-after')) ||
        Number(e?.headers?.['retry-after']) || 0;
      if (!(status === 429 || status === 503)) throw e;
      const backoff = retryAfter ? retryAfter * 1000 : (1000 * 2 ** attempt);
      await sleep(backoff);
    }
  }
  throw new Error(`Falha ao definir "${word}" após retries`);
}

async function main() {
  const defs = await loadExisting();
  let done = 0;

  for (const w of answers) {
    const word = (w || '').normalize('NFC').toUpperCase();
    if (word.length !== 5) continue;

    if (defs[word]) {
      done++;
      continue; // já definido (resume)
    }

    console.log(`Definindo: ${word}`);
    const d = await defineWord(word);

    defs[word] = {
      definicao_curta: d.definicao_curta || '',
      exemplos: Array.isArray(d.exemplos) ? d.exemplos.slice(0, 2) : [],
      sinonimos: Array.isArray(d.sinonimos) ? d.sinonimos.slice(0, 6) : [],
      observacoes: d.observacoes || ''
    };

    // grava incrementalmente para permitir retomada
    await fs.writeFile(OUT_PATH, JSON.stringify(defs, null, 2), 'utf8');

    done++;
    // pausa curta para não saturar rate limit
    await sleep(150);
  }

  console.log(`Concluído. ${done} palavras processadas. Saída: ${OUT_PATH}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
