import { useState } from 'react'
import PageContainer from '../components/PageContainer'
import ProductFormModal from '../components/products/ProductFormModal'
import ProductList from '../components/products/ProductList'
import { useAppData } from '../context/AppDataContext'

const emptyFormProduct = {
  name: '',
  description: '',
  unit: '',
  defaultPrice: 0,
  defaultTax: 18,
}

function Products() {
  const { products, addProduct, updateProduct, deleteProduct } = useAppData()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formProduct, setFormProduct] = useState(emptyFormProduct)

  function openCreateModal() {
    setEditingId(null)
    setFormProduct(emptyFormProduct)
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
    setIsModalOpen(true)
  }

  function handleFormChange(field, value) {
    setFormProduct((current) => ({ ...current, [field]: value }))
  }

  function handleSave() {
    if (!formProduct.name.trim()) {
      window.alert('Product name is required.')
      return
    }

    if (editingId) {
      updateProduct(editingId, formProduct)
    } else {
      addProduct(formProduct)
    }

    setIsModalOpen(false)
  }

  function handleDelete(product) {
    const confirmed = window.confirm(`Delete product "${product.name}"?`)
    if (confirmed) {
      deleteProduct(product.id)
    }
  }

  return (
    <PageContainer
      title="Products & Services"
      description="Maintain reusable products and services for faster quotation creation."
    >
      <button
        type="button"
        onClick={openCreateModal}
        className="mb-6 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
      >
        + Add Product
      </button>

      <ProductList products={products} onEdit={openEditModal} onDelete={handleDelete} />

      <ProductFormModal
        isOpen={isModalOpen}
        title={editingId ? 'Edit Product / Service' : 'Add Product / Service'}
        product={formProduct}
        onChange={handleFormChange}
        onSave={handleSave}
        onCancel={() => setIsModalOpen(false)}
      />
    </PageContainer>
  )
}

export default Products
