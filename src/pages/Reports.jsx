import { useEffect, useState } from 'react'
import { TrendingUp, BookOpen, AlertTriangle, Hash } from 'lucide-react'
import Layout from '../components/Layout'
import Spinner from '../components/Spinner'
import EmptyState from '../components/EmptyState'
import { useToast } from '../lib/toast'
import { apiErrorMessage } from '../lib/api'
import * as reportsApi from '../api/reports'

function StatPill({ label, value, accent }) {
  return (
    <div className="bg-card border border-line rounded-lg p-4 text-center">
      <p className={`font-display text-2xl ${accent}`}>{value}</p>
      <p className="text-xs text-slate font-mono uppercase tracking-wide mt-1">{label}</p>
    </div>
  )
}

function BookListCard({ title, icon: Icon, books, loading, showCount, emptyHint }) {
  return (
    <div className="bg-card border border-line rounded-lg overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-3.5 border-b border-line">
        <Icon size={16} className="text-slate" />
        <h2 className="font-display text-lg text-ink">{title}</h2>
      </div>
      {loading ? (
        <div className="p-6">
          <Spinner label="Loading…" />
        </div>
      ) : !books || books.length === 0 ? (
        <EmptyState icon={Icon} title="Nothing to show" hint={emptyHint} />
      ) : (
        <div className="px-5 max-h-80 overflow-auto">
          {books.map((b) => (
            <div key={b.id} className="ledger-row py-2.5 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm text-ink truncate">{b.title}</p>
                <p className="text-xs text-slate font-mono truncate">{b.author}</p>
              </div>
              {showCount && (
                <span className="text-xs font-mono text-brass shrink-0">{b.borrows_count ?? 0}×</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Reports() {
  const toast = useToast()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState(null)
  const [mostBorrowed, setMostBorrowed] = useState([])
  const [currentlyBorrowed, setCurrentlyBorrowed] = useState([])
  const [overdueBooks, setOverdueBooks] = useState([])

  useEffect(() => {
    let cancelled = false
    Promise.allSettled([
      reportsApi.getReservationStats(),
      reportsApi.getMostBorrowedBooks(),
      reportsApi.getCurrentlyBorrowed(),
      reportsApi.getOverdueBooks(),
    ]).then(([statsR, mostR, currentR, overdueR]) => {
      if (cancelled) return
      if (statsR.status === 'fulfilled') setStats(statsR.value)
      else toast.error(apiErrorMessage(statsR.reason, 'Could not load reservation stats.'))
      if (mostR.status === 'fulfilled') setMostBorrowed(mostR.value)
      if (currentR.status === 'fulfilled') setCurrentlyBorrowed(currentR.value)
      if (overdueR.status === 'fulfilled') setOverdueBooks(overdueR.value)
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Layout title="Reports">
      <div className="space-y-8">
        <section>
          <h2 className="text-xs text-slate font-mono uppercase tracking-wide mb-3">
            Reservation status breakdown
          </h2>
          {loading ? (
            <Spinner label="Loading stats…" />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatPill label="Pending" value={stats?.pending ?? 0} accent="text-brass" />
              <StatPill label="Fulfilled" value={stats?.fulfilled ?? 0} accent="text-forest" />
              <StatPill label="Cancelled" value={stats?.cancelled ?? 0} accent="text-rubric" />
              <StatPill label="Expired" value={stats?.expired ?? 0} accent="text-slate" />
            </div>
          )}
        </section>

        <div className="grid lg:grid-cols-2 gap-6">
          <BookListCard
            title="Most borrowed"
            icon={TrendingUp}
            books={mostBorrowed}
            loading={loading}
            showCount
            emptyHint="No borrow activity yet."
          />
          <BookListCard
            title="Currently on loan"
            icon={BookOpen}
            books={currentlyBorrowed}
            loading={loading}
            emptyHint="Nothing is checked out right now."
          />
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <BookListCard
            title="Overdue titles"
            icon={AlertTriangle}
            books={overdueBooks}
            loading={loading}
            emptyHint="No overdue books — nice work."
          />
          <div className="bg-card border border-line rounded-lg p-5 flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-2">
              <Hash size={15} className="text-slate" />
              <p className="font-display text-lg text-ink">Student history</p>
            </div>
            <p className="text-sm text-slate">
              Looking for a specific student's full borrowing and reservation history? Search for
              them on the{' '}
              <a href="/students" className="text-brass hover:underline">
                Students
              </a>{' '}
              page.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  )
}
