import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import PageContainer from '../components/PageContainer'
import AdditionalCharges from '../components/quotation/AdditionalCharges'
import BankDetails from '../components/quotation/BankDetails'
import CompanyDetails from '../components/quotation/CompanyDetails'
import CoverLetter from '../components/quotation/CoverLetter'
import CustomerForm from '../components/quotation/CustomerForm'
import DeliveryTermsSection from '../components/quotation/DeliveryTermsSection'
import NotesSection from '../components/quotation/NotesSection'
import PaymentTermsSection from '../components/quotation/PaymentTermsSection'
import PricingSummary from '../components/quotation/PricingSummary'
import QuotationActions from '../components/quotation/QuotationActions'
import QuotationDetailsForm from '../components/quotation/QuotationDetailsForm'
import QuoteItems from '../components/quotation/QuoteItems'
import QuotePreview from '../components/quotation/QuotePreview'
import Signature from '../components/quotation/Signature'
import TermsAndConditions from '../components/quotation/TermsAndConditions'
import AddCustomTemplateModal from '../components/templates/AddCustomTemplateModal'
import TemplateSelector from '../components/templates/TemplateSelector'
import { useAppData } from '../context/AppDataContext'
import { useQuotations } from '../context/QuotationContext'
import { useTemplates } from '../context/TemplateContext'
import { DEFAULT_SELECTED_TEMPLATE } from '../data/builtInTemplates'
import {
  copyCustomerToQuotation,
  copyProductToQuotationItem,
  profileToQuotationSnapshot,
} from '../utils/dataMappers'
import {
  createEmptyCharge,
  createEmptyItem,
  EMPTY_COVER_LETTER,
  EMPTY_CUSTOMER,
  EMPTY_QUOTATION_DETAILS,
  getQuotationSummary,
  getTodayDateString,
} from '../utils/quotationCalculations'
import { hasValidationErrors, validateQuotation } from '../utils/quotationValidation'

