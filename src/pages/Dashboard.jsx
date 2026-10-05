import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import PageContainer from '../components/PageContainer'
import StatusBadge from '../components/quotation/StatusBadge'
import * as quotationService from '../services/quotationService'
import { formatCurrency, formatDate } from '../utils/quotationCalculations'

function Dashboard() {
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError('')
      try {
        const data = await quotationService.getQuotationSummary()
        if (!cancelled) setSummary(data)
      } catch (loadError) {
        if (!cancelled) setError(loadError.message || 'Unable to load dashboard.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  const counts = summary?.counts || {}
  const summaryCards = [
    { label: 'Active quotations', value: counts.total || 0 },
    { label: 'Draft', value: counts.draft || 0 },
    { label: 'Sent', value: counts.sent || 0 },
    { label: 'Accepted', value: counts.accepted || 0 },
    { label: 'Rejected', value: counts.rejected || 0 },
    { label: 'Expired', value: counts.expired || 0 },
    { label: 'Cancelled', value: counts.cancelled || 0 },
    { label: 'Latest quotation value', value: formatCurrency(counts.totalValue || 0) },
  ]

  return (
    <PageContainer
      title="Dashboard"
      description="Overview of your latest quotation activity."
      actions={(
        <Link
          to="/quotations/create"
          className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          New quotation
        </Link>
      )}
    >
      {loading && <p className="mb-4 text-sm text-slate-500">Loading dashboard...</p>}
      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {!loading && summary && (
        <>
          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {summaryCards.map((card) => (
              <div
                key={card.label}
                className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-200/40"
              >
                <p className="text-sm text-slate-500">{card.label}</p>
                <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">{card.value}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm shadow-slate-200/40">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <h2 className="text-base font-semibold text-slate-900">Recent quotations</h2>
                <Link to="/quotations" className="text-sm font-medium text-teal-800 hover:underline">View all</Link>
              </div>
              {(summary.recent || []).length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-sm text-slate-500">No quotations yet.</p>
                  <Link
                    to="/quotations/create"
                    className="mt-3 inline-block text-sm font-medium text-teal-800 hover:underline"
                  >
                    Create your first quotation
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {summary.recent.map((quotation) => (
                    <Link
                      key={quotation.id}
                      to={`/quotations/${quotation.id}`}
                      className="flex flex-wrap items-center justify-between gap-4 px-5 py-4 transition hover:bg-slate-50"
                    >
                      <div>
                        <p className="font-medium text-slate-900">
                          {quotation.quotationDetails?.quotationNumber} · Rev {quotation.revisionNumber ?? 0}
                        </p>
                        <p className="text-sm text-slate-500">
                          {quotation.customer?.companyName || 'No customer'} ·{' '}
                          {formatDate(quotation.quotationDetails?.quotationDate)}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-medium text-slate-700">
                          {formatCurrency(quotation.summary?.grandTotal || 0, quotation.quotationDetails?.currency)}
                        </span>
                        <StatusBadge status={quotation.status} />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>

            <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm shadow-slate-200/40">
              <div className="border-b border-slate-100 px-5 py-4">
                <h2 className="text-base font-semibold text-slate-900">Recently revised</h2>
              </div>
              {(summary.recentlyRevised || []).length === 0 ? (
                <p className="p-8 text-center text-sm text-slate-500">No revisions yet.</p>
              ) : (
                <div className="divide-y divide-slate-100">
                  {summary.recentlyRevised.map((quotation) => (
                    <Link
                      key={quotation.id}
                      to={`/quotations/${quotation.id}`}
                      className="flex flex-wrap items-center justify-between gap-4 px-5 py-4 transition hover:bg-slate-50"
                    >
                      <div>
                        <p className="font-medium text-slate-900">
                          {quotation.quotationDetails?.quotationNumber} · Rev {quotation.revisionNumber}
                        </p>
                        <p className="text-sm text-slate-500">{quotation.customer?.companyName || '—'}</p>
                      </div>
                      <StatusBadge status={quotation.status} />
                    </Link>
                  ))}
                </div>
              )}
            </section>
          </div>
        </>
      )}
    </PageContainer>
  )
}

export default Dashboard
