import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Building2,
  BookOpen,
  Users,
  CalendarClock,
  ArrowLeftRight,
  BarChart3,
LogOut,
  BookMarked,
  Search,
  Bell,
  Sun,
  Moon,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useToast } from '../lib/toast'

const NAV = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/libraries', label: 'Libraries', icon: Building2 },
  { to: '/books', label: 'Books', icon: BookOpen },
  { to: '/students', label: 'Students', icon: Users },
  { to: '/reservations', label: 'Reservations', icon: CalendarClock },
  { to: '/borrows', label: 'Borrows', icon: ArrowLeftRight },
  { to: '/reports', label: 'Reports', icon: BarChart3 },
]

function initials(name) {
  if (!name) return '?'
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('')
}

export default function Layout({ children, title }) {
  const { librarian, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const toast = useToast()
  const [search, setSearch] = useState('')

  async function handleLogout() {
    await logout()
    toast.success('Signed out. See you soon.')
    navigate('/login', { replace: true })
  }

  function handleSearchSubmit(e) {
    e.preventDefault()
    if (!search.trim()) return
    navigate(`/books?title=${encodeURIComponent(search.trim())}`)
  }

  return (
    <div className="min-h-screen flex bg-paper">
<aside className="w-60 shrink-0 bg-ink dark:bg-[#060b14] text-white flex flex-col">
        <div className="px-5 py-5 border-b border-white/10 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-teal flex items-center justify-center shrink-0">
            <BookMarked size={16} className="text-ink" />
          </div>
          <div className="min-w-0">
            <p className="font-display font-bold text-[15px] leading-tight truncate">Ledger</p>
            <p className="text-[11px] text-white/45 leading-tight truncate">Library Console</p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-full text-sm transition-colors ${
                  isActive
                    ? 'bg-teal text-ink font-semibold'
                    : 'text-white/60 hover:bg-ink-soft/50 hover:text-white'
                }`
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-white/10">
          <div className="px-3 py-2 mb-1">
            <p className="text-sm text-white truncate">{librarian?.name}</p>
            <p className="text-xs text-white/45 truncate">{librarian?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-full text-sm text-white/60 hover:bg-ink-soft/50 hover:text-white transition-colors"
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="flex items-center gap-4 px-8 py-4 border-b border-line bg-card">
          <h1 className="font-display text-xl font-bold text-ink shrink-0">{title}</h1>

          <form onSubmit={handleSearchSubmit} className="flex-1 max-w-sm ml-4">
            <div className="relative">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search books by title…"
                className="w-full pl-9 pr-3 py-2 text-sm rounded-full border border-line bg-paper focus:outline-none focus:ring-2 focus:ring-teal/40 focus:bg-white transition-colors"
              />
            </div>
          </form>

<div className="flex items-center gap-3 ml-auto shrink-0">
            <button
              onClick={toggleTheme}
              className="w-9 h-9 rounded-full border border-line flex items-center justify-center text-slate hover:text-ink hover:bg-paper transition-colors"
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button
              className="relative w-9 h-9 rounded-full border border-line flex items-center justify-center text-slate hover:text-ink hover:bg-paper transition-colors"
              aria-label="Notifications"
              title="Notifications"
            >
              <Bell size={16} />
              <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-rubric" />
            </button>
            <div
              className="w-9 h-9 rounded-full bg-indigo-soft text-indigo flex items-center justify-center text-xs font-semibold shrink-0"
              title={librarian?.name}
            >
              {initials(librarian?.name)}
            </div>
          </div>
        </header>
        <main className="flex-1 px-8 py-6 overflow-auto">{children}</main>
      </div>
    </div>
  )
}