import FormSection from './FormSection'
import { inputClassName, labelClassName } from './formStyles'

function NotesSection({ notes, onChange }) {
  return (
    <FormSection title="Notes" description="Optional notes shown on the quotation.">
      <label htmlFor="notes" className={labelClassName}>Notes</label>
      <textarea
        id="notes"
        rows={4}
        value={notes}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Prices are subject to final confirmation."
        className={inputClassName}
      />
    </FormSection>
  )
}

export default NotesSection
