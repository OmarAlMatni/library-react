import { Link } from 'react-router-dom'
import { BookX } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-paper px-4">
      <div className="text-center">
        <BookX size={32} className="text-slate mx-auto mb-3" />
        <h1 className="font-display text-2xl text-ink mb-1">Page not filed</h1>
        <p className="text-sm text-slate mb-5">This card isn't in the catalog.</p>
        <Link
          to="/"
          className="inline-block px-4 py-2 rounded-md bg-ink text-white text-sm hover:bg-ink-soft transition-colors"
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  )
}
