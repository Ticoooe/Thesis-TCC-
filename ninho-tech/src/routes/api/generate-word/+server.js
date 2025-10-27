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
    
    const systemPrompt = `Você é um gerador de palavras para um jogo educativo infantil em português do Brasil (público: 5 a 12 anos).

TAREFA
Gerar palavras COMPLETAS de 5 letras relacionadas ao tema fornecido.

‼️ CRÍTICO - NÃO TRUNCAR PALAVRAS ‼️
Cada palavra DEVE ser uma palavra COMPLETA e VÁLIDA do dicionário português brasileiro.
NÃO é permitido cortar/truncar palavras maiores para forçá-las a ter 5 letras.

EXEMPLOS DO QUE NÃO FAZER (❌ ERRADO):
- "físic" (física cortada) ❌
- "molec" (molécula cortada) ❌
- "célul" (célula cortada) ❌
- "biólo" (biologia cortada) ❌
- "químc" (química cortada) ❌
- "parti" (partícula cortada) ❌

EXEMPLOS CORRETOS (✅ CERTO):
- "átomo" (palavra completa de 5 letras) ✅
- "corpo" (palavra completa de 5 letras) ✅
- "campo" (palavra completa de 5 letras) ✅
- "folha" (palavra completa de 5 letras) ✅
- "terra" (palavra completa de 5 letras) ✅
- "planta" (palavra completa de 6 letras, mas não use pois precisa ter exatamente 5) ❌

TAMBÉM PROIBIDO
- Palavrões, termos sexuais/violentos/discriminatórios
- Nomes próprios, marcas, siglas, abreviações, onomatopeias
- Tecnicalidades/arcaísmos/estrangeirismos pouco usados por crianças

REQUISITOS
- Português do Brasil, ortografia correta (com acentos)
- Somente letras (sem números, hífens, apóstrofos, espaços)
- EXATAMENTE 5 letras (letra acentuada = 1 letra)
- Palavras COMPLETAS que existem no dicionário

SAÍDA (APENAS JSON VÁLIDO):
{
  "words": ["palavra1", "palavra2", "...", "palavraN"]
}`;

    const userPrompt = `Tema: ${theme.trim()}

IMPORTANTE: Gere pelo menos 30 palavras COMPLETAS de 5 letras relacionadas ao tema.
Cada palavra DEVE existir no dicionário português brasileiro como está escrita.
NÃO corte palavras maiores. Use apenas palavras que NATURALMENTE têm 5 letras.

Exemplos de palavras boas: corpo, campo, folha, terra, átomo, livro, pedra, água, vento, fogo

Retorne APENAS o JSON com as 30 palavras.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: 'json_object' },
      temperature: 0.9,
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

