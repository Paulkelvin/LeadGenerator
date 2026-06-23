import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL || '';
const key = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabaseEnabled = !!(url && key);

export const supabase = supabaseEnabled ? createClient(url, key) : null;

export async function fetchAll() {
  const [settingsRes, leadsRes, historyRes] = await Promise.all([
    supabase.from('app_settings').select('*').eq('id', 1).single(),
    supabase.from('leads').select('data').eq('id', 1).single(),
    supabase.from('search_history').select('data').eq('id', 1).single(),
  ]);

  if (settingsRes.error) throw settingsRes.error;
  if (leadsRes.error) throw leadsRes.error;
  if (historyRes.error) throw historyRes.error;

  return {
    settings: settingsRes.data,
    leads: leadsRes.data.data || [],
    history: historyRes.data.data || [],
  };
}

export async function saveLeads(arr) {
  const { error } = await supabase
    .from('leads')
    .upsert({ id: 1, data: arr });
  if (error) { console.error('saveLeads:', error); throw error; }
}

export async function saveHistory(arr) {
  const { error } = await supabase
    .from('search_history')
    .upsert({ id: 1, data: arr });
  if (error) { console.error('saveHistory:', error); throw error; }
}

export async function saveSettings({ chApiKey, nzApiKey, hunterKey }) {
  const { error } = await supabase
    .from('app_settings')
    .upsert({ id: 1, ch_api_key: chApiKey, nz_api_key: nzApiKey, hunter_key: hunterKey, updated_at: new Date().toISOString() });
  if (error) { console.error('saveSettings:', error); throw error; }
}
