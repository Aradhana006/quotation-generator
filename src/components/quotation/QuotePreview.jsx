import { formatCurrency, getItemTotal } from '../../utils/quotationCalculations'

function PreviewField({ label, value }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 whitespace-pre-line text-sm text-slate-800">{value || '—'}</p>
    </div>
  )
}

function CompanyHeader({ company }) {
  return (
    <div className="mb-6 flex items-start justify-between gap-4 border-b border-slate-200 pb-6">
      <div>
        <p className="text-xl font-bold text-slate-900">
          {company.name || 'Your Company Name'}
        </p>
        <p className="mt-2 whitespace-pre-line text-sm text-slate-600">
          {company.address || 'Company address will appear here'}
        </p>
        <div className="mt-3 space-y-1 text-sm text-slate-600">
          {company.phone && <p>Phone: {company.phone}</p>}
          {company.email && <p>Email: {company.email}</p>}
          {company.website && <p>Website: {company.website}</p>}
          {company.gstin && <p>GSTIN: {company.gstin}</p>}
        </div>
      </div>
      {company.logo ? (
        <img
          src={company.logo}
          alt="Company logo"
          className="h-16 w-auto max-w-[120px] object-contain"
        />
      ) : (
        <div className="flex h-16 w-24 items-center justify-center rounded border border-dashed border-slate-300 text-xs text-slate-400">
          Logo
        </div>
      )}
    </div>
  )
}

function CoverLetterPreview({ coverLetter, company }) {
  return (
    <div className="mt-6 space-y-4 text-sm leading-7 text-slate-800">
      {coverLetter.greeting && <p>{coverLetter.greeting}</p>}

      {coverLetter.kindAttention && (
        <p>
          <span className="font-medium">Kind Attn:</span> {coverLetter.kindAttention}
        </p>
      )}

      {coverLetter.subject && (
        <p>
          <span className="font-medium">Subject:</span> {coverLetter.subject}
        </p>
      )}

      {coverLetter.message && <p className="whitespace-pre-line">{coverLetter.message}</p>}

      {coverLetter.closing && <p>{coverLetter.closing}</p>}

      <div className="pt-4">
        <p>{coverLetter.signOffCompany || `For ${company.name || 'Your Company'}`}</p>
        <p className="mt-8 font-medium">
          {coverLetter.signOffTitle || 'Authorised Signatory'}
        </p>
      </div>
    </div>
  )
}

