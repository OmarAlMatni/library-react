import { ChevronLeft, ChevronRight } from 'lucide-react'

// meta: Laravel paginator meta { current_page, last_page, total, from, to }
export default function Pagination({ meta, onPageChange }) {
  if (!meta || meta.last_page <= 1) return null

  return (
    <div className="flex items-center justify-between px-1 py-3 text-sm">
      <p className="text-slate">
        Showing <span className="text-ink font-medium">{meta.from ?? 0}</span>&ndash;
        <span className="text-ink font-medium">{meta.to ?? 0}</span> of{' '}
        <span className="text-ink font-medium">{meta.total}</span>
      </p>
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onPageChange(meta.current_page - 1)}
          disabled={meta.current_page <= 1}
          className="p-1.5 rounded-md border border-line disabled:opacity-40 hover:bg-paper transition-colors"
          aria-label="Previous page"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="font-mono text-xs text-slate px-1">
          {meta.current_page} / {meta.last_page}
        </span>
        <button
          onClick={() => onPageChange(meta.current_page + 1)}
          disabled={meta.current_page >= meta.last_page}
          className="p-1.5 rounded-md border border-line disabled:opacity-40 hover:bg-paper transition-colors"
          aria-label="Next page"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}
