import OpenAI from 'openai';
import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

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

export async function POST({ request }) {
  try {
    const { theme } = await request.json();
    
    if (!theme || !theme.trim()) {
      return json({ error: 'Tema é obrigatório' }, { status: 400 });
    }

    const openai = getOpenAI();
    
    const systemPrompt = `
    Você é um gerador de palavras para um jogo educativo infantil em português do Brasil.
    Sua tarefa é gerar EXATAMENTE 15 palavras relacionadas ao tema fornecido.

    REGRAS IMPORTANTES:
    - Cada palavra deve ter EXATAMENTE 5 letras
    - Todas as palavras devem estar em PORTUGUÊS DO BRASIL
    - As palavras devem ser apropriadas para crianças e adolescentes
    - As palavras devem ser relacionadas ao tema fornecido
    - Evite palavras muito complexas ou técnicas
    - Retorne APENAS um JSON no formato: {"words": ["palavra1", "palavra2", ...]}
    `;

    const userPrompt = `Tema: ${theme.trim()}\n\n Gere 10 palavras de 5 letras relacionadas a este tema.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: 'json_object' },
      temperature: 0.7,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ]
    });

    const content = response.choices?.[0]?.message?.content || '{}';
    const data = JSON.parse(content);
    
    if (!data.words || !Array.isArray(data.words) || data.words.length === 0) {
      throw new Error('Formato de resposta inválido da IA');
    }

    // Filtrar apenas palavras com exatamente 5 letras
    const validWords = data.words
      .map(w => w.toLowerCase().trim())
      .filter(w => w.length === 5);

    if (validWords.length === 0) {
      throw new Error('Nenhuma palavra válida gerada');
    }

    console.log('🚀 [+server.js] Valid words:', validWords);
    // Selecionar uma palavra aleatoriamente
    const selectedWord = validWords[Math.floor(Math.random() * validWords.length)];

    console.log('🚀 [+server.js] Selected word:', selectedWord);
    return json({ 
      word: selectedWord.toUpperCase(),
      allWords: validWords,
      theme: theme.trim()
    });

  } catch (err) {
    const msg = err?.message || 'Erro ao gerar palavra';
    const status = /quota|rate|429/i.test(msg) ? 429 : 500;
    return json({ error: msg }, { status });
  }
}

