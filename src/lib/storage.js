import {
  supabaseEnabled,
  saveLeads as dbSaveLeads,
  saveHistory as dbSaveHistory,
  saveSettings as dbSaveSettings,
} from './supabase';

const KEYS = {
  API_KEY: 'ch_api_key',
  NZ_API_KEY: 'nz_api_key',
  HUNTER_KEY: 'hunter_api_key',
  LEADS: 'ch_leads',
  SEARCH_HISTORY: 'lead_search_history',
};

// --- Synchronous localStorage functions (used for initial state seeding) ---

export function getApiKey() {
  return localStorage.getItem(KEYS.API_KEY) || __CH_API_KEY__ || '';
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

export function getSearchHistory() {
  try {
    return JSON.parse(localStorage.getItem(KEYS.SEARCH_HISTORY) || '[]');
  } catch {
    return [];
  }
}

export function saveSearchHistory(entries) {
  localStorage.setItem(KEYS.SEARCH_HISTORY, JSON.stringify(entries));
}

export function addSearchHistory(entry) {
  const history = getSearchHistory();
  const updated = [entry, ...history].slice(0, 25);
  saveSearchHistory(updated);
  return updated;
}

// --- Async dual-mode functions (write to Supabase + localStorage cache) ---

export async function saveLeadsAsync(arr) {
  saveLeads(arr);
  if (supabaseEnabled) await dbSaveLeads(arr);
}

export async function saveHistoryAsync(arr) {
  saveSearchHistory(arr);
  if (supabaseEnabled) await dbSaveHistory(arr);
}

export async function saveSettingsAsync({ chApiKey, nzApiKey, hunterKey }) {
  if (chApiKey !== undefined) setApiKey(chApiKey);
  if (nzApiKey !== undefined) setNzApiKey(nzApiKey);
  if (hunterKey !== undefined) setHunterKey(hunterKey);
  if (supabaseEnabled) {
    await dbSaveSettings({
      chApiKey: chApiKey || '',
      nzApiKey: nzApiKey || '',
      hunterKey: hunterKey || '',
    });
  }
}

export async function addSearchHistoryAsync(entry) {
  const history = getSearchHistory();
  const updated = [entry, ...history].slice(0, 25);
  await saveHistoryAsync(updated);
  return updated;
}
