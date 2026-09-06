import {
  DISCOUNT_TYPES,
  formatCurrency,
  getItemDiscountAmount,
  getItemFinalTotal,
  getItemTaxableAmount,
  TAX_RATE_OPTIONS,
} from '../../utils/quotationCalculations'
import { inputClassName, labelClassName } from './formStyles'

function QuoteItem({
  item,
  index,
  onChange,
  onRemove,
  canRemove,
  errors = {},
}) {
  const lineTotal = getItemFinalTotal(item)
  const discountAmount = getItemDiscountAmount(item)
  const taxableAmount = getItemTaxableAmount(item)

  function handleChange(field) {
    return (event) => {
      onChange(item.id, field, event.target.value)
    }
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-700">Item {index + 1}</p>
          {item.productId && (
            <p className="text-xs text-slate-500">Linked to saved product (snapshot)</p>
          )}
        </div>
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
            className={`${inputClassName} ${errors.description ? 'border-red-400' : ''}`}
          />
          {errors.description && (
            <p className="mt-1 text-xs text-red-600">{errors.description}</p>
          )}
        </div>

        <div className="sm:col-span-2 lg:col-span-4">
          <label htmlFor={`specification-${item.id}`} className={labelClassName}>
            Specification
          </label>
          <textarea
            id={`specification-${item.id}`}
            rows={2}
            value={item.specification}
            onChange={handleChange('specification')}
            placeholder="Optional specifications"
            className={inputClassName}
          />
        </div>

        <div>
          <label htmlFor={`unit-${item.id}`} className={labelClassName}>
            Unit
          </label>
          <input
            id={`unit-${item.id}`}
            type="text"
            value={item.unit}
            onChange={handleChange('unit')}
            placeholder="Nos / Project"
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
            className={`${inputClassName} ${errors.quantity ? 'border-red-400' : ''}`}
          />
          {errors.quantity && (
            <p className="mt-1 text-xs text-red-600">{errors.quantity}</p>
          )}
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
            className={`${inputClassName} ${errors.unitPrice ? 'border-red-400' : ''}`}
          />
          {errors.unitPrice && (
            <p className="mt-1 text-xs text-red-600">{errors.unitPrice}</p>
          )}
        </div>

        <div>
          <label htmlFor={`discountType-${item.id}`} className={labelClassName}>
            Discount Type
          </label>
          <select
            id={`discountType-${item.id}`}
            value={item.discountType}
            onChange={handleChange('discountType')}
            className={inputClassName}
          >
            {Object.entries(DISCOUNT_TYPES).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor={`discountValue-${item.id}`} className={labelClassName}>
            Discount
          </label>
          <input
            id={`discountValue-${item.id}`}
            type="number"
            min="0"
            step="0.01"
            value={item.discountValue}
            onChange={handleChange('discountValue')}
            placeholder={item.discountType === 'percentage' ? '10' : '1000'}
            className={inputClassName}
          />
        </div>

        <div>
          <label htmlFor={`taxRate-${item.id}`} className={labelClassName}>
            Tax Rate (%)
          </label>
          <div className="flex gap-2">
            <select
              id={`taxRate-${item.id}`}
              value={TAX_RATE_OPTIONS.includes(Number(item.taxRate)) ? item.taxRate : 'custom'}
              onChange={(event) => {
                const value = event.target.value
                if (value !== 'custom') {
                  onChange(item.id, 'taxRate', value)
                }
              }}
              className={inputClassName}
            >
              {TAX_RATE_OPTIONS.map((rate) => (
                <option key={rate} value={rate}>{rate}%</option>
              ))}
              <option value="custom">Custom</option>
            </select>
            {!TAX_RATE_OPTIONS.includes(Number(item.taxRate)) && (
              <input
                type="number"
                min="0"
                step="0.01"
                value={item.taxRate}
                onChange={handleChange('taxRate')}
                className={inputClassName}
              />
            )}
          </div>
        </div>

        <div className="sm:col-span-2 lg:col-span-4 rounded-md border border-slate-200 bg-white p-3 text-sm">
          <div className="grid gap-2 sm:grid-cols-3">
            <div>
              <span className="text-slate-500">Discount: </span>
              <span className="font-medium">{formatCurrency(discountAmount)}</span>
            </div>
            <div>
              <span className="text-slate-500">Taxable: </span>
              <span className="font-medium">{formatCurrency(taxableAmount)}</span>
            </div>
            <div>
              <span className="text-slate-500">Line Total: </span>
              <span className="font-semibold">{formatCurrency(lineTotal)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default QuoteItem
