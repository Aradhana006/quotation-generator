import { formatDate } from '../../utils/quotationCalculations'

const TYPE_LABELS = {
  accepted: 'Accepted',
  rejected: 'Rejected',
  changes_requested: 'Changes Requested',
}

function CustomerResponsePanel({ responses = [], canRevise, onCreateRevision }) {
  const latest = responses[0]

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5">
      <h2 className="mb-4 text-lg font-semibold text-slate-900">Customer Response</h2>
      {!latest ? (
        <p className="text-sm text-slate-500">No customer response yet.</p>
      ) : (
        <div className="space-y-4">
          <div className="rounded-md border border-slate-100 bg-slate-50 px-4 py-3">
            <p className="text-sm font-semibold text-slate-900">
              {TYPE_LABELS[latest.responseType] || latest.responseType}
            </p>
            <p className="mt-1 text-sm text-slate-600">
              {formatDate(latest.createdAt)}
              {latest.customerName ? ` · ${latest.customerName}` : ''}
              {latest.customerEmail ? ` · ${latest.customerEmail}` : ''}
            </p>
            {latest.comment ? (
              <p className="mt-2 whitespace-pre-line text-sm text-slate-700">{latest.comment}</p>
            ) : null}
            {latest.responseType === 'changes_requested' && canRevise ? (
              <button
                type="button"
                onClick={onCreateRevision}
                className="mt-3 rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white"
              >
                Create Revision
              </button>
            ) : null}
          </div>
          {responses.length > 1 ? (
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Earlier responses</p>
              {responses.slice(1).map((response) => (
                <p key={response.id} className="text-sm text-slate-600">
                  {formatDate(response.createdAt)} · {TYPE_LABELS[response.responseType] || response.responseType}
                  {response.customerName ? ` · ${response.customerName}` : ''}
                </p>
              ))}
            </div>
          ) : null}
        </div>
      )}
    </section>
  )
}

export default CustomerResponsePanel
