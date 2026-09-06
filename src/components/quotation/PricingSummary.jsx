import FormSection from './FormSection'
import { formatCurrency } from '../../utils/quotationCalculations'

const inputClassName =
  'w-24 rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100'

function PricingSummary({ gstPercent, onGstChange, subtotal, gstAmount, grandTotal }) {
  function handleGstChange(event) {
    onGstChange(event.target.value)
  }

  return (
    <FormSection
      title="Pricing Summary"
      description="Totals update automatically as you edit items."
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-600">Subtotal</span>
          <span className="font-medium text-slate-900">{formatCurrency(subtotal)}</span>
        </div>

        <div className="flex items-center justify-between gap-4 text-sm">
          <label htmlFor="gstPercent" className="text-slate-600">
            GST %
          </label>
          <div className="flex items-center gap-3">
            <input
              id="gstPercent"
              type="number"
              min="0"
              step="0.01"
              value={gstPercent}
              onChange={handleGstChange}
              className={inputClassName}
            />
            <span className="min-w-[6rem] text-right font-medium text-slate-900">
              {formatCurrency(gstAmount)}
            </span>
          </div>
        </div>

        <div className="border-t border-slate-200 pt-3">
          <div className="flex items-center justify-between">
            <span className="text-base font-semibold text-slate-900">Grand Total</span>
            <span className="text-lg font-bold text-slate-900">
              {formatCurrency(grandTotal)}
            </span>
          </div>
        </div>
      </div>
    </FormSection>
  )
}

export default PricingSummary
