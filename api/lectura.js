// api/lectura.js — Función de Vercel que pide la lectura a Claude.
// La clave va en Vercel como ANTHROPIC_API_KEY (Settings → Environment Variables).

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Falta ANTHROPIC_API_KEY en Vercel' });
  }

  const prompt = (req.body && req.body.prompt) || '';
  if (typeof prompt !== 'string' || prompt.length < 20 || prompt.length > 6000) {
    return res.status(400).json({ error: 'Pedido inválido' });
  }

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await r.json();
    if (!r.ok) {
      console.error('Anthropic error', r.status, JSON.stringify(data));
      return res.status(502).json({ error: 'El servicio no respondió' });
    }

    const text = (data.content && data.content[0] && data.content[0].text) || '';
    return res.status(200).json({ text });
  } catch (e) {
    console.error('Fallo de conexión', e);
    return res.status(500).json({ error: 'Fallo de conexión' });
  }
}
