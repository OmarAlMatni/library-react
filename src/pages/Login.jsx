import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { BookMarked } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { apiErrorMessage } from '../lib/api'

export default function Login() {
  const { login, loginAsDemo } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      const dest = location.state?.from?.pathname || '/'
      navigate(dest, { replace: true })
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not sign in. Check your credentials.'))
    } finally {
      setLoading(false)
    }
  }

  function handleDemo() {
    loginAsDemo()
    const dest = location.state?.from?.pathname || '/'
    navigate(dest, { replace: true })
  }

  return (
<div className="min-h-screen flex items-center justify-center bg-ink dark:bg-[#060b14] px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-6">
          <div className="w-11 h-11 rounded-full bg-brass/15 border border-brass/40 flex items-center justify-center mb-3">
            <BookMarked size={20} className="text-brass" />
          </div>
          <h1 className="font-display text-3xl text-white">Ledger</h1>
          <p className="text-sm text-white/50 font-mono tracking-wide mt-1">
            SCHOOL LIBRARY OPS
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-card border border-white/10 rounded-lg shadow-2xl p-6"
        >
          <p className="font-display text-lg text-ink mb-4">Librarian sign in</p>

          {error && (
            <div className="mb-4 text-sm text-rubric bg-rubric-soft border border-rubric/30 rounded-md px-3 py-2">
              {error}
            </div>
          )}

          <label className="block text-sm text-ink-soft mb-1" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 mb-4 text-sm rounded-md border border-line bg-white focus:outline-none focus:ring-2 focus:ring-brass/40"
            placeholder="you@school.edu"
          />

          <label className="block text-sm text-ink-soft mb-1" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 mb-5 text-sm rounded-md border border-line bg-white focus:outline-none focus:ring-2 focus:ring-brass/40"
            placeholder="••••••••"
          />

          <button
            type="submit"
            disabled={loading}
className="w-full py-2.5 rounded-md bg-ink dark:bg-slate-800 dark:hover:bg-slate-700 text-white text-sm font-medium hover:bg-ink-soft transition-colors disabled:opacity-60"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>

          <div className="flex items-center gap-3 my-5">
            <span className="flex-1 h-px bg-line" />
            <span className="text-xs text-ink-soft">or</span>
            <span className="flex-1 h-px bg-line" />
          </div>

          <button
            type="button"
            onClick={handleDemo}
            className="w-full py-2.5 rounded-md border border-brass/50 text-brass text-sm font-medium hover:bg-brass/10 transition-colors"
          >
            Explore the demo
          </button>
        </form>

        <p className="text-center text-xs text-white/35 mt-5">
          Access is limited to registered librarians.
        </p>
      </div>
    </div>
  )
}
