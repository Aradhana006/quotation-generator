import { useState } from 'react'
import { inputClassName, labelClassName } from '../quotation/formStyles'
import { ACCEPTED_IMAGE_ACCEPT, readImageFile } from '../../utils/dataMappers'
import { toUpperCaseValue } from '../../utils/textFormat'

function CompanyProfileForm({
  profile,
  onProfileChange,
  onBankChange,
  onSignatoryChange,
}) {
  const [logoError, setLogoError] = useState('')
  const [signatureError, setSignatureError] = useState('')

  function handleChange(field) {
    return (event) => {
      const value = field === 'gstin' ? toUpperCaseValue(event.target.value) : event.target.value
      onProfileChange(field, value)
    }
  }

  function handleBankField(field) {
    return (event) => {
      const value = field === 'ifsc' ? toUpperCaseValue(event.target.value) : event.target.value
      onBankChange(field, value)
    }
  }

  function handleSignatoryField(field) {
    return (event) => onSignatoryChange(field, event.target.value)
  }

  function handleLogoChange(event) {
    const file = event.target.files?.[0]
    setLogoError('')
    if (!file) {
      onProfileChange('logo', '')
      return
    }
    readImageFile(
      file,
      (result) => onProfileChange('logo', result),
      (error) => {
        setLogoError(error.message || 'Unable to use this image.')
        event.target.value = ''
      },
    )
  }

  function handleSignatureChange(event) {
    const file = event.target.files?.[0]
    setSignatureError('')
    if (!file) {
      onSignatoryChange('signature', '')
      return
    }
    readImageFile(
      file,
      (result) => onSignatoryChange('signature', result),
      (error) => {
        setSignatureError(error.message || 'Unable to use this image.')
        event.target.value = ''
      },
    )
  }

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-base font-semibold text-slate-900">Company Information</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="companyName" className={labelClassName}>Company Name</label>
            <input id="companyName" value={profile.name} onChange={handleChange('name')} className={inputClassName} />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="address" className={labelClassName}>Address</label>
            <textarea id="address" rows={3} value={profile.address} onChange={handleChange('address')} className={inputClassName} />
          </div>
          <div>
            <label htmlFor="phone" className={labelClassName}>Phone</label>
            <input id="phone" value={profile.phone} onChange={handleChange('phone')} className={inputClassName} />
          </div>
          <div>
            <label htmlFor="email" className={labelClassName}>Email</label>
            <input id="email" type="email" value={profile.email} onChange={handleChange('email')} className={inputClassName} />
          </div>
          <div>
            <label htmlFor="website" className={labelClassName}>Website</label>
            <input id="website" value={profile.website} onChange={handleChange('website')} className={inputClassName} />
          </div>
          <div>
            <label htmlFor="gstin" className={labelClassName}>GSTIN</label>
            <input
              id="gstin"
              value={profile.gstin}
              onChange={handleChange('gstin')}
              className={`${inputClassName} uppercase`}
              autoCapitalize="characters"
              spellCheck={false}
            />
          </div>
          <div>
            <label htmlFor="quotationNumberStart" className={labelClassName}>
              Quotation number starts from
            </label>
            <input
              id="quotationNumberStart"
              type="number"
              min={1}
              step={1}
              value={profile.quotationNumberStart ?? 1}
              onChange={handleChange('quotationNumberStart')}
              className={inputClassName}
            />
            <p className="mt-1 text-xs text-slate-500">
              Next finalized quotation uses this sequence (format QT-YYYY-NNN). Drafts do not consume a number.
            </p>
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="logo" className={labelClassName}>Logo</label>
            <input
              id="logo"
              type="file"
              accept={ACCEPTED_IMAGE_ACCEPT}
              onChange={handleLogoChange}
              className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-slate-700"
            />
            {logoError && <p className="mt-2 text-sm text-red-600">{logoError}</p>}
            <p className="mt-1 text-xs text-slate-500">PNG or JPG only (PDF/SVG will not appear on generated PDFs).</p>
            {profile.logo && (
              <img src={profile.logo} alt="Company logo" className="mt-3 h-16 w-auto rounded border border-slate-200 object-contain p-2" />
            )}
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-base font-semibold text-slate-900">Bank Details</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="accountName" className={labelClassName}>Account Name</label>
            <input id="accountName" value={profile.bankDetails.accountName} onChange={handleBankField('accountName')} className={inputClassName} />
          </div>
          <div>
            <label htmlFor="accountNumber" className={labelClassName}>Account Number</label>
            <input id="accountNumber" value={profile.bankDetails.accountNumber} onChange={handleBankField('accountNumber')} className={inputClassName} />
          </div>
          <div>
            <label htmlFor="bankName" className={labelClassName}>Bank Name</label>
            <input id="bankName" value={profile.bankDetails.bankName} onChange={handleBankField('bankName')} className={inputClassName} />
          </div>
          <div>
            <label htmlFor="branch" className={labelClassName}>Branch</label>
            <input id="branch" value={profile.bankDetails.branch} onChange={handleBankField('branch')} className={inputClassName} />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="ifsc" className={labelClassName}>IFSC</label>
            <input
              id="ifsc"
              value={profile.bankDetails.ifsc}
              onChange={handleBankField('ifsc')}
              className={`${inputClassName} uppercase`}
              autoCapitalize="characters"
              spellCheck={false}
            />
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-base font-semibold text-slate-900">Authorized Signatory</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="signatoryName" className={labelClassName}>Signatory Name</label>
            <input id="signatoryName" value={profile.signatory.name} onChange={handleSignatoryField('name')} className={inputClassName} />
          </div>
          <div>
            <label htmlFor="designation" className={labelClassName}>Designation</label>
            <input id="designation" value={profile.signatory.designation} onChange={handleSignatoryField('designation')} className={inputClassName} />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="signature" className={labelClassName}>Signature Image</label>
            <input
              id="signature"
              type="file"
              accept={ACCEPTED_IMAGE_ACCEPT}
              onChange={handleSignatureChange}
              className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-slate-700"
            />
            {signatureError && <p className="mt-2 text-sm text-red-600">{signatureError}</p>}
            <p className="mt-1 text-xs text-slate-500">PNG or JPG only (PDF files cannot be used as a signature).</p>
            {profile.signatory.signature && (
              <img src={profile.signatory.signature} alt="Signature" className="mt-3 h-16 w-auto rounded border border-slate-200 object-contain p-2" />
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

export default CompanyProfileForm
