import { SOCRATA_STATES } from '../data/states';

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
}

const isLocal =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

export function buildQuery({ stateCode, dateFrom, dateTo, entityType, keyword, city, offset = 0, limit = 50, endpointOverride }) {
  const cfg = SOCRATA_STATES[stateCode];
  const endpoint = endpointOverride || cfg.endpoint;
  const clauses = [];

  if (dateFrom) clauses.push(`${cfg.dateField} >= '${dateFrom}T00:00:00.000'`);
  if (dateTo)   clauses.push(`${cfg.dateField} <= '${dateTo}T23:59:59.999'`);
  if (entityType && entityType !== 'all' && cfg.fields.type) {
    clauses.push(`${cfg.fields.type} = '${entityType}'`);
  }
  if (keyword && keyword.trim()) {
    clauses.push(`upper(${cfg.nameField}) like upper('%${keyword.trim().replace(/'/g, "''")}%')`);
  }
  if (city && city.trim() && cfg.cityField) {
    clauses.push(`upper(${cfg.cityField}) like upper('%${city.trim().replace(/'/g, "''")}%')`);
  }

  const queryParams = new URLSearchParams({
    '$limit': String(limit),
    '$offset': String(offset),
    '$order': `${cfg.dateField} DESC`,
  });
  if (clauses.length) queryParams.set('$where', clauses.join(' AND '));

  if (isLocal) {
    return `${endpoint}?${queryParams}`;
  }

  const proxyParams = new URLSearchParams({ endpoint });
  for (const [k, v] of queryParams.entries()) {
    proxyParams.set(k, v);
  }
  return `/api/socrata-proxy?${proxyParams}`;
}

export function normalizeRow(row, stateCode) {
  const cfg = SOCRATA_STATES[stateCode];
  const f = cfg.fields;
  const agentName = f.agentFn
    ? f.agentFn(row)
    : (f.agent ? row[f.agent] || '' : '');
  const rawDate = row[f.date] || '';
  return {
    companyName: (row[f.name] || '').trim(),
    entityType: row[f.type] || '',
    formationDate: rawDate.split('T')[0],
    status: f.status ? (row[f.status] || 'active') : 'active',
    address: row[f.address] || '',
    city: row[f.city] || '',
    state: stateCode,
    zip: row[f.zip] || '',
    agentName,
    email: f.email ? row[f.email] || '' : '',
    naicsCode: f.naics ? row[f.naics] || '' : '',
    county: f.county ? row[f.county] || '' : '',
    jurisdiction: f.jurisdiction ? row[f.jurisdiction] || '' : '',
    ceo: f.ceo ? row[f.ceo] || '' : '',
    _source: 'socrata',
    _stateCode: stateCode,
    _id: `${stateCode}-${row[f.name]}-${rawDate}`,
  };
}

function deduplicateByName(rows) {
  const seen = new Map();
  for (const row of rows) {
    if (!seen.has(row.companyName)) {
      seen.set(row.companyName, row);
    }
  }
  return [...seen.values()];
}

export async function searchState({ stateCode, endpointOverride, ...filters }) {
  const url = buildQuery({ stateCode, endpointOverride, ...filters });
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`${SOCRATA_STATES[stateCode].name} API ${res.status}: ${text || res.statusText}`);
  }
  const data = await res.json();
  if (!Array.isArray(data)) throw new Error(`${SOCRATA_STATES[stateCode].name}: unexpected response`);
  const rows = data.map((r) => normalizeRow(r, stateCode));
  return deduplicateByName(rows);
}
