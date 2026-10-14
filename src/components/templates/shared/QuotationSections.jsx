import {
  formatCurrency,
  formatDate,
  getItemBaseAmount,
  getQuotationSummary,
  resolveCoverLetterMessage,
} from '../../../utils/quotationCalculations'
import { getTemplateTheme } from '../../../data/templateThemes'

export function PreviewField({ label, value, className = '' }) {
  return (
    <div className={className}>
      <p className="text-xs font-medium uppercase tracking-wide opacity-70">{label}</p>
      <p className="mt-1 whitespace-pre-line text-sm">{value || '—'}</p>
    </div>
  )
}

function PageShell({ theme, children, className = '' }) {
  const c = theme.colors
  return (
    <div
      className={`quote-preview-page relative border border-slate-200 bg-white shadow-sm ${className}`}
      style={{
        backgroundColor: '#ffffff',
        color: c.text,
        fontFamily: theme.fontFamily,
      }}
    >
      {/* Full A4 column so the company contact block can sit at the page bottom */}
      <div className="relative z-10 flex min-h-[297mm] flex-col px-8 py-6 sm:px-10 sm:py-7">
        {children}
      </div>
    </div>
  )
}

/** Letterhead: company name/logo + rule only (contact block is page footer). */
function BrandHeader({ company, theme }) {
  const c = theme.colors
  return (
    <div className="mb-2">
      <div className="flex items-center gap-3">
        {company?.logo ? (
          <img
            src={company.logo}
            alt={company.name || 'Company logo'}
            className="h-10 w-auto max-w-[140px] object-contain"
          />
        ) : null}
        <p className="text-[15px] font-bold leading-tight" style={{ color: c.text }}>
          {company?.name || 'Your Company'}
        </p>
      </div>
      <div className="mt-2 h-px w-full" style={{ backgroundColor: c.line }} />
    </div>
  )
}

/** 3-column company details — pinned to the bottom of the page. */
function ContactFooter({ company, theme }) {
  const c = theme.colors
  return (
    <div className="mt-auto pt-8">
      <div className="mb-3 h-px w-full" style={{ backgroundColor: c.line }} />
      <p className="mb-2 text-sm font-semibold" style={{ color: c.text }}>
        {company?.name || 'Your Company'}
      </p>
      <div
        className="grid gap-3 text-[10px] leading-relaxed sm:grid-cols-3"
        style={{ color: c.footerText }}
      >
        <div>
          <p className="mb-1 font-semibold uppercase tracking-wide" style={{ color: c.muted }}>
            Address
          </p>
          <p className="whitespace-pre-line">{company?.address || '—'}</p>
        </div>
        <div>
          <p className="mb-1 font-semibold uppercase tracking-wide" style={{ color: c.muted }}>
            Email
          </p>
          <p>{company?.email || '—'}</p>
          {company?.website && <p className="mt-1">{company.website}</p>}
        </div>
        <div>
          <p className="mb-1 font-semibold uppercase tracking-wide" style={{ color: c.muted }}>
            Contact
          </p>
          <p>{company?.phone || '—'}</p>
          {company?.gstin && <p className="mt-1">GSTIN: {company.gstin}</p>}
        </div>
      </div>
    </div>
  )
}

function LabelValue({ label, value, theme, boldValue = false }) {
  if (!value && value !== 0) return null
  return (
    <div className="grid grid-cols-[110px_14px_1fr] gap-0 text-[13px] leading-6">
      <span style={{ color: theme.colors.text }}>{label}</span>
      <span style={{ color: theme.colors.text }}>:</span>
      <span
        className={boldValue ? 'font-bold' : 'font-normal'}
        style={{ color: theme.colors.text }}
      >
        {value}
      </span>
    </div>
  )
}

function SignatureArea({ signature, company, theme }) {
  return (
    <div className="mt-8 space-y-2 text-[13px]" style={{ color: theme.colors.text }}>
      <p>For {company.name || 'Your Company'}</p>
      <div className="pt-1">
        {signature?.signatureImage ? (
          <img
            src={signature.signatureImage}
            alt="Signature"
            className="mb-2 h-12 w-auto object-contain"
          />
        ) : (
          <div className="mb-2 h-10 w-36 border-b" style={{ borderColor: theme.colors.line }} />
        )}
        <p>{signature?.designation || 'Authorised Signatory'}</p>
        {signature?.name ? <p>{signature.name}</p> : null}
      </div>
    </div>
  )
}

