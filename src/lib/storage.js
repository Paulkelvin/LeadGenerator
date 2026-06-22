const KEYS = {
  API_KEY: 'ch_api_key',
  NZ_API_KEY: 'nz_api_key',
  HUNTER_KEY: 'hunter_api_key',
  LEADS: 'ch_leads',
};

export function getApiKey() {
  return localStorage.getItem(KEYS.API_KEY) || '';
}

export function setApiKey(key) {
  localStorage.setItem(KEYS.API_KEY, key);
}

export function getNzApiKey() {
  return localStorage.getItem(KEYS.NZ_API_KEY) || '';
}

export function setNzApiKey(key) {
  localStorage.setItem(KEYS.NZ_API_KEY, key);
}

export function getHunterKey() {
  return localStorage.getItem(KEYS.HUNTER_KEY) || '';
}

export function setHunterKey(key) {
  localStorage.setItem(KEYS.HUNTER_KEY, key);
}

export function getLeads() {
  try {
    return JSON.parse(localStorage.getItem(KEYS.LEADS) || '[]');
  } catch {
    return [];
  }
}

export function saveLeads(leads) {
  localStorage.setItem(KEYS.LEADS, JSON.stringify(leads));
}
