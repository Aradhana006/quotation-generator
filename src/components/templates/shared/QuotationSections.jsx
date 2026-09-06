import {
  formatCurrency,
  formatDate,
  getItemDiscountAmount,
  getItemFinalTotal,
  getItemTaxableAmount,
  getQuotationSummary,
} from '../../../utils/quotationCalculations'
import StatusBadge from '../../quotation/StatusBadge'

export function PreviewField({ label, value, className = '' }) {
  return (
    <div className={className}>
      <p className="text-xs font-medium uppercase tracking-wide opacity-70">{label}</p>
      <p className="mt-1 whitespace-pre-line text-sm">{value || '—'}</p>
    </div>
  )
}

export function CompanyHeader({ company, variant = 'default' }) {
  const titleClass =
    variant === 'classic'
      ? 'text-lg font-serif font-bold uppercase tracking-wide'
      : variant === 'professional'
        ? 'text-2xl font-bold uppercase tracking-tight'
        : 'text-xl font-bold'

  return (
    <div className="mb-6 flex items-start justify-between gap-4 border-b pb-6">
      <div>
        <p className={titleClass}>{company.name || 'Your Company Name'}</p>
        <p className="mt-2 whitespace-pre-line text-sm opacity-80">
          {company.address || 'Company address will appear here'}
        </p>
        <div className="mt-3 space-y-1 text-sm opacity-80">
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
        <div className="flex h-16 w-24 items-center justify-center rounded border border-dashed text-xs opacity-50">
          Logo
        </div>
      )}
    </div>
  )
}

