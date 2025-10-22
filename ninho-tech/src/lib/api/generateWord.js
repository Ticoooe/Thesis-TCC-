const cache = new Map();
const inFlight = new Map();

export async function generateWordFromTheme(theme) {
  const cacheKey = theme.toLowerCase().trim();
  
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }
  
  if (inFlight.has(cacheKey)) {
    return inFlight.get(cacheKey);
  }

  const p = (async () => {
    const response = await fetch('/api/generate-word', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ theme }),
    });
    
    if (response.status === 429) {
      throw new Error('Limite da API atingido. Tente novamente em alguns instantes.');
    }
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || 'Falha ao gerar palavra');
    }
    
    const data = await response.json();
    cache.set(cacheKey, data);
    return data;
  })();

  inFlight.set(cacheKey, p);
  try {
    return await p;
  } finally {
    inFlight.delete(cacheKey);
  }
}

