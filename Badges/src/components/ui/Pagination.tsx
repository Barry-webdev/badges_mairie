import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  page: number;
  pages: number;
  total: number;
  limit: number;
  onChange: (page: number) => void;
}

export const Pagination = ({ page, pages, total, limit, onChange }: PaginationProps) => {
  if (pages <= 1) return null;

  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
      <p className="text-sm text-gray-500">
        Affichage <span className="font-medium">{from}–{to}</span> sur <span className="font-medium">{total}</span>
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onChange(page - 1)}
          disabled={page === 1}
          className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {Array.from({ length: Math.min(5, pages) }, (_, i) => {
          let p: number;
          if (pages <= 5) {
            p = i + 1;
          } else if (page <= 3) {
            p = i + 1;
          } else if (page >= pages - 2) {
            p = pages - 4 + i;
          } else {
            p = page - 2 + i;
          }
          return (
            <button
              key={p}
              onClick={() => onChange(p)}
              className={`w-8 h-8 text-sm rounded-lg transition-colors ${
                p === page
                  ? 'bg-blue-900 text-white font-medium'
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              {p}
            </button>
          );
        })}

        <button
          onClick={() => onChange(page + 1)}
          disabled={page === pages}
          className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