function CreateQuotation() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditing = Boolean(id)

  const { companyProfile, customers, products } = useAppData()
  const {
    quotations,
    defaultTermsLibrary,
    saveQuotation,
    getQuotationById,
    generateQuotationNumber,
  } = useQuotations()
  const { customTemplates, addCustomTemplate } = useTemplates()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const [validationErrors, setValidationErrors] = useState({})
  const [saveMessage, setSaveMessage] = useState('')

  const [quotationId, setQuotationId] = useState(() => crypto.randomUUID())
  const [status, setStatus] = useState('draft')
  const [createdAt, setCreatedAt] = useState(null)

  const initialProfileSnapshot = profileToQuotationSnapshot(companyProfile)

  const [company, setCompany] = useState(initialProfileSnapshot.company)
  const [customer, setCustomer] = useState(EMPTY_CUSTOMER)
  const [quotationDetails, setQuotationDetails] = useState(EMPTY_QUOTATION_DETAILS)
  const [coverLetter, setCoverLetter] = useState(EMPTY_COVER_LETTER)
  const [items, setItems] = useState([createEmptyItem()])
  const [additionalCharges, setAdditionalCharges] = useState([])
  const [notes, setNotes] = useState('')
  const [paymentTerms, setPaymentTerms] = useState('')
  const [deliveryTerms, setDeliveryTerms] = useState('')
  const [terms, setTerms] = useState([])
  const [bankDetails, setBankDetails] = useState(initialProfileSnapshot.bankDetails)
  const [signature, setSignature] = useState(initialProfileSnapshot.signature)
  const [selectedTemplate, setSelectedTemplate] = useState(DEFAULT_SELECTED_TEMPLATE)

  useEffect(() => {
    if (!isEditing) return

    const existing = getQuotationById(id)
    if (!existing) {
      navigate('/quotations')
      return
    }

    setQuotationId(existing.id)
    setStatus(existing.status || 'draft')
    setCreatedAt(existing.createdAt)
    setCompany(existing.company)
    setCustomer(existing.customer)
    setQuotationDetails(existing.quotationDetails)
    setCoverLetter(existing.coverLetter)
    setItems(existing.items?.length ? existing.items : [createEmptyItem()])
    setAdditionalCharges(existing.additionalCharges || [])
    setNotes(existing.notes || '')
    setPaymentTerms(existing.paymentTerms || '')
    setDeliveryTerms(existing.deliveryTerms || '')
    setTerms(existing.terms || [])
    setBankDetails(existing.bankDetails)
    setSignature(existing.signature)
    setSelectedTemplate(existing.selectedTemplate || DEFAULT_SELECTED_TEMPLATE)
    setIsInitialized(true)
  }, [id, isEditing, getQuotationById, navigate])

  const hasInitializedCreate = useRef(false)

  useEffect(() => {
    if (isEditing || hasInitializedCreate.current) return

    hasInitializedCreate.current = true
    const today = getTodayDateString()
    setQuotationDetails({
      ...EMPTY_QUOTATION_DETAILS,
      quotationNumber: generateQuotationNumber(quotations),
      quotationDate: today,
      validUntil: '',
    })
    setIsInitialized(true)
  }, [isEditing, generateQuotationNumber, quotations])

  const summary = getQuotationSummary(items, additionalCharges)
  const currency = quotationDetails.currency || 'INR'

  const quotationData = {
    status,
    company,
    customer,
    quotationDetails,
    coverLetter,
    items,
    additionalCharges,
    notes,
    paymentTerms,
    deliveryTerms,
    terms,
    bankDetails,
    signature,
  }

  function handleCompanyChange(field, value) {
    setCompany((current) => ({ ...current, [field]: value }))
  }

  function handleCustomerChange(field, value) {
    setCustomer((current) => ({ ...current, [field]: value }))
  }

  function handleSelectCustomer(customerId) {
    const savedCustomer = customers.find((item) => item.id === customerId)
    if (!savedCustomer) return
    setCustomer(copyCustomerToQuotation(savedCustomer))
  }

  function handleQuotationDetailsChange(field, value) {
    setQuotationDetails((current) => ({ ...current, [field]: value }))
  }

  function handleCoverLetterChange(field, value) {
    setCoverLetter((current) => ({ ...current, [field]: value }))
  }

  function handleItemChange(itemId, field, value) {
    setItems((current) =>
      current.map((item) =>
        item.id === itemId ? { ...item, [field]: value } : item,
      ),
    )
  }

  function handleAddItem() {
    setItems((current) => [...current, createEmptyItem()])
  }

  function handleAddProductItem(productId) {
    const product = products.find((item) => item.id === productId)
    if (!product) return
    setItems((current) => [...current, copyProductToQuotationItem(product)])
  }

  function handleRemoveItem(itemId) {
    setItems((current) => current.filter((item) => item.id !== itemId))
  }

  function handleChargeChange(chargeId, field, value) {
    setAdditionalCharges((current) =>
      current.map((charge) =>
        charge.id === chargeId ? { ...charge, [field]: value } : charge,
      ),
    )
  }

  function handleAddCharge() {
    setAdditionalCharges((current) => [...current, createEmptyCharge()])
  }

  function handleRemoveCharge(chargeId) {
    setAdditionalCharges((current) => current.filter((charge) => charge.id !== chargeId))
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

  function handleAddFromDefault(defaultTerm) {
    setTerms((current) => [...current, defaultTerm])
  }

  function handleBankDetailsChange(field, value) {
    setBankDetails((current) => ({ ...current, [field]: value }))
  }

  function handleSignatureChange(field, value) {
    setSignature((current) => ({ ...current, [field]: value }))
  }

  function getItemErrors() {
    const itemErrors = {}
    items.forEach((item, index) => {
      const errors = {}
      if (validationErrors[`item-${index}-description`]) {
        errors.description = validationErrors[`item-${index}-description`]
      }
      if (validationErrors[`item-${index}-quantity`]) {
        errors.quantity = validationErrors[`item-${index}-quantity`]
      }
      if (validationErrors[`item-${index}-unitPrice`]) {
        errors.unitPrice = validationErrors[`item-${index}-unitPrice`]
      }
      if (Object.keys(errors).length) {
        itemErrors[index] = errors
      }
    })
    return itemErrors
  }

  function persistQuotation(nextStatus) {
    const formData = { customer, quotationDetails, items }
    const errors = validateQuotation(formData, quotations, isEditing ? quotationId : null)

    if (hasValidationErrors(errors)) {
      setValidationErrors(errors)
      setSaveMessage('Please fix the validation errors before saving.')
      return
    }

    setValidationErrors({})

    const quotation = {
      id: quotationId,
      status: nextStatus,
      company,
      customer,
      quotationDetails,
      coverLetter,
      items,
      additionalCharges,
      notes,
      paymentTerms,
      deliveryTerms,
      terms,
      bankDetails,
      signature,
      selectedTemplate,
      createdAt,
    }

    saveQuotation(quotation)
    setStatus(nextStatus)
    setSaveMessage(
      nextStatus === 'draft'
        ? 'Quotation saved as draft.'
        : 'Quotation finalized successfully.',
    )
    navigate(`/quotations/${quotationId}`)
  }

  function handleSaveDraft() {
    persistQuotation('draft')
  }

  function handleFinalize() {
    persistQuotation('sent')
  }

  function handleCancel() {
    navigate('/quotations')
  }

  if (!isInitialized) {
    return (
      <PageContainer title={isEditing ? 'Edit Quotation' : 'Create Quotation'}>
        <p className="text-sm text-slate-500">Loading quotation...</p>
      </PageContainer>
    )
  }

  return (
    <PageContainer
      title={isEditing ? 'Edit Quotation' : 'Create Quotation'}
      description="Build a complete quotation with live preview."
    >
      <div className="mb-6 space-y-3">
        <QuotationActions
          onSaveDraft={handleSaveDraft}
          onFinalize={handleFinalize}
          onCancel={handleCancel}
          isEditing={isEditing}
        />
        {saveMessage && (
          <p className="text-sm text-green-700">{saveMessage}</p>
        )}
        {validationErrors.customer && (
          <p className="text-sm text-red-600">{validationErrors.customer}</p>
        )}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="space-y-6">
          <TemplateSelector
            selectedTemplate={selectedTemplate}
            customTemplates={customTemplates}
            onSelectTemplate={setSelectedTemplate}
            onAddCustomClick={() => setIsModalOpen(true)}
          />

          <CompanyDetails company={company} onChange={handleCompanyChange} />

          <CustomerForm
            customer={customer}
            customers={customers}
            onChange={handleCustomerChange}
            onSelectCustomer={handleSelectCustomer}
            error={validationErrors.customer}
          />

          <QuotationDetailsForm
            details={quotationDetails}
            onChange={handleQuotationDetailsChange}
            errors={{
              quotationNumber: validationErrors.quotationNumber,
              quotationDate: validationErrors.quotationDate,
            }}
          />

          <CoverLetter coverLetter={coverLetter} onChange={handleCoverLetterChange} />

          <QuoteItems
            items={items}
            products={products}
            onItemChange={handleItemChange}
            onAddItem={handleAddItem}
            onAddProductItem={handleAddProductItem}
            onRemoveItem={handleRemoveItem}
            itemErrors={getItemErrors()}
            itemsError={validationErrors.items}
          />

          <AdditionalCharges
            charges={additionalCharges}
            onChargeChange={handleChargeChange}
            onAddCharge={handleAddCharge}
            onRemoveCharge={handleRemoveCharge}
          />

          <PricingSummary summary={summary} currency={currency} />

          <NotesSection notes={notes} onChange={setNotes} />

          <PaymentTermsSection paymentTerms={paymentTerms} onChange={setPaymentTerms} />

          <DeliveryTermsSection deliveryTerms={deliveryTerms} onChange={setDeliveryTerms} />

          <TermsAndConditions
            terms={terms}
            defaultTermsLibrary={defaultTermsLibrary}
            onTermChange={handleTermChange}
            onAddTerm={handleAddTerm}
            onRemoveTerm={handleRemoveTerm}
            onAddFromDefault={handleAddFromDefault}
          />

          <BankDetails bankDetails={bankDetails} onChange={handleBankDetailsChange} />

          <Signature signature={signature} onChange={handleSignatureChange} />
        </div>

        <div className="xl:sticky xl:top-6 xl:self-start">
          <QuotePreview
            quotationData={quotationData}
            selectedTemplate={selectedTemplate}
            customTemplates={customTemplates}
          />
        </div>
      </div>

      <AddCustomTemplateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUpload={addCustomTemplate}
      />
    </PageContainer>
  )
}

export default CreateQuotation
