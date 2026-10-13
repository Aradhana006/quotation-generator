import { inputClassName, labelClassName } from '../quotation/formStyles'
import { toUpperCaseValue } from '../../utils/textFormat'

const fields = [
  { id: 'companyName', label: 'Company Name', type: 'text' },
  { id: 'contactPerson', label: 'Contact Person', type: 'text' },
  { id: 'email', label: 'Email', type: 'email' },
  { id: 'phone', label: 'Phone', type: 'tel' },
  { id: 'referenceNumber', label: 'Customer Reference No.', type: 'text' },
  { id: 'gstin', label: 'GSTIN', type: 'text', uppercase: true },
  { id: 'address', label: 'Address', type: 'textarea', fullWidth: true },
]

function CustomerFormFields({ customer, onChange }) {
  function handleChange(field, uppercase = false) {
    return (event) => {
      const value = uppercase ? toUpperCaseValue(event.target.value) : event.target.value
      onChange(field, value)
    }
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {fields.map((field) => {
        const commonProps = {
          id: field.id,
          name: field.id,
          value: customer[field.id] ?? '',
          onChange: handleChange(field.id, field.uppercase),
          className: `${inputClassName}${field.uppercase ? ' uppercase' : ''}`,
          ...(field.uppercase ? { autoCapitalize: 'characters', spellCheck: false } : {}),
        }

        return (
          <div key={field.id} className={field.fullWidth ? 'sm:col-span-2' : ''}>
            <label htmlFor={field.id} className={labelClassName}>{field.label}</label>
            {field.type === 'textarea' ? (
              <textarea {...commonProps} rows={3} />
            ) : (
              <input {...commonProps} type={field.type} />
            )}
          </div>
        )
      })}
    </div>
  )
}

export default CustomerFormFields
