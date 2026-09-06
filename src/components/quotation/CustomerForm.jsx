import FormSection from './FormSection'

const inputClassName =
  'w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100'

const labelClassName = 'mb-1 block text-sm font-medium text-slate-700'

const fields = [
  { id: 'companyName', label: 'Company / Customer Name', type: 'text', placeholder: 'Acme Corp' },
  { id: 'contactPerson', label: 'Contact Person', type: 'text', placeholder: 'John Doe' },
  { id: 'email', label: 'Email', type: 'email', placeholder: 'john@example.com' },
  { id: 'phone', label: 'Phone', type: 'tel', placeholder: '+91 98765 43210' },
  { id: 'address', label: 'Address', type: 'textarea', placeholder: 'Street, city, state, postal code', fullWidth: true },
]

function CustomerForm({ customer, onChange }) {
  function handleChange(field) {
    return (event) => {
      onChange(field, event.target.value)
    }
  }

  return (
    <FormSection
      title="Customer Details"
      description="Who is this quotation for?"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {fields.map((field) => {
          const commonProps = {
            id: field.id,
            name: field.id,
            value: customer[field.id],
            onChange: handleChange(field.id),
            placeholder: field.placeholder,
            className: inputClassName,
          }

          return (
            <div
              key={field.id}
              className={field.fullWidth ? 'sm:col-span-2' : ''}
            >
              <label htmlFor={field.id} className={labelClassName}>
                {field.label}
              </label>
              {field.type === 'textarea' ? (
                <textarea {...commonProps} rows={3} />
              ) : (
                <input {...commonProps} type={field.type} />
              )}
            </div>
          )
        })}
      </div>
    </FormSection>
  )
}

export default CustomerForm
