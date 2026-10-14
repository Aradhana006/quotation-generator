import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import AdditionalCharges from '../components/quotation/AdditionalCharges'
import BankDetails from '../components/quotation/BankDetails'
import CollapsibleFormSection from '../components/quotation/CollapsibleFormSection'
import CompanyDetails from '../components/quotation/CompanyDetails'
import CoverLetter from '../components/quotation/CoverLetter'
import CreateQuotationToolbar from '../components/quotation/CreateQuotationToolbar'
import CustomerForm from '../components/quotation/CustomerForm'
import DeliveryTermsSection from '../components/quotation/DeliveryTermsSection'
import NotesSection from '../components/quotation/NotesSection'
import PaymentTermsSection from '../components/quotation/PaymentTermsSection'
import PricingSummary from '../components/quotation/PricingSummary'
import QuotationDetailsForm from '../components/quotation/QuotationDetailsForm'
import QuotationReviewStep from '../components/quotation/QuotationReviewStep'
import QuotationWizardFooter from '../components/quotation/QuotationWizardFooter'
import QuotationWizardSteps, { WIZARD_STEPS } from '../components/quotation/QuotationWizardSteps'
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
  mergeCompanySnapshot,
  profileToQuotationSnapshot,
} from '../utils/dataMappers'
import {
  addDaysToDateString,
  createEmptyCharge,
  createEmptyItem,
  EMPTY_COVER_LETTER,
  resolveCoverLetterMessage,
  EMPTY_CUSTOMER,
  EMPTY_QUOTATION_DETAILS,
  getQuotationSummary,
  getTodayDateString,
  isBlankItem,
} from '../utils/quotationCalculations'
import { hasValidationErrors, validateQuotation } from '../utils/quotationValidation'

function pickBasicsErrors(errors) {
  const next = {}
  if (errors.customer) next.customer = errors.customer
  if (errors.quotationNumber) next.quotationNumber = errors.quotationNumber
  if (errors.quotationDate) next.quotationDate = errors.quotationDate
  return next
}

function pickItemsErrors(errors) {
  const next = {}
  if (errors.items) next.items = errors.items
  Object.entries(errors).forEach(([key, value]) => {
    if (key.startsWith('item-')) next[key] = value
  })
  return next
}

