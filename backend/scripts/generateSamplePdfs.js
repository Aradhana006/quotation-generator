import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import { sanitizePdfFilename } from '../pdf/format.js'
import { generateQuotationPdf } from '../services/pdfService.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const outputDir = path.join(__dirname, '..', 'tmp', 'pdf-samples')

function baseQuotation(overrides = {}) {
  return {
    id: 'sample',
    status: 'draft',
    company: {
      name: 'Nexora Automation Pvt Ltd',
      logo: '',
      address: '42, Industrial Layout, Peenya, Bengaluru 560058',
      phone: '+91 80 4123 8900',
      email: 'sales@nexora.example',
      website: 'www.nexora.example',
      gstin: '29AABCU9603R1ZM',
    },
    customer: {
      companyName: 'ABC Industries',
      contactPerson: 'Mr. Ramesh Kumar',
      email: 'ramesh@abcindustries.example',
      phone: '+91 98765 43210',
      address: 'Plot 18, Phase II, MIDC, Pune 411026',
    },
    quotationDetails: {
      quotationNumber: 'QT-2026-001',
      quotationDate: '2026-04-02',
      validUntil: '2026-04-30',
      referenceNumber: 'ENQ-4481',
      subject: 'Supply of Edge Gateway for PLC connectivity',
      currency: 'INR',
    },
    coverLetter: {
      enabled: true,
      greeting: 'Dear Sir,',
      kindAttention: 'Mr. Ramesh Kumar, Projects',
      subject: 'Quotation for Edge Gateway Hardware',
      message:
        'With reference to your enquiry, we are pleased to submit our offer for the supply of industrial edge hardware to connect with your existing PLC. Prices are exclusive of installation unless listed below.',
      closing: 'Thanking you,',
      signOffCompany: 'For Nexora Automation Pvt Ltd',
      signOffTitle: 'Authorised Signatory',
    },
    items: [
      {
        description: 'Edge hardware to connect with PLC',
        specification:
          'Processor – Intel / ARM\nRAM – 4 GB\nStorage – 80 GB SSD\nOperating System – Linux\nInput Power – 12 V DC',
        quantity: 2,
        unit: 'Nos',
        unitPrice: 48500,
        discountType: 'percentage',
        discountValue: 5,
        taxRate: 18,
        lineTotal: 108081,
      },
    ],
    additionalCharges: [
      { name: 'Shipping', amount: 2500 },
      { name: 'Installation', amount: 4500 },
    ],
    notes: 'Lead time: 3–4 weeks from technically and commercially clear order.',
    paymentTerms: '40% advance, 60% against delivery.',
    deliveryTerms: 'Ex-works Bengaluru. Transit insurance in buyer scope.',
    terms: [
      'Prices are in INR and exclusive of any statutory variation in GST.',
      'Warranty: 12 months from date of dispatch against manufacturing defects.',
      'Order is valid subject to confirmation of technical specifications.',
    ],
    bankDetails: {
      accountName: 'Nexora Automation Pvt Ltd',
      accountNumber: '50200012345678',
      bankName: 'HDFC Bank',
      branch: 'Peenya',
      ifsc: 'HDFC0001234',
    },
    signature: {
      name: 'Anita Sharma',
      designation: 'Manager – Sales',
      signatureImage: '',
    },
    selectedTemplate: { type: 'builtin', id: 'modern' },
    summary: {
      subtotal: 97000,
      totalDiscount: 4850,
      taxableAmount: 92150,
      taxAmount: 16587,
      additionalTotal: 7000,
      grandTotal: 115737,
    },
    ...overrides,
  }
}

function manyItems() {
  return Array.from({ length: 18 }, (_, index) => ({
    description: `Industrial I/O module ${index + 1} for PLC expansion`,
    specification:
      index % 3 === 0
        ? 'Channel count – 16 digital inputs\nIsolation – 1500 V\nMounting – DIN rail\nCommunication – Modbus TCP'
        : '',
    quantity: index + 1,
    unit: 'Nos',
    unitPrice: 3200 + index * 150,
    discountType: 'percentage',
    discountValue: 2,
    taxRate: 18,
    lineTotal: (3200 + index * 150) * (index + 1),
  }))
}

async function writePdf(name, quotation) {
  const buffer = await generateQuotationPdf(quotation, 'company-sample')
  const filePath = path.join(outputDir, name)
  await fs.writeFile(filePath, buffer)
  console.log(`Wrote ${name} (${buffer.length} bytes) filename=${sanitizePdfFilename(quotation)}`)
}

async function main() {
  await fs.mkdir(outputDir, { recursive: true })

  await writePdf('modern-cover.pdf', baseQuotation())
  await writePdf(
    'modern-no-cover.pdf',
    baseQuotation({
      coverLetter: { enabled: false },
    }),
  )
  await writePdf(
    'professional.pdf',
    baseQuotation({ selectedTemplate: { type: 'builtin', id: 'professional' } }),
  )
  await writePdf(
    'classic.pdf',
    baseQuotation({ selectedTemplate: { type: 'builtin', id: 'classic' } }),
  )
  await writePdf(
    'many-items-terms.pdf',
    baseQuotation({
      items: manyItems(),
      terms: Array.from({ length: 20 }, (_, index) => `Term ${index + 1}: commercial condition for multi-page layout testing.`),
      selectedTemplate: { type: 'builtin', id: 'professional' },
    }),
  )
  await writePdf(
    'custom-missing.pdf',
    baseQuotation({ selectedTemplate: { type: 'custom', id: 'missing-template' } }),
  )
  await writePdf(
    'unknown-template.pdf',
    baseQuotation({ selectedTemplate: { type: 'builtin', id: 'does-not-exist' } }),
  )

  const unsafeName = sanitizePdfFilename({
    quotationDetails: { quotationNumber: 'QT-2026-001' },
    customer: { companyName: 'ABC Industries / ..\\secret' },
  })
  if (unsafeName.includes('/') || unsafeName.includes('\\')) {
    throw new Error('Filename sanitization failed')
  }
  console.log('Sanitized filename:', unsafeName)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
