import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { DEFAULT_SELECTED_TEMPLATE } from '../data/builtInTemplates'
import { DEFAULT_TERMS_LIBRARY } from '../utils/quotationCalculations'
import { useAuth } from './AuthContext'
import * as quotationService from '../services/quotationService.js'
import * as termService from '../services/termService.js'

const QuotationContext = createContext(null)

export function QuotationProvider({ children }) {
  const { isAuthenticated, isLoading: authLoading } = useAuth()

  const [defaultTermsLibrary, setDefaultTermsLibrary] = useState(DEFAULT_TERMS_LIBRARY)
  const [termsLoading, setTermsLoading] = useState(true)

  const refreshDefaultTerms = useCallback(async () => {
    setTermsLoading(true)
    try {
      const terms = await termService.getDefaultTermsLibrary()
      setDefaultTermsLibrary(terms)
    } catch {
      setDefaultTermsLibrary(DEFAULT_TERMS_LIBRARY)
    } finally {
      setTermsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (authLoading) return

    if (!isAuthenticated) {
      setDefaultTermsLibrary(DEFAULT_TERMS_LIBRARY)
      setTermsLoading(false)
      return
    }

    refreshDefaultTerms()
  }, [isAuthenticated, authLoading, refreshDefaultTerms])

  async function createQuotation(quotationData) {
    return quotationService.createQuotation(quotationData)
  }

  async function updateQuotation(id, quotationData) {
    return quotationService.updateQuotation(id, quotationData)
  }

  async function deleteQuotation(id) {
    return quotationService.deleteQuotation(id)
  }

  function getQuotationById() {
    return null
  }

  async function fetchQuotationById(id) {
    try {
      return await quotationService.getQuotation(id)
    } catch {
      return null
    }
  }

  async function duplicateQuotation(id) {
    return quotationService.duplicateQuotation(id)
  }

  async function updateQuotationStatus(id, status) {
    return quotationService.updateQuotationStatus(id, status)
  }

  async function reviseQuotation(id) {
    return quotationService.reviseQuotation(id)
  }

  async function archiveQuotation(id) {
    return quotationService.archiveQuotation(id)
  }

  async function restoreQuotation(id) {
    return quotationService.restoreQuotation(id)
  }

  async function generateQuotationNumber(excludeId = null) {
    return quotationService.generateNextQuotationNumber(excludeId)
  }

  async function saveDefaultTermsLibrary(terms) {
    const saved = await termService.saveDefaultTermsLibrary(terms)
    setDefaultTermsLibrary(saved)
    return saved
  }

  const value = useMemo(
    () => ({
      quotations: [],
      quotationsLoading: false,
      quotationsError: '',
      defaultTermsLibrary,
      termsLoading,
      setDefaultTermsLibrary: saveDefaultTermsLibrary,
      createQuotation,
      updateQuotation,
      deleteQuotation,
      getQuotationById,
      fetchQuotationById,
      duplicateQuotation,
      updateQuotationStatus,
      reviseQuotation,
      archiveQuotation,
      restoreQuotation,
      generateQuotationNumber,
    }),
    [defaultTermsLibrary, termsLoading],
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
