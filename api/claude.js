/**
 * /api/claude.js — Proxy Vercel para Anthropic API
 *
 * SETUP:
 * 1. Coloque este arquivo em /api/claude.js no seu repositório Vercel
 * 2. Em Vercel Dashboard → Settings → Environment Variables, adicione:
 *    Nome: ANTHROPIC_API_KEY
 *    Valor: sua chave Anthropic (sk-ant-...)
 * 3. Redeploy
 */

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'ANTHROPIC_API_KEY nao configurada' });

  try {
    const upstream = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type':      'application/json',
        'x-api-key':         apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(req.body),
    });
    const data = await upstream.json();
    return res.status(upstream.status).json(data);
  } catch(e) {
    return res.status(500).json({ error: e.message });
  }
}
