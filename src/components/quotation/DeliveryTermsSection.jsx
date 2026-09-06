import FormSection from './FormSection'
import { inputClassName, labelClassName } from './formStyles'

function DeliveryTermsSection({ deliveryTerms, onChange }) {
  return (
    <FormSection title="Delivery Terms" description="Explain delivery expectations.">
      <label htmlFor="deliveryTerms" className={labelClassName}>Delivery Terms</label>
      <textarea
        id="deliveryTerms"
        rows={3}
        value={deliveryTerms}
        onChange={(event) => onChange(event.target.value)}
        placeholder="4 to 5 weeks from confirmed purchase order."
        className={inputClassName}
      />
    </FormSection>
  )
}

export default DeliveryTermsSection
