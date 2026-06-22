const BASE_URL = 'https://api.company-information.service.gov.uk';

function makeAuthHeader(apiKey) {
  return 'Basic ' + btoa(apiKey + ':');
}

export async function searchCompanies({ apiKey, sicCodes, incorporatedFrom, location, startIndex = 0, size = 20 }) {
  const headers = {
    Authorization: makeAuthHeader(apiKey),
    'Content-Type': 'application/json',
  };

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

  const url = `${BASE_URL}/advanced-search/companies?${params.toString()}`;

  const res = await fetch(url, { headers });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`API error ${res.status}: ${text || res.statusText}`);
  }

  const data = await res.json();
  return data;
}

export async function getCompanyProfile(apiKey, companyNumber) {
  const headers = { Authorization: makeAuthHeader(apiKey) };
  const res = await fetch(`${BASE_URL}/company/${companyNumber}`, { headers });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}
