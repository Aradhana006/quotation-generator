import {
  formatCurrency,
  formatDate,
  getItemBaseAmount,
  getItemFinalTotal,
  getQuotationSummary,
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
      {/* Pack content from the top — no flex spacer that creates empty mid-page gaps */}
      <div className="relative z-10 flex min-h-[297mm] flex-col justify-start px-8 py-6 sm:px-10 sm:py-7">
        {children}
      </div>
    </div>
  )
}

/** Top: uploaded logo only (keeps the page looking like a clean quotation letterhead). */
function BrandHeader({ company, theme, align = 'right' }) {
  const c = theme.colors
  const alignClass =
    align === 'center' ? 'justify-center' : align === 'left' ? 'justify-start' : 'justify-end'

  return (
    <div className={`mb-4 flex items-start ${alignClass}`}>
      {company?.logo ? (
        <img
          src={company.logo}
          alt={company.name || 'Company logo'}
          className="h-14 w-auto max-w-[220px] object-contain object-right"
        />
      ) : (
        <div className="text-right">
          <p className="text-lg font-semibold" style={{ color: c.text }}>
            {company?.name || 'Your Company'}
          </p>
          <p className="mt-0.5 text-xs" style={{ color: c.muted }}>
            Quotation
          </p>
        </div>
      )}
    </div>
  )
}

