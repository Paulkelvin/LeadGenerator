export async function searchFiledState({ stateCode, apiKey, keyword, dateFrom, page = 1 }) {
  const params = new URLSearchParams({ state: stateCode, page: String(page) });
  if (keyword && keyword.trim()) params.set('q', keyword.trim());
  if (dateFrom) params.set('date_from', dateFrom);

  const isLocal =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

  const url = isLocal
    ? `https://filed.dev/api/v1/search?${params}`
    : `/api/filed-proxy?${params}`;

  const headers = { Accept: 'application/json' };
  if (isLocal) {
    headers['Authorization'] = `Bearer ${apiKey}`;
  } else {
    headers['X-Filed-Key'] = apiKey;
  }

  const res = await fetch(url, { headers });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Filed.dev (${stateCode}) ${res.status}: ${text || res.statusText}`);
  }
  const data = await res.json();

  return (data.results || data.data || data.businesses || []).map((r) => ({
    companyName: r.name || r.business_name || '',
    entityType: r.type || r.entity_type || '',
    formationDate: (r.filing_date || r.formation_date || '').split('T')[0],
    status: r.status || 'active',
    address: r.address || '',
    city: r.city || '',
    state: stateCode,
    zip: r.zip || r.postal_code || '',
    agentName: r.agent || r.registered_agent || '',
    _source: 'filed',
    _stateCode: stateCode,
    _id: `${stateCode}-${r.number || r.entity_number || r.name}-${r.filing_date || ''}`,
  }));
}
