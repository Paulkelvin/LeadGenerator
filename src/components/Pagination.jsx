import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ startIndex, pageSize, total, onPage }) {
  const currentPage = Math.floor(startIndex / pageSize) + 1;
  const totalPages = Math.ceil(total / pageSize);
  const hasPrev = startIndex > 0;
  const hasNext = startIndex + pageSize < total;

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-700">
      <span className="text-sm text-gray-500">
        Page {currentPage} of {totalPages} &mdash;{' '}
        <span className="text-gray-400">{total.toLocaleString()} results</span>
      </span>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPage(Math.max(0, startIndex - pageSize))}
          disabled={!hasPrev}
          className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-800 border border-gray-700 rounded-lg text-gray-300 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft size={15} />
          Prev
        </button>
        <button
          onClick={() => onPage(startIndex + pageSize)}
          disabled={!hasNext}
          className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-800 border border-gray-700 rounded-lg text-gray-300 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Next
          <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
}
