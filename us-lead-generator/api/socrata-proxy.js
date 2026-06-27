export default async function handler(req, res) {
  const { endpoint, ...queryParams } = req.query;
  if (!endpoint) {
    return res.status(400).json({ error: 'endpoint parameter required' });
  }

  const allowed = [
    'data.colorado.gov',
    'data.oregon.gov',
    'data.ct.gov',
  ];
  let url;
  try {
    url = new URL(endpoint);
  } catch {
    return res.status(400).json({ error: 'Invalid endpoint URL' });
  }
  if (!allowed.includes(url.hostname)) {
    return res.status(403).json({ error: 'Endpoint not allowed' });
  }

  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(queryParams)) {
    params.set(k, v);
  }

  const fetchUrl = `${endpoint}?${params}`;
  try {
    const upstream = await fetch(fetchUrl, {
      headers: { Accept: 'application/json' },
    });
    const data = await upstream.json();
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
    res.status(upstream.status).json(data);
  } catch (err) {
    res.status(502).json({ error: 'Upstream unreachable', message: err.message });
  }
}
