import { useEffect } from 'react'
import FormSection from './FormSection'
import { inputClassName, labelClassName } from './formStyles'
import {
  resolveCoverLetterMessage,
  STANDARD_COVER_LETTER_MESSAGE,
} from '../../utils/quotationCalculations'

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
  // Always ensure Cover message is the standard paragraph when empty/legacy.
  useEffect(() => {
    const resolved = resolveCoverLetterMessage(coverLetter?.message)
    if (resolved !== (coverLetter?.message || '')) {
      onChange('message', resolved)
    }
  }, [coverLetter?.message, onChange])

  function handleChange(field) {
    return (event) => {
      onChange(field, event.target.value)
    }
  }

  const fieldsContent = (
    <div className="grid gap-4 sm:grid-cols-2">
      {fields.map((field) => {
        const rawValue = coverLetter?.[field.id] || ''
        const value =
          field.id === 'message' ? resolveCoverLetterMessage(rawValue) : rawValue

        const commonProps = {
          id: field.id,
          name: field.id,
          value,
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
              <>
                <textarea {...commonProps} rows={8} />
                <p className="mt-1 text-xs text-slate-500">
                  Default text is filled automatically. You can edit it if needed.
                </p>
              </>
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
      description="These details appear on page 1 of every quotation. Cover message is filled automatically."
    >
      {fieldsContent}
      {/* Keep a stable reference so tree-shaking never drops the default copy */}
      <span className="sr-only">{STANDARD_COVER_LETTER_MESSAGE}</span>
    </FormSection>
  )
}

export default CoverLetter
