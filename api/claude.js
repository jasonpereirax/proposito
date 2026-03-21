/**
 * /api/claude.js — Proxy Vercel para a Anthropic API
 *
 * CONFIGURAÇÃO:
 * 1. Adicione no Vercel Dashboard → Settings → Environment Variables:
 *    ANTHROPIC_API_KEY = sua_chave_anthropic
 *
 * 2. Este arquivo deve estar em /api/claude.js na raiz do repositório.
 *
 * Por que isso é necessário:
 * A Anthropic API bloqueia chamadas diretas do browser (CORS policy).
 * Este proxy roda server-side no Vercel, repassa a requisição com a
 * API key segura na variável de ambiente, e devolve a resposta ao browser.
 */

export default async function handler(req, res) {
  // Só aceita POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // CORS — permite apenas o seu domínio em produção
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY não configurada no Vercel' });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method:  'POST',
      headers: {
        'Content-Type':      'application/json',
        'x-api-key':         apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    return res.status(200).json(data);

  } catch (err) {
    console.error('Proxy error:', err);
    return res.status(500).json({ error: err.message });
  }
}
