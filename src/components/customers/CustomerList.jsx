import CustomerCard from './CustomerCard'

function CustomerList({ customers, onEdit, onDelete }) {
  if (customers.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
        No customers saved yet. Click &quot;+ Add Customer&quot; to create your first customer.
      </div>
    )
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {customers.map((customer) => (
        <CustomerCard
          key={customer.id}
          customer={customer}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}

export default CustomerList
