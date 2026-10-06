import { useMemo, useState } from 'react'
import PageContainer from '../components/PageContainer'
import ProductFormModal from '../components/products/ProductFormModal'
import ProductList from '../components/products/ProductList'
import { useAppData } from '../context/AppDataContext'
import * as productService from '../services/productService.js'

const emptyFormProduct = {
  name: '',
  description: '',
  unit: '',
  defaultPrice: '',
  defaultTax: 18,
}

function validateProductForm(formProduct) {
  const errors = {}

  if (!formProduct.name.trim()) {
    errors.name = 'Product name is required.'
  }

  if (!formProduct.unit.trim()) {
    errors.unit = 'Unit is required.'
  }

  const defaultPrice = Number(formProduct.defaultPrice)
  if (formProduct.defaultPrice === '' || Number.isNaN(defaultPrice)) {
    errors.defaultPrice = 'Default price is required.'
  } else if (defaultPrice < 0) {
    errors.defaultPrice = 'Default price cannot be negative.'
  }

  const defaultTax = formProduct.defaultTax === '' ? 0 : Number(formProduct.defaultTax)
  if (Number.isNaN(defaultTax)) {
    errors.defaultTax = 'Default tax must be a valid number.'
  } else if (defaultTax < 0) {
    errors.defaultTax = 'Default tax cannot be negative.'
  }

  return errors
}

function Products() {
  const { products, productsLoading, productsError, refreshProducts } = useAppData()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formProduct, setFormProduct] = useState(emptyFormProduct)
  const [formErrors, setFormErrors] = useState({})
  const [searchQuery, setSearchQuery] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [deleteError, setDeleteError] = useState('')

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return products

    return products.filter((product) => {
      const name = product.name?.toLowerCase() || ''
      const description = product.description?.toLowerCase() || ''
      return name.includes(query) || description.includes(query)
    })
  }, [products, searchQuery])

  function openCreateModal() {
    setEditingId(null)
    setFormProduct(emptyFormProduct)
    setFormErrors({})
    setSaveError('')
    setIsModalOpen(true)
  }

  function openEditModal(product) {
    setEditingId(product.id)
    setFormProduct({
      name: product.name,
      description: product.description,
      unit: product.unit,
      defaultPrice: product.defaultPrice,
      defaultTax: product.defaultTax,
    })
    setFormErrors({})
    setSaveError('')
    setIsModalOpen(true)
  }

  function handleFormChange(field, value) {
    setFormProduct((current) => ({ ...current, [field]: value }))
    setFormErrors((current) => ({ ...current, [field]: '' }))
  }

  async function handleSave() {
    const errors = validateProductForm(formProduct)
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    setIsSaving(true)
    setSaveError('')

    const payload = {
      name: formProduct.name.trim(),
      description: formProduct.description.trim(),
      unit: formProduct.unit.trim(),
      defaultPrice: Number(formProduct.defaultPrice),
      defaultTax: formProduct.defaultTax === '' ? 0 : Number(formProduct.defaultTax),
    }

    try {
      if (editingId) {
        await productService.updateProduct(editingId, payload)
      } else {
        await productService.createProduct(payload)
      }

      await refreshProducts()
      setIsModalOpen(false)
    } catch (error) {
      setSaveError(error.message || 'Unable to save product.')
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete(product) {
    const confirmed = window.confirm(`Delete product "${product.name}"?`)
    if (!confirmed) return

    setDeleteError('')

    try {
      await productService.deleteProduct(product.id)
      await refreshProducts()
    } catch (error) {
      setDeleteError(error.message || 'Unable to delete product.')
    }
  }

  return (
    <PageContainer
      title="Products & Services"
      description="Maintain reusable products and services for faster quotation creation."
    >
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={openCreateModal}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          + Add Product
        </button>

        <div className="w-full sm:max-w-xs">
          <label htmlFor="productSearch" className="sr-only">
            Search products
          </label>
          <input
            id="productSearch"
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
          />
        </div>
      </div>

      {productsLoading && (
        <p className="mb-4 text-sm text-slate-500">Loading products...</p>
      )}

      {productsError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {productsError}
        </div>
      )}

      {deleteError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {deleteError}
        </div>
      )}

      {!productsLoading && !productsError && (
        <>
          {products.length > 0 && searchQuery.trim() && filteredProducts.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
              No products match &quot;{searchQuery.trim()}&quot;.
            </div>
          ) : (
            <ProductList
              products={filteredProducts}
              onEdit={openEditModal}
              onDelete={handleDelete}
            />
          )}
        </>
      )}

      <ProductFormModal
        isOpen={isModalOpen}
        title={editingId ? 'Edit Product / Service' : 'Add Product / Service'}
        product={formProduct}
        errors={formErrors}
        onChange={handleFormChange}
        onSave={handleSave}
        onCancel={() => setIsModalOpen(false)}
        isSaving={isSaving}
        saveError={saveError}
      />
    </PageContainer>
  )
}

export default Products
