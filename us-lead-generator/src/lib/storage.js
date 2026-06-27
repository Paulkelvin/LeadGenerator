import {
  supabaseEnabled,
  saveLeads as dbSaveLeads,
  saveHistory as dbSaveHistory,
  saveSettings as dbSaveSettings,
} from './supabase';

const KEYS = {
  FILED_KEY: 'us_filed_api_key',
  LEADS: 'us_leads',
  HISTORY: 'us_search_history',
  DATASET_OVERRIDES: 'us_dataset_overrides',
};

export function getFiledKey() {
  return localStorage.getItem(KEYS.FILED_KEY) || '';
}
export function setFiledKey(k) {
  localStorage.setItem(KEYS.FILED_KEY, k);
}

export function getLeads() {
  try { return JSON.parse(localStorage.getItem(KEYS.LEADS) || '[]'); } catch { return []; }
}
export function saveLeads(arr) {
  localStorage.setItem(KEYS.LEADS, JSON.stringify(arr));
}

export function getSearchHistory() {
  try { return JSON.parse(localStorage.getItem(KEYS.HISTORY) || '[]'); } catch { return []; }
}
export function saveSearchHistory(arr) {
  localStorage.setItem(KEYS.HISTORY, JSON.stringify(arr));
}

export function getDatasetOverrides() {
  try { return JSON.parse(localStorage.getItem(KEYS.DATASET_OVERRIDES) || '{}'); } catch { return {}; }
}
export function saveDatasetOverrides(obj) {
  localStorage.setItem(KEYS.DATASET_OVERRIDES, JSON.stringify(obj));
}

export async function saveLeadsAsync(arr) {
  saveLeads(arr);
  if (supabaseEnabled) await dbSaveLeads(arr);
}

export async function saveHistoryAsync(arr) {
  saveSearchHistory(arr);
  if (supabaseEnabled) await dbSaveHistory(arr);
}

export async function saveSettingsAsync({ filedApiKey }) {
  if (filedApiKey !== undefined) setFiledKey(filedApiKey);
  if (supabaseEnabled) await dbSaveSettings({ filedApiKey: filedApiKey || '' });
}
