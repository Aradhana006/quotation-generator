import FormSection from './FormSection'
import { inputClassName, labelClassName } from './formStyles'

function PaymentTermsSection({ paymentTerms, onChange }) {
  return (
    <FormSection title="Payment Terms" description="Explain how payment should be made.">
      <label htmlFor="paymentTerms" className={labelClassName}>Payment Terms</label>
      <textarea
        id="paymentTerms"
        rows={3}
        value={paymentTerms}
        onChange={(event) => onChange(event.target.value)}
        placeholder="100% advance along with purchase order."
        className={inputClassName}
      />
    </FormSection>
  )
}

export default PaymentTermsSection