function CreateQuotation() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditing = Boolean(id)

  const {
    companyProfile,
    companyLoading,
    customers,
    customersLoading,
    products,
    productsLoading,
  } = useAppData()
  const {
    defaultTermsLibrary,
    createQuotation,
    updateQuotation,
    fetchQuotationById,
    generateQuotationNumber,
    reviseQuotation,
  } = useQuotations()
  const { customTemplates, addCustomTemplate } = useTemplates()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const [validationErrors, setValidationErrors] = useState({})
  const [saveMessage, setSaveMessage] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [activeStep, setActiveStep] = useState('basics')
  const [maxReachableIndex, setMaxReachableIndex] = useState(0)
  const [showPreview, setShowPreview] = useState(false)

  const [quotationId, setQuotationId] = useState(() => crypto.randomUUID())
  const [status, setStatus] = useState('draft')
  const [createdAt, setCreatedAt] = useState(null)
  const [permissions, setPermissions] = useState({ canEdit: true, canRevise: false })
  const [revisionNumber, setRevisionNumber] = useState(0)

  const initialSnapshot = profileToQuotationSnapshot(companyProfile)

  const [company, setCompany] = useState(() => initialSnapshot.company)
  const [customer, setCustomer] = useState(EMPTY_CUSTOMER)
  const [quotationDetails, setQuotationDetails] = useState(EMPTY_QUOTATION_DETAILS)
  const [coverLetter, setCoverLetter] = useState(EMPTY_COVER_LETTER)
  const [items, setItems] = useState([createEmptyItem()])
  const [additionalCharges, setAdditionalCharges] = useState([])
  const [notes, setNotes] = useState('')
  const [paymentTerms, setPaymentTerms] = useState('')
  const [deliveryTerms, setDeliveryTerms] = useState('')
  const [terms, setTerms] = useState([])
  const [bankDetails, setBankDetails] = useState(() => initialSnapshot.bankDetails)
  const [signature, setSignature] = useState(() => initialSnapshot.signature)
  const [selectedTemplate, setSelectedTemplate] = useState(DEFAULT_SELECTED_TEMPLATE)

  const companySectionTouched = useRef(false)
  const bankSectionTouched = useRef(false)
  const signatureSectionTouched = useRef(false)

  // New quotations: auto-fill company / bank / signature from Company Settings.
  // Stop overwriting a section once the user edits it on this quotation.
  useEffect(() => {
    if (isEditing || !isInitialized || companyLoading) return

    const snapshot = profileToQuotationSnapshot(companyProfile)
    if (!companySectionTouched.current) setCompany(snapshot.company)
    if (!bankSectionTouched.current) setBankDetails(snapshot.bankDetails)
    if (!signatureSectionTouched.current) setSignature(snapshot.signature)
  }, [companyProfile, companyLoading, isEditing, isInitialized])

  useEffect(() => {
    if (!isEditing) return

    async function loadQuotation() {
      let existing
      try {
        existing = await fetchQuotationById(id)
      } catch {
        return
      }
      if (!existing) {
        navigate('/quotations')
        return
      }

      companySectionTouched.current = false
      bankSectionTouched.current = false
      signatureSectionTouched.current = false

      setQuotationId(existing.id)
      setStatus(existing.status || 'draft')
      setCreatedAt(existing.createdAt)
      setCompany(existing.company)
      setCustomer(existing.customer)
      setQuotationDetails(existing.quotationDetails)
      setCoverLetter({
        ...EMPTY_COVER_LETTER,
        ...(existing.coverLetter || {}),
        message: resolveCoverLetterMessage(existing.coverLetter?.message),
        enabled: true,
      })
      setItems(existing.items?.length ? existing.items : [createEmptyItem()])
      setAdditionalCharges(existing.additionalCharges || [])
      setNotes(existing.notes || '')
      setPaymentTerms(existing.paymentTerms || '')
      setDeliveryTerms(existing.deliveryTerms || '')
      setTerms(existing.terms || [])
      setBankDetails(existing.bankDetails)
      setSignature(existing.signature)
      setSelectedTemplate(existing.selectedTemplate || DEFAULT_SELECTED_TEMPLATE)
      setPermissions(existing.permissions || { canEdit: existing.status === 'draft', canRevise: false })
      setRevisionNumber(existing.revisionNumber ?? 0)
      setMaxReachableIndex(WIZARD_STEPS.length - 1)
      setIsInitialized(true)
    }

    loadQuotation()
  }, [id, isEditing, fetchQuotationById, navigate])

  // Editing: fill any blank company/bank/signature fields from Company Settings.
  useEffect(() => {
    if (!isEditing || !isInitialized || companyLoading) return

    const merged = mergeCompanySnapshot(
      { company, bankDetails, signature },
      companyProfile,
    )
    if (!companySectionTouched.current) setCompany(merged.company)
    if (!bankSectionTouched.current) setBankDetails(merged.bankDetails)
    if (!signatureSectionTouched.current) setSignature(merged.signature)
    // Only re-run when profile finishes loading / changes — not on every local edit.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: merge from settings, not local form churn
  }, [isEditing, isInitialized, companyLoading, companyProfile])

  const hasInitializedCreate = useRef(false)

  useEffect(() => {
    if (isEditing || hasInitializedCreate.current) return

    hasInitializedCreate.current = true

    async function initCreate() {
      const today = getTodayDateString()
      const number = await generateQuotationNumber()
      const validityDays = 30
      setQuotationDetails({
        ...EMPTY_QUOTATION_DETAILS,
        quotationNumber: number,
        quotationDate: today,
        validityDays,
        validUntil: addDaysToDateString(today, validityDays),
      })
      setCoverLetter({
        ...EMPTY_COVER_LETTER,
        message: resolveCoverLetterMessage(EMPTY_COVER_LETTER.message),
        enabled: true,
      })
      setIsInitialized(true)
    }

    initCreate()
  }, [isEditing, generateQuotationNumber])

  useEffect(() => {
    if (activeStep === 'review') {
      setShowPreview(false)
    }
  }, [activeStep])

  const summary = getQuotationSummary(items, additionalCharges)
  const currency = quotationDetails.currency || 'INR'
  const activeIndex = WIZARD_STEPS.findIndex((step) => step.id === activeStep)
  const canEdit = !isEditing || permissions.canEdit
  const showSidePreview =
    showPreview && (activeStep === 'cover' || activeStep === 'items' || activeStep === 'terms')

  const quotationData = {
    status,
    company,
    customer,
    quotationDetails,
    coverLetter: { ...coverLetter, enabled: true },
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
    companySectionTouched.current = true
    setCompany((current) => ({ ...current, [field]: value }))
  }

  function handleReloadCompanyFromSettings() {
    const snapshot = profileToQuotationSnapshot(companyProfile)
    companySectionTouched.current = false
    bankSectionTouched.current = false
    signatureSectionTouched.current = false
    setCompany(snapshot.company)
    setBankDetails(snapshot.bankDetails)
    setSignature(snapshot.signature)
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
    setCoverLetter((current) => ({ ...current, enabled: true, [field]: value }))
  }

  function prepareCoverPageDefaults() {
    setCoverLetter((current) => ({
      ...current,
      enabled: true,
      message: resolveCoverLetterMessage(current.message),
      kindAttention:
        current.kindAttention?.trim() ||
        customer.contactPerson ||
        '',
      subject:
        current.subject?.trim() ||
        quotationDetails.subject ||
        '',
      signOffCompany:
        current.signOffCompany?.trim() ||
        company.name ||
        '',
    }))
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
    const nextItem = copyProductToQuotationItem(product)
    setItems((current) => {
      const blankIndex = current.findIndex(isBlankItem)
      if (blankIndex !== -1) {
        return current.map((item, index) =>
          index === blankIndex ? { ...nextItem, id: item.id } : item,
        )
      }
      return [...current, nextItem]
    })
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
    bankSectionTouched.current = true
    setBankDetails((current) => ({ ...current, [field]: value }))
  }

  function handleSignatureChange(field, value) {
    signatureSectionTouched.current = true
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

  function goToStep(stepId) {
    const index = WIZARD_STEPS.findIndex((step) => step.id === stepId)
    if (index < 0 || index > maxReachableIndex) return
    if (stepId === 'cover') prepareCoverPageDefaults()
    setActiveStep(stepId)
    setSaveMessage('')
  }

  function unlockThrough(stepId) {
    const index = WIZARD_STEPS.findIndex((step) => step.id === stepId)
    if (index > maxReachableIndex) {
      setMaxReachableIndex(index)
    }
  }

  function validateCurrentStep() {
    const formData = { customer, quotationDetails, items }
    const allErrors = validateQuotation(formData, [], isEditing ? quotationId : null)

    if (activeStep === 'basics') {
      const errors = pickBasicsErrors(allErrors)
      setValidationErrors(errors)
      if (hasValidationErrors(errors)) {
        setSaveMessage('Please complete the basics before continuing.')
        return false
      }
      return true
    }

    if (activeStep === 'items') {
      const errors = pickItemsErrors(allErrors)
      setValidationErrors(errors)
      if (hasValidationErrors(errors)) {
        setSaveMessage('Please fix item details before continuing.')
        return false
      }
      return true
    }

    setValidationErrors({})
    return true
  }

  function handleNext() {
    if (!canEdit) return
    if (!validateCurrentStep()) return

    const nextIndex = Math.min(activeIndex + 1, WIZARD_STEPS.length - 1)
    const nextStep = WIZARD_STEPS[nextIndex].id
    if (nextStep === 'cover' || activeStep === 'basics') {
      prepareCoverPageDefaults()
    }
    setValidationErrors({})
    setSaveMessage('')
    unlockThrough(nextStep)
    setActiveStep(nextStep)
  }

  function handleBack() {
    if (activeIndex <= 0) return
    setSaveMessage('')
    setActiveStep(WIZARD_STEPS[activeIndex - 1].id)
  }

  async function persistQuotation(nextStatus) {
    const formData = { customer, quotationDetails, items }
    const errors = validateQuotation(formData, [], isEditing ? quotationId : null)

    if (hasValidationErrors(errors)) {
      setValidationErrors(errors)
      setSaveMessage('Please fix the validation errors before saving.')
      if (errors.customer || errors.quotationNumber || errors.quotationDate) {
        setActiveStep('basics')
        unlockThrough('basics')
      } else if (errors.items || Object.keys(errors).some((key) => key.startsWith('item-'))) {
        setActiveStep('items')
        unlockThrough('items')
      }
      return
    }

    setValidationErrors({})
    setIsSaving(true)
    setSaveMessage('')

    // Persist the form snapshot (includes uploaded logo / signature images).
    const quotation = {
      id: quotationId,
      status: nextStatus,
      company,
      customer,
      quotationDetails,
      coverLetter: { ...coverLetter, enabled: true },
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

    try {
      const saved = isEditing
        ? await updateQuotation(quotationId, quotation)
        : await createQuotation(quotation)
      setQuotationId(saved.id)
      setStatus(saved.status || nextStatus)
      setSaveMessage(
        nextStatus === 'draft'
          ? 'Quotation saved as draft.'
          : 'Quotation finalized successfully.',
      )
      navigate(`/quotations/${saved.id}`)
    } catch (error) {
      setSaveMessage(error.message || 'Unable to save quotation.')
    } finally {
      setIsSaving(false)
    }
  }

  function handleSaveDraft() {
    if (!canEdit) return
    persistQuotation('draft')
  }

  function handleFinalize() {
    if (!canEdit) return
    persistQuotation('sent')
  }

  async function handleCreateRevision() {
    try {
      const revision = await reviseQuotation(quotationId)
      navigate(`/quotations/${revision.id}/edit`)
    } catch (error) {
      setSaveMessage(error.message || 'Unable to create revision.')
    }
  }

  function handleCancel() {
    navigate('/quotations')
  }

  if (!isInitialized) {
    return (
      <div className="p-6">
        <h1 className="text-lg font-semibold text-slate-900">
          {isEditing ? 'Edit Quotation' : 'Create Quotation'}
        </h1>
        <p className="mt-2 text-sm text-slate-500">Loading quotation...</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-full flex-col bg-[#f4f7f8]">
      {isEditing && !permissions.canEdit && (
        <div className="border-b border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 sm:px-6">
          This quotation has already been issued. Create a revision to make changes.
          {permissions.canRevise && (
            <button type="button" onClick={handleCreateRevision} className="ml-3 font-medium underline">
              Create Revision
            </button>
          )}
        </div>
      )}

      <CreateQuotationToolbar
        quotationNumber={`${quotationDetails.quotationNumber || ''} · Rev ${revisionNumber}`}
        status={status}
        grandTotal={summary.grandTotal}
        currency={currency}
        isEditing={isEditing}
        saveMessage={saveMessage}
        showPreviewToggle={
          activeStep === 'cover' || activeStep === 'items' || activeStep === 'terms'
        }
        showPreview={showPreview}
        onTogglePreview={() => setShowPreview((current) => !current)}
        onCancel={handleCancel}
      />

      <QuotationWizardSteps
        activeStep={activeStep}
        onStepChange={goToStep}
        maxReachableIndex={maxReachableIndex}
      />

      <div
        className={`flex flex-1 flex-col ${
          showSidePreview ? 'xl:grid xl:grid-cols-[minmax(0,1fr)_min(420px,38%)]' : ''
        }`}
      >
        <div className="overflow-auto p-4 pb-28 sm:p-6">
          {activeStep === 'basics' && (
            <div className="mx-auto max-w-4xl space-y-4">
              <div>
                <h2 className="text-base font-semibold text-slate-900">Basics</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Choose a template, set quotation details, and add the customer.
                </p>
              </div>

              <TemplateSelector
                compact
                selectedTemplate={selectedTemplate}
                customTemplates={customTemplates}
                onSelectTemplate={setSelectedTemplate}
                onAddCustomClick={() => setIsModalOpen(true)}
                quotationData={quotationData}
              />

              <div className="grid gap-4 lg:grid-cols-2">
                <QuotationDetailsForm
                  compact
                  details={quotationDetails}
                  onChange={handleQuotationDetailsChange}
                  errors={{
                    quotationNumber: validationErrors.quotationNumber,
                    quotationDate: validationErrors.quotationDate,
                  }}
                />

                <CustomerForm
                  compact
                  customer={customer}
                  customers={customers}
                  customersLoading={customersLoading}
                  onChange={handleCustomerChange}
                  onSelectCustomer={handleSelectCustomer}
                  error={validationErrors.customer}
                />
              </div>
            </div>
          )}

          {activeStep === 'cover' && (
            <div className="mx-auto max-w-4xl space-y-4">
              <div>
                <h2 className="text-base font-semibold text-slate-900">Cover page</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Every quotation includes a cover page. Edit the letter details shown on page 1.
                </p>
              </div>
              <CoverLetter coverLetter={coverLetter} onChange={handleCoverLetterChange} />
            </div>
          )}

          {activeStep === 'items' && (
            <div className="mx-auto max-w-5xl">
              <div className="mb-4">
                <h2 className="text-base font-semibold text-slate-900">Items & pricing</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Add products or custom lines, then review totals.
                </p>
              </div>
              <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-start">
                <div className="space-y-4">
                  <QuoteItems
                    items={items}
                    products={products}
                    productsLoading={productsLoading}
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
                </div>

                <div className="lg:sticky lg:top-36 lg:self-start">
                  <PricingSummary compact summary={summary} currency={currency} />
                </div>
              </div>
            </div>
          )}

          {activeStep === 'terms' && (
            <div className="mx-auto max-w-4xl space-y-4">
              <div>
                <h2 className="text-base font-semibold text-slate-900">Terms & company</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Add notes, terms, and the company letterhead details shown on the PDF.
                </p>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <NotesSection notes={notes} onChange={setNotes} />
                <PaymentTermsSection paymentTerms={paymentTerms} onChange={setPaymentTerms} />
              </div>
              <DeliveryTermsSection deliveryTerms={deliveryTerms} onChange={setDeliveryTerms} />
              <TermsAndConditions
                terms={terms}
                defaultTermsLibrary={defaultTermsLibrary}
                onTermChange={handleTermChange}
                onAddTerm={handleAddTerm}
                onRemoveTerm={handleRemoveTerm}
                onAddFromDefault={handleAddFromDefault}
              />

              <CompanyDetails
                company={company}
                onChange={handleCompanyChange}
                onReloadFromSettings={handleReloadCompanyFromSettings}
                settingsLoading={companyLoading}
              />

              <CollapsibleFormSection
                title="Bank Details"
                description="Loaded from Company Settings — edit for this quotation if needed"
                defaultOpen={Boolean(bankDetails.bankName || bankDetails.accountNumber)}
              >
                <BankDetails bare bankDetails={bankDetails} onChange={handleBankDetailsChange} />
              </CollapsibleFormSection>

              <CollapsibleFormSection
                title="Signature"
                description="Loaded from Company Settings — edit for this quotation if needed"
                defaultOpen={Boolean(
                  signature.name || signature.designation || signature.signatureImage,
                )}
              >
                <Signature bare signature={signature} onChange={handleSignatureChange} />
              </CollapsibleFormSection>
            </div>
          )}

          {activeStep === 'review' && (
            <QuotationReviewStep
              quotationData={quotationData}
              selectedTemplate={selectedTemplate}
              customTemplates={customTemplates}
              summary={summary}
              currency={currency}
              revisionNumber={revisionNumber}
            />
          )}
        </div>

        {showSidePreview && (
          <div className="border-t border-slate-200 bg-slate-100 xl:border-l xl:border-t-0">
            <div className="sticky top-[8.5rem] max-h-[calc(100vh-8.5rem)] overflow-auto p-4">
              <QuotePreview
                quotationData={quotationData}
                selectedTemplate={selectedTemplate}
                customTemplates={customTemplates}
              />
            </div>
          </div>
        )}
      </div>

      <QuotationWizardFooter
        activeStep={activeStep}
        isFirst={activeIndex === 0}
        isLast={activeStep === 'review'}
        isSaving={isSaving}
        canEdit={canEdit}
        onBack={handleBack}
        onNext={handleNext}
        onSaveDraft={handleSaveDraft}
        onFinalize={handleFinalize}
      />

      <AddCustomTemplateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUpload={addCustomTemplate}
      />
    </div>
  )
}

export default CreateQuotation
