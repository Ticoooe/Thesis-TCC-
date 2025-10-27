import { json } from '@sveltejs/kit';

export async function GET({ url }) {
  try {
    const word = url.searchParams.get('word');
    
    if (!word || !word.trim()) {
      return json({ valid: false, error: 'Palavra não fornecida' }, { status: 400 });
    }

    const acadLetras = await fetch(
      `https://www.academia.org.br/ajax/abl/buscar-palavras?form=vocabulario&palavra=${encodeURIComponent(word.trim())}`
    );
    
    const data = await acadLetras.json();
    const isValid = data.rows && data.rows.length > 0;
        
    return json({ valid: isValid, word: word.trim() });
  } catch (error) {
    console.error('❌ [check-word] Erro ao verificar palavra:', error);
    return json({ valid: false, error: 'Erro ao verificar palavra' }, { status: 500 });
  }
}
