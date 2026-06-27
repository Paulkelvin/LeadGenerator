import { useState, useEffect, useRef } from 'react';
import { Flag } from 'lucide-react';
import SearchFilters from './components/SearchFilters';
import ResultsTable from './components/ResultsTable';
import LeadsPanel from './components/LeadsPanel';
import SettingsPanel from './components/SettingsPanel';
import { searchState } from './lib/socrataApi';
import { searchFiledState } from './lib/filedApi';
import { SOCRATA_STATES, FILED_STATES } from './data/states';
import {
  getFiledKey,
  getLeads,
  getDatasetOverrides,
  saveLeadsAsync,
  saveSettingsAsync,
} from './lib/storage';
import { supabaseEnabled, fetchAll } from './lib/supabase';

const FILED_CODES = new Set(FILED_STATES.map((s) => s.code));
const PAGE_SIZE = 50;

export default function App() {
  const [tab, setTab] = useState('search');
  const [filedApiKey, setFiledApiKey] = useState('');
  const [results, setResults] = useState([]);
  const [leads, setLeads] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [stateErrors, setStateErrors] = useState({});
  const [loadingStates, setLoadingStates] = useState([]);
  const [hasMore, setHasMore] = useState(false);
  const [dbReady, setDbReady] = useState(false);

  const lastFiltersRef = useRef(null);
  const offsetsRef = useRef({});

  // Bootstrap: load from Supabase (with 5s timeout fallback) or localStorage
  useEffect(() => {
    let cancelled = false;
    async function boot() {
      let key = getFiledKey();
      let savedLeads = getLeads();

      if (supabaseEnabled) {
        const timer = new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 5000));
        try {
          const { settings, leads: dbLeads } = await Promise.race([
            fetchAll(),
            timer,
          ]);
          if (!cancelled) {
            if (settings?.filed_api_key) key = settings.filed_api_key;
            if (dbLeads?.length) savedLeads = dbLeads;
          }
        } catch {
          // fallback to localStorage — already set above
        }
      }

      if (!cancelled) {
        setFiledApiKey(key);
        setLeads(savedLeads);
        setDbReady(true);
      }
    }
    boot();
    return () => { cancelled = true; };
  }, []);

  async function handleSearch(filters) {
    lastFiltersRef.current = filters;
    offsetsRef.current = {};
    setResults([]);
    setStateErrors({});
    setHasMore(false);
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
              limit: PAGE_SIZE,
            });
            offsetsRef.current[code] = PAGE_SIZE;
            if (rows.length === PAGE_SIZE) setHasMore(true);
          }
          allRows.push(...rows);
        } catch (err) {
          errors[code] = err.message;
        } finally {
          setLoadingStates((prev) => prev.filter((s) => s !== code));
        }
      })
    );

    setResults(allRows.sort((a, b) => (b.formationDate || '').localeCompare(a.formationDate || '')));
    setStateErrors(errors);
    setIsLoading(false);
  }

  async function handleLoadMore() {
    if (!lastFiltersRef.current) return;
    setIsLoading(true);

    const { selectedStates, ...rest } = lastFiltersRef.current;
    const datasetOverrides = getDatasetOverrides();
    const socrataStates = selectedStates.filter((c) => !FILED_CODES.has(c));

    const newRows = [];
    let anyMore = false;

    await Promise.all(
      socrataStates.map(async (code) => {
        const offset = offsetsRef.current[code] || 0;
        try {
          const rows = await searchState({
            stateCode: code,
            endpointOverride: datasetOverrides[code],
            dateFrom: rest.dateFrom,
            dateTo: rest.dateTo,
            entityType: rest.entityType,
            keyword: rest.keyword,
            city: rest.city,
            offset,
            limit: PAGE_SIZE,
          });
          offsetsRef.current[code] = offset + PAGE_SIZE;
          if (rows.length === PAGE_SIZE) anyMore = true;
          newRows.push(...rows);
        } catch {
          // silently skip on load-more errors
        }
      })
    );

    setResults((prev) => {
      const existingIds = new Set(prev.map((r) => r._id));
      const fresh = newRows.filter((r) => !existingIds.has(r._id));
      return [...prev, ...fresh].sort((a, b) => (b.formationDate || '').localeCompare(a.formationDate || ''));
    });
    setHasMore(anyMore);
    setIsLoading(false);
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
    { id: 'settings', label: 'Settings' },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col w-full">
      {/* Sticky header */}
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

      {/* Main content */}
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
              onLoadMore={handleLoadMore}
              hasMore={hasMore}
            />
          </>
        )}

        {tab === 'leads' && (
          <LeadsPanel
            leads={leads}
            onLeadsChange={handleLeadsChange}
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