export function CoverLetterPreview({ coverLetter, company }) {
  if (!coverLetter.enabled) return null

  return (
    <div className="mt-6 space-y-4 text-sm leading-7">
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

export function CustomerSection({ customer, title = 'Bill To' }) {
  return (
    <div className="mb-6 rounded-lg p-4">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide opacity-70">{title}</p>
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
  )
}

export function ItemsTable({ items, currency = 'INR', compact = false }) {
  if (!items.length) {
    return (
      <p className="mb-6 text-sm opacity-70">No items added yet.</p>
    )
  }

  return (
    <table className={`mb-6 w-full border-collapse text-sm ${compact ? 'text-xs' : ''}`}>
      <thead>
        <tr className="border-b text-left">
          <th className="pb-2 pr-3 font-semibold">Description</th>
          <th className="pb-2 pr-3 font-semibold">Spec</th>
          <th className="pb-2 pr-3 font-semibold">Unit</th>
          <th className="pb-2 pr-3 font-semibold">Qty</th>
          <th className="pb-2 pr-3 font-semibold">Unit Price</th>
          <th className="pb-2 pr-3 font-semibold">Discount</th>
          <th className="pb-2 pr-3 font-semibold">Tax</th>
          <th className="pb-2 font-semibold">Total</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item) => (
          <tr key={item.id} className="border-b align-top">
            <td className="py-2 pr-3">{item.description || '—'}</td>
            <td className="py-2 pr-3 whitespace-pre-line">{item.specification || '—'}</td>
            <td className="py-2 pr-3">{item.unit || '—'}</td>
            <td className="py-2 pr-3">{item.quantity || 0}</td>
            <td className="py-2 pr-3">{formatCurrency(Number(item.unitPrice) || 0, currency)}</td>
            <td className="py-2 pr-3">{formatCurrency(getItemDiscountAmount(item), currency)}</td>
            <td className="py-2 pr-3">{item.taxRate || 0}%</td>
            <td className="py-2">{formatCurrency(getItemFinalTotal(item), currency)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export function PricingBlock({ items, additionalCharges = [], currency = 'INR' }) {
  const summary = getQuotationSummary(items, additionalCharges)

  const rows = [
    { label: 'Subtotal', value: summary.grossAmount },
    { label: 'Discount', value: summary.totalDiscount, hideIfZero: true },
    { label: 'Taxable Amount', value: summary.subtotalAfterDiscount },
    { label: 'GST / Tax', value: summary.taxAmount },
    { label: 'Additional Charges', value: summary.additionalTotal, hideIfZero: true },
  ]

  return (
    <div className="mb-8 ml-auto w-full max-w-sm space-y-2 text-sm">
      {rows.map((row) => {
        if (row.hideIfZero && !row.value) return null
        return (
          <div key={row.label} className="flex justify-between">
            <span className="opacity-70">{row.label}</span>
            <span className="font-medium">{formatCurrency(row.value, currency)}</span>
          </div>
        )
      })}
      <div className="flex justify-between border-t pt-2 text-base">
        <span className="font-semibold">Grand Total</span>
        <span className="font-bold">{formatCurrency(summary.grandTotal, currency)}</span>
      </div>
    </div>
  )
}

export function AdditionalChargesBlock({ additionalCharges, currency = 'INR' }) {
  const charges = additionalCharges.filter((charge) => charge.name?.trim() || charge.amount)
  if (!charges.length) return null

  return (
    <div className="mb-8">
      <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide">Additional Charges</h4>
      <div className="space-y-2 text-sm">
        {charges.map((charge) => (
          <div key={charge.id} className="flex justify-between">
            <span>{charge.name || 'Charge'}</span>
            <span className="font-medium">{formatCurrency(Number(charge.amount) || 0, currency)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function NotesBlock({ notes }) {
  if (!notes?.trim()) return null

  return (
    <div className="mb-8">
      <h4 className="mb-2 text-sm font-semibold uppercase tracking-wide">Notes</h4>
      <p className="whitespace-pre-line text-sm">{notes}</p>
    </div>
  )
}

export function PaymentTermsBlock({ paymentTerms }) {
  if (!paymentTerms?.trim()) return null

  return (
    <div className="mb-8">
      <h4 className="mb-2 text-sm font-semibold uppercase tracking-wide">Payment Terms</h4>
      <p className="whitespace-pre-line text-sm">{paymentTerms}</p>
    </div>
  )
}

export function DeliveryTermsBlock({ deliveryTerms }) {
  if (!deliveryTerms?.trim()) return null

  return (
    <div className="mb-8">
      <h4 className="mb-2 text-sm font-semibold uppercase tracking-wide">Delivery Terms</h4>
      <p className="whitespace-pre-line text-sm">{deliveryTerms}</p>
    </div>
  )
}

export function TermsBlock({ terms }) {
  if (!terms.some((term) => term.trim())) return null

  return (
    <div className="mb-8 border-t pt-6">
      <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide">Terms & Conditions</h4>
      <ul className="list-disc space-y-2 pl-5 text-sm">
        {terms.filter((term) => term.trim()).map((term, index) => (
          <li key={index}>{term}</li>
        ))}
      </ul>
    </div>
  )
}

export function BankBlock({ bankDetails }) {
  const hasBankDetails =
    bankDetails.accountName ||
    bankDetails.accountNumber ||
    bankDetails.bankName ||
    bankDetails.branch ||
    bankDetails.ifsc

  if (!hasBankDetails) return null

  return (
    <div className="mb-8 rounded-lg p-4">
      <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide">Bank Details</h4>
      <div className="grid gap-2 text-sm sm:grid-cols-2">
        {bankDetails.accountName && <p>Account Name: {bankDetails.accountName}</p>}
        {bankDetails.accountNumber && <p>Account Number: {bankDetails.accountNumber}</p>}
        {bankDetails.bankName && <p>Bank Name: {bankDetails.bankName}</p>}
        {bankDetails.branch && <p>Branch: {bankDetails.branch}</p>}
        {bankDetails.ifsc && <p>IFSC: {bankDetails.ifsc}</p>}
      </div>
    </div>
  )
}

export function SignatureBlock({ signature }) {
  return (
    <div className="border-t pt-6">
      {signature.signatureImage ? (
        <img
          src={signature.signatureImage}
          alt="Signature"
          className="mb-3 h-14 w-auto object-contain"
        />
      ) : (
        <div className="mb-3 h-14 w-40 border-b" />
      )}
      <p className="text-sm font-medium">{signature.name || 'Authorised Signatory'}</p>
      <p className="text-sm opacity-70">{signature.designation || 'Authorised Signatory'}</p>
    </div>
  )
}

export function MetaGrid({ quotationDetails, status, showSubject = true }) {
  const currency = quotationDetails.currency || 'INR'

  return (
    <>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide opacity-70">Quotation Number</p>
          <p className="mt-1 text-xl font-bold">{quotationDetails.quotationNumber || '—'}</p>
        </div>
        {status && <StatusBadge status={status} />}
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <PreviewField label="Date" value={formatDate(quotationDetails.quotationDate)} />
        <PreviewField label="Valid Until" value={formatDate(quotationDetails.validUntil)} />
        <PreviewField label="Reference" value={quotationDetails.referenceNumber} />
        <PreviewField label="Currency" value={currency} />
      </div>
      {showSubject && quotationDetails.subject && (
        <div className="mb-6">
          <PreviewField label="Subject" value={quotationDetails.subject} />
        </div>
      )}
    </>
  )
}

export function QuotationBodyContent({ quotationData, compact = false }) {
  const {
    items,
    additionalCharges = [],
    notes,
    paymentTerms,
    deliveryTerms,
    terms,
    bankDetails,
    signature,
    quotationDetails,
  } = quotationData

  const currency = quotationDetails?.currency || 'INR'

  return (
    <>
      <ItemsTable items={items} currency={currency} compact={compact} />
      <PricingBlock
        items={items}
        additionalCharges={additionalCharges}
        currency={currency}
      />
      <AdditionalChargesBlock additionalCharges={additionalCharges} currency={currency} />
      <NotesBlock notes={notes} />
      <PaymentTermsBlock paymentTerms={paymentTerms} />
      <DeliveryTermsBlock deliveryTerms={deliveryTerms} />
      <TermsBlock terms={terms} />
      <BankBlock bankDetails={bankDetails} />
      <SignatureBlock signature={signature} />
    </>
  )
}

export function QuotationContentSections({
  quotationData,
  showHeader = false,
  variant = 'default',
  compact = false,
}) {
  const {
    company,
    customer,
    quotationDetails,
    coverLetter,
    status,
  } = quotationData

  return (
    <>
      {showHeader && (
        <div className="quote-preview-page bg-white p-6 shadow-sm sm:p-10">
          <CompanyHeader company={company} variant={variant} />
          <MetaGrid
            quotationDetails={quotationDetails}
            status={status}
            showSubject={!coverLetter?.enabled}
          />
          <CustomerSection customer={customer} />
          <CoverLetterPreview coverLetter={coverLetter} company={company} />
        </div>
      )}

      <div className="quote-preview-page bg-white p-6 shadow-sm sm:p-10">
        <QuotationBodyContent quotationData={quotationData} compact={compact} />
      </div>
    </>
  )
}
