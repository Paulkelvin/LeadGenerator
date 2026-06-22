const KEYS = {
  API_KEY: 'ch_api_key',
  LEADS: 'ch_leads',
};

export function getApiKey() {
  return localStorage.getItem(KEYS.API_KEY) || '';
}

export function setApiKey(key) {
  localStorage.setItem(KEYS.API_KEY, key);
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
