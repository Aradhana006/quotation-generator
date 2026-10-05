function QuotationPagination({ pagination, onPageChange }) {
  if (!pagination || pagination.totalPages <= 1) return null

  return (
    <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
      <p>
        Page {pagination.page} of {pagination.totalPages} · {pagination.total} quotations
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={pagination.page <= 1}
          onClick={() => onPageChange(pagination.page - 1)}
          className="rounded-md border border-slate-300 px-3 py-1.5 disabled:opacity-50"
        >
          Previous
        </button>
        <button
          type="button"
          disabled={pagination.page >= pagination.totalPages}
          onClick={() => onPageChange(pagination.page + 1)}
          className="rounded-md border border-slate-300 px-3 py-1.5 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  )
}

export default QuotationPagination
