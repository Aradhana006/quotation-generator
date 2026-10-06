import { useState } from 'react'
import PageContainer from '../components/PageContainer'
import CustomerFormModal from '../components/customers/CustomerFormModal'
import CustomerList from '../components/customers/CustomerList'
import { useAppData } from '../context/AppDataContext'
import * as customerService from '../services/customerService.js'

const emptyFormCustomer = {
  companyName: '',
  contactPerson: '',
  email: '',
  phone: '',
  address: '',
}

function Customers() {
  const { customers, customersLoading, customersError, refreshCustomers } = useAppData()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formCustomer, setFormCustomer] = useState(emptyFormCustomer)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [deleteError, setDeleteError] = useState('')

  function openCreateModal() {
    setEditingId(null)
    setFormCustomer(emptyFormCustomer)
    setSaveError('')
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
    setSaveError('')
    setIsModalOpen(true)
  }

  function handleFormChange(field, value) {
    setFormCustomer((current) => ({ ...current, [field]: value }))
  }

  async function handleSave() {
    if (!formCustomer.companyName.trim()) {
      setSaveError('Company name is required.')
      return
    }

    setIsSaving(true)
    setSaveError('')

    try {
      if (editingId) {
        await customerService.updateCustomer(editingId, formCustomer)
      } else {
        await customerService.createCustomer(formCustomer)
      }

      await refreshCustomers()
      setIsModalOpen(false)
    } catch (error) {
      setSaveError(error.message || 'Unable to save customer.')
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete(customer) {
    const confirmed = window.confirm(`Delete customer "${customer.companyName}"?`)
    if (!confirmed) return

    setDeleteError('')

    try {
      await customerService.deleteCustomer(customer.id)
      await refreshCustomers()
    } catch (error) {
      setDeleteError(error.message || 'Unable to delete customer.')
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

      {customersLoading && (
        <p className="mb-4 text-sm text-slate-500">Loading customers...</p>
      )}

      {customersError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {customersError}
        </div>
      )}

      {deleteError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {deleteError}
        </div>
      )}

      {!customersLoading && !customersError && (
        <CustomerList customers={customers} onEdit={openEditModal} onDelete={handleDelete} />
      )}

      <CustomerFormModal
        isOpen={isModalOpen}
        title={editingId ? 'Edit Customer' : 'Add Customer'}
        customer={formCustomer}
        onChange={handleFormChange}
        onSave={handleSave}
        onCancel={() => setIsModalOpen(false)}
        isSaving={isSaving}
        saveError={saveError}
      />
    </PageContainer>
  )
}

export default Customers
