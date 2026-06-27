import { SOCRATA_STATES } from '../data/states';

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
}

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

  const params = new URLSearchParams({
    '$limit': String(limit),
    '$offset': String(offset),
    '$order': `${cfg.dateField} DESC`,
  });
  if (clauses.length) params.set('$where', clauses.join(' AND '));

  return `${endpoint}?${params}`;
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
    _source: 'socrata',
    _stateCode: stateCode,
    _id: `${stateCode}-${row[f.name]}-${rawDate}`,
  };
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
  return data.map((r) => normalizeRow(r, stateCode));
}
