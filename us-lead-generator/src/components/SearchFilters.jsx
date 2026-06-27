import { useState } from 'react';
import { Search, X } from 'lucide-react';
import { SOCRATA_STATES, FILED_STATES, STATE_BADGE_CLASSES } from '../data/states';

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
}

const ENTITY_TYPES = [
  { value: 'all', label: 'All Types' },
  { value: 'Limited Liability Company', label: 'LLC' },
  { value: 'Corporation', label: 'Corporation' },
  { value: 'Limited Partnership', label: 'LP' },
  { value: 'Nonprofit Corporation', label: 'Non-Profit' },
  { value: 'General Partnership', label: 'Partnership' },
];

export default function SearchFilters({ filedApiKey, onSearch, isLoading }) {
  const [selectedStates, setSelectedStates] = useState(['CO']);
  const [dateFrom, setDateFrom] = useState(daysAgo(30));
  const [dateTo, setDateTo] = useState('');
  const [entityType, setEntityType] = useState('all');
  const [city, setCity] = useState('');
  const [keyword, setKeyword] = useState('');

  function toggleState(code) {
    setSelectedStates((prev) =>
      prev.includes(code) ? prev.filter((s) => s !== code) : [...prev, code]
    );
  }

  function handleSearch() {
    if (selectedStates.length === 0) return;
    onSearch({ selectedStates, dateFrom, dateTo, entityType, city, keyword });
  }

  const socrataKeys = Object.keys(SOCRATA_STATES);
  const hasFiledKey = !!filedApiKey;

  return (
    <div className="bg-gray-900 border-b border-gray-700 px-4 py-5">
      <div className="max-w-7xl mx-auto space-y-5">

        {/* State selector */}
        <div>
          <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
            States ({selectedStates.length} selected)
          </label>
          <div className="space-y-3">
            {/* Socrata states */}
            <div>
              <p className="text-xs text-gray-600 mb-1.5">Free — no key needed</p>
              <div className="flex flex-wrap gap-2">
                {socrataKeys.map((code) => {
                  const cfg = SOCRATA_STATES[code];
                  const selected = selectedStates.includes(code);
                  const badgeCls = STATE_BADGE_CLASSES[cfg.color];
                  return (
                    <button
                      key={code}
                      onClick={() => toggleState(code)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                        selected
                          ? badgeCls
                          : 'bg-gray-800 text-gray-400 border-gray-700 hover:border-gray-500 hover:text-gray-200'
                      }`}
                    >
                      {cfg.emoji} {cfg.name}
                      {selected && <X size={11} />}
                    </button>
                  );
                })}
              </div>
            </div>
            {/* Filed.dev states */}
            <div>
              <p className="text-xs text-gray-600 mb-1.5">
                via Filed.dev
                {!hasFiledKey && (
                  <span className="ml-2 text-purple-500/70">— add API key in Settings to enable</span>
                )}
              </p>
              <div className="flex flex-wrap gap-2">
                {FILED_STATES.map(({ code, name, emoji, color }) => {
                  const selected = selectedStates.includes(code);
                  const badgeCls = STATE_BADGE_CLASSES[color];
                  return (
                    <button
                      key={code}
                      onClick={() => hasFiledKey && toggleState(code)}
                      disabled={!hasFiledKey}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                        !hasFiledKey
                          ? 'bg-gray-800/40 text-gray-600 border-gray-800 cursor-not-allowed'
                          : selected
                          ? badgeCls
                          : 'bg-gray-800 text-gray-400 border-gray-700 hover:border-gray-500 hover:text-gray-200'
                      }`}
                    >
                      {emoji} {name}
                      {selected && <X size={11} />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Filters row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Date range */}
          <div>
            <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-1.5">
              Formation Date Range
            </label>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="flex-1 min-w-0 bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
              <span className="text-gray-500 text-xs flex-shrink-0">to</span>
              <input
                type="date"
                value={dateTo}
                min={dateFrom || undefined}
                onChange={(e) => setDateTo(e.target.value)}
                className="flex-1 min-w-0 bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Entity type */}
          <div>
            <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-1.5">
              Entity Type
            </label>
            <select
              value={entityType}
              onChange={(e) => setEntityType(e.target.value)}
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              {ENTITY_TYPES.map(({ value, label }) => (
                <option key={value} value={value} className="bg-gray-900">{label}</option>
              ))}
            </select>
          </div>

          {/* City */}
          <div>
            <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-1.5">
              City (optional)
            </label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g. Denver, Portland, Hartford"
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Keyword */}
          <div>
            <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-1.5">
              Keyword (optional)
            </label>
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="e.g. cleaning, restaurant, salon"
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Search button */}
        <button
          onClick={handleSearch}
          disabled={isLoading || selectedStates.length === 0}
          className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Searching…
            </>
          ) : (
            <>
              <Search size={16} />
              Search {selectedStates.length} State{selectedStates.length !== 1 ? 's' : ''}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
