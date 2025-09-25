import { svelte } from '@sveltejs/vite-plugin-svelte';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, loadEnv } from 'vite';
import OpenAI from 'openai';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      tailwindcss(),
      svelte(),
      {
        name: 'dev-definition-endpoint',
        configureServer(server) {
          server.middlewares.use('/api/definition', async (req, res) => {
            try {
              if (req.method !== 'GET') {
                res.statusCode = 405;
                res.setHeader('Content-Type', 'application/json'); 
                res.end(JSON.stringify({ error: 'Method not allowed' }));
                return;
              }

              const apiKey = env.OPENAI_API_KEY || process.env.OPENAI_API_KEY;
              if (!apiKey) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'OPENAI_API_KEY não configurada (.env ou ambiente)' }));
                return;
              }

              const url = new URL(req.url || '', 'http://localhost');
              const word = String(url.searchParams.get('word') || '').trim();
              if (!/[\p{L}]{5}/u.test(word)) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'Palavra inválida (5 letras)' }));
                return;
              }

              const openai = new OpenAI({
                baseURL: "https://openrouter.ai/api/v1",
                apiKey: apiKey,
              });
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

              try {
                const r = await openai.chat.completions.create({
                  model: "gpt-4o-mini",
                  response_format: { type: 'json_object' },
                  temperature: 0.3,
                  messages: [
                    { role: 'system', content: sys },
                    { role: 'user', content: user }
                  ],
                });

                const payload = { word, ...(JSON.parse(r.choices?.[0]?.message?.content || '{}')) };
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.setHeader('Cache-Control', 'public, max-age=3600');
                res.end(JSON.stringify(payload));
              } catch (err) {
                const msg = err?.message || 'internal error';
                const status = /quota|rate|429/i.test(msg) ? 429 : 500;
                res.statusCode = status;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: msg }));
              }
            } catch (e) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: e?.message || 'internal error' }));
            }
          });
        }
      }
    ],
  };
});
