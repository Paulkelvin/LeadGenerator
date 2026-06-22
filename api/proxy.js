// Vercel serverless proxy — relays Companies House API requests.
// The browser passes its Authorization header; we forward it upstream.
// No API key is stored server-side.
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization');

  if (req.method === 'OPTIONS') return res.status(204).end();

  // Extract the CH endpoint path from ?endpoint=... and forward remaining params
  const rawUrl = req.url || '';
  const urlObj = new URL(rawUrl, 'http://localhost');
  const endpoint = urlObj.searchParams.get('endpoint') || '/';
  urlObj.searchParams.delete('endpoint');

  const targetUrl =
    `https://api.company-information.service.gov.uk${endpoint}` +
    (urlObj.search ? urlObj.search : '');

  try {
    const upstream = await fetch(targetUrl, {
      headers: {
        Authorization: req.headers.authorization || '',
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
