export const A4_WIDTH = 595.28
export const A4_HEIGHT = 841.89

export const DEFAULT_ITEM_TABLE_COLUMNS = [
  { key: 'description', label: 'Description', width: 220 },
  { key: 'quantity', label: 'Qty', width: 40 },
  { key: 'unit', label: 'Unit', width: 40 },
  { key: 'unitPrice', label: 'Price', width: 80 },
  { key: 'total', label: 'Total', width: 80 },
]

export const TEMPLATE_FIELD_GROUPS = [
  {
    id: 'company',
    label: 'Company',
    fields: [
      { key: 'company.name', label: 'Company Name', defaultWidth: 260, defaultHeight: 28, defaultFontSize: 16, defaultFontWeight: 'bold' },
      { key: 'company.logo', label: 'Company Logo', kind: 'image', defaultWidth: 90, defaultHeight: 56, defaultFontSize: 10 },
      { key: 'company.address', label: 'Company Address', defaultWidth: 260, defaultHeight: 42, defaultFontSize: 10 },
      { key: 'company.phone', label: 'Company Phone', defaultWidth: 180, defaultHeight: 20, defaultFontSize: 10 },
      { key: 'company.email', label: 'Company Email', defaultWidth: 200, defaultHeight: 20, defaultFontSize: 10 },
      { key: 'company.website', label: 'Website', defaultWidth: 200, defaultHeight: 20, defaultFontSize: 10 },
      { key: 'company.gstin', label: 'GSTIN', defaultWidth: 180, defaultHeight: 20, defaultFontSize: 10, defaultVisibility: 'conditional' },
    ],
  },
  {
    id: 'quotation',
    label: 'Quotation',
    fields: [
      { key: 'quotation.quotationNumber', label: 'Quotation Number', defaultWidth: 180, defaultHeight: 22, defaultFontSize: 12, defaultFontWeight: 'bold' },
      { key: 'quotation.date', label: 'Quotation Date', defaultWidth: 140, defaultHeight: 20, defaultFontSize: 11 },
      { key: 'quotation.validUntil', label: 'Valid Until', defaultWidth: 140, defaultHeight: 20, defaultFontSize: 11 },
      { key: 'quotation.referenceNumber', label: 'Reference Number', defaultWidth: 180, defaultHeight: 20, defaultFontSize: 11 },
      { key: 'quotation.subject', label: 'Subject', defaultWidth: 320, defaultHeight: 24, defaultFontSize: 11 },
    ],
  },
  {
    id: 'customer',
    label: 'Customer',
    fields: [
      { key: 'customer.companyName', label: 'Customer Company Name', defaultWidth: 240, defaultHeight: 24, defaultFontSize: 12, defaultFontWeight: 'bold' },
      { key: 'customer.contactPerson', label: 'Customer Contact Person', defaultWidth: 220, defaultHeight: 20, defaultFontSize: 11 },
      { key: 'customer.email', label: 'Customer Email', defaultWidth: 200, defaultHeight: 20, defaultFontSize: 10 },
      { key: 'customer.phone', label: 'Customer Phone', defaultWidth: 180, defaultHeight: 20, defaultFontSize: 10 },
      { key: 'customer.address', label: 'Customer Address', defaultWidth: 240, defaultHeight: 42, defaultFontSize: 10 },
    ],
  },
  {
    id: 'coverLetter',
    label: 'Cover Letter',
    fields: [
      { key: 'coverLetter.greeting', label: 'Greeting', defaultWidth: 220, defaultHeight: 20, defaultFontSize: 11, defaultVisibility: 'conditional' },
      { key: 'coverLetter.kindAttention', label: 'Kind Attention', defaultWidth: 240, defaultHeight: 20, defaultFontSize: 11, defaultVisibility: 'conditional' },
      { key: 'coverLetter.subject', label: 'Cover Letter Subject', defaultWidth: 320, defaultHeight: 22, defaultFontSize: 11, defaultVisibility: 'conditional' },
      { key: 'coverLetter.message', label: 'Cover Letter Message', defaultWidth: 420, defaultHeight: 80, defaultFontSize: 10, defaultVisibility: 'conditional' },
      { key: 'coverLetter.closing', label: 'Closing', defaultWidth: 180, defaultHeight: 20, defaultFontSize: 11, defaultVisibility: 'conditional' },
    ],
  },
  {
    id: 'items',
    label: 'Items',
    fields: [
      { key: 'items.table', label: 'Item Table', kind: 'table', defaultWidth: 500, defaultHeight: 160, defaultFontSize: 9 },
      { key: 'items.description', label: 'Item Description', defaultWidth: 260, defaultHeight: 24, defaultFontSize: 10 },
      { key: 'items.specification', label: 'Item Specification', defaultWidth: 300, defaultHeight: 56, defaultFontSize: 9 },
      { key: 'items.quantity', label: 'Quantity', defaultWidth: 70, defaultHeight: 20, defaultFontSize: 10 },
      { key: 'items.unit', label: 'Unit', defaultWidth: 70, defaultHeight: 20, defaultFontSize: 10 },
      { key: 'items.unitPrice', label: 'Unit Price', defaultWidth: 90, defaultHeight: 20, defaultFontSize: 10 },
      { key: 'items.discount', label: 'Discount', defaultWidth: 80, defaultHeight: 20, defaultFontSize: 10 },
      { key: 'items.tax', label: 'Tax', defaultWidth: 70, defaultHeight: 20, defaultFontSize: 10 },
      { key: 'items.total', label: 'Item Total', defaultWidth: 90, defaultHeight: 20, defaultFontSize: 10 },
    ],
  },
  {
    id: 'summary',
    label: 'Summary',
    fields: [
      { key: 'pricing.subtotal', label: 'Subtotal', defaultWidth: 140, defaultHeight: 20, defaultFontSize: 11 },
      { key: 'pricing.totalDiscount', label: 'Discount Total', defaultWidth: 140, defaultHeight: 20, defaultFontSize: 11 },
      { key: 'pricing.taxableAmount', label: 'Taxable Amount', defaultWidth: 140, defaultHeight: 20, defaultFontSize: 11 },
      { key: 'pricing.tax', label: 'Tax', defaultWidth: 140, defaultHeight: 20, defaultFontSize: 11, defaultVisibility: 'conditional' },
      { key: 'pricing.additionalCharges', label: 'Additional Charges', defaultWidth: 200, defaultHeight: 36, defaultFontSize: 10, defaultVisibility: 'conditional' },
      { key: 'pricing.grandTotal', label: 'Grand Total', defaultWidth: 160, defaultHeight: 24, defaultFontSize: 13, defaultFontWeight: 'bold' },
    ],
  },
  {
    id: 'other',
    label: 'Other',
    fields: [
      { key: 'notes', label: 'Notes', defaultWidth: 360, defaultHeight: 48, defaultFontSize: 10 },
      { key: 'paymentTerms', label: 'Payment Terms', defaultWidth: 320, defaultHeight: 36, defaultFontSize: 10 },
      { key: 'deliveryTerms', label: 'Delivery Terms', defaultWidth: 320, defaultHeight: 36, defaultFontSize: 10 },
      { key: 'terms', label: 'Terms & Conditions', defaultWidth: 420, defaultHeight: 80, defaultFontSize: 9 },
      { key: 'bankDetails', label: 'Bank Details', defaultWidth: 260, defaultHeight: 70, defaultFontSize: 9 },
      { key: 'signature.name', label: 'Authorized Signatory', defaultWidth: 180, defaultHeight: 20, defaultFontSize: 11, defaultFontWeight: 'bold' },
      { key: 'signature.designation', label: 'Signatory Designation', defaultWidth: 180, defaultHeight: 18, defaultFontSize: 10 },
      { key: 'signature.image', label: 'Signature', kind: 'image', defaultWidth: 120, defaultHeight: 48, defaultFontSize: 10, defaultVisibility: 'conditional' },
    ],
  },
]

const FIELD_INDEX = Object.fromEntries(
  TEMPLATE_FIELD_GROUPS.flatMap((group) => group.fields.map((field) => [field.key, { ...field, group: group.label }])),
)

export function getTemplateFieldDefinition(fieldKey) {
  return FIELD_INDEX[fieldKey] || { key: fieldKey, label: fieldKey, defaultWidth: 180, defaultHeight: 22, defaultFontSize: 11 }
}

export function getTemplateFieldLabel(fieldKey) {
  return getTemplateFieldDefinition(fieldKey).label
}
