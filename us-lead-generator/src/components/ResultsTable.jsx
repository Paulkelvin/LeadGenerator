import { useState } from 'react';
import { Star, Copy, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { STATE_BADGE_CLASSES, SOCRATA_STATES, FILED_STATES } from '../data/states';

const ALL_STATES = {
  ...SOCRATA_STATES,
  ...Object.fromEntries(FILED_STATES.map((s) => [s.code, s])),
};

const PER_PAGE = 25;

function cleanName(name) {
  return name
    .replace(/\b(llc\.?|llp\.?|l\.l\.c\.?|l\.l\.p\.?|inc\.?|corp\.?|corporation|incorporated|limited|ltd\.?|plc\.?|co\.?)$/i, '')
    .trim();
}

function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false);
  function handleCopy(e) {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }
  return (
    <button
      onClick={handleCopy}
      className="p-0.5 rounded text-gray-600 hover:text-gray-300 transition-colors flex-shrink-0"
    >
      {copied ? <Check size={11} className="text-green-400" /> : <Copy size={11} />}
    </button>
  );
}

function StateBadge({ stateCode }) {
  const cfg = ALL_STATES[stateCode] || {};
  const color = cfg.color || 'blue';
  const cls = STATE_BADGE_CLASSES[color] || STATE_BADGE_CLASSES.blue;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border ${cls}`}>
      {cfg.emoji} {stateCode}
    </span>
  );
}

function Pagination({ page, totalPages, onPageChange, totalResults }) {
  const pages = [];
  const maxVisible = 5;
  let start = Math.max(1, page - Math.floor(maxVisible / 2));
  let end = Math.min(totalPages, start + maxVisible - 1);
  if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);

  if (start > 1) {
    pages.push(1);
    if (start > 2) pages.push('...');
  }
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < totalPages) {
    if (end < totalPages - 1) pages.push('...');
    pages.push(totalPages);
  }

  return (
    <div className="px-4 py-3 flex items-center justify-between">
      <p className="text-sm text-gray-400">
        <span className="text-white font-medium">{totalResults}</span> results
        <span className="text-gray-600 ml-2">·</span>
        <span className="ml-2">Page {page} of {totalPages}</span>
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="p-1.5 rounded text-gray-400 hover:text-white hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft size={16} />
        </button>
        {pages.map((p, i) =>
          p === '...' ? (
            <span key={`dots-${i}`} className="px-1 text-gray-600 text-sm">…</span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`min-w-[32px] h-8 rounded text-sm font-medium transition-colors ${
                p === page
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              {p}
            </button>
          )
        )}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="p-1.5 rounded text-gray-400 hover:text-white hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

