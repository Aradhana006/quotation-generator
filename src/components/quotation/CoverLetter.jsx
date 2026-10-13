import FormSection from './FormSection'
import { inputClassName, labelClassName } from './formStyles'

const fields = [
  { id: 'greeting', label: 'Greeting', type: 'text' },
  { id: 'kindAttention', label: 'Kind Attention', type: 'text' },
  { id: 'subject', label: 'Subject', type: 'text', fullWidth: true },
  { id: 'message', label: 'Cover message', type: 'textarea', fullWidth: true },
  { id: 'closing', label: 'Closing', type: 'text' },
  { id: 'signOffCompany', label: 'Sign-off company', type: 'text' },
  { id: 'signOffTitle', label: 'Sign-off title', type: 'text' },
]

function CoverLetter({ coverLetter, onChange, bare = false }) {
  function handleChange(field) {
    return (event) => {
      onChange(field, event.target.value)
    }
  }

  const fieldsContent = (
    <div className="grid gap-4 sm:grid-cols-2">
      {fields.map((field) => {
        const commonProps = {
          id: field.id,
          name: field.id,
          value: coverLetter[field.id] || '',
          onChange: handleChange(field.id),
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
              <textarea {...commonProps} rows={4} />
            ) : (
              <input {...commonProps} type={field.type} />
            )}
          </div>
        )
      })}
    </div>
  )

  if (bare) {
    return fieldsContent
  }

  return (
    <FormSection
      title="Cover page"
      description="These details appear on page 1 of every quotation. The item schedule follows on page 2."
    >
      {fieldsContent}
    </FormSection>
  )
}

export default CoverLetter
