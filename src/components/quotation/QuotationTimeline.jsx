import { formatDate } from '../../utils/quotationCalculations'

const ACTION_LABELS = {
  created: 'Quotation created',
  updated: 'Updated',
  status_changed: 'Status changed',
  revised: 'Revision created',
  duplicated: 'Duplicated',
  deleted: 'Deleted',
  archived: 'Archived',
  restored: 'Restored',
  public_link_created: 'Public link created',
  public_link_revoked: 'Public link revoked',
  customer_viewed: 'Customer viewed',
  customer_accepted: 'Customer accepted',
  customer_rejected: 'Customer rejected',
  customer_requested_changes: 'Customer requested changes',
}

function QuotationTimeline({ events = [] }) {
  if (!events.length) {
    return <p className="text-sm text-slate-500">No history events yet.</p>
  }

  return (
    <ol className="space-y-3">
      {events.map((event) => (
        <li key={event.id} className="rounded-md border border-slate-100 bg-slate-50 px-3 py-2 text-sm">
          <p className="font-medium text-slate-800">{ACTION_LABELS[event.action] || event.action}</p>
          <p className="text-slate-500">
            {event.user ? `${event.user} · ` : ''}
            {formatDate(String(event.createdAt || '').split('T')[0])}
            {event.from && event.to ? ` · ${event.from} → ${event.to}` : ''}
            {event.revision !== undefined && event.action === 'revised' ? ` · Rev ${event.revision}` : ''}
            {event.metadata?.quotationRevision !== undefined
            && String(event.action || '').startsWith('customer_')
              ? ` · Rev ${event.metadata.quotationRevision}`
              : ''}
          </p>
        </li>
      ))}
    </ol>
  )
}

export default QuotationTimeline
