import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import PageContainer from '../components/PageContainer'
import QuotationActions from '../components/quotation/QuotationActions'
import QuotationFilters from '../components/quotation/QuotationFilters'
import QuotationPagination from '../components/quotation/QuotationPagination'
import StatusBadge from '../components/quotation/StatusBadge'
import { useQuotations } from '../context/QuotationContext'
import * as quotationService from '../services/quotationService'
import { formatCurrency, formatDate } from '../utils/quotationCalculations'

const DEFAULT_FILTERS = {
  search: '',
  status: '',
  from: '',
  to: '',
  customer: '',
  sort: 'newest',
  latestOnly: 'true',
  archived: '',
  page: 1,
  limit: 20,
}

function Quotations() {
  const navigate = useNavigate()
  const { deleteQuotation, duplicateQuotation, updateQuotationStatus, reviseQuotation, archiveQuotation, restoreQuotation } =
    useQuotations()

  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [items, setItems] = useState([])
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionError, setActionError] = useState('')

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError('')
      try {
        const result = await quotationService.getQuotations(filters)
        if (!cancelled) {
          setItems(result.items)
          setPagination(result.pagination)
        }
      } catch (loadError) {
        if (!cancelled) setError(loadError.message || 'Unable to load quotations.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [filters])

  async function refresh() {
    const result = await quotationService.getQuotations(filters)
    setItems(result.items)
    setPagination(result.pagination)
  }

  async function handleDelete(quotation) {
    const confirmed = window.confirm(`Delete draft ${quotation.quotationDetails?.quotationNumber} Rev ${quotation.revisionNumber}?`)
    if (!confirmed) return
    setActionError('')
    try {
      await deleteQuotation(quotation.id)
      await refresh()
    } catch (err) {
      setActionError(err.message || 'Unable to delete quotation.')
    }
  }

  async function handleDuplicate(id) {
    setActionError('')
    try {
      const duplicate = await duplicateQuotation(id)
      if (duplicate) navigate(`/quotations/${duplicate.id}/edit`)
    } catch (err) {
      setActionError(err.message || 'Unable to duplicate quotation.')
    }
  }

  async function handleRevise(quotation) {
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

  async function handleStatusChange(id, status) {
    setActionError('')
    try {
      await updateQuotationStatus(id, status)
      await refresh()
    } catch (err) {
      setActionError(err.message || 'Unable to update quotation status.')
    }
  }

  async function handleArchive(id) {
    setActionError('')
    try {
      await archiveQuotation(id)
      await refresh()
    } catch (err) {
      setActionError(err.message || 'Unable to archive quotation.')
    }
  }

  async function handleRestore(id) {
    setActionError('')
    try {
      await restoreQuotation(id)
      await refresh()
    } catch (err) {
      setActionError(err.message || 'Unable to restore quotation.')
    }
  }

  async function handleDownload(id) {
    setActionError('')
    try {
      await quotationService.downloadQuotationPdf(id)
    } catch (err) {
      setActionError(err.message || 'Unable to generate PDF.')
    }
  }

  return (
    <PageContainer
      title="Quotations"
      description="Search, filter, and manage quotation revisions without loading the full history into the browser."
    >
      <div className="mb-6 flex justify-end">
        <Link
          to="/quotations/create"
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          + Create Quotation
        </Link>
      </div>

      <QuotationFilters filters={filters} onChange={setFilters} />

      {loading && <p className="text-sm text-slate-500">Loading quotations...</p>}
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}
      {actionError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{actionError}</div>
      )}

      {!loading && !error && items.length === 0 && (
        <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
          <p className="text-sm font-medium text-slate-700">No quotations match these filters.</p>
          <Link
            to="/quotations/create"
            className="mt-4 inline-block rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white"
          >
            Create Quotation
          </Link>
        </div>
      )}

      {!loading && items.length > 0 && (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-4 py-3 font-semibold text-slate-700">Quotation</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Customer</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Date</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Amount</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Status</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((quotation) => (
                <tr key={quotation.id} className="border-b border-slate-100 align-top">
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-900">
                      {quotation.quotationDetails?.quotationNumber || '—'}
                    </p>
                    <p className="text-xs text-slate-500">
                      Revision {quotation.revisionNumber ?? 0}
                      {quotation.isLatest ? ' · Latest' : ''}
                      {quotation.archivedAt ? ' · Archived' : ''}
                    </p>
                    {quotation.revisions?.length > 1 && (
                      <p className="mt-1 text-xs text-slate-500">
                        Revisions:{' '}
                        {quotation.revisions.map((revision, index) => (
                          <span key={revision.id}>
                            {index > 0 ? ' | ' : ''}
                            <Link to={`/quotations/${revision.id}`} className="hover:underline">
                              {revision.revisionNumber}
                            </Link>
                          </span>
                        ))}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-700">{quotation.customer?.companyName || '—'}</td>
                  <td className="px-4 py-3 text-slate-700">
                    {formatDate(quotation.quotationDetails?.quotationDate)}
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {formatCurrency(quotation.summary?.grandTotal || 0, quotation.quotationDetails?.currency || 'INR')}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={quotation.status} />
                  </td>
                  <td className="px-4 py-3">
                    <QuotationActions
                      quotation={quotation}
                      onDuplicate={handleDuplicate}
                      onRevise={handleRevise}
                      onDelete={handleDelete}
                      onArchive={handleArchive}
                      onRestore={handleRestore}
                      onDownload={handleDownload}
                      onStatusChange={handleStatusChange}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <QuotationPagination
        pagination={pagination}
        onPageChange={(page) => setFilters((current) => ({ ...current, page }))}
      />
    </PageContainer>
  )
}

export default Quotations
