import { Link } from 'react-router-dom'

function QuotationActions({
  quotation,
  onDuplicate,
  onRevise,
  onDelete,
  onArchive,
  onRestore,
  onDownload,
  onStatusChange,
}) {
  const permissions = quotation.permissions || {}

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Link
        to={`/quotations/${quotation.id}`}
        className="text-sm font-medium text-slate-700 hover:text-slate-900"
      >
        View
      </Link>
      {permissions.canEdit ? (
        <Link
          to={`/quotations/${quotation.id}/edit`}
          className="text-sm font-medium text-slate-700 hover:text-slate-900"
        >
          Edit
        </Link>
      ) : null}
      {permissions.canRevise ? (
        <button type="button" onClick={() => onRevise(quotation)} className="text-sm font-medium text-slate-700">
          Revise
        </button>
      ) : null}
      <button type="button" onClick={() => onDuplicate(quotation.id)} className="text-sm font-medium text-slate-700">
        Duplicate
      </button>
      <button type="button" onClick={() => onDownload(quotation.id)} className="text-sm font-medium text-slate-700">
        PDF
      </button>
      {permissions.allowedStatuses?.length > 0 && !quotation.archivedAt ? (
        <select
          aria-label="Change status"
          value=""
          onChange={(event) => {
            if (event.target.value) onStatusChange(quotation.id, event.target.value)
            event.target.value = ''
          }}
          className="rounded border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700"
        >
          <option value="">Status…</option>
          {permissions.allowedStatuses.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      ) : null}
      {permissions.canArchive ? (
        <button type="button" onClick={() => onArchive(quotation.id)} className="text-sm font-medium text-slate-700">
          Archive
        </button>
      ) : null}
      {permissions.canRestore ? (
        <button type="button" onClick={() => onRestore(quotation.id)} className="text-sm font-medium text-slate-700">
          Restore
        </button>
      ) : null}
      {permissions.canDelete ? (
        <button type="button" onClick={() => onDelete(quotation)} className="text-sm font-medium text-red-600">
          Delete
        </button>
      ) : null}
    </div>
  )
}

export default QuotationActions