/** Cover page letter body — one consistent body size, light spacing. */
export function CoverLetterPreview({ coverLetter, company, asCoverPage = false, theme }) {
  if (!coverLetter) return null
  const t = theme || getTemplateTheme('modern')
  const message = resolveCoverLetterMessage(coverLetter.message)
  // Kind Attn is shown once under To — don't repeat it in the letter body.
  const showAttnInBody = Boolean(coverLetter.kindAttention) && !asCoverPage

  const body = (
    <div className="max-w-3xl space-y-3 text-[13px] leading-6" style={{ color: t.colors.text }}>
      {coverLetter.greeting && <p>{coverLetter.greeting}</p>}
      {showAttnInBody && <p>Kind Attn: {coverLetter.kindAttention}</p>}
      {coverLetter.subject && <p>Subject: {coverLetter.subject}</p>}
      {message && (
        <p className="whitespace-pre-line text-justify">{message}</p>
      )}
      {coverLetter.closing && <p>{coverLetter.closing}</p>}
    </div>
  )

  if (!asCoverPage) return <div className="mt-4">{body}</div>
  return body
}

export function CustomerSection({ customer, title = 'To', theme }) {
  const t = theme || getTemplateTheme('modern')
  return (
    <div className="mb-4 text-[13px] leading-6" style={{ color: t.colors.text }}>
      <p className="mb-1">{title}</p>
      <p>{customer.companyName || '—'}</p>
      {customer.address && <p className="mt-1 whitespace-pre-line">{customer.address}</p>}
      {customer.contactPerson && <p className="mt-2">Kind Attn: {customer.contactPerson}</p>}
    </div>
  )
}

function formatPlainAmount(amount, currency) {
  const value = Number(amount) || 0
  if (currency === 'INR') {
    return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(value)
  }
  return formatCurrency(value, currency)
}

