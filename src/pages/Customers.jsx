import { useState } from 'react'
import PageContainer from '../components/PageContainer'
import CustomerFormModal from '../components/customers/CustomerFormModal'
import CustomerList from '../components/customers/CustomerList'
import { useAppData } from '../context/AppDataContext'

const emptyFormCustomer = {
  companyName: '',
  contactPerson: '',
  email: '',
  phone: '',
  address: '',
}

function Customers() {
  const { customers, addCustomer, updateCustomer, deleteCustomer } = useAppData()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formCustomer, setFormCustomer] = useState(emptyFormCustomer)

  function openCreateModal() {
    setEditingId(null)
    setFormCustomer(emptyFormCustomer)
    setIsModalOpen(true)
  }

  function openEditModal(customer) {
    setEditingId(customer.id)
    setFormCustomer({
      companyName: customer.companyName,
      contactPerson: customer.contactPerson,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
    })
    setIsModalOpen(true)
  }

  function handleFormChange(field, value) {
    setFormCustomer((current) => ({ ...current, [field]: value }))
  }

  function handleSave() {
    if (!formCustomer.companyName.trim()) {
      window.alert('Company name is required.')
      return
    }

    if (editingId) {
      updateCustomer(editingId, formCustomer)
    } else {
      addCustomer(formCustomer)
    }

    setIsModalOpen(false)
  }

  function handleDelete(customer) {
    const confirmed = window.confirm(`Delete customer "${customer.companyName}"?`)
    if (confirmed) {
      deleteCustomer(customer.id)
    }
  }

  return (
    <PageContainer
      title="Customers"
      description="Manage reusable customer records for your quotations."
    >
      <button
        type="button"
        onClick={openCreateModal}
        className="mb-6 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
      >
        + Add Customer
      </button>

      <CustomerList customers={customers} onEdit={openEditModal} onDelete={handleDelete} />

      <CustomerFormModal
        isOpen={isModalOpen}
        title={editingId ? 'Edit Customer' : 'Add Customer'}
        customer={formCustomer}
        onChange={handleFormChange}
        onSave={handleSave}
        onCancel={() => setIsModalOpen(false)}
      />
    </PageContainer>
  )
}

export default Customers
