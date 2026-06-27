import { useState, useEffect, useRef } from 'react';
import { Flag } from 'lucide-react';
import SearchFilters from './components/SearchFilters';
import ResultsTable from './components/ResultsTable';
import LeadsPanel from './components/LeadsPanel';
import HistoryPanel from './components/HistoryPanel';
import SettingsPanel from './components/SettingsPanel';
import { searchState } from './lib/socrataApi';
import { searchFiledState } from './lib/filedApi';
import { SOCRATA_STATES, FILED_STATES } from './data/states';
import {
  getFiledKey,
  getLeads,
  getSearchHistory,
  getDatasetOverrides,
  saveLeadsAsync,
  saveHistoryAsync,
  saveSettingsAsync,
} from './lib/storage';
import { supabaseEnabled, fetchAll } from './lib/supabase';

const FILED_CODES = new Set(FILED_STATES.map((s) => s.code));
const FETCH_LIMIT = 200;

export default function App() {
  const [tab, setTab] = useState('search');
  const [filedApiKey, setFiledApiKey] = useState('');
  const [results, setResults] = useState([]);
  const [leads, setLeads] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [stateErrors, setStateErrors] = useState({});
  const [loadingStates, setLoadingStates] = useState([]);
  const [dbReady, setDbReady] = useState(false);

  const lastFiltersRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    async function boot() {
      let key = getFiledKey();
      let savedLeads = getLeads();
      let savedHistory = getSearchHistory();

      if (supabaseEnabled) {
        const timer = new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 5000));
        try {
          const { settings, leads: dbLeads, history: dbHistory } = await Promise.race([
            fetchAll(),
            timer,
          ]);
          if (!cancelled) {
            if (settings?.filed_api_key) key = settings.filed_api_key;
            if (dbLeads?.length) savedLeads = dbLeads;
            if (dbHistory?.length) savedHistory = dbHistory;
          }
        } catch {
          // fallback to localStorage
        }
      }

      if (!cancelled) {
        setFiledApiKey(key);
        setLeads(savedLeads);
        setSearchHistory(savedHistory);
        setDbReady(true);
      }
    }
    boot();
    return () => { cancelled = true; };
  }, []);

  async function handleSearch(filters) {
    lastFiltersRef.current = filters;
    setResults([]);
    setStateErrors({});
    setIsLoading(true);

    const { selectedStates, ...rest } = filters;
    setLoadingStates([...selectedStates]);

    const datasetOverrides = getDatasetOverrides();
    const allRows = [];
    const errors = {};

    await Promise.all(
      selectedStates.map(async (code) => {
        try {
          let rows;
          if (FILED_CODES.has(code)) {
            rows = await searchFiledState({
              stateCode: code,
              apiKey: filedApiKey,
              keyword: rest.keyword,
              dateFrom: rest.dateFrom,
              page: 1,
            });
          } else {
            rows = await searchState({
              stateCode: code,
              endpointOverride: datasetOverrides[code],
              dateFrom: rest.dateFrom,
              dateTo: rest.dateTo,
              entityType: rest.entityType,
              keyword: rest.keyword,
              city: rest.city,
              offset: 0,
              limit: FETCH_LIMIT,
            });
          }
          allRows.push(...rows);
        } catch (err) {
          errors[code] = err.message;
        } finally {
          setLoadingStates((prev) => prev.filter((s) => s !== code));
        }
      })
    );

    const sorted = allRows.sort((a, b) => (b.formationDate || '').localeCompare(a.formationDate || ''));
    setResults(sorted);
    setStateErrors(errors);
    setIsLoading(false);

    const entry = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      selectedStates,
      dateFrom: rest.dateFrom,
      dateTo: rest.dateTo,
      entityType: rest.entityType,
      keyword: rest.keyword,
      city: rest.city,
      resultCount: sorted.length,
      items: sorted,
    };
    const newHistory = [entry, ...searchHistory].slice(0, 50);
    setSearchHistory(newHistory);
    saveHistoryAsync(newHistory);
  }

  function handleHistoryLoad(entry) {
    if (entry.items?.length) {
      setResults(entry.items);
      setStateErrors({});
      setTab('search');
    }
  }

  function handleHistoryRerun(entry) {
    setTab('search');
    handleSearch({
      selectedStates: entry.selectedStates,
      dateFrom: entry.dateFrom,
      dateTo: entry.dateTo,
      entityType: entry.entityType,
      keyword: entry.keyword,
      city: entry.city,
    });
  }

  function handleHistoryClear() {
    setSearchHistory([]);
    saveHistoryAsync([]);
  }

  function handleAddLead(row) {
    if (leads.some((l) => l._id === row._id)) return;
    const next = [...leads, { ...row, status: 'new', contactEmail: row.email || '', phone: '', website: '', notes: '' }];
    setLeads(next);
    saveLeadsAsync(next);
  }

  function handleLeadsChange(next) {
    setLeads(next);
    saveLeadsAsync(next);
  }

  async function handleSaveFiledKey(key) {
    setFiledApiKey(key);
    await saveSettingsAsync({ filedApiKey: key });
  }

  const savedLeadIds = new Set(leads.map((l) => l._id));

  const TABS = [
    { id: 'search', label: 'Search' },
    { id: 'leads',  label: `Leads${leads.length ? ` (${leads.length})` : ''}` },
    { id: 'history', label: `History${searchHistory.length ? ` (${searchHistory.length})` : ''}` },
    { id: 'settings', label: 'Settings' },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col w-full">
      <div className="sticky top-0 z-30">
        <header className="bg-gray-900 border-b border-gray-700 px-4 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Flag size={16} className="text-white" />
              </div>
              <div className="hidden sm:block min-w-0">
                <h1 className="text-base font-bold text-white leading-none truncate">US Lead Generator</h1>
                <p className="text-xs text-gray-500 leading-none mt-0.5 truncate">New business registrations</p>
              </div>
            </div>
            <nav className="flex items-center gap-1 flex-shrink-0">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                    tab === t.id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </nav>
          </div>
        </header>
      </div>

      <main className="flex-1 flex flex-col pb-6 overflow-x-hidden">
        {tab === 'search' && (
          <>
            <SearchFilters
              filedApiKey={filedApiKey}
              onSearch={handleSearch}
              isLoading={isLoading}
            />
            <ResultsTable
              results={results}
              stateErrors={stateErrors}
              isLoading={isLoading}
              loadingStates={loadingStates}
              onAddLead={handleAddLead}
              savedLeadIds={savedLeadIds}
            />
          </>
        )}

        {tab === 'leads' && (
          <LeadsPanel
            leads={leads}
            onLeadsChange={handleLeadsChange}
          />
        )}

        {tab === 'history' && (
          <HistoryPanel
            history={searchHistory}
            onLoad={handleHistoryLoad}
            onRerun={handleHistoryRerun}
            onClear={handleHistoryClear}
          />
        )}

        {tab === 'settings' && (
          <SettingsPanel
            filedApiKey={filedApiKey}
            onSaveFiledKey={handleSaveFiledKey}
          />
        )}
      </main>
    </div>
  );
}
