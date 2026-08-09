import { useEffect, useRef, useState } from 'react'
import { Search, X, UserRound } from 'lucide-react'
import { searchStudents } from '../api/students'

export default function StudentPicker({ value, onChange, error }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [searchFailed, setSearchFailed] = useState(false)
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
    setSearchFailed(false)
    const handle = setTimeout(() => {
      searchStudents(query.trim())
        .then((data) => setResults(data))
        .catch(() => setSearchFailed(true))
        .finally(() => setLoading(false))
    }, 350)
    return () => clearTimeout(handle)
  }, [query])

  function select(student) {
    onChange(student)
    setOpen(false)
    setQuery('')
  }

  return (
    <div ref={boxRef} className="relative">
      <label className="block text-sm text-ink-soft mb-1">Student</label>

      {value ? (
        <div className="flex items-center justify-between border border-line rounded-md px-3 py-2 bg-paper">
          <div className="flex items-center gap-2 min-w-0">
            <UserRound size={15} className="text-slate shrink-0" />
            <div className="min-w-0">
              <p className="text-sm text-ink truncate">{value.full_name || `Student #${value.id}`}</p>
              <p className="text-xs text-slate font-mono truncate">
                {value.registration_number ? `Reg. ${value.registration_number}` : `ID ${value.id}`}
                {value.class_name ? ` · ${value.class_name}` : ''}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onChange(null)}
            className="text-slate hover:text-ink shrink-0 ml-2"
            aria-label="Clear selected student"
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
            placeholder="Search by name or registration number…"
            className={`w-full pl-9 pr-3 py-2 text-sm rounded-md border bg-white focus:outline-none focus:ring-2 focus:ring-brass/40 ${
              error ? 'border-rubric' : 'border-line'
            }`}
          />
        </div>
      )}

      {open && !value && query.trim() && (
        <div className="absolute z-20 mt-1 w-full bg-card border border-line rounded-md shadow-lg max-h-56 overflow-auto">
          {loading && <p className="px-3 py-2.5 text-sm text-slate">Searching…</p>}
          {!loading && searchFailed && (
            <p className="px-3 py-2.5 text-sm text-rubric">
              Couldn't reach the student directory service.
            </p>
          )}
          {!loading && !searchFailed && results.length === 0 && (
            <p className="px-3 py-2.5 text-sm text-slate">No students found.</p>
          )}
          {!loading &&
            results.map((s) => (
              <button
                type="button"
                key={s.id}
                onClick={() => select(s)}
                className="w-full text-left px-3 py-2 text-sm hover:bg-paper transition-colors ledger-row"
              >
                <p className="text-ink">{s.full_name || `Student #${s.id}`}</p>
                <p className="text-xs text-slate font-mono">
                  {s.registration_number ? `Reg. ${s.registration_number}` : `ID ${s.id}`}
                  {s.class_name ? ` · ${s.class_name}` : ''}
                </p>
              </button>
            ))}
        </div>
      )}
      {error && <p className="text-xs text-rubric mt-1">{error}</p>}
    </div>
  )
}
