import { createContext, useCallback, useContext, useRef, useState } from 'react'
import { CheckCircle2, XCircle, X } from 'lucide-react'

const ToastContext = createContext(null)

let idCounter = 0

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const timers = useRef({})

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
    if (timers.current[id]) {
      clearTimeout(timers.current[id])
      delete timers.current[id]
    }
  }, [])

  const push = useCallback(
    (message, type = 'success') => {
      const id = ++idCounter
      setToasts((prev) => [...prev, { id, message, type }])
      timers.current[id] = setTimeout(() => dismiss(id), 4200)
    },
    [dismiss]
  )

  const value = {
    success: (msg) => push(msg, 'success'),
    error: (msg) => push(msg, 'error'),
  }

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 w-80 max-w-[90vw]">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={`flex items-start gap-2.5 rounded-md border px-3.5 py-3 shadow-lg bg-card text-sm animate-in ${
              t.type === 'error' ? 'border-rubric/40' : 'border-forest/40'
            }`}
            style={{ animation: 'toast-in 0.18s ease-out' }}
          >
            {t.type === 'error' ? (
              <XCircle size={18} className="text-rubric shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2 size={18} className="text-forest shrink-0 mt-0.5" />
            )}
            <p className="flex-1 text-ink leading-snug">{t.message}</p>
            <button
              onClick={() => dismiss(t.id)}
              className="text-slate hover:text-ink shrink-0"
              aria-label="Dismiss notification"
            >
              <X size={15} />
            </button>
          </div>
        ))}
      </div>
      <style>{`
        @keyframes toast-in {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
