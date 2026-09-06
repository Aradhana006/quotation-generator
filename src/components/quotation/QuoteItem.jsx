import { formatCurrency, getItemTotal } from '../../utils/quotationCalculations'

const inputClassName =
  'w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100'

const labelClassName = 'mb-1 block text-xs font-medium text-slate-600'

function QuoteItem({ item, index, onChange, onRemove, canRemove }) {
  const lineTotal = getItemTotal(item)

  function handleChange(field) {
    return (event) => {
      onChange(item.id, field, event.target.value)
    }
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-medium text-slate-700">Item {index + 1}</p>
        {canRemove && (
          <button
            type="button"
            onClick={() => onRemove(item.id)}
            className="text-sm font-medium text-red-600 hover:text-red-700"
          >
            Remove
          </button>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2 lg:col-span-4">
          <label htmlFor={`description-${item.id}`} className={labelClassName}>
            Description
          </label>
          <input
            id={`description-${item.id}`}
            type="text"
            value={item.description}
            onChange={handleChange('description')}
            placeholder="Product or service description"
            className={inputClassName}
          />
        </div>

        <div>
          <label htmlFor={`quantity-${item.id}`} className={labelClassName}>
            Quantity
          </label>
          <input
            id={`quantity-${item.id}`}
            type="number"
            min="0"
            step="1"
            value={item.quantity}
            onChange={handleChange('quantity')}
            className={inputClassName}
          />
        </div>

        <div>
          <label htmlFor={`unitPrice-${item.id}`} className={labelClassName}>
            Unit Price
          </label>
          <input
            id={`unitPrice-${item.id}`}
            type="number"
            min="0"
            step="0.01"
            value={item.unitPrice}
            onChange={handleChange('unitPrice')}
            className={inputClassName}
          />
        </div>

        <div>
          <label className={labelClassName}>Item Total</label>
          <div className="flex h-[38px] items-center rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-900">
            {formatCurrency(lineTotal)}
          </div>
        </div>
      </div>
    </div>
  )
}

export default QuoteItem
