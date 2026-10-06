import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { EMPTY_COMPANY_PROFILE, EMPTY_PRODUCT } from '../data/defaults'
import { useAuth } from './AuthContext'
import * as companyService from '../services/companyService.js'
import * as customerService from '../services/customerService.js'
import * as productService from '../services/productService.js'

const AppDataContext = createContext(null)

export function AppDataProvider({ children }) {
  const { isAuthenticated, isLoading: authLoading } = useAuth()

  const [companyProfile, setCompanyProfile] = useState(EMPTY_COMPANY_PROFILE)
  const [companyLoading, setCompanyLoading] = useState(true)
  const [companyError, setCompanyError] = useState('')

  const [customers, setCustomers] = useState([])
  const [customersLoading, setCustomersLoading] = useState(true)
  const [customersError, setCustomersError] = useState('')

  const [products, setProducts] = useState([])
  const [productsLoading, setProductsLoading] = useState(true)
  const [productsError, setProductsError] = useState('')

  const refreshCustomers = useCallback(async () => {
    setCustomersLoading(true)
    setCustomersError('')
    try {
      const data = await customerService.getCustomers()
      setCustomers(data)
    } catch (error) {
      setCustomersError(error.message || 'Unable to load customers.')
      setCustomers([])
    } finally {
      setCustomersLoading(false)
    }
  }, [])

  const refreshProducts = useCallback(async () => {
    setProductsLoading(true)
    setProductsError('')
    try {
      const data = await productService.getProducts()
      setProducts(data)
    } catch (error) {
      setProductsError(error.message || 'Unable to load products.')
      setProducts([])
    } finally {
      setProductsLoading(false)
    }
  }, [])

  const refreshCompanyProfile = useCallback(async () => {
    setCompanyLoading(true)
    setCompanyError('')
    try {
      const profile = await companyService.getCompanyProfile()
      setCompanyProfile(profile)
    } catch (error) {
      setCompanyError(error.message || 'Unable to load company profile.')
      setCompanyProfile(EMPTY_COMPANY_PROFILE)
    } finally {
      setCompanyLoading(false)
    }
  }, [])

  useEffect(() => {
    if (authLoading) return

    if (!isAuthenticated) {
      setCustomers([])
      setProducts([])
      setCompanyProfile(EMPTY_COMPANY_PROFILE)
      setCustomersLoading(false)
      setProductsLoading(false)
      setCompanyLoading(false)
      setCustomersError('')
      setProductsError('')
      setCompanyError('')
      return
    }

    refreshCustomers()
    refreshProducts()
    refreshCompanyProfile()
  }, [
    isAuthenticated,
    authLoading,
    refreshCustomers,
    refreshProducts,
    refreshCompanyProfile,
  ])

  async function saveCompanyProfile(profile) {
    const saved = await companyService.saveCompanyProfile(profile)
    setCompanyProfile(saved)
    return saved
  }

  function updateCompanyProfile(field, value) {
    setCompanyProfile((current) => ({ ...current, [field]: value }))
  }

  function updateCompanyBankField(field, value) {
    setCompanyProfile((current) => ({
      ...current,
      bankDetails: { ...current.bankDetails, [field]: value },
    }))
  }

  function updateCompanySignatoryField(field, value) {
    setCompanyProfile((current) => ({
      ...current,
      signatory: { ...current.signatory, [field]: value },
    }))
  }

  const value = useMemo(
    () => ({
      companyProfile,
      companyLoading,
      companyError,
      saveCompanyProfile,
      refreshCompanyProfile,
      setCompanyProfile,
      updateCompanyProfile,
      updateCompanyBankField,
      updateCompanySignatoryField,
      customers,
      customersLoading,
      customersError,
      refreshCustomers,
      products,
      productsLoading,
      productsError,
      refreshProducts,
    }),
    [
      companyProfile,
      companyLoading,
      companyError,
      refreshCompanyProfile,
      customers,
      customersLoading,
      customersError,
      refreshCustomers,
      products,
      productsLoading,
      productsError,
      refreshProducts,
    ],
  )

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>
}

export function useAppData() {
  const context = useContext(AppDataContext)
  if (!context) {
    throw new Error('useAppData must be used within AppDataProvider')
  }
  return context
}

export { EMPTY_PRODUCT }
