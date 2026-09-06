import { createContext, useContext, useMemo } from 'react'
import { DEFAULT_SELECTED_TEMPLATE } from '../data/builtInTemplates'
import { useLocalStorage } from '../hooks/useLocalStorage'
import * as quotationService from '../services/quotationService.js'
import * as termService from '../services/termService.js'
import { STORAGE_KEYS } from '../data/defaults'

const QuotationContext = createContext(null)

export function QuotationProvider({ children }) {
  const [quotations, setQuotations] = useLocalStorage(STORAGE_KEYS.quotations, [])
  const [defaultTermsLibrary, setDefaultTermsLibrary] = useLocalStorage(
    STORAGE_KEYS.defaultTermsLibrary,
    termService.getDefaultTermsLibrary(),
  )

  function saveQuotation(quotationData) {
    const saved = quotationService.saveQuotation(quotationData)
    setQuotations(quotationService.getQuotations())
    return saved
  }

  function deleteQuotation(id) {
    quotationService.deleteQuotation(id)
    setQuotations(quotationService.getQuotations())
  }

  function getQuotationById(id) {
    return quotations.find((quotation) => quotation.id === id) || null
  }

  function duplicateQuotation(id) {
    const duplicate = quotationService.duplicateQuotation(id)
    if (duplicate) {
      setQuotations(quotationService.getQuotations())
    }
    return duplicate
  }

  function updateQuotationStatus(id, status) {
    quotationService.updateQuotationStatus(id, status)
    setQuotations(quotationService.getQuotations())
  }

  const value = useMemo(
    () => ({
      quotations,
      defaultTermsLibrary,
      setDefaultTermsLibrary,
      saveQuotation,
      deleteQuotation,
      getQuotationById,
      duplicateQuotation,
      updateQuotationStatus,
      generateQuotationNumber: (excludeId) =>
        quotationService.generateNextQuotationNumber(excludeId),
    }),
    [quotations, defaultTermsLibrary],
  )

  return (
    <QuotationContext.Provider value={value}>{children}</QuotationContext.Provider>
  )
}

export function useQuotations() {
  const context = useContext(QuotationContext)
  if (!context) {
    throw new Error('useQuotations must be used within QuotationProvider')
  }
  return context
}

export { DEFAULT_SELECTED_TEMPLATE }
