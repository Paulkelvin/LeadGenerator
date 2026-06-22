const isLocal =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

function makeAuthHeader(apiKey) {
  return 'Basic ' + btoa(apiKey + ':');
}

// In dev: hit Companies House directly.
// In production: route through /api/proxy to avoid CORS.
function buildUrl(endpoint, params) {
  const qs = params ? `?${params}` : '';
  if (isLocal) {
    return `https://api.company-information.service.gov.uk${endpoint}${qs}`;
  }
  return `/api/proxy?endpoint=${encodeURIComponent(endpoint)}${params ? '&' + params : ''}`;
}

export async function searchCompanies({
  apiKey,
  sicCodes,
  incorporatedFrom,
  location,
  startIndex = 0,
  size = 20,
}) {
  const params = new URLSearchParams({
    company_status: 'active',
    size: String(size),
    start_index: String(startIndex),
  });

  if (sicCodes && sicCodes.length > 0) {
    sicCodes.forEach((code) => params.append('sic_codes', code));
  }
  if (incorporatedFrom) {
    params.set('incorporated_from', incorporatedFrom);
  }
  if (location && location.trim()) {
    params.set('location', location.trim());
  }

  const url = buildUrl('/advanced-search/companies', params.toString());

  const res = await fetch(url, {
    headers: { Authorization: makeAuthHeader(apiKey) },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`API error ${res.status}: ${text || res.statusText}`);
  }

  return res.json();
}

export async function getOfficers(apiKey, companyNumber) {
  const url = buildUrl(`/company/${companyNumber}/officers`, '');

  const res = await fetch(url, {
    headers: { Authorization: makeAuthHeader(apiKey) },
  });

  if (!res.ok) throw new Error(`Officers API error ${res.status}`);

  const data = await res.json();
  return (data.items || []).filter((o) => !o.resigned_on);
}