export function ItemsTable({ items, currency = 'INR', theme, subject }) {
  const t = theme || getTemplateTheme('modern')
  const c = t.colors

  if (!items.length) {
    return <p className="mb-3 text-[13px] opacity-70">No items added yet.</p>
  }

  return (
    <div className="mb-4">
      {subject && (
        <p className="mb-2 text-[13px] font-bold" style={{ color: c.text }}>
          {subject}
        </p>
      )}
      <table
        className="w-full border-collapse text-[12px]"
        style={{ borderColor: c.tableBorder, color: c.text }}
      >
        <thead>
          <tr style={{ backgroundColor: c.tableHeaderBg, color: c.tableHeaderText }}>
            <th className="border px-2 py-2 text-center font-bold" style={{ borderColor: c.tableBorder }}>
              Sno.
            </th>
            <th className="border px-2 py-2 text-center font-bold" style={{ borderColor: c.tableBorder }}>
              Description
            </th>
            <th className="border px-2 py-2 text-center font-bold" style={{ borderColor: c.tableBorder }}>
              Price (Rs.)
            </th>
            <th className="border px-2 py-2 text-center font-bold" style={{ borderColor: c.tableBorder }}>
              Qty (No)
            </th>
            <th className="border px-2 py-2 text-center font-bold" style={{ borderColor: c.tableBorder }}>
              Total Price (Rs.)
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => {
            const unitPrice = Number(item.unitPrice) || 0
            const qty = Number(item.quantity) || 0
            // Total Price = Price × Qty only (GST shown below in summary).
            const lineBase = getItemBaseAmount(item)
            const specLines = String(item.specification || '')
              .split('\n')
              .map((line) => line.trim().replace(/^[-•*]\s*/, ''))
              .filter(Boolean)

            return (
              <tr key={item.id || `${item.description}-${index}`} className="align-top">
                <td
                  className="border px-2 py-2 text-center"
                  style={{ borderColor: c.tableBorder }}
                >
                  {index + 1}.
                </td>
                <td className="border px-2 py-2 text-left" style={{ borderColor: c.tableBorder }}>
                  <p>{item.description || '—'}</p>
                  {specLines.length > 0 && (
                    <ul className="mt-1 list-disc space-y-0.5 pl-4">
                      {specLines.map((line) => (
                        <li key={line}>{line}</li>
                      ))}
                    </ul>
                  )}
                </td>
                <td
                  className="border px-2 py-2 text-center tabular-nums"
                  style={{ borderColor: c.tableBorder }}
                >
                  {formatPlainAmount(unitPrice, currency)}
                </td>
                <td
                  className="border px-2 py-2 text-center tabular-nums"
                  style={{ borderColor: c.tableBorder }}
                >
                  {qty}
                </td>
                <td
                  className="border px-2 py-2 text-center font-bold tabular-nums"
                  style={{ borderColor: c.tableBorder }}
                >
                  {formatPlainAmount(lineBase, currency)}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export function PricingBlock({ items, additionalCharges = [], currency = 'INR', theme }) {
  const t = theme || getTemplateTheme('modern')
  const summary = getQuotationSummary(items, additionalCharges)
  const rows = [
    ['Subtotal', summary.grossAmount],
    ['Total Discount', summary.totalDiscount],
    ['Taxable Amount', summary.subtotalAfterDiscount],
    ['GST / Tax', summary.taxAmount],
    ...additionalCharges
      .filter((charge) => String(charge.name || '').trim() || Number(charge.amount))
      .map((charge) => [charge.name || 'Charge', Number(charge.amount) || 0]),
  ]

  return (
    <div
      className="mb-4 ml-auto w-full max-w-[min(100%,20rem)] text-[13px]"
      style={{ color: t.colors.text }}
    >
      <p className="mb-2 font-bold">Pricing summary</p>
      <div className="space-y-1">
        {rows.map(([label, value]) => (
          <div key={label} className="grid grid-cols-[1fr_7.5rem] gap-2">
            <span>{label}</span>
            <span className="text-right tabular-nums">{formatCurrency(value, currency)}</span>
          </div>
        ))}
      </div>
      <div
        className="mt-2 grid grid-cols-[1fr_7.5rem] gap-2 border px-2 py-2 font-bold"
        style={{ borderColor: t.colors.tableBorder }}
      >
        <span>Grand Total</span>
        <span className="text-right tabular-nums">
          {formatCurrency(summary.grandTotal, currency)}
        </span>
      </div>
    </div>
  )
}

function buildPreviewTermRows(quotationData) {
  const {
    quotationDetails = {},
    paymentTerms,
    deliveryTerms,
    terms = [],
    company,
  } = quotationData
  const rows = []
  const seen = new Set()

  const push = (label, value, boldValue = false) => {
    const key = String(label || '').toLowerCase()
    if (!value || seen.has(key)) return
    seen.add(key)
    rows.push({ label, value, boldValue })
  }

  push(
    'Validity',
    quotationDetails.validityDays !== '' && quotationDetails.validityDays != null
      ? `${quotationDetails.validityDays} Days.`
      : quotationDetails.validUntil
        ? `Until ${formatDate(quotationDetails.validUntil)}.`
        : '',
  )
  push('Payment', paymentTerms)
  push('Delivery', deliveryTerms)

  terms.forEach((term) => {
    const text = String(term || '').trim().replace(/^[-•*]\s*/, '')
    if (!text) return
    const match = text.match(/^([^:]+):\s*(.+)$/)
    if (match) {
      const label = match[1].trim()
      const value = match[2].trim()
      push(label, value, /^(gst|gstin)$/i.test(label))
    } else {
      push('Note', text)
    }
  })

  push('GSTIN', company?.gstin, true)
  return rows
}

export function TermsAndBankBlock({ quotationData, theme }) {
  const t = theme || getTemplateTheme('modern')
  const { bankDetails = {} } = quotationData
  const termRows = buildPreviewTermRows(quotationData)

  const hasBank =
    bankDetails.accountName ||
    bankDetails.accountNumber ||
    bankDetails.bankName ||
    bankDetails.branch ||
    bankDetails.ifsc

  return (
    <div className="mb-4 grid gap-6 sm:grid-cols-2">
      <div>
        <h4
          className="mb-2 text-[13px] font-bold uppercase underline underline-offset-4"
          style={{ color: t.colors.text }}
        >
          Terms & Conditions
        </h4>
        <div className="space-y-0.5">
          {termRows.map((row) => (
            <LabelValue
              key={`${row.label}-${row.value}`}
              label={row.label}
              value={row.value}
              theme={t}
              boldValue={row.boldValue}
            />
          ))}
        </div>
      </div>

      {hasBank && (
        <div>
          <h4
            className="mb-2 text-[13px] font-bold underline underline-offset-4"
            style={{ color: t.colors.text }}
          >
            Bank Details
          </h4>
          <div className="space-y-0.5">
            <LabelValue label="Account Name" value={bankDetails.accountName} theme={t} />
            <LabelValue label="Account Number" value={bankDetails.accountNumber} theme={t} />
            <LabelValue label="Bank Name" value={bankDetails.bankName} theme={t} />
            <LabelValue label="Branch" value={bankDetails.branch} theme={t} />
            <LabelValue label="IFSC" value={bankDetails.ifsc} theme={t} />
          </div>
        </div>
      )}
    </div>
  )
}

export function CompanyHeader({ company, variant = 'modern' }) {
  const theme = getTemplateTheme(variant)
  return <BrandHeader company={company} theme={theme} />
}

export function MetaGrid({ quotationDetails, showSubject = true, theme }) {
  const t = theme || getTemplateTheme('modern')
  return (
    <div className="mb-4">
      <div className="mb-3 mt-4 flex items-start justify-between gap-4 text-[13px]">
        <p style={{ color: t.colors.text }}>
          Quotation No.: {quotationDetails.quotationNumber || '—'}
        </p>
        <p style={{ color: t.colors.text }}>
          Date: {formatDate(quotationDetails.quotationDate)}
        </p>
      </div>
      {showSubject && quotationDetails.subject && (
        <p className="text-[13px]" style={{ color: t.colors.text }}>
          Subject: {quotationDetails.subject}
        </p>
      )}
    </div>
  )
}

export function QuotationBodyContent({ quotationData, compact = false, theme }) {
  const t = theme || getTemplateTheme('modern')
  const { items, additionalCharges = [], quotationDetails } = quotationData
  const currency = quotationDetails?.currency || 'INR'

  return (
    <>
      <ItemsTable
        items={items}
        currency={currency}
        theme={t}
        subject={quotationDetails?.subject || 'Quotation'}
      />
      <PricingBlock
        items={items}
        additionalCharges={additionalCharges}
        currency={currency}
        theme={t}
      />
      <TermsAndBankBlock quotationData={quotationData} theme={t} />
      <SignatureArea
        signature={quotationData.signature}
        company={quotationData.company}
        theme={t}
      />
    </>
  )
}

/** Page 1 = cover letterhead. Page 2 = full quotation — sample-aligned layout. */
export function QuotationDocumentPages({
  quotationData,
  variant = 'modern',
  pageClassName = '',
  bodyHeading = null,
}) {
  const theme = getTemplateTheme(variant)
  const { company, customer, quotationDetails, coverLetter, signature } = quotationData
  const coverContent = {
    ...coverLetter,
    enabled: true,
  }

  return (
    <div className="space-y-6">
      {/* Page 1 — cover */}
      <PageShell theme={theme} className={`quote-preview-page--cover ${pageClassName}`}>
        <div className="flex-1">
          <BrandHeader company={company} theme={theme} />

          <div className="mb-4 mt-5 flex items-start justify-between gap-4 text-[13px]">
            <p style={{ color: theme.colors.text }}>
              Quotation No.: {quotationDetails.quotationNumber || '—'}
            </p>
            <p style={{ color: theme.colors.text }}>
              Date: {formatDate(quotationDetails.quotationDate)}
            </p>
          </div>

          <CustomerSection customer={customer} title="To" theme={theme} />

          <CoverLetterPreview
            coverLetter={coverContent}
            company={company}
            asCoverPage
            theme={theme}
          />
          <SignatureArea signature={signature} company={company} theme={theme} />
        </div>
        <ContactFooter company={company} theme={theme} />
      </PageShell>

      {/* Page 2 — quotation schedule */}
      <PageShell theme={theme} className={`quote-preview-page--content ${pageClassName}`}>
        <div className="flex-1">
          <BrandHeader company={company} theme={theme} />
          {bodyHeading}
          <div className="mt-4">
            <QuotationBodyContent quotationData={quotationData} compact theme={theme} />
          </div>
        </div>
        <ContactFooter company={company} theme={theme} />
      </PageShell>
    </div>
  )
}

export function QuotationContentSections({
  quotationData,
  showHeader = false,
  variant = 'modern',
  compact = false,
}) {
  if (showHeader) {
    return (
      <QuotationDocumentPages
        quotationData={quotationData}
        variant={variant === 'default' ? 'modern' : variant}
      />
    )
  }

  const theme = getTemplateTheme(variant === 'default' ? 'modern' : variant)
  return (
    <PageShell theme={theme} className="quote-preview-page--content">
      <QuotationBodyContent quotationData={quotationData} compact={compact} theme={theme} />
    </PageShell>
  )
}

/* Kept for older imports */
export function AdditionalChargesBlock() {
  return null
}
export function NotesBlock() {
  return null
}
export function PaymentTermsBlock() {
  return null
}
export function DeliveryTermsBlock() {
  return null
}
export function TermsBlock() {
  return null
}
export function BankBlock() {
  return null
}
export function SignatureBlock({ signature }) {
  return (
    <div>
      {signature?.name}
    </div>
  )
}
