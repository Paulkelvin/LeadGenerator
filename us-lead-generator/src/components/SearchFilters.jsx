import { useState, useRef, useEffect } from 'react';
import { Search, X, ChevronDown, Filter } from 'lucide-react';
import { SOCRATA_STATES, FILED_STATES, STATE_BADGE_CLASSES } from '../data/states';
import { INDUSTRY_CATEGORIES, POPULAR_INDUSTRIES } from '../data/industries';

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

function IndustryPicker({ selected, onChange }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const panelRef = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false);
    }
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  function toggle(value) {
    onChange(
      selected.includes(value)
        ? selected.filter((v) => v !== value)
        : [...selected, value]
    );
  }

  const allIndustries = INDUSTRY_CATEGORIES.flatMap((c) => c.industries);
  const filtered = search.trim()
    ? allIndustries.filter((i) => i.label.toLowerCase().includes(search.toLowerCase()))
    : null;

  return (
    <div>
      <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
        Industries {selected.length > 0 && `(${selected.length} selected)`}
      </label>

      {/* Popular quick picks */}
      <div className="flex flex-wrap gap-1.5 mb-2">
        {POPULAR_INDUSTRIES.map((ind) => {
          const active = selected.includes(ind.value);
          return (
            <button
              key={ind.value}
              onClick={() => toggle(ind.value)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                active
                  ? 'bg-blue-900/60 text-blue-300 border-blue-700/50'
                  : 'bg-gray-800 text-gray-400 border-gray-700 hover:border-gray-500 hover:text-gray-200'
              }`}
            >
              {ind.label}
              {active && <X size={10} className="inline ml-1" />}
            </button>
          );
        })}
        <button
          onClick={() => setOpen((v) => !v)}
          className="px-2.5 py-1 rounded-lg text-xs font-medium border bg-gray-800 text-gray-400 border-gray-700 hover:border-gray-500 hover:text-gray-200 transition-colors flex items-center gap-1"
        >
          <Filter size={10} />
          All industries
          <ChevronDown size={10} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Selected tags (non-popular ones) */}
      {selected.filter((v) => !POPULAR_INDUSTRIES.some((p) => p.value === v)).length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {selected
            .filter((v) => !POPULAR_INDUSTRIES.some((p) => p.value === v))
            .map((v) => {
              const ind = allIndustries.find((i) => i.value === v);
              return (
                <span
                  key={v}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-900/60 text-blue-300 border border-blue-700/50"
                >
                  {ind?.label || v}
                  <button onClick={() => toggle(v)} className="hover:text-white">
                    <X size={10} />
                  </button>
                </span>
              );
            })}
        </div>
      )}

      {/* Dropdown panel */}
      {open && (
        <div
          ref={panelRef}
          className="relative z-20 bg-gray-800 border border-gray-600 rounded-lg shadow-xl mt-1 max-h-[320px] overflow-hidden flex flex-col"
        >
          <div className="p-2 border-b border-gray-700">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search industries…"
              autoFocus
              className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-1.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="overflow-y-auto p-2 space-y-3">
            {filtered ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
                {filtered.map((ind) => (
                  <label
                    key={ind.value}
                    className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-700/50 cursor-pointer text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={selected.includes(ind.value)}
                      onChange={() => toggle(ind.value)}
                      className="rounded border-gray-600 bg-gray-900 text-blue-500 focus:ring-blue-500 focus:ring-offset-0"
                    />
                    <span className={selected.includes(ind.value) ? 'text-blue-300' : 'text-gray-300'}>{ind.label}</span>
                  </label>
                ))}
                {filtered.length === 0 && (
                  <p className="col-span-3 text-sm text-gray-500 py-2 text-center">No matches</p>
                )}
              </div>
            ) : (
              INDUSTRY_CATEGORIES.map((cat) => (
                <div key={cat.label}>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide px-2 mb-1">{cat.label}</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-0.5">
                    {cat.industries.map((ind) => (
                      <label
                        key={ind.value}
                        className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-700/50 cursor-pointer text-sm"
                      >
                        <input
                          type="checkbox"
                          checked={selected.includes(ind.value)}
                          onChange={() => toggle(ind.value)}
                          className="rounded border-gray-600 bg-gray-900 text-blue-500 focus:ring-blue-500 focus:ring-offset-0"
                        />
                        <span className={selected.includes(ind.value) ? 'text-blue-300' : 'text-gray-300'}>{ind.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="p-2 border-t border-gray-700 flex items-center justify-between">
            <button
              onClick={() => onChange([])}
              className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
            >
              Clear all
            </button>
            <button
              onClick={() => setOpen(false)}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SearchFilters({ filedApiKey, onSearch, isLoading }) {
  const [selectedStates, setSelectedStates] = useState(['CO']);
  const [dateFrom, setDateFrom] = useState(daysAgo(30));
  const [dateTo, setDateTo] = useState('');
  const [entityType, setEntityType] = useState('all');
  const [city, setCity] = useState('');
  const [selectedIndustries, setSelectedIndustries] = useState([]);
  const [keyword, setKeyword] = useState('');

  function toggleState(code) {
    setSelectedStates((prev) =>
      prev.includes(code) ? prev.filter((s) => s !== code) : [...prev, code]
    );
  }

  function handleSearch() {
    if (selectedStates.length === 0) return;
    onSearch({ selectedStates, dateFrom, dateTo, entityType, city, keyword, industries: selectedIndustries });
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

        {/* Industry selector */}
        <IndustryPicker selected={selectedIndustries} onChange={setSelectedIndustries} />

        {/* Filters row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

          <div>
            <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-1.5">
              Custom Keyword (optional)
            </label>
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Additional keyword to search"
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
