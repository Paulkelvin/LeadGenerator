// Vercel serverless proxy for the NZ NZBN API.
// Browser sends the NZBN key as X-Nzbn-Key; we forward it as
// Ocp-Apim-Subscription-Key to the upstream API.
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-Nzbn-Key');

  if (req.method === 'OPTIONS') return res.status(204).end();

  const rawUrl = req.url || '';
  const urlObj = new URL(rawUrl, 'http://localhost');
  const endpoint = urlObj.searchParams.get('endpoint') || '/';
  urlObj.searchParams.delete('endpoint');

  const targetUrl =
    `https://api.business.govt.nz/gateway/nzbn/v5${endpoint}` +
    (urlObj.search ? urlObj.search : '');

  const nzbnKey = req.headers['x-nzbn-key'] || '';

  try {
    const upstream = await fetch(targetUrl, {
      headers: {
        'Ocp-Apim-Subscription-Key': nzbnKey,
        Accept: 'application/json',
      },
    });
    const body = await upstream.text();
    res.setHeader('Content-Type', 'application/json');
    return res.status(upstream.status).send(body);
  } catch (err) {
    return res.status(502).json({ error: err.message });
  }
}
