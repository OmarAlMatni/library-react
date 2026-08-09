import Modal from './Modal'
import { AlertTriangle } from 'lucide-react'

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message,
  confirmLabel = 'Confirm',
  danger = true,
  loading = false,
}) {
  return (
    <Modal open={open} onClose={onClose} title={title} width="max-w-sm">
      <div className="flex gap-3">
        <div
          className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center ${
            danger ? 'bg-rubric-soft text-rubric' : 'bg-brass-soft text-brass'
          }`}
        >
          <AlertTriangle size={17} />
        </div>
        <p className="text-sm text-ink-soft leading-relaxed">{message}</p>
      </div>
      <div className="flex justify-end gap-2 mt-5">
        <button
          onClick={onClose}
          className="px-3.5 py-2 text-sm rounded-md border border-line text-ink-soft hover:bg-paper transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className={`px-3.5 py-2 text-sm rounded-md text-white transition-colors disabled:opacity-60 ${
danger ? 'bg-rubric hover:bg-rubric/90' : 'bg-ink dark:bg-slate-800 dark:hover:bg-slate-700 hover:bg-ink-soft'
          }`}
        >
          {loading ? 'Working…' : confirmLabel}
        </button>
      </div>
    </Modal>
  )
}
