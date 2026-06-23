import { Clock, RotateCcw, Trash2 } from 'lucide-react';
import { SIC_CODE_MAP } from '../data/sicCodes';

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) +
    ' ' + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

export default function HistoryPanel({ history, onRerun, onClear }) {
  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center px-4">
        <div className="text-5xl mb-4">🕐</div>
        <h3 className="text-xl font-semibold text-gray-300 mb-2">No search history yet</h3>
        <p className="text-gray-500 max-w-sm">
          Each search you run will be saved here so you can quickly re-run it.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
        <span className="text-sm text-gray-400">
          {history.length} saved search{history.length !== 1 ? 'es' : ''}
        </span>
        <button
          onClick={onClear}
          className="flex items-center gap-2 px-3 py-1.5 text-xs text-gray-400 hover:text-red-400 border border-gray-700 hover:border-red-800 rounded-lg transition-colors"
        >
          <Trash2 size={13} />
          Clear history
        </button>
      </div>

      <ul className="divide-y divide-gray-800">
        {history.map((entry) => {
          const sicsLabels = (entry.sicCodes || []).map((c) =>
            SIC_CODE_MAP[c] ? `${c} – ${SIC_CODE_MAP[c]}` : c
          );

          return (
            <li key={entry.id} className="px-4 py-3 flex items-start gap-3 hover:bg-gray-800/30">
              <Clock size={15} className="text-gray-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-gray-500">{formatDate(entry.timestamp)}</span>
                  <span className="text-xs bg-blue-900/40 text-blue-300 px-1.5 py-0.5 rounded-full border border-blue-800/50">
                    {(entry.resultCount || 0).toLocaleString()} results
                  </span>
                </div>
                <div className="mt-1 flex flex-wrap gap-1">
                  {entry.location && (
                    <span className="text-xs bg-gray-800 text-gray-300 px-2 py-0.5 rounded-full border border-gray-700">
                      📍 {entry.location}
                    </span>
                  )}
                  {entry.incorporatedFrom && (
                    <span className="text-xs bg-gray-800 text-gray-300 px-2 py-0.5 rounded-full border border-gray-700">
                      From {entry.incorporatedFrom}
                    </span>
                  )}
                  {sicsLabels.slice(0, 3).map((label) => (
                    <span key={label} className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full border border-gray-700 font-mono truncate max-w-[220px]">
                      {label}
                    </span>
                  ))}
                  {sicsLabels.length > 3 && (
                    <span className="text-xs text-gray-600">+{sicsLabels.length - 3} more</span>
                  )}
                </div>
              </div>
              <button
                onClick={() => onRerun(entry)}
                title="Re-run this search"
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-blue-400 hover:text-blue-300 border border-blue-800/50 hover:border-blue-600 rounded-lg transition-colors flex-shrink-0"
              >
                <RotateCcw size={12} />
                Re-run
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
