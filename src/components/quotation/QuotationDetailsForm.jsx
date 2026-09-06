import FormSection from './FormSection'
import { inputClassName, labelClassName } from './formStyles'

const fields = [
  { id: 'quotationNumber', label: 'Quotation Number', type: 'text', placeholder: 'QT-2026-001' },
  { id: 'quotationDate', label: 'Quotation Date', type: 'date' },
  { id: 'validUntil', label: 'Valid Until', type: 'date' },
  { id: 'referenceNumber', label: 'Reference Number', type: 'text', placeholder: 'PO-12345' },
  { id: 'subject', label: 'Subject', type: 'text', placeholder: 'Website development proposal', fullWidth: true },
]

const CURRENCIES = [
  { value: 'INR', label: 'INR (₹)' },
  { value: 'USD', label: 'USD ($)' },
  { value: 'EUR', label: 'EUR (€)' },
  { value: 'GBP', label: 'GBP (£)' },
]

function QuotationDetailsForm({ details, onChange, errors = {} }) {
  function handleChange(field) {
    return (event) => {
      onChange(field, event.target.value)
    }
  }

  return (
    <FormSection
      title="Quotation Details"
      description="Basic information for this quotation."
    >
      <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          Quotation Number
        </p>
        <p className="mt-1 text-lg font-semibold text-slate-900">
          {details.quotationNumber || '—'}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {fields.map((field) => (
          <div
            key={field.id}
            className={field.fullWidth ? 'sm:col-span-2' : ''}
          >
            <label htmlFor={field.id} className={labelClassName}>
              {field.label}
            </label>
            <input
              id={field.id}
              name={field.id}
              type={field.type}
              value={details[field.id]}
              onChange={handleChange(field.id)}
              placeholder={field.placeholder}
              className={`${inputClassName} ${errors[field.id] ? 'border-red-400' : ''}`}
            />
            {errors[field.id] && (
              <p className="mt-1 text-xs text-red-600">{errors[field.id]}</p>
            )}
          </div>
        ))}

        <div>
          <label htmlFor="currency" className={labelClassName}>Currency</label>
          <select
            id="currency"
            value={details.currency}
            onChange={handleChange('currency')}
            className={inputClassName}
          >
            {CURRENCIES.map((currency) => (
              <option key={currency.value} value={currency.value}>{currency.label}</option>
            ))}
          </select>
        </div>
      </div>
    </FormSection>
  )
}

export default QuotationDetailsForm
