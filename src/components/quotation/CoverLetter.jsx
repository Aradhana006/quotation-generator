import FormSection from './FormSection'
import { inputClassName, labelClassName } from './formStyles'

const fields = [
  { id: 'greeting', label: 'Greeting', type: 'text' },
  { id: 'kindAttention', label: 'Kind Attention', type: 'text' },
  { id: 'subject', label: 'Subject', type: 'text', fullWidth: true },
  { id: 'message', label: 'Message', type: 'textarea', fullWidth: true },
  { id: 'closing', label: 'Closing', type: 'text' },
  { id: 'signOffCompany', label: 'Sign-off Company', type: 'text' },
  { id: 'signOffTitle', label: 'Sign-off Title', type: 'text' },
]

function CoverLetter({ coverLetter, onChange, bare = false }) {
  function handleToggle(event) {
    onChange('enabled', event.target.checked)
  }

  function handleChange(field) {
    return (event) => {
      onChange(field, event.target.value)
    }
  }

  const fieldsContent = (
    <>
      <label className="mb-4 flex items-center gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          checked={coverLetter.enabled}
          onChange={handleToggle}
          className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-400"
        />
        Include cover letter
      </label>

      {coverLetter.enabled && (
        <div className="grid gap-4 sm:grid-cols-2">
          {fields.map((field) => {
            const commonProps = {
              id: field.id,
              name: field.id,
              value: coverLetter[field.id],
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
      )}
    </>
  )

  if (bare) {
    return fieldsContent
  }

  return (
    <FormSection
      title="Cover Letter"
      description="Optional introductory letter shown as the first page."
    >
      {fieldsContent}
    </FormSection>
  )
}

export default CoverLetter
