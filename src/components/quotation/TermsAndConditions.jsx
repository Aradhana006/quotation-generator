import FormSection from './FormSection'
import { inputClassName, labelClassName } from './formStyles'

function TermsAndConditions({
  terms,
  defaultTermsLibrary,
  onTermChange,
  onAddTerm,
  onRemoveTerm,
  onAddFromDefault,
}) {
  const unusedDefaults = defaultTermsLibrary.filter(
    (defaultTerm) => !terms.includes(defaultTerm),
  )

  return (
    <FormSection
      title="Terms & Conditions"
      description="Terms copied into this quotation. Editing here does not change your default library."
    >
      {unusedDefaults.length > 0 && (
        <div className="mb-4">
          <label htmlFor="defaultTermSelect" className={labelClassName}>
            Add from default terms
          </label>
          <select
            id="defaultTermSelect"
            defaultValue=""
            onChange={(event) => {
              const value = event.target.value
              if (value) {
                onAddFromDefault(value)
                event.target.value = ''
              }
            }}
            className={inputClassName}
          >
            <option value="" disabled>Select a default term...</option>
            {unusedDefaults.map((term) => (
              <option key={term} value={term}>{term}</option>
            ))}
          </select>
        </div>
      )}

      <div className="space-y-3">
        {terms.length === 0 && (
          <p className="text-sm text-slate-500">No terms added yet.</p>
        )}

        {terms.map((term, index) => (
          <div key={index} className="flex gap-2">
            <div className="flex-1">
              <label htmlFor={`term-${index}`} className={labelClassName}>
                Term {index + 1}
              </label>
              <input
                id={`term-${index}`}
                type="text"
                value={term}
                onChange={(event) => onTermChange(index, event.target.value)}
                className={inputClassName}
              />
            </div>
            <button
              type="button"
              onClick={() => onRemoveTerm(index)}
              className="mt-6 shrink-0 text-sm font-medium text-red-600 hover:text-red-700"
            >
              Delete
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={onAddTerm}
        className="mt-4 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
      >
        + Add Custom Term
      </button>
    </FormSection>
  )
}

export default TermsAndConditions
