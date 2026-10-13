import FormSection from './FormSection'
import { inputClassName, labelClassName } from './formStyles'
import { addDaysToDateString } from '../../utils/quotationCalculations'

const CURRENCIES = [
  { value: 'INR', label: 'INR (₹)' },
  { value: 'USD', label: 'USD ($)' },
  { value: 'EUR', label: 'EUR (€)' },
  { value: 'GBP', label: 'GBP (£)' },
]

function QuotationDetailsForm({ details, onChange, errors = {}, compact = false }) {
  const isDraftNumber = String(details.quotationNumber || '').toUpperCase().startsWith('DRAFT-')

  function handleChange(field) {
    return (event) => {
      const value = event.target.value

      if (field === 'quotationDate') {
        onChange('quotationDate', value)
        if (details.validityDays !== '' && details.validityDays != null) {
          onChange('validUntil', addDaysToDateString(value, details.validityDays))
        }
        return
      }

      if (field === 'validityDays') {
        onChange('validityDays', value)
        onChange('validUntil', addDaysToDateString(details.quotationDate, value))
        return
      }

      onChange(field, value)
    }
  }

  return (
    <FormSection
      title="Quotation Details"
      description="Dates, validity, reference and currency."
      compact={compact}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="quotationNumber" className={labelClassName}>
            Quotation Number
          </label>
          <input
            id="quotationNumber"
            name="quotationNumber"
            type="text"
            value={
              isDraftNumber
                ? 'Assigned on finalize'
                : details.quotationNumber
            }
            readOnly
            className={`${inputClassName} bg-slate-50 text-slate-600 ${errors.quotationNumber ? 'border-red-400' : ''}`}
          />
          <p className="mt-1 text-xs text-slate-500">
            Preview of next number while drafting; final QT number is assigned when you finalize.
          </p>
          {errors.quotationNumber && (
            <p className="mt-1 text-xs text-red-600">{errors.quotationNumber}</p>
          )}
        </div>

        <div>
          <label htmlFor="quotationDate" className={labelClassName}>Quotation Date</label>
          <input
            id="quotationDate"
            name="quotationDate"
            type="date"
            value={details.quotationDate}
            onChange={handleChange('quotationDate')}
            className={`${inputClassName} ${errors.quotationDate ? 'border-red-400' : ''}`}
          />
          {errors.quotationDate && (
            <p className="mt-1 text-xs text-red-600">{errors.quotationDate}</p>
          )}
        </div>

        <div>
          <label htmlFor="validityDays" className={labelClassName}>Validity (days)</label>
          <input
            id="validityDays"
            name="validityDays"
            type="number"
            min={0}
            step={1}
            value={details.validityDays ?? ''}
            onChange={handleChange('validityDays')}
            className={inputClassName}
          />
        </div>

        <div>
          <label htmlFor="validUntil" className={labelClassName}>Valid Until</label>
          <input
            id="validUntil"
            name="validUntil"
            type="date"
            value={details.validUntil}
            onChange={handleChange('validUntil')}
            className={inputClassName}
          />
        </div>

        <div>
          <label htmlFor="referenceNumber" className={labelClassName}>Reference Number</label>
          <input
            id="referenceNumber"
            name="referenceNumber"
            type="text"
            value={details.referenceNumber}
            onChange={handleChange('referenceNumber')}
            className={inputClassName}
          />
        </div>

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

        <div className="sm:col-span-2">
          <label htmlFor="subject" className={labelClassName}>Subject</label>
          <input
            id="subject"
            name="subject"
            type="text"
            value={details.subject}
            onChange={handleChange('subject')}
            className={inputClassName}
          />
        </div>
      </div>
    </FormSection>
  )
}

export default QuotationDetailsForm
