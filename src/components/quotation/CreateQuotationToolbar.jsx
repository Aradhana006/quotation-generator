import StatusBadge from './StatusBadge'
import { formatCurrency } from '../../utils/quotationCalculations'

function CreateQuotationToolbar({
  quotationNumber,
  status,
  grandTotal,
  currency,
  isEditing,
  saveMessage,
  showPreviewToggle,
  showPreview,
  onTogglePreview,
  onCancel,
}) {
  const hasError = saveMessage?.includes('Unable') || saveMessage?.includes('fix')

  return (
    <div className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/95 backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-lg font-semibold tracking-tight text-slate-900">
              {isEditing ? 'Edit Quotation' : 'Create Quotation'}
            </h1>
            <StatusBadge status={status} />
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
            <span>
              <span className="text-slate-400">No.</span>{' '}
              <span className="font-medium text-slate-700">{quotationNumber || '—'}</span>
            </span>
            <span>
              <span className="text-slate-400">Total</span>{' '}
              <span className="font-semibold text-slate-900">
                {formatCurrency(grandTotal, currency)}
              </span>
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {showPreviewToggle && (
            <button
              type="button"
              onClick={onTogglePreview}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              {showPreview ? 'Hide Preview' : 'Show Preview'}
            </button>
          )}
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl px-3 py-2 text-sm font-medium text-slate-600 transition hover:text-slate-900"
          >
            Cancel
          </button>
        </div>
      </div>

      {saveMessage && (
        <p
          className={`border-t border-slate-100 px-4 py-2 text-sm sm:px-6 ${
            hasError ? 'bg-red-50 text-red-600' : 'bg-teal-50 text-teal-800'
          }`}
        >
          {saveMessage}
        </p>
      )}
    </div>
  )
}

export default CreateQuotationToolbar