export default function ResultsTable({ results, stateErrors, isLoading, loadingStates, onAddLead, savedLeadIds }) {
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(results.length / PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const pageResults = results.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  function handlePageChange(p) {
    setPage(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  if (!isLoading && results.length === 0 && Object.keys(stateErrors || {}).length === 0) {
    return null;
  }

  return (
    <div className="flex-1 overflow-x-auto">
      {/* Per-state error banners */}
      {Object.entries(stateErrors || {}).map(([code, msg]) => (
        <div key={code} className="mx-4 mt-3 px-4 py-2.5 bg-red-900/30 border border-red-700/50 rounded-lg text-sm text-red-300">
          <span className="font-medium">{ALL_STATES[code]?.name || code}:</span> {msg}
        </div>
      ))}

      {/* Loading states indicator */}
      {loadingStates && loadingStates.length > 0 && (
        <div className="mx-4 mt-3 flex items-center gap-2 text-sm text-gray-400">
          <div className="w-4 h-4 border-2 border-gray-600 border-t-blue-500 rounded-full animate-spin" />
          Loading {loadingStates.join(', ')}…
        </div>
      )}

      {results.length === 0 && isLoading ? null : results.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-500">
          <p className="text-lg font-medium text-gray-400">No results found</p>
          <p className="text-sm mt-1">Try adjusting your filters or date range</p>
        </div>
      ) : (
        <>
          {/* Top pagination */}
          <Pagination page={currentPage} totalPages={totalPages} onPageChange={handlePageChange} totalResults={results.length} />

          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-xs text-gray-500 uppercase tracking-wide">
                <th className="px-4 py-2 text-left font-medium w-20">State</th>
                <th className="px-3 py-2 text-left font-medium">Company</th>
                <th className="px-3 py-2 text-left font-medium hidden md:table-cell">Type</th>
                <th className="px-3 py-2 text-left font-medium">Formed</th>
                <th className="px-3 py-2 text-left font-medium hidden sm:table-cell">Status</th>
                <th className="px-3 py-2 text-left font-medium hidden lg:table-cell">City / Zip</th>
                <th className="px-3 py-2 text-left font-medium hidden xl:table-cell">Agent</th>
                <th className="px-3 py-2 text-left font-medium">Search</th>
                <th className="px-3 py-2 text-center font-medium w-10">★</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {pageResults.map((row) => {
                const isLead = savedLeadIds?.has(row._id);
                const q = encodeURIComponent(cleanName(row.companyName));
                const googleUrl = `https://www.google.com/search?q=${q}`;
                const linkedinUrl = `https://www.linkedin.com/search/results/companies/?keywords=${q}`;
                return (
                  <tr
                    key={row._id}
                    className={`hover:bg-gray-800/40 transition-colors ${isLead ? 'bg-yellow-900/10' : ''}`}
                  >
                    <td className="px-4 py-3">
                      <StateBadge stateCode={row.state} />
                    </td>
                    <td className="px-3 py-3 max-w-[220px]">
                      <div className="min-w-0">
                        <div className="font-medium text-white leading-snug truncate flex items-center gap-1">
                          <span className="truncate">{row.companyName}</span>
                          <CopyBtn text={row.companyName} />
                        </div>
                        {(row.email || row.naicsCode || row.county || row.ceo) && (
                          <div className="mt-1 space-y-0.5">
                            {row.email && (
                              <div className="flex items-center gap-1 text-xs text-emerald-400 truncate">
                                <span className="text-gray-600">@</span>
                                <a href={`mailto:${row.email}`} className="hover:underline truncate" onClick={(e) => e.stopPropagation()}>{row.email}</a>
                                <CopyBtn text={row.email} />
                              </div>
                            )}
                            {row.ceo && (
                              <div className="text-xs text-gray-500 truncate">CEO: {row.ceo}</div>
                            )}
                            {row.naicsCode && (
                              <div className="text-xs text-gray-600 truncate">NAICS: {row.naicsCode}</div>
                            )}
                            {row.county && (
                              <div className="text-xs text-gray-600 truncate">{row.county} County</div>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-3 hidden md:table-cell text-gray-400 text-xs max-w-[120px] truncate">
                      {row.entityType || '—'}
                    </td>
                    <td className="px-3 py-3 text-gray-300 whitespace-nowrap">
                      {row.formationDate || '—'}
                    </td>
                    <td className="px-3 py-3 hidden sm:table-cell">
                      {row.status ? (
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          row.status.toLowerCase().includes('activ')
                            ? 'bg-green-900/40 text-green-400 border border-green-800/50'
                            : 'bg-gray-800 text-gray-400 border border-gray-700'
                        }`}>
                          {row.status}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="px-3 py-3 hidden lg:table-cell text-gray-400 text-xs">
                      {[row.city, row.zip].filter(Boolean).join(', ') || '—'}
                    </td>
                    <td className="px-3 py-3 hidden xl:table-cell text-gray-400 text-xs max-w-[150px] truncate">
                      {row.agentName || '—'}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1">
                        <a
                          href={googleUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-1.5 py-0.5 rounded text-xs font-medium bg-blue-900/40 text-blue-300 border border-blue-800/50 hover:bg-blue-800/60 transition-colors"
                        >G</a>
                        <a
                          href={linkedinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-1.5 py-0.5 rounded text-xs font-medium bg-sky-900/40 text-sky-300 border border-sky-800/50 hover:bg-sky-800/60 transition-colors"
                        >Li</a>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <button
                        onClick={() => onAddLead(row)}
                        disabled={isLead}
                        title={isLead ? 'Already saved as lead' : 'Save as lead'}
                        className={`transition-colors ${
                          isLead
                            ? 'text-yellow-400 cursor-default'
                            : 'text-gray-600 hover:text-yellow-400'
                        }`}
                      >
                        <Star size={15} fill={isLead ? 'currentColor' : 'none'} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Bottom pagination */}
          <Pagination page={currentPage} totalPages={totalPages} onPageChange={handlePageChange} totalResults={results.length} />
        </>
      )}
    </div>
  );
}
