import { useState } from 'react'
import CustomerForm from './CustomerForm'
import {
  EMPTY_CUSTOMER,
  isCustomerValid,
} from '../../utils/customerValidation'

function QuotationEditor() {
  const [customer, setCustomer] = useState(EMPTY_CUSTOMER)
  const [customerErrors, setCustomerErrors] = useState({})

  const customerIsValid = isCustomerValid(customer)

  return (
    <div className="space-y-6">
      <CustomerForm
        customer={customer}
        onCustomerChange={setCustomer}
        onValidationChange={setCustomerErrors}
      />

      <section className="rounded-lg border border-slate-200 bg-slate-50 p-4">
        <h3 className="text-sm font-medium text-slate-700">Editor status</h3>
        <p className="mt-1 text-sm text-slate-500">
          {customerIsValid
            ? 'Customer section is complete.'
            : 'Fill in all required customer fields to continue.'}
        </p>

        {import.meta.env.DEV && (
          <details className="mt-3">
            <summary className="cursor-pointer text-sm text-slate-600">
              Debug: customer data in parent
            </summary>
            <pre className="mt-2 overflow-x-auto rounded bg-white p-3 text-xs text-slate-700">
              {JSON.stringify({ customer, customerErrors }, null, 2)}
            </pre>
          </details>
        )}
      </section>
    </div>
  )
}

export default QuotationEditor
