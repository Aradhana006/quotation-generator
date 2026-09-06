import FormSection from './FormSection'
import { inputClassName, labelClassName } from './formStyles'

function TermsAndConditions({ terms, onTermChange, onAddTerm, onRemoveTerm }) {
  return (
    <FormSection
      title="Terms & Conditions"
      description="Add the terms that appear at the bottom of the quotation."
    >
      <div className="space-y-3">
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
            {terms.length > 1 && (
              <button
                type="button"
                onClick={() => onRemoveTerm(index)}
                className="mt-6 shrink-0 text-sm font-medium text-red-600 hover:text-red-700"
              >
                Delete
              </button>
            )}
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={onAddTerm}
        className="mt-4 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
      >
        + Add Term
      </button>
    </FormSection>
  )
}

export default TermsAndConditions
