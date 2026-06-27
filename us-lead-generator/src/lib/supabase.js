import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL || '';
const key = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabaseEnabled = !!(url && key);
export const supabase = supabaseEnabled ? createClient(url, key) : null;

export async function fetchAll() {
  const [settingsRes, leadsRes, historyRes] = await Promise.all([
    supabase.from('us_app_settings').select('*').eq('id', 1).single(),
    supabase.from('us_leads').select('data').eq('id', 1).single(),
    supabase.from('us_search_history').select('data').eq('id', 1).single(),
  ]);
  const notFound = (e) => e?.code === 'PGRST116';
  if (settingsRes.error && !notFound(settingsRes.error)) throw settingsRes.error;
  if (leadsRes.error && !notFound(leadsRes.error)) throw leadsRes.error;
  if (historyRes.error && !notFound(historyRes.error)) throw historyRes.error;
  return {
    settings: settingsRes.data ?? {},
    leads: leadsRes.data?.data ?? [],
    history: historyRes.data?.data ?? [],
  };
}

export async function saveLeads(arr) {
  const { error } = await supabase.from('us_leads').upsert({ id: 1, data: arr });
  if (error) throw error;
}

export async function saveHistory(arr) {
  const { error } = await supabase.from('us_search_history').upsert({ id: 1, data: arr });
  if (error) throw error;
}

export async function saveSettings({ filedApiKey }) {
  const { error } = await supabase.from('us_app_settings').upsert({
    id: 1,
    filed_api_key: filedApiKey || '',
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
}
