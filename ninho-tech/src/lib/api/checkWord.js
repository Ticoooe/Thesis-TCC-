const cache = new Map();
const inFlight = new Map();

export async function checkWord(word) {
    if (cache.has(word)) return cache.get(word);
    if (inFlight.has(word)) return inFlight.get(word);
    
    const p = (async () => {
        const response = await fetch(`/api/check-word?word=${encodeURIComponent(word)}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        
        if (!response.ok) {
            console.error('❌ [checkWord] Erro na resposta:', response.status);
            return false;
        }
        
        const data = await response.json();
        return data.valid || false;
    })();
    
    inFlight.set(word, p);
    try {
        const result = await p;
        cache.set(word, result);
        return result;
    } finally {
        inFlight.delete(word);
    }
}