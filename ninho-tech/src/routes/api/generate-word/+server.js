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
    
    const systemPrompt = `Você é um gerador de palavras para um jogo educativo infantil em português do Brasil.
    Sua tarefa é gerar EXATAMENTE 20 palavras de 5 letras relacionadas ao tema fornecido. 
    Essas palavras devem ser palavras válidas em português do Brasil e devem ser fáceis de entender para crianças e adolescentes. 
    Não retorne palavras que não sejam válidas em português do Brasil.
    O público alvo são crianças de 5 a 12 anos.

    REGRAS IMPORTANTES:
    - Cada palavra deve ter EXATAMENTE 5 letras
    - Todas as palavras devem estar em PORTUGUÊS DO BRASIL
    - As palavras devem ser apropriadas para crianças e adolescentes
    - As palavras devem ser relacionadas ao tema fornecido
    - Evite palavras muito complexas ou técnicas
    - Retorne EXATAMENTE 20 palavras no array
    - Retorne APENAS um JSON válido no formato: {"words": ["palavra1", "palavra2", "palavra3", ..., "palavra20"]}
    - NÃO adicione texto extra, apenas o JSON`;

    const userPrompt = `Tema: ${theme.trim()}\n\nGere EXATAMENTE 20 palavras de 5 letras relacionadas a este tema. Essas palavras devem ser palavras válidas em português do Brasil e devem ser fáceis de entender para crianças e adolescentes.`;

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
    
    console.log('📝 [+server.js] Palavras recebidas da IA:', data.words?.length || 0);
    
    if (!data.words || !Array.isArray(data.words) || data.words.length === 0) {
      throw new Error('Formato de resposta inválido da IA');
    }

    // Filtrar apenas palavras com exatamente 5 letras
    const validWords = data.words
      .map(w => w.toLowerCase().trim())
      .filter(w => w.length === 5);

    console.log('✅ [+server.js] Palavras válidas (5 letras):', validWords.length, '/', data.words.length);
    console.log('🔤 [+server.js] Palavras:', validWords);

    if (validWords.length === 0) {
      throw new Error('Nenhuma palavra válida gerada');
    }
    
    if (validWords.length < 10) {
      console.warn('⚠️  [+server.js] Menos de 10 palavras válidas geradas. Total:', validWords.length);
    }
    
    // Selecionar uma palavra aleatoriamente
    const selectedWord = validWords[Math.floor(Math.random() * validWords.length)];
    console.log('🎯 [+server.js] Palavra selecionada:', selectedWord.toUpperCase());
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