/** Company name + contact — sits directly under content (no push-to-bottom gap). */
function ContactFooter({ company, theme }) {
  const c = theme.colors
  return (
    <div className="mt-5 pt-4">
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

function LabelValue({ label, value, theme }) {
  if (!value && value !== 0) return null
  return (
    <div className="grid grid-cols-[120px_12px_1fr] gap-1 text-sm leading-6">
      <span style={{ color: theme.colors.text }}>{label}</span>
      <span style={{ color: theme.colors.muted }}>:</span>
      <span style={{ color: theme.colors.text }}>{value}</span>
    </div>
  )
}

function SignatureArea({ signature, company, theme }) {
  return (
    <div className="mt-5">
      <p className="text-sm italic" style={{ color: theme.colors.text }}>
        For <span className="font-semibold not-italic">{company.name || 'Your Company'}</span>
      </p>
      <div className="mt-3 flex items-end gap-6">
        <div>
          {signature?.signatureImage ? (
            <img
              src={signature.signatureImage}
              alt="Signature"
              className="mb-1 h-12 w-auto object-contain"
            />
          ) : (
            <div className="mb-1 h-10 w-36 border-b" style={{ borderColor: theme.colors.line }} />
          )}
          <p className="text-sm italic" style={{ color: theme.colors.muted }}>
            {signature?.designation || 'Authorised Signatory'}
          </p>
          {signature?.name && (
            <p className="text-sm font-medium" style={{ color: theme.colors.text }}>
              {signature.name}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

/** Cover page letter body. */
export function CoverLetterPreview({ coverLetter, company, asCoverPage = false, theme }) {
  if (!coverLetter) return null
  const t = theme || getTemplateTheme('modern')

  const body = (
    <div className="max-w-2xl space-y-3 text-[13px] leading-6" style={{ color: t.colors.text }}>
      {coverLetter.greeting && <p>{coverLetter.greeting}</p>}
      {coverLetter.kindAttention && (
        <p className="font-semibold">
          Kind Attn: {coverLetter.kindAttention}
        </p>
      )}
      {coverLetter.subject && (
        <p>
          <span className="font-semibold">Subject:</span> {coverLetter.subject}
        </p>
      )}
      {coverLetter.message && (
        <p className="whitespace-pre-line text-justify">{coverLetter.message}</p>
      )}
      {coverLetter.closing && <p className="pt-1">{coverLetter.closing}</p>}
      {(coverLetter.signOffCompany || coverLetter.signOffTitle) && (
        <div className="pt-2">
          {coverLetter.signOffCompany && (
            <p className="font-semibold">{coverLetter.signOffCompany}</p>
          )}
          {coverLetter.signOffTitle && (
            <p className="text-xs" style={{ color: t.colors.muted }}>
              {coverLetter.signOffTitle}
            </p>
          )}
        </div>
      )}
    </div>
  )

  if (!asCoverPage) return <div className="mt-4">{body}</div>
  return body
}

export function CustomerSection({ customer, title = 'To', theme }) {
  const t = theme || getTemplateTheme('modern')
  return (
    <div className="mb-3 text-sm leading-6" style={{ color: t.colors.text }}>
      <p className="mb-1 font-medium">{title}</p>
      <p className="font-semibold">{customer.companyName || '—'}</p>
      {customer.address && <p className="mt-1 whitespace-pre-line">{customer.address}</p>}
      {customer.contactPerson && <p className="mt-2">Kind Attn: {customer.contactPerson}</p>}
      {(customer.email || customer.phone) && (
        <p className="mt-1" style={{ color: t.colors.muted }}>
          {[customer.email, customer.phone].filter(Boolean).join(' · ')}
        </p>
      )}
      {(customer.referenceNumber || customer.gstin) && (
        <p className="mt-1" style={{ color: t.colors.muted }}>
          {[
            customer.referenceNumber ? `Ref: ${customer.referenceNumber}` : '',
            customer.gstin ? `GSTIN: ${customer.gstin}` : '',
          ]
            .filter(Boolean)
            .join(' · ')}
        </p>
      )}
    </div>
  )
}

export function ItemsTable({ items, currency = 'INR', theme, subject }) {
  const t = theme || getTemplateTheme('modern')
  const c = t.colors

  if (!items.length) {
    return <p className="mb-3 text-sm opacity-70">No items added yet.</p>
  }

  return (
    <div className="mb-3">
      {subject && (
        <h3
          className="mb-2 text-base font-bold"
          style={{ color: c.text, fontFamily: t.headingFont }}
        >
          {subject}
        </h3>
      )}
      <table
        className="w-full border-collapse text-[12px]"
        style={{ borderColor: c.tableBorder, color: c.text }}
      >
        <thead>
          <tr style={{ backgroundColor: c.tableHeaderBg, color: c.tableHeaderText }}>
            <th className="border px-2 py-2 text-center font-semibold" style={{ borderColor: c.tableBorder }}>
              Sno.
            </th>
            <th className="border px-2 py-2 text-left font-semibold" style={{ borderColor: c.tableBorder }}>
              Description
            </th>
            <th className="border px-2 py-2 text-center font-semibold" style={{ borderColor: c.tableBorder }}>
              Price
            </th>
            <th className="border px-2 py-2 text-center font-semibold" style={{ borderColor: c.tableBorder }}>
              Qty
            </th>
            <th className="border px-2 py-2 text-center font-semibold" style={{ borderColor: c.tableBorder }}>
              Total Price
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => {
            const lineTotal = getItemFinalTotal(item)
            const unitPrice = Number(item.unitPrice) || 0
            const qty = Number(item.quantity) || 0
            const specLines = String(item.specification || '')
              .split('\n')
              .map((line) => line.trim())
              .filter(Boolean)

            return (
              <tr key={item.id || `${item.description}-${index}`} className="align-top">
                <td
                  className="border px-2 py-2 text-center"
                  style={{ borderColor: c.tableBorder }}
                >
                  {index + 1}.
                </td>
                <td className="border px-2 py-2" style={{ borderColor: c.tableBorder }}>
                  <p className="font-medium">{item.description || '—'}</p>
                  {specLines.length > 0 && (
                    <ul className="mt-1 list-disc space-y-0.5 pl-4" style={{ color: c.muted }}>
                      {specLines.map((line) => (
                        <li key={line}>{line.replace(/^[-•*]\s*/, '')}</li>
                      ))}
                    </ul>
                  )}
                  {item.unit && (
                    <p className="mt-1 text-[11px]" style={{ color: c.muted }}>
                      Unit: {item.unit}
                    </p>
                  )}
                </td>
                <td
                  className="border px-2 py-2 text-center tabular-nums"
                  style={{ borderColor: c.tableBorder }}
                >
                  {formatCurrency(unitPrice, currency)}
                </td>
                <td
                  className="border px-2 py-2 text-center tabular-nums"
                  style={{ borderColor: c.tableBorder }}
                >
                  {qty}
                </td>
                <td
                  className="border px-2 py-2 text-center font-semibold tabular-nums"
                  style={{ borderColor: c.tableBorder }}
                >
                  {formatCurrency(lineTotal || getItemBaseAmount(item), currency)}
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

  return (
    <div className="mb-3 ml-auto w-full max-w-xs text-sm">
      <div
        className="flex justify-between rounded-sm px-3 py-2 font-semibold"
        style={{ backgroundColor: t.colors.accent, color: '#fff' }}
      >
        <span>Grand Total</span>
        <span>{formatCurrency(summary.grandTotal, currency)}</span>
      </div>
      {(summary.taxAmount > 0 || summary.totalDiscount > 0) && (
        <div className="mt-2 space-y-1 px-1 text-xs" style={{ color: t.colors.muted }}>
          {summary.totalDiscount > 0 && (
            <div className="flex justify-between">
              <span>Discount</span>
              <span>{formatCurrency(summary.totalDiscount, currency)}</span>
            </div>
          )}
          {summary.taxAmount > 0 && (
            <div className="flex justify-between">
              <span>Tax / GST</span>
              <span>{formatCurrency(summary.taxAmount, currency)}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export function TermsAndBankBlock({ quotationData, theme }) {
  const t = theme || getTemplateTheme('modern')
  const {
    quotationDetails,
    paymentTerms,
    deliveryTerms,
    terms = [],
    bankDetails = {},
    company,
  } = quotationData

  const termRows = [
    {
      label: 'Validity',
      value:
        quotationDetails.validityDays !== '' && quotationDetails.validityDays != null
          ? `${quotationDetails.validityDays} Days`
          : quotationDetails.validUntil
            ? `Until ${formatDate(quotationDetails.validUntil)}`
            : '',
    },
    { label: 'Payment', value: paymentTerms },
    { label: 'Delivery', value: deliveryTerms },
    { label: 'GSTIN', value: company?.gstin },
  ]

  const customTerms = terms.filter((term) => String(term || '').trim())
  const hasBank =
    bankDetails.accountName ||
    bankDetails.accountNumber ||
    bankDetails.bankName ||
    bankDetails.branch ||
    bankDetails.ifsc

  return (
    <div className="mb-3 grid gap-4 sm:grid-cols-2">
      <div>
        <h4
          className="mb-2 text-sm font-bold uppercase underline underline-offset-4"
          style={{ color: t.colors.text, fontFamily: t.headingFont }}
        >
          Terms & Conditions
        </h4>
        <div className="space-y-0.5">
          {termRows.map((row) => (
            <LabelValue key={row.label} label={row.label} value={row.value} theme={t} />
          ))}
          {customTerms.map((term, index) => (
            <p key={index} className="text-sm leading-6" style={{ color: t.colors.text }}>
              • {term}
            </p>
          ))}
        </div>
      </div>

      {hasBank && (
        <div>
          <h4
            className="mb-2 text-sm font-bold underline underline-offset-4"
            style={{ color: t.colors.text, fontFamily: t.headingFont }}
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
  return <BrandHeader company={company} theme={theme} align="left" />
}

export function MetaGrid({ quotationDetails, showSubject = true, theme }) {
  const t = theme || getTemplateTheme('modern')
  return (
    <div className="mb-5">
      <div className="mb-4 flex items-start justify-between gap-4 text-sm">
        <p style={{ color: t.colors.text }}>
          <span className="font-medium">{quotationDetails.referenceNumber || quotationDetails.quotationNumber || '—'}</span>
        </p>
        <p style={{ color: t.colors.text }}>{formatDate(quotationDetails.quotationDate)}</p>
      </div>
      {showSubject && quotationDetails.subject && (
        <p className="text-sm">
          <span className="font-semibold">Subject:</span> {quotationDetails.subject}
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
        <BrandHeader company={company} theme={theme} align="right" />

        <div className="mb-4 flex items-start justify-between gap-4 text-sm">
          <p style={{ color: theme.colors.text }}>
            {quotationDetails.referenceNumber || quotationDetails.quotationNumber || '—'}
          </p>
          <p style={{ color: theme.colors.text }}>
            {formatDate(quotationDetails.quotationDate)}
          </p>
        </div>

        <CustomerSection customer={customer} title="To" theme={theme} />

        <div className="mt-1">
          <p
            className="mb-3 text-[10px] font-semibold uppercase tracking-wide"
            style={{ color: theme.colors.muted }}
          >
            Cover letter
          </p>
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
        <BrandHeader company={company} theme={theme} align="right" />
        {bodyHeading}
        <QuotationBodyContent quotationData={quotationData} compact theme={theme} />
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
      <ContactFooter company={quotationData.company} theme={theme} />
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
