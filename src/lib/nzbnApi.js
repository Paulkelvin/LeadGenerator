const NZBN_BASE = 'https://api.business.govt.nz/gateway/nzbn/v5';

const isLocal =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

function buildUrl(endpoint, params) {
  const qs = params ? `?${params}` : '';
  if (isLocal) return `${NZBN_BASE}${endpoint}${qs}`;
  return `/api/nzbn?endpoint=${encodeURIComponent(endpoint)}${params ? '&' + params : ''}`;
}

// Normalise NZBN entity into the same shape the app uses for CH companies
function normalise(entity) {
  const addr = entity.phyAddress || entity.mailAddress || {};
  return {
    company_name: entity.entityName || '',
    company_number: entity.nzbn || '',
    date_of_creation: (entity.registrationDate || '').split('T')[0],
    registered_office_address: {
      address_line_1: addr.address1 || '',
      address_line_2: addr.address2 || '',
      locality: addr.address3 || '',
      region: addr.address4 || '',
      postal_code: addr.postCode || '',
      country: 'New Zealand',
    },
    sic_codes: (entity.classifications || []).map((c) => c.classificationCode),
    company_status: (entity.entityStatusCode || 'registered').toLowerCase(),
    _country: 'nz',
  };
}

export async function searchNZCompanies({
  apiKey,
  sicCodes,
  incorporatedFrom,
  incorporatedTo,
  location,
  startIndex = 0,
  size = 20,
}) {
  const pageNumber = Math.floor(startIndex / size) + 1;

  const params = new URLSearchParams({
    'entity-type': 'COMPANY',
    'entity-status': 'REGISTERED',
    'page-size': String(size),
    'page-number': String(pageNumber),
  });

  if (incorporatedFrom) params.set('registration-date-start', incorporatedFrom);
  if (incorporatedTo) params.set('registration-date-end', incorporatedTo);
  if (location && location.trim()) params.set('search-term', location.trim());
  if (sicCodes && sicCodes.length > 0) params.set('classification', sicCodes.join(','));

  const url = buildUrl('/entities', params.toString());

  const headers = { Accept: 'application/json' };
  if (isLocal) {
    headers['Ocp-Apim-Subscription-Key'] = apiKey;
  } else {
    headers['X-Nzbn-Key'] = apiKey;
  }

  const res = await fetch(url, { headers });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`NZBN API error ${res.status}: ${text || res.statusText}`);
  }

  const data = await res.json();

  return {
    items: (data.items || []).map(normalise),
    hits: data.totalItems || 0,
    total_results: data.totalItems || 0,
  };
}
