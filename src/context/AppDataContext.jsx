import { createContext, useContext, useMemo } from 'react'
import {
  EMPTY_COMPANY_PROFILE,
  EMPTY_PRODUCT,
  EMPTY_SAVED_CUSTOMER,
  STORAGE_KEYS,
} from '../data/defaults'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { createProduct, createSavedCustomer } from '../utils/dataMappers'

const AppDataContext = createContext(null)

export function AppDataProvider({ children }) {
  const [companyProfile, setCompanyProfile] = useLocalStorage(
    STORAGE_KEYS.companyProfile,
    EMPTY_COMPANY_PROFILE,
  )
  const [customers, setCustomers] = useLocalStorage(STORAGE_KEYS.customers, [])
  const [products, setProducts] = useLocalStorage(STORAGE_KEYS.products, [])

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

  function addCustomer(customerData) {
    const customer = createSavedCustomer(customerData)
    setCustomers((current) => [...current, customer])
    return customer
  }

  function updateCustomer(id, customerData) {
    setCustomers((current) =>
      current.map((customer) =>
        customer.id === id ? { ...customer, ...customerData, id } : customer,
      ),
    )
  }

  function deleteCustomer(id) {
    setCustomers((current) => current.filter((customer) => customer.id !== id))
  }

  function addProduct(productData) {
    const product = createProduct(productData)
    setProducts((current) => [...current, product])
    return product
  }

  function updateProduct(id, productData) {
    setProducts((current) =>
      current.map((product) =>
        product.id === id
          ? {
              ...product,
              ...productData,
              id,
              defaultPrice: Number(productData.defaultPrice) || 0,
              defaultTax: Number(productData.defaultTax) || 0,
            }
          : product,
      ),
    )
  }

  function deleteProduct(id) {
    setProducts((current) => current.filter((product) => product.id !== id))
  }

  const value = useMemo(
    () => ({
      companyProfile,
      setCompanyProfile,
      updateCompanyProfile,
      updateCompanyBankField,
      updateCompanySignatoryField,
      customers,
      addCustomer,
      updateCustomer,
      deleteCustomer,
      products,
      addProduct,
      updateProduct,
      deleteProduct,
    }),
    [companyProfile, customers, products],
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

export { EMPTY_SAVED_CUSTOMER, EMPTY_PRODUCT }
