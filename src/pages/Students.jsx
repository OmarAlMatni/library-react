import { useState } from 'react'
import { Search, UserRound, BookOpen, CalendarClock, WifiOff } from 'lucide-react'
import Layout from '../components/Layout'
import Spinner from '../components/Spinner'
import EmptyState from '../components/EmptyState'
import StatusBadge from '../components/StatusBadge'
import { useToast } from '../lib/toast'
import { apiErrorMessage } from '../lib/api'
import { searchStudents } from '../api/students'
import { getStudentHistory } from '../api/reports'
import { listStudentReservations } from '../api/reservations'

export default function Students() {
  const toast = useToast()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  const [selected, setSelected] = useState(null)
  const [history, setHistory] = useState(null)
  const [reservations, setReservations] = useState(null)
  const [loadingDetail, setLoadingDetail] = useState(false)

  async function handleSearch(e) {
    e.preventDefault()
    if (!query.trim()) return
    setSearching(true)
    setSearchError(false)
    setHasSearched(true)
    try {
      const data = await searchStudents(query.trim())
      setResults(data)
    } catch (err) {
      setSearchError(true)
      toast.error(apiErrorMessage(err, 'Could not reach the student directory service.'))
    } finally {
      setSearching(false)
    }
  }

  async function selectStudent(student) {
    setSelected(student)
    setLoadingDetail(true)
    setHistory(null)
    setReservations(null)
    try {
      const [h, r] = await Promise.all([
        getStudentHistory(student.id),
        listStudentReservations(student.id),
      ])
      setHistory(h)
      setReservations(r)
    } catch (err) {
      toast.error(apiErrorMessage(err, "Could not load this student's history."))
    } finally {
      setLoadingDetail(false)
    }
  }

  return (
    <Layout title="Students">
      <p className="text-sm text-slate mb-5">
        Student records are looked up live from the school directory service — search by name or
        registration number.
      </p>

      <form onSubmit={handleSearch} className="flex gap-2 mb-5 max-w-md">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search students…"
            className="w-full pl-9 pr-3 py-2 text-sm rounded-md border border-line bg-white focus:outline-none focus:ring-2 focus:ring-brass/40"
          />
        </div>
        <button
          type="submit"
className="px-4 py-2 text-sm rounded-md bg-ink dark:bg-slate-800 dark:hover:bg-slate-700 text-white hover:bg-ink-soft transition-colors"
        >
          Search
        </button>
      </form>

      <div className="grid lg:grid-cols-[minmax(0,1fr)_1.4fr] gap-6">
        <div className="bg-card border border-line rounded-lg overflow-hidden">
          {searching ? (
            <div className="p-6">
              <Spinner label="Searching…" />
            </div>
          ) : searchError ? (
            <EmptyState
              icon={WifiOff}
              title="Directory unreachable"
              hint="The school-core student service didn't respond. Check SCHOOL_API_URL on the backend."
            />
          ) : !hasSearched ? (
            <EmptyState icon={UserRound} title="Search for a student" hint="Results will appear here." />
          ) : results.length === 0 ? (
            <EmptyState icon={UserRound} title="No students found" hint="Try a different search term." />
          ) : (
            <div className="px-5">
              {results.map((s) => (
                <button
                  key={s.id}
                  onClick={() => selectStudent(s)}
                  className={`w-full text-left ledger-row py-3 flex items-center gap-3 transition-colors ${
                    selected?.id === s.id ? 'bg-paper' : 'hover:bg-paper'
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-paper border border-line flex items-center justify-center shrink-0">
                    <UserRound size={14} className="text-slate" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-ink truncate">{s.full_name || `Student #${s.id}`}</p>
                    <p className="text-xs text-slate font-mono">
                      {s.registration_number ? `Reg. ${s.registration_number}` : `ID ${s.id}`}
                      {s.class_name ? ` · ${s.class_name}` : ''}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="bg-card border border-line rounded-lg overflow-hidden">
          {!selected ? (
            <EmptyState
              icon={BookOpen}
              title="No student selected"
              hint="Pick a student from the results to see their borrowing history."
            />
          ) : loadingDetail ? (
            <div className="p-6">
              <Spinner label="Loading history…" />
            </div>
          ) : (
            <div>
              <div className="px-5 py-4 border-b border-line">
                <p className="font-display text-lg text-ink">{selected.full_name}</p>
                <p className="text-xs text-slate font-mono">
                  {selected.registration_number ? `Reg. ${selected.registration_number}` : `ID ${selected.id}`}
                  {selected.class_name ? ` · ${selected.class_name}` : ''}
                </p>
              </div>

              <div className="px-5 py-3 border-b border-line flex items-center gap-2">
                <CalendarClock size={14} className="text-slate" />
                <p className="text-xs text-slate uppercase tracking-wide font-mono">
                  Reservations ({reservations?.length ?? 0})
                </p>
              </div>
              <div className="px-5">
                {(reservations?.length ?? 0) === 0 ? (
                  <p className="text-sm text-slate py-3">No reservations on record.</p>
                ) : (
                  reservations.map((r) => (
                    <div key={r.id} className="ledger-row py-2.5 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm text-ink truncate">{r.book?.title}</p>
                        <p className="text-xs text-slate font-mono">{r.reservation_date}</p>
                      </div>
                      <StatusBadge status={r.status} />
                    </div>
                  ))
                )}
              </div>

              <div className="px-5 py-3 border-t border-b border-line flex items-center gap-2">
                <BookOpen size={14} className="text-slate" />
                <p className="text-xs text-slate uppercase tracking-wide font-mono">
                  Borrow history ({history?.length ?? 0})
                </p>
              </div>
              <div className="px-5 pb-1">
                {(history?.length ?? 0) === 0 ? (
                  <p className="text-sm text-slate py-3">No borrow history on record.</p>
                ) : (
                  history.map((b) => (
                    <div key={b.id} className="ledger-row py-2.5 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm text-ink truncate">{b.book?.title}</p>
                        <p className="text-xs text-slate font-mono">
                          {b.borrow_date} → {b.return_date || 'not yet returned'}
                        </p>
                      </div>
                      <StatusBadge status={b.return_date ? 'returned' : b.is_overdue ? 'overdue' : 'active'} />
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
