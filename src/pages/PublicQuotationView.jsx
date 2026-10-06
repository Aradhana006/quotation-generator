import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import CustomerActionModal from '../components/public/CustomerActionModal'
import CustomerResponseActions from '../components/public/CustomerResponseActions'
import PublicQuoteDocument from '../components/public/PublicQuoteDocument'
import StatusBadge from '../components/quotation/StatusBadge'
import PublicQuotationLayout from '../layouts/PublicQuotationLayout'
import {
  acceptPublicQuotation,
  getPublicQuotation,
  rejectPublicQuotation,
  requestPublicChanges,
  toCustomerQuotationData,
} from '../services/publicQuotationService'
import { formatDate } from '../utils/quotationCalculations'

const SUCCESS_COPY = {
  accepted: {
    title: 'Quotation Accepted',
    body: 'Thank you.',
  },
  rejected: {
    title: 'Quotation Rejected',
    body: 'Your response has been recorded.',
  },
  changes_requested: {
    title: 'Change Request Submitted',
    body: 'The business will review your request.',
  },
}

function PublicQuotationView() {
  const { token } = useParams()
  const [payload, setPayload] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [action, setAction] = useState(null)
  const [resultType, setResultType] = useState(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError('')
      try {
        setPayload(await getPublicQuotation(token))
      } catch (err) {
        setError(err.message || 'Quotation link is invalid.')
        setPayload(null)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [token])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <p className="text-sm text-slate-500">Loading quotation…</p>
      </div>
    )
  }

  if (error || !payload?.quotation) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
        <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 text-center">
          <h1 className="text-lg font-semibold text-slate-900">Unable to open quotation</h1>
          <p className="mt-2 text-sm text-slate-600">{error || 'Quotation link is invalid.'}</p>
        </div>
      </div>
    )
  }

  const quotation = payload.quotation
  const quotationLabel = `${quotation.quotationNumber} Rev ${quotation.revision}`
  const success = resultType ? SUCCESS_COPY[resultType] : null

  async function handleAction(variant, fields) {
    const submit = {
      accept: acceptPublicQuotation,
      reject: rejectPublicQuotation,
      changes: requestPublicChanges,
    }[variant]
    const result = await submit(token, fields)
    setPayload(result.data)
    setResultType({
      accept: 'accepted',
      reject: 'rejected',
      changes: 'changes_requested',
    }[variant])
    setAction(null)
  }

  return (
    <PublicQuotationLayout
      company={quotation.company}
      quotationNumber={quotation.quotationNumber}
      revision={quotation.revision}
      status={quotation.status}
    >
      {success ? (
        <section className="rounded-xl border border-slate-200 bg-white p-8 text-center">
          <h1 className="text-2xl font-semibold text-slate-900">{success.title}</h1>
          <p className="mt-2 text-sm text-slate-600">Quotation: {quotationLabel}</p>
          <p className="mt-4 text-sm text-slate-700">{success.body}</p>
        </section>
      ) : (
        <div className="space-y-6">
          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Status</p>
                <div className="mt-1">
                  <StatusBadge status={quotation.status} />
                </div>
              </div>
              <p className="text-sm text-slate-600">
                Valid until: {formatDate(quotation.validUntil)}
              </p>
            </div>
            {payload.message && (
              <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">
                {payload.message}
              </p>
            )}
          </section>

          <PublicQuoteDocument
            quotationData={toCustomerQuotationData(quotation)}
            selectedTemplate={quotation.selectedTemplate}
            customTemplate={quotation.customTemplate}
          />

          <CustomerResponseActions
            permissions={payload.permissions}
            message={payload.message}
            onAccept={() => setAction('accept')}
            onReject={() => setAction('reject')}
            onRequestChanges={() => setAction('changes')}
          />
        </div>
      )}

      <CustomerActionModal
        variant={action}
        isOpen={Boolean(action)}
        onClose={() => setAction(null)}
        onSubmit={(fields) => handleAction(action, fields)}
      />
    </PublicQuotationLayout>
  )
}

export default PublicQuotationView
