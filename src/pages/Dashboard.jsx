import { Link } from 'react-router-dom'
import PageContainer from '../components/PageContainer'
import StatusBadge from '../components/quotation/StatusBadge'
import { useQuotations } from '../context/QuotationContext'
import {
  formatCurrency,
  formatDate,
  getQuotationSummary,
} from '../utils/quotationCalculations'

function Dashboard() {
  const { quotations } = useQuotations()

  const statusCounts = quotations.reduce(
    (counts, quotation) => {
      const status = quotation.status || 'draft'
      counts[status] = (counts[status] || 0) + 1
      return counts
    },
    { draft: 0, sent: 0, accepted: 0, rejected: 0, expired: 0 },
  )

  const totalValue = quotations.reduce((sum, quotation) => {
    const summary = getQuotationSummary(
      quotation.items,
      quotation.additionalCharges || [],
    )
    return sum + summary.grandTotal
  }, 0)

  const recentQuotations = [...quotations]
    .sort(
      (a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt),
    )
    .slice(0, 5)

  const summaryCards = [
    { label: 'Total Quotations', value: quotations.length },
    { label: 'Drafts', value: statusCounts.draft },
    { label: 'Sent', value: statusCounts.sent },
    { label: 'Accepted', value: statusCounts.accepted },
    { label: 'Rejected', value: statusCounts.rejected },
    { label: 'Total Quotation Value', value: formatCurrency(totalValue) },
  ]

  return (
    <PageContainer
      title="Dashboard"
      description="Overview of your quotations and recent activity."
    >
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {summaryCards.map((card) => (
          <div
            key={card.label}
            className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
          >
            <p className="text-sm text-slate-500">{card.label}</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h2 className="text-lg font-semibold text-slate-900">Recent Quotations</h2>
          <Link
            to="/quotations"
            className="text-sm font-medium text-slate-700 hover:text-slate-900"
          >
            View all
          </Link>
        </div>

        {recentQuotations.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm text-slate-500">No quotations yet.</p>
            <Link
              to="/quotations/create"
              className="mt-3 inline-block text-sm font-medium text-slate-700 hover:text-slate-900"
            >
              Create your first quotation
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentQuotations.map((quotation) => {
              const summary = getQuotationSummary(
                quotation.items,
                quotation.additionalCharges || [],
              )
              const currency = quotation.quotationDetails?.currency || 'INR'

              return (
                <Link
                  key={quotation.id}
                  to={`/quotations/${quotation.id}`}
                  className="flex flex-wrap items-center justify-between gap-4 px-5 py-4 transition hover:bg-slate-50"
                >
                  <div>
                    <p className="font-medium text-slate-900">
                      {quotation.quotationDetails?.quotationNumber || '—'}
                    </p>
                    <p className="text-sm text-slate-500">
                      {quotation.customer?.companyName || 'No customer'} ·{' '}
                      {formatDate(quotation.quotationDetails?.quotationDate)}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-slate-700">
                      {formatCurrency(summary.grandTotal, currency)}
                    </span>
                    <StatusBadge status={quotation.status} />
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </PageContainer>
  )
}

export default Dashboard