function QuotePreview({
  company,
  customer,
  quotationDetails,
  coverLetter,
  items,
  gstPercent,
  subtotal,
  gstAmount,
  grandTotal,
  terms,
  bankDetails,
  signature,
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-5 py-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Live Preview
        </p>
        <h2 className="mt-1 text-lg font-semibold text-slate-900">Quotation Preview</h2>
      </div>

      <div className="max-h-[calc(100vh-8rem)] overflow-auto bg-slate-100 p-4">
        <div className="quote-preview-page mx-auto bg-white p-6 text-slate-900 shadow-sm sm:p-8">
          <CompanyHeader company={company} />

          <div className="mb-6 grid gap-4 sm:grid-cols-2">
            <PreviewField label="Quotation Number" value={quotationDetails.quotationNumber} />
            <PreviewField label="Date" value={quotationDetails.quotationDate} />
            <PreviewField label="Valid Until" value={quotationDetails.validUntil} />
            <PreviewField label="Reference" value={quotationDetails.referenceNumber} />
          </div>

          {!coverLetter.enabled && quotationDetails.subject && (
            <div className="mb-6">
              <PreviewField label="Subject" value={quotationDetails.subject} />
            </div>
          )}

          <div className="mb-6 rounded-lg bg-slate-50 p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Bill To
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <PreviewField label="Company" value={customer.companyName} />
              <PreviewField label="Contact" value={customer.contactPerson} />
              <PreviewField label="Email" value={customer.email} />
              <PreviewField label="Phone" value={customer.phone} />
              <div className="sm:col-span-2">
                <PreviewField label="Address" value={customer.address} />
              </div>
            </div>
          </div>

          {coverLetter.enabled && <CoverLetterPreview coverLetter={coverLetter} company={company} />}
        </div>

        <div className="quote-preview-page mx-auto mt-6 bg-white p-6 text-slate-900 shadow-sm sm:p-8">
          <div className="mb-4 border-b border-slate-200 pb-4">
            <h3 className="text-lg font-semibold text-slate-900">Quotation</h3>
            {quotationDetails.subject && (
              <p className="mt-1 text-sm text-slate-600">{quotationDetails.subject}</p>
            )}
          </div>

          <table className="mb-6 w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left">
                <th className="pb-2 pr-3 font-semibold text-slate-700">Description</th>
                <th className="pb-2 pr-3 font-semibold text-slate-700">Specifications</th>
                <th className="pb-2 pr-3 font-semibold text-slate-700">Qty</th>
                <th className="pb-2 pr-3 font-semibold text-slate-700">Unit Price</th>
                <th className="pb-2 font-semibold text-slate-700">Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-slate-100 align-top">
                  <td className="py-2 pr-3 text-slate-800">{item.description || '—'}</td>
                  <td className="py-2 pr-3 text-slate-500">—</td>
                  <td className="py-2 pr-3 text-slate-800">{item.quantity || 0}</td>
                  <td className="py-2 pr-3 text-slate-800">
                    {formatCurrency(Number(item.unitPrice) || 0)}
                  </td>
                  <td className="py-2 text-slate-800">
                    {formatCurrency(getItemTotal(item))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mb-8 ml-auto w-full max-w-xs space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-600">Subtotal</span>
              <span className="font-medium text-slate-900">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">GST ({gstPercent || 0}%)</span>
              <span className="font-medium text-slate-900">{formatCurrency(gstAmount)}</span>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-2 text-base">
              <span className="font-semibold text-slate-900">Grand Total</span>
              <span className="font-bold text-slate-900">{formatCurrency(grandTotal)}</span>
            </div>
          </div>

          {terms.some((term) => term.trim()) && (
            <div className="mb-8 border-t border-slate-200 pt-6">
              <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-700">
                Terms & Conditions
              </h4>
              <ul className="list-disc space-y-2 pl-5 text-sm text-slate-700">
                {terms.filter((term) => term.trim()).map((term, index) => (
                  <li key={index}>{term}</li>
                ))}
              </ul>
            </div>
          )}

          {(bankDetails.accountName ||
            bankDetails.accountNumber ||
            bankDetails.bankName ||
            bankDetails.branch ||
            bankDetails.ifsc) && (
            <div className="mb-8 rounded-lg bg-slate-50 p-4">
              <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-700">
                Bank Details
              </h4>
              <div className="grid gap-2 text-sm text-slate-700 sm:grid-cols-2">
                {bankDetails.accountName && <p>Account Name: {bankDetails.accountName}</p>}
                {bankDetails.accountNumber && <p>Account Number: {bankDetails.accountNumber}</p>}
                {bankDetails.bankName && <p>Bank Name: {bankDetails.bankName}</p>}
                {bankDetails.branch && <p>Branch: {bankDetails.branch}</p>}
                {bankDetails.ifsc && <p>IFSC: {bankDetails.ifsc}</p>}
              </div>
            </div>
          )}

          <div className="border-t border-slate-200 pt-6">
            {signature.signatureImage ? (
              <img
                src={signature.signatureImage}
                alt="Signature"
                className="mb-3 h-14 w-auto object-contain"
              />
            ) : (
              <div className="mb-3 h-14 w-40 border-b border-slate-400" />
            )}
            <p className="text-sm font-medium text-slate-900">
              {signature.name || 'Authorised Signatory'}
            </p>
            <p className="text-sm text-slate-600">
              {signature.designation || 'Authorised Signatory'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default QuotePreview
