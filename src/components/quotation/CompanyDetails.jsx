import FormSection from './FormSection'
import { inputClassName, labelClassName } from './formStyles'

const fields = [
  { id: 'name', label: 'Company Name', type: 'text', placeholder: 'ABC Company' },
  { id: 'address', label: 'Address', type: 'textarea', placeholder: 'Street, city, state, postal code', fullWidth: true },
  { id: 'phone', label: 'Phone', type: 'tel', placeholder: '+91 98765 43210' },
  { id: 'email', label: 'Email', type: 'email', placeholder: 'info@company.com' },
  { id: 'website', label: 'Website', type: 'text', placeholder: 'www.company.com' },
  { id: 'gstin', label: 'GSTIN', type: 'text', placeholder: '29ABCDE1234F1Z5' },
]

function CompanyDetails({ company, onChange }) {
  function handleChange(field) {
    return (event) => {
      onChange(field, event.target.value)
    }
  }

  function handleLogoChange(event) {
    const file = event.target.files?.[0]
    if (!file) {
      onChange('logo', '')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      onChange('logo', reader.result)
    }
    reader.readAsDataURL(file)
  }

  return (
    <FormSection
      title="Company Details"
      description="Your business information shown on the quotation."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {fields.map((field) => {
          const commonProps = {
            id: field.id,
            name: field.id,
            value: company[field.id],
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

        <div className="sm:col-span-2">
          <label htmlFor="logo" className={labelClassName}>
            Company Logo
          </label>
          <input
            id="logo"
            type="file"
            accept="image/*"
            onChange={handleLogoChange}
            className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-slate-700 hover:file:bg-slate-200"
          />
          {company.logo ? (
            <img
              src={company.logo}
              alt="Company logo preview"
              className="mt-3 h-16 w-auto rounded border border-slate-200 bg-white object-contain p-2"
            />
          ) : (
            <p className="mt-2 text-sm text-slate-500">
              Logo upload placeholder — image will appear in the preview.
            </p>
          )}
        </div>
      </div>
    </FormSection>
  )
}

export default CompanyDetails
