import FormSection from './FormSection'
import { inputClassName, labelClassName } from './formStyles'

const fields = [
  { id: 'accountName', label: 'Account Name', type: 'text' },
  { id: 'accountNumber', label: 'Account Number', type: 'text' },
  { id: 'bankName', label: 'Bank Name', type: 'text' },
  { id: 'branch', label: 'Branch', type: 'text' },
  { id: 'ifsc', label: 'IFSC', type: 'text', fullWidth: true },
]

function BankDetails({ bankDetails, onChange, bare = false }) {
  function handleChange(field) {
    return (event) => {
      onChange(field, event.target.value)
    }
  }

  const fieldsContent = (
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
            className={inputClassName}
          />
        </div>
      ))}
    </div>
  )

  if (bare) {
    return fieldsContent
  }

  return (
    <FormSection
      title="Bank Details"
      description="Payment information shown on the quotation."
    >
      {fieldsContent}
    </FormSection>
  )
}

export default BankDetails
