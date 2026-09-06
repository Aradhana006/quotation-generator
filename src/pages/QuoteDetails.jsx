import { Link, useNavigate, useParams } from 'react-router-dom'
import PageContainer from '../components/PageContainer'
import QuotePreview from '../components/quotation/QuotePreview'
import StatusBadge from '../components/quotation/StatusBadge'
import { useQuotations } from '../context/QuotationContext'
import { useTemplates } from '../context/TemplateContext'
import {
  formatCurrency,
  formatDate,
  getQuotationSummary,
} from '../utils/quotationCalculations'

function QuoteDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getQuotationById, deleteQuotation, duplicateQuotation } = useQuotations()
  const { customTemplates } = useTemplates()

  const quotation = getQuotationById(id)

  if (!quotation) {
    return (
      <PageContainer title="Quotation Not Found">
        <p className="text-sm text-slate-500">This quotation could not be found.</p>
        <Link to="/quotations" className="mt-4 inline-block text-sm font-medium text-slate-700">
          Back to Quotations
        </Link>
      </PageContainer>
    )
  }

  const summary = getQuotationSummary(
    quotation.items,
    quotation.additionalCharges || [],
  )
  const currency = quotation.quotationDetails?.currency || 'INR'

  function handleDelete() {
    const confirmed = window.confirm(
      `Delete quotation ${quotation.quotationDetails?.quotationNumber}? This cannot be undone.`,
    )
    if (!confirmed) return
    deleteQuotation(quotation.id)
    navigate('/quotations')
  }

  function handleDuplicate() {
    const duplicate = duplicateQuotation(quotation.id)
    if (duplicate) {
      navigate(`/quotations/${duplicate.id}/edit`)
    }
  }

  const quotationData = {
    status: quotation.status,
    company: quotation.company,
    customer: quotation.customer,
    quotationDetails: quotation.quotationDetails,
    coverLetter: quotation.coverLetter,
    items: quotation.items,
    additionalCharges: quotation.additionalCharges || [],
    notes: quotation.notes || '',
    paymentTerms: quotation.paymentTerms || '',
    deliveryTerms: quotation.deliveryTerms || '',
    terms: quotation.terms || [],
    bankDetails: quotation.bankDetails,
    signature: quotation.signature,
  }

  return (
    <PageContainer
      title={quotation.quotationDetails?.quotationNumber || 'Quotation Details'}
      description="Read-only view of the saved quotation."
    >
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <StatusBadge status={quotation.status} />
          <span className="text-sm text-slate-500">
            Updated {formatDate(quotation.updatedAt?.split('T')[0])}
          </span>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            to={`/quotations/${quotation.id}/edit`}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Edit
          </Link>
          <button
            type="button"
            onClick={handleDuplicate}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Duplicate
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium uppercase text-slate-500">Customer</p>
          <p className="mt-1 font-medium text-slate-900">
            {quotation.customer?.companyName || '—'}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium uppercase text-slate-500">Date</p>
          <p className="mt-1 font-medium text-slate-900">
            {formatDate(quotation.quotationDetails?.quotationDate)}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium uppercase text-slate-500">Valid Until</p>
          <p className="mt-1 font-medium text-slate-900">
            {formatDate(quotation.quotationDetails?.validUntil)}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium uppercase text-slate-500">Grand Total</p>
          <p className="mt-1 font-medium text-slate-900">
            {formatCurrency(summary.grandTotal, currency)}
          </p>
        </div>
      </div>

      <QuotePreview
        quotationData={quotationData}
        selectedTemplate={quotation.selectedTemplate}
        customTemplates={customTemplates}
      />
    </PageContainer>
  )
}

export default QuoteDetails
