import { formatCurrency } from '../../utils/quotationCalculations'

function ProductCard({ product, onEdit, onDelete }) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900">{product.name || 'Unnamed Product'}</h3>
      <div className="mt-3 space-y-1 text-sm text-slate-600">
        <p>{product.description || 'No description provided.'}</p>
        <p>Unit: {product.unit || '—'}</p>
        <p>Default Price: {formatCurrency(Number(product.defaultPrice) || 0)}</p>
        <p>Default Tax: {product.defaultTax || 0}%</p>
      </div>
      <div className="mt-4 flex gap-2">
        <button type="button" onClick={() => onEdit(product)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
          Edit
        </button>
        <button type="button" onClick={() => onDelete(product)} className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50">
          Delete
        </button>
      </div>
    </article>
  )
}

export default ProductCard
