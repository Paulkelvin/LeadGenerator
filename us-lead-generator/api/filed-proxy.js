export default async function handler(req, res) {
  const apiKey = req.headers['x-filed-key'];
  if (!apiKey) {
    return res.status(401).json({ error: 'No Filed.dev API key provided' });
  }

  const { state, q, page, date_from } = req.query;
  if (!state) {
    return res.status(400).json({ error: 'state parameter required' });
  }

  const params = new URLSearchParams({ state });
  if (q) params.set('q', q);
  if (page) params.set('page', page);
  if (date_from) params.set('date_from', date_from);

  try {
    const upstream = await fetch(`https://filed.dev/api/v1/search?${params}`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: 'application/json',
      },
    });
    const data = await upstream.json();
    res.status(upstream.status).json(data);
  } catch (err) {
    res.status(502).json({ error: 'Filed.dev unreachable', message: err.message });
  }
}
