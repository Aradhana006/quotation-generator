import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import PageContainer from '../components/PageContainer'
import CustomerResponsePanel from '../components/quotation/CustomerResponsePanel'
import PublicLinkPanel from '../components/quotation/PublicLinkPanel'
import QuotePreview from '../components/quotation/QuotePreview'
import QuotationTimeline from '../components/quotation/QuotationTimeline'
import RevisionHistory from '../components/quotation/RevisionHistory'
import StatusBadge from '../components/quotation/StatusBadge'
import { useQuotations } from '../context/QuotationContext'
import { useTemplates } from '../context/TemplateContext'
import {
  createPublicLink,
  downloadQuotationPdf,
  getPublicLink,
  getQuotationHistory,
  getQuotationResponses,
  revokePublicLinks,
} from '../services/quotationService'
import {
  formatCurrency,
  formatDate,
  getQuotationSummary,
} from '../utils/quotationCalculations'

function QuoteDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const {
    fetchQuotationById,
    deleteQuotation,
    duplicateQuotation,
    reviseQuotation,
    archiveQuotation,
    restoreQuotation,
  } = useQuotations()
  const { customTemplates } = useTemplates()

  const [quotation, setQuotation] = useState(null)
  const [history, setHistory] = useState([])
  const [responses, setResponses] = useState([])
  const [publicLink, setPublicLink] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionError, setActionError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [pdfLoading, setPdfLoading] = useState(false)
  const [showPreview, setShowPreview] = useState(true)
  const [generatingLink, setGeneratingLink] = useState(false)
  const [copyingLink, setCopyingLink] = useState(false)
  const [sharingLink, setSharingLink] = useState(false)
  const [revokingLink, setRevokingLink] = useState(false)

  async function refreshQuotation(quotationId = id) {
    const data = await fetchQuotationById(quotationId)
    if (!data) {
      setError('Quotation not found.')
      setQuotation(null)
      setHistory([])
      setResponses([])
      setPublicLink(null)
      return null
    }
    setQuotation(data)
    try {
      setHistory(await getQuotationHistory(quotationId))
    } catch {
      setHistory([])
    }
    try {
      setResponses(await getQuotationResponses(quotationId))
    } catch {
      setResponses([])
    }
    try {
      setPublicLink(await getPublicLink(quotationId))
    } catch {
      setPublicLink(null)
    }
    return data
  }

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError('')
      setSuccessMessage('')
      await refreshQuotation(id)
      setLoading(false)
    }
    load()
  }, [id, fetchQuotationById])

  if (loading) {
    return (
      <PageContainer title="Quotation Details">
        <p className="text-sm text-slate-500">Loading quotation...</p>
      </PageContainer>
    )
  }

  if (error || !quotation) {
    return (
      <PageContainer title="Quotation Not Found">
        <p className="text-sm text-slate-500">{error || 'This quotation could not be found.'}</p>
        <Link to="/quotations" className="mt-4 inline-block text-sm font-medium text-slate-700">
          Back to Quotations
        </Link>
      </PageContainer>
    )
  }

  const summary = quotation.summary || getQuotationSummary(
    quotation.items,
    quotation.additionalCharges || [],
  )
  const currency = quotation.quotationDetails?.currency || 'INR'
  const permissions = quotation.permissions || {}
  const quotationNumber = quotation.quotationDetails?.quotationNumber || 'Quotation'

  async function handleDelete() {
    const confirmed = window.confirm(
      `Delete draft ${quotationNumber} Rev ${quotation.revisionNumber}?`,
    )
    if (!confirmed) return
    setActionError('')
    try {
      await deleteQuotation(quotation.id)
      navigate('/quotations')
    } catch (err) {
      setActionError(err.message || 'Unable to delete quotation.')
    }
  }

  async function handleDuplicate() {
    setActionError('')
    try {
      const duplicate = await duplicateQuotation(quotation.id)
      if (duplicate) navigate(`/quotations/${duplicate.id}/edit`)
    } catch (err) {
      setActionError(err.message || 'Unable to duplicate quotation.')
    }
  }

  async function handleRevise() {
    const confirmed = window.confirm(
      'This will create a new revision while preserving the existing quotation.',
    )
    if (!confirmed) return
    setActionError('')
    try {
      const revision = await reviseQuotation(quotation.id)
      navigate(`/quotations/${revision.id}/edit`)
    } catch (err) {
      setActionError(err.message || 'Unable to create revision.')
    }
  }

  async function handleArchive() {
    setActionError('')
    try {
      setQuotation(await archiveQuotation(quotation.id))
    } catch (err) {
      setActionError(err.message || 'Unable to archive quotation.')
    }
  }

  async function handleRestore() {
    setActionError('')
    try {
      setQuotation(await restoreQuotation(quotation.id))
    } catch (err) {
      setActionError(err.message || 'Unable to restore quotation.')
    }
  }

  async function handleDownloadPdf() {
    setActionError('')
    setSuccessMessage('')
    setPdfLoading(true)
    try {
      await downloadQuotationPdf(quotation.id)
    } catch (err) {
      setActionError(err.message || 'Unable to generate PDF.')
    } finally {
      setPdfLoading(false)
    }
  }

  async function handleGenerateLink() {
    setActionError('')
    setSuccessMessage('')
    setGeneratingLink(true)
    try {
      const link = await createPublicLink(quotation.id)
      setPublicLink(link)
      setSuccessMessage(
        link.reused
          ? 'Active public link loaded.'
          : 'Public link created. Status is now Sent.',
      )
      await refreshQuotation(quotation.id)
    } catch (err) {
      setActionError(err.message || 'Unable to create public link.')
    } finally {
      setGeneratingLink(false)
    }
  }

  async function handleCopyLink() {
    setActionError('')
    setCopyingLink(true)
    try {
      let link = publicLink
      if (!link?.url) {
        link = await createPublicLink(quotation.id)
        setPublicLink(link)
        await refreshQuotation(quotation.id)
      }
      if (!link?.url) throw new Error('No public link available.')
      await navigator.clipboard.writeText(link.url)
      setSuccessMessage('Link copied successfully.')
    } catch (err) {
      setActionError(err.message || 'Unable to copy link.')
    } finally {
      setCopyingLink(false)
    }
  }

  async function handleShareLink() {
    setActionError('')
    setSharingLink(true)
    try {
      let link = publicLink
      if (!link?.url) {
        link = await createPublicLink(quotation.id)
        setPublicLink(link)
        await refreshQuotation(quotation.id)
      }
      if (!link?.url) throw new Error('No public link available.')

      if (typeof navigator.share === 'function') {
        await navigator.share({
          title: `Quotation ${quotationNumber}`,
          text: 'Please review our quotation.',
          url: link.url,
        })
        setSuccessMessage('Shared successfully.')
      } else {
        await navigator.clipboard.writeText(link.url)
        setSuccessMessage('Sharing is unavailable here. Link copied successfully.')
      }
    } catch (err) {
      if (err?.name === 'AbortError') return
      setActionError(err.message || 'Unable to share link.')
    } finally {
      setSharingLink(false)
    }
  }

  async function handleRevokeLink() {
    const confirmed = window.confirm(
      'Revoke all public links for this revision? Customers will no longer be able to open them.',
    )
    if (!confirmed) return
    setActionError('')
    setSuccessMessage('')
    setRevokingLink(true)
    try {
      await revokePublicLinks(quotation.id)
      setPublicLink(null)
      setSuccessMessage('Public link revoked.')
      await refreshQuotation(quotation.id)
    } catch (err) {
      setActionError(err.message || 'Unable to revoke public link.')
    } finally {
      setRevokingLink(false)
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
      title={quotationNumber}
      description={`Revision ${quotation.revisionNumber ?? 0}${quotation.isLatest ? ' · Latest' : ''}${quotation.archivedAt ? ' · Archived' : ''}`}
    >
      {successMessage && (
        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          {successMessage}
        </div>
      )}

      {actionError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {actionError}
        </div>
      )}

      {!permissions.canEdit && !quotation.archivedAt && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          This quotation has already been issued. Create a revision to make changes.
          {permissions.canRevise && (
            <button type="button" onClick={handleRevise} className="ml-3 font-medium underline">
              Create Revision
            </button>
          )}
        </div>
      )}

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge status={quotation.status} />
          <span className="text-sm text-slate-500">
            Created {formatDate(quotation.createdAt?.split('T')[0])}
          </span>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setShowPreview((current) => !current)}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700"
          >
            {showPreview ? 'Hide Preview' : 'Preview'}
          </button>
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={pdfLoading}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {pdfLoading ? 'Generating PDF...' : 'Download PDF'}
          </button>
          {permissions.canEdit && (
            <Link
              to={`/quotations/${quotation.id}/edit`}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700"
            >
              Edit
            </Link>
          )}
          {permissions.canRevise && (
            <button
              type="button"
              onClick={handleRevise}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700"
            >
              Revise
            </button>
          )}
          <button
            type="button"
            onClick={handleDuplicate}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700"
          >
            Duplicate
          </button>
          {permissions.canArchive && (
            <button
              type="button"
              onClick={handleArchive}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700"
            >
              Archive
            </button>
          )}
          {permissions.canRestore && (
            <button
              type="button"
              onClick={handleRestore}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700"
            >
              Restore
            </button>
          )}
          {permissions.canDelete && (
            <button
              type="button"
              onClick={handleDelete}
              className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700"
            >
              Delete
            </button>
          )}
        </div>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium uppercase text-slate-500">Customer</p>
          <p className="mt-1 font-medium text-slate-900">{quotation.customer?.companyName || '—'}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium uppercase text-slate-500">Revision</p>
          <p className="mt-1 font-medium text-slate-900">{quotation.revisionNumber ?? 0}</p>
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

      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        <PublicLinkPanel
          publicLink={publicLink}
          canShare={permissions.canShare}
          generating={generatingLink}
          copying={copyingLink}
          sharing={sharingLink}
          revoking={revokingLink}
          onGenerate={handleGenerateLink}
          onCopy={handleCopyLink}
          onShare={handleShareLink}
          onRevoke={handleRevokeLink}
        />
        <CustomerResponsePanel
          responses={responses}
          canRevise={permissions.canRevise}
          onCreateRevision={handleRevise}
        />
      </div>

      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        <RevisionHistory revisions={quotation.revisions} currentId={quotation.id} />
        <section className="rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Activity</h2>
          <QuotationTimeline events={history} />
        </section>
      </div>

      {showPreview && (
        <QuotePreview
          quotationData={quotationData}
          selectedTemplate={quotation.selectedTemplate || { type: 'builtin', id: 'modern' }}
          customTemplates={customTemplates}
        />
      )}
    </PageContainer>
  )
}

export default QuoteDetails
