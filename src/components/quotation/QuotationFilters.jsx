import { QUOTATION_STATUSES, STATUS_LABELS } from '../../utils/quotationCalculations'

function QuotationFilters({ filters, onChange }) {
  function update(partial) {
    onChange({ ...filters, ...partial, page: 1 })
  }

  return (
    <div className="mb-4 grid gap-3 rounded-lg border border-slate-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-4">
      <label className="block text-sm">
        <span className="mb-1 block text-xs font-medium uppercase text-slate-500">Search</span>
        <input
          type="search"
          value={filters.search || ''}
          onChange={(event) => update({ search: event.target.value })}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
      </label>
      <label className="block text-sm">
        <span className="mb-1 block text-xs font-medium uppercase text-slate-500">Status</span>
        <select
          value={filters.status || ''}
          onChange={(event) => update({ status: event.target.value })}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="">All statuses</option>
          {QUOTATION_STATUSES.map((status) => (
            <option key={status} value={status}>
              {STATUS_LABELS[status]}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-sm">
        <span className="mb-1 block text-xs font-medium uppercase text-slate-500">From</span>
        <input
          type="date"
          value={filters.from || ''}
          onChange={(event) => update({ from: event.target.value })}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
      </label>
      <label className="block text-sm">
        <span className="mb-1 block text-xs font-medium uppercase text-slate-500">To</span>
        <input
          type="date"
          value={filters.to || ''}
          onChange={(event) => update({ to: event.target.value })}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
      </label>
      <label className="block text-sm">
        <span className="mb-1 block text-xs font-medium uppercase text-slate-500">Customer</span>
        <input
          type="text"
          value={filters.customer || ''}
          onChange={(event) => update({ customer: event.target.value })}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
      </label>
      <label className="block text-sm">
        <span className="mb-1 block text-xs font-medium uppercase text-slate-500">Sort</span>
        <select
          value={filters.sort || 'newest'}
          onChange={(event) => update({ sort: event.target.value })}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="quotation_number">Quotation number</option>
          <option value="amount">Amount</option>
        </select>
      </label>
      <label className="flex items-end gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          checked={filters.latestOnly !== 'false'}
          onChange={(event) => update({ latestOnly: event.target.checked ? 'true' : 'false' })}
        />
        Latest revision only
      </label>
      <label className="block text-sm">
        <span className="mb-1 block text-xs font-medium uppercase text-slate-500">Archive</span>
        <select
          value={filters.archived || ''}
          onChange={(event) => update({ archived: event.target.value })}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="">Active only</option>
          <option value="true">Include archived</option>
          <option value="only">Archived only</option>
        </select>
      </label>
    </div>
  )
}

export default QuotationFilters
