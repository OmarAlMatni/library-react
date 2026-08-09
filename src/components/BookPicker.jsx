import { useEffect, useRef, useState } from 'react'
import { Search, X, BookOpen } from 'lucide-react'
import { listBooks } from '../api/books'

export default function BookPicker({ value, onChange, error }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const boxRef = useRef(null)

  useEffect(() => {
    function onClickOutside(e) {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      return
    }
    setLoading(true)
    const handle = setTimeout(() => {
      listBooks({ title: query.trim(), per_page: 8 })
        .then((data) => setResults(data.data))
        .catch(() => setResults([]))
        .finally(() => setLoading(false))
    }, 350)
    return () => clearTimeout(handle)
  }, [query])

  function select(book) {
    onChange(book)
    setOpen(false)
    setQuery('')
  }

  return (
    <div ref={boxRef} className="relative">
      <label className="block text-sm text-ink-soft mb-1">Book</label>

      {value ? (
        <div className="flex items-center justify-between border border-line rounded-md px-3 py-2 bg-paper">
          <div className="flex items-center gap-2 min-w-0">
            <BookOpen size={15} className="text-slate shrink-0" />
            <div className="min-w-0">
              <p className="text-sm text-ink truncate">{value.title}</p>
              <p className="text-xs text-slate font-mono truncate">
                {value.author} · {value.isbn}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onChange(null)}
            className="text-slate hover:text-ink shrink-0 ml-2"
            aria-label="Clear selected book"
          >
            <X size={15} />
          </button>
        </div>
      ) : (
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setOpen(true)}
            placeholder="Search by title…"
            className={`w-full pl-9 pr-3 py-2 text-sm rounded-md border bg-white focus:outline-none focus:ring-2 focus:ring-brass/40 ${
              error ? 'border-rubric' : 'border-line'
            }`}
          />
        </div>
      )}

      {open && !value && query.trim() && (
        <div className="absolute z-20 mt-1 w-full bg-card border border-line rounded-md shadow-lg max-h-56 overflow-auto">
          {loading && <p className="px-3 py-2.5 text-sm text-slate">Searching…</p>}
          {!loading && results.length === 0 && (
            <p className="px-3 py-2.5 text-sm text-slate">No books found.</p>
          )}
          {!loading &&
            results.map((b) => (
              <button
                type="button"
                key={b.id}
                onClick={() => select(b)}
                className="w-full text-left px-3 py-2 text-sm hover:bg-paper transition-colors ledger-row"
              >
                <p className="text-ink">{b.title}</p>
                <p className="text-xs text-slate font-mono">
                  {b.author} · {b.isbn}
                </p>
              </button>
            ))}
        </div>
      )}
      {error && <p className="text-xs text-rubric mt-1">{error}</p>}
    </div>
  )
}
