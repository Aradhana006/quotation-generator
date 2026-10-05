import FormSection from './FormSection'
import { formatCurrency } from '../../utils/quotationCalculations'

function PricingSummary({ summary, currency = 'INR', compact = false }) {
  const {
    grossAmount,
    totalDiscount,
    subtotalAfterDiscount,
    taxAmount,
    additionalTotal,
    grandTotal,
  } = summary

  const rows = [
    { label: 'Subtotal', value: grossAmount },
    { label: 'Discount', value: totalDiscount, hideIfZero: true },
    { label: 'Taxable Amount', value: subtotalAfterDiscount },
    { label: 'GST / Tax', value: taxAmount },
    { label: 'Additional Charges', value: additionalTotal, hideIfZero: true },
  ]

  return (
    <FormSection
      title="Pricing Summary"
      description="Totals are calculated from items and additional charges."
      compact={compact}
    >
      <div className="space-y-3">
        {rows.map((row) => {
          if (row.hideIfZero && !row.value) return null
          return (
            <div key={row.label} className="flex items-center justify-between text-sm">
              <span className="text-slate-600">{row.label}</span>
              <span className="font-medium text-slate-900">
                {formatCurrency(row.value, currency)}
              </span>
            </div>
          )
        })}

        <div className="border-t border-slate-200 pt-3">
          <div className="flex items-center justify-between">
            <span className="text-base font-semibold text-slate-900">Grand Total</span>
            <span className="text-lg font-bold text-slate-900">
              {formatCurrency(grandTotal, currency)}
            </span>
          </div>
        </div>
      </div>
    </FormSection>
  )
}

export default PricingSummary
