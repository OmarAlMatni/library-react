const STYLES = {
  active: 'text-forest',
  returned: 'text-slate',
  overdue: 'text-rubric',
  pending: 'text-brass',
  fulfilled: 'text-forest',
  cancelled: 'text-rubric',
  expired: 'text-slate',
}

const LABELS = {
  active: 'On loan',
  returned: 'Returned',
  overdue: 'Overdue',
  pending: 'Pending',
  fulfilled: 'Fulfilled',
  cancelled: 'Cancelled',
  expired: 'Expired',
}

export default function StatusBadge({ status }) {
  const cls = STYLES[status] || 'text-slate'
  const label = LABELS[status] || status
  return <span className={`stamp ${cls}`}>{label}</span>
}
