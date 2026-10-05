import { inputClassName, labelClassName } from '../quotation/formStyles'

const fields = [
  { id: 'companyName', label: 'Company Name', type: 'text' },
  { id: 'contactPerson', label: 'Contact Person', type: 'text' },
  { id: 'email', label: 'Email', type: 'email' },
  { id: 'phone', label: 'Phone', type: 'tel' },
  { id: 'address', label: 'Address', type: 'textarea', fullWidth: true },
]

function CustomerFormFields({ customer, onChange }) {
  function handleChange(field) {
    return (event) => onChange(field, event.target.value)
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {fields.map((field) => {
        const commonProps = {
          id: field.id,
          name: field.id,
          value: customer[field.id] ?? '',
          onChange: handleChange(field.id),
          className: inputClassName,
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
