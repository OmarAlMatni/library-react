import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, ArrowLeftRight, AlertTriangle, CalendarClock, Building2 } from 'lucide-react'
import Layout from '../components/Layout'
import Spinner from '../components/Spinner'
import EmptyState from '../components/EmptyState'
import StatusBadge from '../components/StatusBadge'
import { listBooks } from '../api/books'
import { listLibraries } from '../api/libraries'
import { listActiveBorrows, listOverdueBorrows } from '../api/borrows'
import { listPendingReservations } from '../api/reservations'

const BADGE_STYLES = {
  indigo: 'bg-indigo-soft text-indigo',
  teal: 'bg-teal-soft text-teal',
  blue: 'bg-blue-soft text-blue',
  green: 'bg-forest-soft text-forest',
  red: 'bg-rubric-soft text-rubric',
}

function StatCard({ icon: Icon, label, value, to, caption, badge = 'indigo' }) {
  return (
    <Link
      to={to}
      className="bg-card border border-line rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow block"
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-sm text-slate">{label}</span>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${BADGE_STYLES[badge]}`}>
          <Icon size={16} />
        </div>
      </div>
      <p className="font-display text-3xl font-bold text-ink">{value}</p>
      {caption && <p className="text-xs text-slate mt-1.5">{caption}</p>}
    </Link>
  )
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ books: 0, libraries: 0, active: 0, overdue: [], pending: [] })

  useEffect(() => {
    let cancelled = false
    async function load() {
      const [booksR, librariesR, activeR, overdueR, pendingR] = await Promise.allSettled([
        listBooks({ per_page: 1 }),
        listLibraries(),
        listActiveBorrows(),
        listOverdueBorrows(),
        listPendingReservations(),
      ])
      if (cancelled) return
      setStats({
        books: booksR.status === 'fulfilled' ? booksR.value.meta.total : 0,
        libraries: librariesR.status === 'fulfilled' ? librariesR.value.length : 0,
        active: activeR.status === 'fulfilled' ? activeR.value.length : 0,
        overdue: overdueR.status === 'fulfilled' ? overdueR.value.slice(0, 5) : [],
        pending: pendingR.status === 'fulfilled' ? pendingR.value.slice(0, 5) : [],
      })
      setLoading(false)
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <Layout title="Dashboard">
      {loading ? (
        <Spinner label="Loading overview…" />
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={BookOpen}
              label="Books catalogued"
              value={stats.books}
              to="/books"
              caption="Across all libraries"
              badge="indigo"
            />
            <StatCard
              icon={Building2}
              label="Libraries"
              value={stats.libraries}
              to="/libraries"
              caption="Branches in your network"
              badge="teal"
            />
            <StatCard
              icon={ArrowLeftRight}
              label="On loan"
              value={stats.active}
              to="/borrows"
              caption="Currently checked out"
              badge="blue"
            />
            <StatCard
              icon={AlertTriangle}
              label="Overdue"
              value={stats.overdue.length}
              to="/borrows"
              caption="Needs follow-up"
              badge="red"
            />
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-card border border-line rounded-lg overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-line">
                <h2 className="font-display text-lg text-ink">Overdue right now</h2>
                <Link to="/borrows" className="text-xs text-blue hover:underline">
                  View all
                </Link>
              </div>
              {stats.overdue.length === 0 ? (
                <EmptyState icon={AlertTriangle} title="Nothing overdue" hint="All loans are on track." />
              ) : (
                <div className="px-5">
                  {stats.overdue.map((b) => (
                    <div key={b.id} className="ledger-row py-3 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm text-ink truncate">{b.book?.title}</p>
                        <p className="text-xs text-slate font-mono">
                          {b.student?.full_name || `Student #${b.student_id}`} · due {b.due_date}
                        </p>
                      </div>
                      <StatusBadge status="overdue" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-card border border-line rounded-lg overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-line">
                <h2 className="font-display text-lg text-ink">Pending reservations</h2>
                <Link to="/reservations" className="text-xs text-blue hover:underline">
                  View all
                </Link>
              </div>
              {stats.pending.length === 0 ? (
                <EmptyState
                  icon={CalendarClock}
                  title="No pending reservations"
                  hint="New holds will show up here."
                />
              ) : (
                <div className="px-5">
                  {stats.pending.map((r) => (
                    <div key={r.id} className="ledger-row py-3 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm text-ink truncate">{r.book?.title}</p>
                        <p className="text-xs text-slate font-mono">
                          {r.student?.full_name || `Student #${r.student_id}`} · {r.reservation_date}
                        </p>
                      </div>
                      <StatusBadge status="pending" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}