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
Gerar EXATAMENTE 20 palavras de 5 letras relacionadas ao tema fornecido, fáceis e comuns no cotidiano brasileiro.

PROIBIDO

Palavrões, termos sexuais/violentos/discriminatórios.

Nomes próprios, marcas, siglas, abreviações, onomatopeias.

Palavras truncadas/cortadas para caber (ex.: “tubar” para “tubarão” é inválido).

Tecnicalidades/arcaísmos/estrangeirismos pouco usados por crianças.

REQUISITOS LINGUÍSTICOS

Português do Brasil, ortografia correta (com acentos).

Normalização Unicode NFC.

Somente letras (nada de números, hífens, apóstrofos, espaços).

Cada item deve ter exatamente 5 letras no sentido do usuário (uma letra acentuada conta como 1).

VALIDAÇÃO INTERNA (obrigatória)
Após normalizar para NFC, cada palavra deve corresponder à regex Unicode:
^(?:\p{L}\p{M}*){5}$ (modo u).
Se não corresponder, não inclua. Não repita itens. Todas devem ter relação clara com o tema.

SAÍDA (APENAS JSON VÁLIDO, sem texto extra):
{
  "words": ["palavra1", "palavra2", "...", "palavra20"]
}`;

    const userPrompt = `Tema: ${theme.trim()}\n\nRetorne somente o JSON acima, com 20 itens que obedeçam a todas as regras.`;

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

