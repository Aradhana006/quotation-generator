import { formatCurrency, formatDate } from '../../utils/quotationCalculations'
import QuotePreview from './QuotePreview'

function SummaryCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm shadow-slate-200/40">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1.5 text-sm font-semibold text-slate-900">{value || '—'}</p>
    </div>
  )
}

function QuotationReviewStep({
  quotationData,
  selectedTemplate,
  customTemplates,
  summary,
  currency,
  revisionNumber,
}) {
  const itemCount = quotationData.items?.length || 0

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h2 className="text-base font-semibold text-slate-900">Review quotation</h2>
        <p className="mt-1 text-sm text-slate-500">
          Check the summary and preview, then save as draft or finalize.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          label="Quotation"
          value={`${quotationData.quotationDetails?.quotationNumber || '—'} · Rev ${revisionNumber}`}
        />
        <SummaryCard
          label="Customer"
          value={quotationData.customer?.companyName}
        />
        <SummaryCard
          label="Date"
          value={formatDate(quotationData.quotationDetails?.quotationDate)}
        />
        <SummaryCard
          label="Grand total"
          value={`${formatCurrency(summary.grandTotal, currency)} · ${itemCount} item${itemCount === 1 ? '' : 's'}`}
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-100 shadow-sm shadow-slate-200/40">
        <div className="border-b border-slate-200 bg-white px-5 py-3">
          <h3 className="text-sm font-semibold text-slate-900">Live preview</h3>
        </div>
        <div className="max-h-[70vh] overflow-auto p-4">
          <QuotePreview
            quotationData={quotationData}
            selectedTemplate={selectedTemplate}
            customTemplates={customTemplates}
          />
        </div>
      </div>
    </div>
  )
}

export default QuotationReviewStep
