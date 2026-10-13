import { useState } from 'react'
import FormSection from './FormSection'
import { inputClassName, labelClassName } from './formStyles'
import { ACCEPTED_IMAGE_ACCEPT, readImageFile } from '../../utils/dataMappers'
import { toUpperCaseValue } from '../../utils/textFormat'

const fields = [
  { id: 'name', label: 'Company Name', type: 'text' },
  { id: 'address', label: 'Address', type: 'textarea', fullWidth: true },
  { id: 'phone', label: 'Phone', type: 'tel' },
  { id: 'email', label: 'Email', type: 'email' },
  { id: 'website', label: 'Website', type: 'text' },
  { id: 'gstin', label: 'GSTIN', type: 'text', uppercase: true },
]

function CompanyDetails({ company, onChange, onReloadFromSettings, settingsLoading = false }) {
  const [logoError, setLogoError] = useState('')

  function handleChange(field, uppercase = false) {
    return (event) => {
      onChange(field, uppercase ? toUpperCaseValue(event.target.value) : event.target.value)
    }
  }

  function handleLogoChange(event) {
    const file = event.target.files?.[0]
    setLogoError('')
    if (!file) {
      onChange('logo', '')
      return
    }

    readImageFile(
      file,
      (result) => onChange('logo', result),
      (error) => {
        setLogoError(error.message || 'Unable to use this image.')
        event.target.value = ''
      },
    )
  }

  return (
    <FormSection
      title="Company Details"
      description="Loaded from Company Settings. Edit here only if this quotation needs different details."
    >
      {onReloadFromSettings && (
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onReloadFromSettings}
            disabled={settingsLoading}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {settingsLoading ? 'Loading settings...' : 'Reload from Company Settings'}
          </button>
          <p className="text-xs text-slate-500">
            Resets company, bank, and signature from your saved profile.
          </p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {fields.map((field) => {
          const commonProps = {
            id: field.id,
            name: field.id,
            value: company[field.id] || '',
            onChange: handleChange(field.id, field.uppercase),
            className: `${inputClassName}${field.uppercase ? ' uppercase' : ''}`,
            ...(field.uppercase ? { autoCapitalize: 'characters', spellCheck: false } : {}),
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
            accept={ACCEPTED_IMAGE_ACCEPT}
            onChange={handleLogoChange}
            className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-slate-700 hover:file:bg-slate-200"
          />
          {logoError && <p className="mt-2 text-sm text-red-600">{logoError}</p>}
          {company.logo ? (
            <img
              src={company.logo}
              alt="Company logo preview"
              className="mt-3 h-16 w-auto rounded border border-slate-200 bg-white object-contain p-2"
            />
          ) : (
            <p className="mt-2 text-sm text-slate-500">
              Use PNG or JPG (not PDF). Appears on quotations and PDFs.
            </p>
          )}
        </div>
      </div>
    </FormSection>
  )
}

export default CompanyDetails
