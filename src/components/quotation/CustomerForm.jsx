import FormSection from './FormSection'
import CustomerFormFields from '../customers/CustomerFormFields'
import { inputClassName } from './formStyles'

function CustomerForm({ customer, customers, onChange, onSelectCustomer, error }) {
  function handleSelectChange(event) {
    const customerId = event.target.value
    if (!customerId) return
    onSelectCustomer(customerId)
    event.target.value = ''
  }

  return (
    <FormSection
      title="Customer Details"
      description="Select a saved customer or enter details manually."
    >
      {customers.length === 0 && (
        <p className="mb-4 text-sm text-slate-500">
          No customers found. Add customers from the Customers page, or enter details manually.
        </p>
      )}

      {customers.length > 0 && (
        <div className="mb-4">
          <label htmlFor="selectCustomer" className="mb-1 block text-sm font-medium text-slate-700">
            Select Existing Customer
          </label>
          <select
            id="selectCustomer"
            defaultValue=""
            onChange={handleSelectChange}
            className={inputClassName}
          >
            <option value="" disabled>Select a customer...</option>
            {customers.map((savedCustomer) => (
              <option key={savedCustomer.id} value={savedCustomer.id}>
                {savedCustomer.companyName}
              </option>
            ))}
          </select>
        </div>
      )}

      {error && (
        <p className="mb-4 text-sm text-red-600">{error}</p>
      )}

      <CustomerFormFields customer={customer} onChange={onChange} />
    </FormSection>
  )
}

export default CustomerForm
