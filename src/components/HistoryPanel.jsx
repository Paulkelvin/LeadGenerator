import { RotateCcw, Clock, Trash2, DatabaseZap } from 'lucide-react';
import { SIC_CODE_MAP } from '../data/sicCodes';
import { ANZSIC_CODE_MAP } from '../data/anzsicCodes';

function formatTs(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: '2-digit',
  }) + ' · ' + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

function fmtDate(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' });
}

function IndustriesSummary({ codes, country }) {
  if (!codes || codes.length === 0) {
    return <span className="text-gray-600">Any</span>;
  }
  const map = country === 'nz' ? ANZSIC_CODE_MAP : SIC_CODE_MAP;
  const labelled = codes.map((c) => map[c] || c);
  const shown = labelled.slice(0, 2);
  const extra = labelled.length - 2;
  return (
    <span className="text-gray-400 text-xs">
      {shown.join(', ')}
      {extra > 0 && <span className="text-gray-600"> +{extra} more</span>}
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
          Each search you run will be recorded here so you can re-run it or track what you've already looked at.
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
              {['Date & Time', 'Country', 'Location', 'Date Range', 'Industries', 'Results', ''].map((h) => (
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
                <td className="px-4 py-3 text-sm whitespace-nowrap">
                  {entry.country === 'nz' ? '🇳🇿 NZ' : '🇬🇧 UK'}
                </td>
                <td className="px-4 py-3 text-gray-400 text-xs">
                  {entry.location || <span className="text-gray-600">—</span>}
                </td>
                <td className="px-4 py-3 text-xs whitespace-nowrap">
                  {fmtDate(entry.incorporatedFrom) ? (
                    <span className="text-gray-300">
                      {fmtDate(entry.incorporatedFrom)}
                      <span className="text-gray-600 mx-1">→</span>
                      {fmtDate(entry.incorporatedTo) || <span className="text-gray-600">now</span>}
                    </span>
                  ) : (
                    <span className="text-gray-600">—</span>
                  )}
                </td>
                <td className="px-4 py-3 max-w-[220px]">
                  <IndustriesSummary codes={entry.sicCodes} country={entry.country} />
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
