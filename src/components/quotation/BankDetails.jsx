import FormSection from './FormSection'
import { inputClassName, labelClassName } from './formStyles'

const fields = [
  { id: 'accountName', label: 'Account Name', type: 'text', placeholder: 'ABC Company Pvt Ltd' },
  { id: 'accountNumber', label: 'Account Number', type: 'text', placeholder: '1234567890' },
  { id: 'bankName', label: 'Bank Name', type: 'text', placeholder: 'State Bank of India' },
  { id: 'branch', label: 'Branch', type: 'text', placeholder: 'Main Branch, Chennai' },
  { id: 'ifsc', label: 'IFSC', type: 'text', placeholder: 'SBIN0001234', fullWidth: true },
]

function BankDetails({ bankDetails, onChange }) {
  function handleChange(field) {
    return (event) => {
      onChange(field, event.target.value)
    }
  }

  return (
    <FormSection
      title="Bank Details"
      description="Payment information shown on the quotation."
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
              value={bankDetails[field.id]}
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

export default BankDetails
