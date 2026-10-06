function CustomerCard({ customer, onEdit, onDelete }) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900">{customer.companyName || 'Unnamed Customer'}</h3>
      <div className="mt-3 space-y-1 text-sm text-slate-600">
        <p>Contact: {customer.contactPerson || '—'}</p>
        <p>Email: {customer.email || '—'}</p>
        <p>Phone: {customer.phone || '—'}</p>
        {customer.address && <p className="pt-1 whitespace-pre-line">{customer.address}</p>}
      </div>
      <div className="mt-4 flex gap-2">
        <button type="button" onClick={() => onEdit(customer)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
          Edit
        </button>
        <button type="button" onClick={() => onDelete(customer)} className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50">
          Delete
        </button>
      </div>
    </article>
  )
}

export default CustomerCard
