import { useState } from 'react'
import { validateCustomer } from '../../utils/customerValidation'

const FIELDS = [
  {
    id: 'name',
    label: 'Customer Name',
    type: 'text',
    required: true,
    placeholder: 'John Doe',
  },
  {
    id: 'company',
    label: 'Company',
    type: 'text',
    required: false,
    placeholder: 'Acme Corp',
  },
  {
    id: 'email',
    label: 'Email',
    type: 'email',
    required: true,
    placeholder: 'john@example.com',
  },
  {
    id: 'phone',
    label: 'Phone',
    type: 'tel',
    required: true,
    placeholder: '+91 98765 43210',
  },
  {
    id: 'address',
    label: 'Address',
    type: 'textarea',
    required: false,
    placeholder: 'Street, city, state, postal code',
  },
]

function CustomerForm({ customer, onCustomerChange, onValidationChange }) {
  const [touched, setTouched] = useState({})

  const errors = validateCustomer(customer)

  function handleChange(field) {
    return (event) => {
      const value = event.target.value
      const nextCustomer = { ...customer, [field]: value }

      onCustomerChange(nextCustomer)
      onValidationChange?.(validateCustomer(nextCustomer))
    }
  }

  function handleBlur(field) {
    return () => {
      setTouched((current) => ({ ...current, [field]: true }))
      onValidationChange?.(validateCustomer(customer))
    }
  }

  function showError(field) {
    return touched[field] && errors[field]
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-slate-900">Customer</h2>
        <p className="mt-1 text-sm text-slate-500">
          Enter the customer details for this quotation.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {FIELDS.map((field) => {
          const error = showError(field.id)
          const commonProps = {
            id: field.id,
            name: field.id,
            value: customer[field.id],
            onChange: handleChange(field.id),
            onBlur: handleBlur(field.id),
            placeholder: field.placeholder,
            'aria-invalid': Boolean(error),
            'aria-describedby': error ? `${field.id}-error` : undefined,
            className: `w-full rounded-md border px-3 py-2 text-sm text-slate-900 outline-none transition focus:ring-2 ${
              error
                ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                : 'border-slate-300 focus:border-slate-400 focus:ring-slate-100'
            }`,
          }

          return (
            <div
              key={field.id}
              className={field.type === 'textarea' ? 'sm:col-span-2' : ''}
            >
              <label
                htmlFor={field.id}
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                {field.label}
                {field.required && (
                  <span className="ml-1 text-red-500" aria-hidden="true">
                    *
                  </span>
                )}
              </label>

              {field.type === 'textarea' ? (
                <textarea {...commonProps} rows={3} />
              ) : (
                <input {...commonProps} type={field.type} />
              )}

              {error && (
                <p
                  id={`${field.id}-error`}
                  className="mt-1 text-sm text-red-600"
                  role="alert"
                >
                  {error}
                </p>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}

export default CustomerForm
