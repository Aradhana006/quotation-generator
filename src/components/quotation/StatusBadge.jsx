import { STATUS_LABELS } from '../../utils/quotationCalculations'

const statusStyles = {
  draft: 'bg-slate-100 text-slate-700',
  sent: 'bg-blue-100 text-blue-700',
  accepted: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  expired: 'bg-amber-100 text-amber-700',
  cancelled: 'bg-orange-100 text-orange-800',
}

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[status] || statusStyles.draft}`}
    >
      {STATUS_LABELS[status] || status}
    </span>
  )
}

export default StatusBadge
