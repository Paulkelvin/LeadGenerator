// Vercel serverless proxy — forwards requests to Companies House API.
// The browser sends its Authorization header here; we relay it upstream.
// This sidesteps CORS without storing the API key server-side.
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  const { path } = req.query;
  const apiPath = Array.isArray(path) ? path.join('/') : (path || '');

  // Forward the raw query string as-is (preserves repeated params like sic_codes)
  const rawUrl = req.url || '';
  const qIndex = rawUrl.indexOf('?');
  const qs = qIndex >= 0 ? rawUrl.slice(qIndex + 1) : '';

  const targetUrl = `https://api.company-information.service.gov.uk/${apiPath}${qs ? '?' + qs : ''}`;

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
