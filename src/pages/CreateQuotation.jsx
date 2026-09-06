import { useState } from 'react'
import PageContainer from '../components/PageContainer'
import BankDetails from '../components/quotation/BankDetails'
import CompanyDetails from '../components/quotation/CompanyDetails'
import CoverLetter from '../components/quotation/CoverLetter'
import CustomerForm from '../components/quotation/CustomerForm'
import PricingSummary from '../components/quotation/PricingSummary'
import QuotationDetailsForm from '../components/quotation/QuotationDetailsForm'
import QuoteItems from '../components/quotation/QuoteItems'
import QuotePreview from '../components/quotation/QuotePreview'
import Signature from '../components/quotation/Signature'
import TermsAndConditions from '../components/quotation/TermsAndConditions'
import {
  createEmptyItem,
  DEFAULT_TERMS,
  EMPTY_BANK_DETAILS,
  EMPTY_COMPANY,
  EMPTY_COVER_LETTER,
  EMPTY_CUSTOMER,
  EMPTY_QUOTATION_DETAILS,
  EMPTY_SIGNATURE,
  getGrandTotal,
  getGstAmount,
  getSubtotal,
} from '../utils/quotationCalculations'

function CreateQuotation() {
  const [company, setCompany] = useState(EMPTY_COMPANY)
  const [customer, setCustomer] = useState(EMPTY_CUSTOMER)
  const [quotationDetails, setQuotationDetails] = useState(EMPTY_QUOTATION_DETAILS)
  const [coverLetter, setCoverLetter] = useState(EMPTY_COVER_LETTER)
  const [items, setItems] = useState([createEmptyItem()])
  const [gstPercent, setGstPercent] = useState(18)
  const [terms, setTerms] = useState(DEFAULT_TERMS)
  const [bankDetails, setBankDetails] = useState(EMPTY_BANK_DETAILS)
  const [signature, setSignature] = useState(EMPTY_SIGNATURE)

  const subtotal = getSubtotal(items)
  const gstAmount = getGstAmount(subtotal, gstPercent)
  const grandTotal = getGrandTotal(subtotal, gstAmount)

  function handleCompanyChange(field, value) {
    setCompany((current) => ({ ...current, [field]: value }))
  }

  function handleCustomerChange(field, value) {
    setCustomer((current) => ({ ...current, [field]: value }))
  }

  function handleQuotationDetailsChange(field, value) {
    setQuotationDetails((current) => ({ ...current, [field]: value }))
  }

  function handleCoverLetterChange(field, value) {
    setCoverLetter((current) => ({ ...current, [field]: value }))
  }

  function handleItemChange(id, field, value) {
    setItems((current) =>
      current.map((item) =>
        item.id === id ? { ...item, [field]: value } : item,
      ),
    )
  }

  function handleAddItem() {
    setItems((current) => [...current, createEmptyItem()])
  }

  function handleRemoveItem(id) {
    setItems((current) => current.filter((item) => item.id !== id))
  }

  function handleTermChange(index, value) {
    setTerms((current) =>
      current.map((term, termIndex) => (termIndex === index ? value : term)),
    )
  }

  function handleAddTerm() {
    setTerms((current) => [...current, ''])
  }

  function handleRemoveTerm(index) {
    setTerms((current) => current.filter((_, termIndex) => termIndex !== index))
  }

  function handleBankDetailsChange(field, value) {
    setBankDetails((current) => ({ ...current, [field]: value }))
  }

  function handleSignatureChange(field, value) {
    setSignature((current) => ({ ...current, [field]: value }))
  }

  return (
    <PageContainer
      title="Create Quotation"
      description="Build a new quotation with live preview."
    >
      <div className="grid gap-6 xl:grid-cols-2">
        <div className="space-y-6">
          <CompanyDetails company={company} onChange={handleCompanyChange} />

          <CustomerForm customer={customer} onChange={handleCustomerChange} />

          <QuotationDetailsForm
            details={quotationDetails}
            onChange={handleQuotationDetailsChange}
          />

          <CoverLetter coverLetter={coverLetter} onChange={handleCoverLetterChange} />

          <QuoteItems
            items={items}
            onItemChange={handleItemChange}
            onAddItem={handleAddItem}
            onRemoveItem={handleRemoveItem}
          />

          <PricingSummary
            gstPercent={gstPercent}
            onGstChange={setGstPercent}
            subtotal={subtotal}
            gstAmount={gstAmount}
            grandTotal={grandTotal}
          />

          <TermsAndConditions
            terms={terms}
            onTermChange={handleTermChange}
            onAddTerm={handleAddTerm}
            onRemoveTerm={handleRemoveTerm}
          />

          <BankDetails bankDetails={bankDetails} onChange={handleBankDetailsChange} />

          <Signature signature={signature} onChange={handleSignatureChange} />
        </div>

        <div className="xl:sticky xl:top-6 xl:self-start">
          <QuotePreview
            company={company}
            customer={customer}
            quotationDetails={quotationDetails}
            coverLetter={coverLetter}
            items={items}
            gstPercent={gstPercent}
            subtotal={subtotal}
            gstAmount={gstAmount}
            grandTotal={grandTotal}
            terms={terms}
            bankDetails={bankDetails}
            signature={signature}
          />
        </div>
      </div>
    </PageContainer>
  )
}

export default CreateQuotation
