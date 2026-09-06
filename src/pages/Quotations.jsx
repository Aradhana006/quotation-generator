import { Link, useNavigate } from 'react-router-dom'
import PageContainer from '../components/PageContainer'
import StatusBadge from '../components/quotation/StatusBadge'
import { useQuotations } from '../context/QuotationContext'
import {
  formatCurrency,
  formatDate,
  getQuotationSummary,
} from '../utils/quotationCalculations'

function Quotations() {
  const navigate = useNavigate()
  const { quotations, deleteQuotation, duplicateQuotation } = useQuotations()

  const sortedQuotations = [...quotations].sort(
    (a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt),
  )

  function handleDelete(id, quotationNumber) {
    const confirmed = window.confirm(
      `Delete quotation ${quotationNumber}? This cannot be undone.`,
    )
    if (!confirmed) return
    deleteQuotation(id)
  }

  function handleDuplicate(id) {
    const duplicate = duplicateQuotation(id)
    if (duplicate) {
      navigate(`/quotations/${duplicate.id}/edit`)
    }
  }

  return (
    <PageContainer
      title="Quotations"
      description="View, search, and manage all your quotations."
    >
      <div className="mb-6 flex justify-end">
        <Link
          to="/quotations/create"
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          + Create Quotation
        </Link>
      </div>

      {sortedQuotations.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
          <p className="text-sm font-medium text-slate-700">No quotations yet.</p>
          <p className="mt-2 text-sm text-slate-500">
            Create your first quotation to get started.
          </p>
          <Link
            to="/quotations/create"
            className="mt-4 inline-block rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            Create Quotation
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-4 py-3 font-semibold text-slate-700">Quotation Number</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Customer</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Date</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Amount</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Status</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedQuotations.map((quotation) => {
                const summary = getQuotationSummary(
                  quotation.items,
                  quotation.additionalCharges || [],
                )
                const currency = quotation.quotationDetails?.currency || 'INR'

                return (
                  <tr key={quotation.id} className="border-b border-slate-100">
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {quotation.quotationDetails?.quotationNumber || '—'}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {quotation.customer?.companyName || '—'}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {formatDate(quotation.quotationDetails?.quotationDate)}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {formatCurrency(summary.grandTotal, currency)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={quotation.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <Link
                          to={`/quotations/${quotation.id}`}
                          className="text-sm font-medium text-slate-700 hover:text-slate-900"
                        >
                          View
                        </Link>
                        <Link
                          to={`/quotations/${quotation.id}/edit`}
                          className="text-sm font-medium text-slate-700 hover:text-slate-900"
                        >
                          Edit
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDuplicate(quotation.id)}
                          className="text-sm font-medium text-slate-700 hover:text-slate-900"
                        >
                          Duplicate
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(
                              quotation.id,
                              quotation.quotationDetails?.quotationNumber,
                            )
                          }
                          className="text-sm font-medium text-red-600 hover:text-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </PageContainer>
  )
}

export default Quotations
