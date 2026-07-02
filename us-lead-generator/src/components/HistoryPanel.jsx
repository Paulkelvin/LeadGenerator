import { RotateCcw, Clock, Trash2, DatabaseZap } from 'lucide-react';
import { SOCRATA_STATES, FILED_STATES } from '../data/states';

const ALL_STATES = {
  ...SOCRATA_STATES,
  ...Object.fromEntries(FILED_STATES.map((s) => [s.code, s])),
};

function formatTs(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', {
    day: 'numeric', month: 'short', year: '2-digit',
  }) + ' · ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

function fmtDate(iso) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: '2-digit' });
}

function StatesList({ codes }) {
  if (!codes || codes.length === 0) return <span className="text-gray-600">—</span>;
  const shown = codes.slice(0, 3).map((c) => `${ALL_STATES[c]?.emoji || ''} ${c}`);
  const extra = codes.length - 3;
  return (
    <span className="text-gray-400 text-xs">
      {shown.join(', ')}
      {extra > 0 && <span className="text-gray-600"> +{extra}</span>}
    </span>
  );
}

export default function HistoryPanel({ history, onRerun, onLoad, onClear }) {
  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center px-4">
        <div className="w-14 h-14 bg-gray-800 border border-gray-700 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <Clock size={24} className="text-gray-500" />
        </div>
        <h3 className="text-lg font-semibold text-gray-300 mb-2">No search history yet</h3>
        <p className="text-gray-500 max-w-sm text-sm">
          Each search you run will be recorded here so you can re-run it or load cached results.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <Clock size={15} className="text-gray-500" />
          <span className="text-sm text-gray-400">
            {history.length} search{history.length !== 1 ? 'es' : ''} recorded
          </span>
        </div>
        <button
          onClick={onClear}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-red-400 hover:text-red-300 hover:bg-red-950/40 border border-red-900/40 rounded-lg transition-colors"
        >
          <Trash2 size={12} />
          Clear history
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-700 bg-gray-800/50">
              {['Date & Time', 'States', 'Industries / Keyword', 'Date Range', 'Type', 'City', 'Results', ''].map((h) => (
                <th
                  key={h}
                  className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {history.map((entry) => (
              <tr key={entry.id} className="hover:bg-gray-800/30 transition-colors">
                <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                  {formatTs(entry.timestamp)}
                </td>
                <td className="px-4 py-3">
                  <StatesList codes={entry.selectedStates} />
                </td>
                <td className="px-4 py-3 text-gray-400 text-xs max-w-[180px]">
                  {entry.industries?.length > 0 ? (
                    <span className="text-gray-300">
                      {entry.industries.slice(0, 3).join(', ')}
                      {entry.industries.length > 3 && <span className="text-gray-600"> +{entry.industries.length - 3}</span>}
                    </span>
                  ) : entry.keyword ? (
                    <span className="text-gray-300">{entry.keyword}</span>
                  ) : (
                    <span className="text-gray-600">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-xs whitespace-nowrap">
                  {entry.dateFrom ? (
                    <span className="text-gray-300">
                      {fmtDate(entry.dateFrom)}
                      <span className="text-gray-600 mx-1">→</span>
                      {fmtDate(entry.dateTo) || <span className="text-gray-600">now</span>}
                    </span>
                  ) : (
                    <span className="text-gray-600">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-gray-400 text-xs">
                  {entry.entityType && entry.entityType !== 'all' ? entry.entityType : <span className="text-gray-600">All</span>}
                </td>
                <td className="px-4 py-3 text-gray-400 text-xs">
                  {entry.city || <span className="text-gray-600">—</span>}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="text-xs bg-blue-900/50 text-blue-300 px-2 py-0.5 rounded-full border border-blue-700/50">
                    {(entry.resultCount || 0).toLocaleString()}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    {entry.items?.length > 0 && (
                      <button
                        onClick={() => onLoad(entry)}
                        title="Restore cached results instantly"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-green-300 hover:text-green-100 bg-green-900/30 hover:bg-green-900/50 border border-green-800/50 rounded-lg transition-colors whitespace-nowrap"
                      >
                        <DatabaseZap size={12} />
                        Load
                      </button>
                    )}
                    <button
                      onClick={() => onRerun(entry)}
                      title="Re-run search against API"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-300 hover:text-white bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg transition-colors whitespace-nowrap"
                    >
                      <RotateCcw size={12} />
                      Re-run
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
