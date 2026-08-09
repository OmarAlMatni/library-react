import { Loader2 } from 'lucide-react'

export default function Spinner({ label, size = 18 }) {
  return (
    <div className="flex items-center gap-2 text-slate text-sm">
      <Loader2 size={size} className="animate-spin" />
      {label && <span>{label}</span>}
    </div>
  )
}
