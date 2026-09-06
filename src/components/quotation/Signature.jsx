import FormSection from './FormSection'
import { inputClassName, labelClassName } from './formStyles'

function Signature({ signature, onChange }) {
  function handleChange(field) {
    return (event) => {
      onChange(field, event.target.value)
    }
  }

  function handleImageChange(event) {
    const file = event.target.files?.[0]
    if (!file) {
      onChange('signatureImage', '')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      onChange('signatureImage', reader.result)
    }
    reader.readAsDataURL(file)
  }

  return (
    <FormSection
      title="Signature"
      description="Authorised signatory details for the quotation."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="signatoryName" className={labelClassName}>
            Signatory Name
          </label>
          <input
            id="signatoryName"
            type="text"
            value={signature.name}
            onChange={handleChange('name')}
            placeholder="John Doe"
            className={inputClassName}
          />
        </div>

        <div>
          <label htmlFor="designation" className={labelClassName}>
            Designation
          </label>
          <input
            id="designation"
            type="text"
            value={signature.designation}
            onChange={handleChange('designation')}
            placeholder="Authorised Signatory"
            className={inputClassName}
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="signatureImage" className={labelClassName}>
            Signature Image
          </label>
          <input
            id="signatureImage"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-slate-700 hover:file:bg-slate-200"
          />
          {signature.signatureImage ? (
            <img
              src={signature.signatureImage}
              alt="Signature preview"
              className="mt-3 h-16 w-auto rounded border border-slate-200 bg-white object-contain p-2"
            />
          ) : (
            <p className="mt-2 text-sm text-slate-500">
              Signature image upload — placeholder for future use.
            </p>
          )}
        </div>
      </div>
    </FormSection>
  )
}

export default Signature
