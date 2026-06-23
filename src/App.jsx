import { useState } from 'react';
import { Building2, Star, AlertTriangle, Info, History } from 'lucide-react';
import SettingsBar from './components/SettingsBar';
import SearchFilters from './components/SearchFilters';
import ResultsTable from './components/ResultsTable';
import Pagination from './components/Pagination';
import LeadsPanel from './components/LeadsPanel';
import HistoryPanel from './components/HistoryPanel';
import SetupScreen from './components/SetupScreen';
import { searchCompanies } from './lib/companiesHouse';
import { searchNZCompanies } from './lib/nzbnApi';
import {
  getApiKey, setApiKey,
  getNzApiKey, setNzApiKey,
  getHunterKey, setHunterKey,
  getLeads, saveLeads,
  getSearchHistory, saveSearchHistory, addSearchHistory,
} from './lib/storage';

const PAGE_SIZE = 20;

export default function App() {
  const [apiKey, setApiKeyState] = useState(getApiKey);
  const [nzApiKey, setNzApiKeyState] = useState(getNzApiKey);
  const [hunterKey, setHunterKeyState] = useState(getHunterKey);
  const [country, setCountry] = useState('uk');
  const [tab, setTab] = useState('search');

  // Search state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [corsBlocked, setCorsBlocked] = useState(false);
  const [results, setResults] = useState([]);
  const [total, setTotal] = useState(0);
  const [startIndex, setStartIndex] = useState(0);
  const [lastFilters, setLastFilters] = useState(null);

  // Search history
  const [searchHistory, setSearchHistory] = useState(getSearchHistory);

  // Leads — migrate legacy leads (no status field) on boot
  const [leads, setLeads] = useState(() =>
    getLeads().map((l) => {
      if (!l._meta?.status) {
        const hasContact = l._meta?.email || l._meta?.phone;
        return {
          ...l,
          _country: l._country || 'uk',
          _meta: { ...l._meta, status: hasContact ? 'has_contact' : 'new' },
        };
      }
      return { ...l, _country: l._country || 'uk' };
    })
  );

  function handleSaveKey(key) {
    setApiKey(key);
    setApiKeyState(key);
  }

  function handleSaveNzApiKey(key) {
    setNzApiKey(key);
    setNzApiKeyState(key);
  }

  function handleSaveHunterKey(key) {
    setHunterKey(key);
    setHunterKeyState(key);
  }

  async function runSearch(filters, newStartIndex = 0) {
    setIsLoading(true);
    setError(null);
    setCorsBlocked(false);

    try {
      let data;
      if (filters.country === 'nz') {
        data = await searchNZCompanies({
          apiKey: nzApiKey,
          sicCodes: filters.sicCodes,
          incorporatedFrom: filters.incorporatedFrom,
          location: filters.location,
          startIndex: newStartIndex,
          size: PAGE_SIZE,
        });
      } else {
        data = await searchCompanies({
          apiKey,
          sicCodes: filters.sicCodes,
          incorporatedFrom: filters.incorporatedFrom,
          location: filters.location,
          startIndex: newStartIndex,
          size: PAGE_SIZE,
        });
      }

      const items = data.items || [];
      setResults(items);
      setTotal(data.hits || data.total_results || items.length);
      setStartIndex(newStartIndex);

      // Record search history (only on first page, not pagination)
      if (newStartIndex === 0) {
        const entry = {
          id: Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
          timestamp: new Date().toISOString(),
          country: filters.country || 'uk',
          location: filters.location || '',
          sicCodes: filters.sicCodes || [],
          incorporatedFrom: filters.incorporatedFrom || '',
          resultCount: data.hits || data.total_results || items.length,
        };
        const newHistory = addSearchHistory(entry);
        setSearchHistory(newHistory);
      }
    } catch (err) {
      const msg = err.message.toLowerCase();
      if (
        msg.includes('failed to fetch') ||
        msg.includes('cors') ||
        msg.includes('network') ||
        msg.includes('load')
      ) {
        setCorsBlocked(true);
      }
      setError(err.message);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }

  function handleSearch(filters) {
    setLastFilters(filters);
    setTab('search');
    runSearch(filters, 0);
  }

  function handlePage(newStartIndex) {
    if (lastFilters) runSearch(lastFilters, newStartIndex);
  }

  function handleRerunSearch(entry) {
    const filters = {
      country: entry.country,
      sicCodes: entry.sicCodes,
      incorporatedFrom: entry.incorporatedFrom,
      location: entry.location,
    };
    setCountry(entry.country);
    setLastFilters(filters);
    setTab('search');
    runSearch(filters, 0);
  }

  function handleClearHistory() {
    saveSearchHistory([]);
    setSearchHistory([]);
  }

  function markLead(company) {
    setLeads((prev) => {
      if (prev.find((l) => l.company_number === company.company_number)) return prev;
      const updated = [...prev, {
        ...company,
        _country: company._country || 'uk',
        _meta: { status: 'new' },
      }];
      saveLeads(updated);
      return updated;
    });
  }

  function unmarkLead(companyNumber) {
    setLeads((prev) => {
      const updated = prev.filter((l) => l.company_number !== companyNumber);
      saveLeads(updated);
      return updated;
    });
  }

  function updateLead(companyNumber, fields) {
    setLeads((prev) => {
      const updated = prev.map((l) => {
        if (l.company_number !== companyNumber) return l;

        const newMeta = { ...l._meta, ...fields };

        // Auto-advance to has_contact when email or phone becomes non-empty
        const hadContact = l._meta?.email || l._meta?.phone;
        const nowHasContact = newMeta.email || newMeta.phone;
        const currentStatus = newMeta.status || 'new';
        if (!hadContact && nowHasContact && (currentStatus === 'new' || currentStatus === 'parked')) {
          newMeta.status = 'has_contact';
        }

        // Stamp contacted_at on first transition to 'contacted'
        if (fields.status === 'contacted' && !l._meta?.contacted_at) {
          newMeta.contacted_at = new Date().toISOString();
        }

        return { ...l, _meta: newMeta };
      });
      saveLeads(updated);
      return updated;
    });
  }

  const activeKey = country === 'nz' ? nzApiKey : apiKey;

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col overflow-x-hidden w-full">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-700 px-4 py-3 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Building2 size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white leading-none">Lead Generator</h1>
              <p className="text-xs text-gray-500 leading-none mt-0.5">
                New business registrations
              </p>
            </div>
          </div>
          {/* Tab nav */}
          <nav className="flex items-center gap-1">
            <button
              onClick={() => setTab('search')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                tab === 'search'
                  ? 'bg-gray-700 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              Search
              {results.length > 0 && tab !== 'search' && (
                <span className="ml-1.5 text-xs bg-gray-600 px-1.5 py-0.5 rounded-full">
                  {results.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setTab('leads')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                tab === 'leads'
                  ? 'bg-gray-700 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <Star size={13} />
              Leads
              {leads.length > 0 && (
                <span className="text-xs bg-yellow-800/70 text-yellow-300 px-1.5 py-0.5 rounded-full">
                  {leads.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setTab('history')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                tab === 'history'
                  ? 'bg-gray-700 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <History size={13} />
              History
              {searchHistory.length > 0 && (
                <span className="text-xs bg-gray-700 text-gray-300 px-1.5 py-0.5 rounded-full">
                  {searchHistory.length}
                </span>
              )}
            </button>
          </nav>
        </div>
      </header>

      {/* API Key bar */}
      <SettingsBar
        apiKey={apiKey}
        nzApiKey={nzApiKey}
        hunterKey={hunterKey}
        onSaveApiKey={handleSaveKey}
        onSaveNzApiKey={handleSaveNzApiKey}
        onSaveHunterKey={handleSaveHunterKey}
      />

      {/* Main content */}
      <main className="flex-1 flex flex-col pb-6">
        {tab === 'search' && (
          <>
            {!activeKey ? (
              <SetupScreen country={country} />
            ) : (
              <>
                <SearchFilters
                  country={country}
                  onCountryChange={setCountry}
                  onSearch={handleSearch}
                  isLoading={isLoading}
                />

                <div className="max-w-7xl mx-auto w-full px-4 pt-4 flex-1 flex flex-col gap-4">
                  {/* CORS warning */}
                  {corsBlocked && (
                    <div className="bg-orange-950/50 border border-orange-700/50 rounded-xl p-4 flex gap-3">
                      <AlertTriangle size={18} className="text-orange-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-orange-300 mb-1">
                          CORS / Network Error
                        </p>
                        <p className="text-xs text-orange-400/80 leading-relaxed">
                          The browser was blocked from reaching the API directly.
                          Check your API key or try again. See the browser console for details.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Error state */}
                  {error && !corsBlocked && (
                    <div className="bg-red-950/50 border border-red-700/50 rounded-xl p-4 flex gap-3">
                      <AlertTriangle size={18} className="text-red-400 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-red-300">{error}</p>
                    </div>
                  )}

                  {/* Results */}
                  {results.length > 0 && (
                    <div className="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden">
                      <div className="px-4 py-3 border-b border-gray-700 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-300">Results</span>
                          <span className="text-xs bg-blue-900/50 text-blue-300 px-2 py-0.5 rounded-full border border-blue-700/50">
                            {total.toLocaleString()} total
                          </span>
                        </div>
                        <span className="text-xs text-gray-600">
                          Showing {startIndex + 1}–
                          {Math.min(startIndex + results.length, total)} of{' '}
                          {total.toLocaleString()}
                        </span>
                      </div>

                      <ResultsTable
                        results={results}
                        leads={leads}
                        onMarkLead={markLead}
                        onUnmarkLead={unmarkLead}
                        apiKey={apiKey}
                      />

                      <Pagination
                        startIndex={startIndex}
                        pageSize={PAGE_SIZE}
                        total={total}
                        onPage={handlePage}
                      />
                    </div>
                  )}

                  {/* Empty state after search */}
                  {!isLoading && !error && results.length === 0 && lastFilters && (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                      <div className="text-4xl mb-4">🔍</div>
                      <h3 className="text-lg font-semibold text-gray-300 mb-2">
                        No companies found
                      </h3>
                      <p className="text-gray-500 max-w-sm text-sm">
                        Try broadening your filters — select more industry codes, extend the date
                        range, or leave the location blank.
                      </p>
                    </div>
                  )}

                  {/* Pre-search prompt */}
                  {!isLoading && !lastFilters && (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                      <div className="w-14 h-14 bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-gray-700">
                        <Info size={24} className="text-gray-500" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-300 mb-2">
                        Choose your filters and search
                      </h3>
                      <p className="text-gray-500 max-w-sm text-sm">
                        Select a country, pick industry categories, set a date range, and optionally
                        filter by location to find new companies.
                      </p>
                    </div>
                  )}
                </div>
              </>
            )}
          </>
        )}

        {tab === 'leads' && (
          <div className="max-w-7xl mx-auto w-full px-4 pt-4 flex-1">
            <div className="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden">
              <LeadsPanel leads={leads} hunterKey={hunterKey} onUpdate={updateLead} onRemove={unmarkLead} />
            </div>
          </div>
        )}

        {tab === 'history' && (
          <div className="max-w-7xl mx-auto w-full px-4 pt-4 flex-1">
            <div className="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden">
              <HistoryPanel
                history={searchHistory}
                onRerun={handleRerunSearch}
                onClear={handleClearHistory}
              />
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="text-center py-4 text-xs text-gray-700 border-t border-gray-800">
        Data from{' '}
        <a
          href="https://developer.company-information.service.gov.uk/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-600 hover:text-gray-400"
        >
          Companies House
        </a>
        {' '}and{' '}
        <a
          href="https://developer.business.govt.nz/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-600 hover:text-gray-400"
        >
          NZBN
        </a>
      </footer>
    </div>
  );
}
