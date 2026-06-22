import { useState } from 'react';
import { Search, ChevronDown, ChevronUp, X } from 'lucide-react';
import { SIC_CATEGORIES, ALL_SIC_CODES } from '../data/sicCodes';

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
}

export default function SearchFilters({ onSearch, isLoading }) {
  const [selectedCodes, setSelectedCodes] = useState([]);
  const [incorporatedFrom, setIncorporatedFrom] = useState(daysAgo(30));
  const [location, setLocation] = useState('');
  const [openCategory, setOpenCategory] = useState(null);

  function toggleCode(code) {
    setSelectedCodes((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  }

  function toggleCategory(codes) {
    const allSelected = codes.every((c) => selectedCodes.includes(c));
    if (allSelected) {
      setSelectedCodes((prev) => prev.filter((c) => !codes.includes(c)));
    } else {
      setSelectedCodes((prev) => [...new Set([...prev, ...codes])]);
    }
  }

  function clearAll() {
    setSelectedCodes([]);
  }

  function handleSearch() {
    onSearch({ sicCodes: selectedCodes, incorporatedFrom, location });
  }

  return (
    <div className="bg-gray-900 border-b border-gray-700 px-4 py-5">
      <div className="max-w-7xl mx-auto space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Date filter */}
          <div className="min-w-0">
            <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">
              Incorporated After
            </label>
            <input
              type="date"
              value={incorporatedFrom}
              onChange={(e) => setIncorporatedFrom(e.target.value)}
              className="w-full min-w-0 bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Location filter */}
          <div className="min-w-0">
            <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">
              Location (optional)
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Birmingham, London, Manchester"
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Search button */}
          <div className="flex items-end min-w-0">
            <button
              onClick={handleSearch}
              disabled={isLoading}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Searching…
                </>
              ) : (
                <>
                  <Search size={16} />
                  Search Companies
                </>
              )}
            </button>
          </div>
        </div>

        {/* SIC Code selector */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">
              Industry / SIC Codes
              {selectedCodes.length > 0 && (
                <span className="ml-2 text-blue-400">({selectedCodes.length} selected)</span>
              )}
            </label>
            {selectedCodes.length > 0 && (
              <button
                onClick={clearAll}
                className="text-xs text-gray-500 hover:text-gray-300 flex items-center gap-1"
              >
                <X size={12} />
                Clear all
              </button>
            )}
          </div>

          {/* Selected chips */}
          {selectedCodes.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {selectedCodes.map((code) => {
                const entry = ALL_SIC_CODES.find((s) => s.code === code);
                return (
                  <span
                    key={code}
                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-900/60 text-blue-300 text-xs rounded-full border border-blue-700/50"
                  >
                    {code} – {entry?.label}
                    <button onClick={() => toggleCode(code)} className="hover:text-white">
                      <X size={10} />
                    </button>
                  </span>
                );
              })}
            </div>
          )}

          {/* Category accordion */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
            {SIC_CATEGORIES.map((cat) => {
              const catCodes = cat.codes.map((c) => c.code);
              const allSelected = catCodes.every((c) => selectedCodes.includes(c));
              const someSelected = catCodes.some((c) => selectedCodes.includes(c));
              const isOpen = openCategory === cat.label;

              return (
                <div key={cat.label} className="bg-gray-800 rounded-lg border border-gray-700">
                  <button
                    className="w-full flex items-center justify-between px-3 py-2 text-left"
                    onClick={() => setOpenCategory(isOpen ? null : cat.label)}
                  >
                    <span className="flex items-center gap-2">
                      <span
                        className={`text-sm font-medium ${
                          someSelected ? 'text-blue-300' : 'text-gray-300'
                        }`}
                      >
                        {cat.label}
                      </span>
                      {someSelected && (
                        <span className="text-xs bg-blue-800 text-blue-200 px-1.5 py-0.5 rounded-full">
                          {catCodes.filter((c) => selectedCodes.includes(c)).length}
                        </span>
                      )}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleCategory(catCodes);
                        }}
                        className={`text-xs px-1.5 py-0.5 rounded transition-colors ${
                          allSelected
                            ? 'bg-blue-700 text-blue-100 hover:bg-blue-600'
                            : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                        }`}
                      >
                        {allSelected ? 'All ✓' : 'All'}
                      </button>
                      {isOpen ? (
                        <ChevronUp size={14} className="text-gray-500" />
                      ) : (
                        <ChevronDown size={14} className="text-gray-500" />
                      )}
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-3 pb-2 space-y-1 border-t border-gray-700 pt-2">
                      {cat.codes.map(({ code, label }) => (
                        <label
                          key={code}
                          className="flex items-start gap-2 cursor-pointer group"
                        >
                          <input
                            type="checkbox"
                            checked={selectedCodes.includes(code)}
                            onChange={() => toggleCode(code)}
                            className="mt-0.5 accent-blue-500"
                          />
                          <span className="text-xs text-gray-400 group-hover:text-gray-200 leading-tight">
                            <span className="font-mono text-gray-500">{code}</span> {label}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
