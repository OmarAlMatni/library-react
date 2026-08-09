export default function EmptyState({ icon: Icon, title, hint, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      {Icon && (
        <div className="w-11 h-11 rounded-full bg-paper border border-line flex items-center justify-center mb-3">
          <Icon size={20} className="text-slate" />
        </div>
      )}
      <p className="font-display text-lg text-ink">{title}</p>
      {hint && <p className="text-sm text-slate mt-1 max-w-sm">{hint}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
