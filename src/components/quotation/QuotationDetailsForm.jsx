import FormSection from './FormSection'

const inputClassName =
  'w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100'

const labelClassName = 'mb-1 block text-sm font-medium text-slate-700'

const fields = [
  { id: 'quotationNumber', label: 'Quotation Number', type: 'text', placeholder: 'QT-2026-001' },
  { id: 'quotationDate', label: 'Quotation Date', type: 'date' },
  { id: 'validUntil', label: 'Valid Until', type: 'date' },
  { id: 'referenceNumber', label: 'Reference Number', type: 'text', placeholder: 'PO-12345' },
  { id: 'subject', label: 'Subject', type: 'text', placeholder: 'Website development proposal', fullWidth: true },
]

function QuotationDetailsForm({ details, onChange }) {
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
              className={inputClassName}
            />
          </div>
        ))}
      </div>
    </FormSection>
  )
}

export default QuotationDetailsForm
