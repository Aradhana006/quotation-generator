import FormSection from './FormSection'
import { inputClassName, labelClassName } from './formStyles'

function AdditionalCharges({ charges, onChargeChange, onAddCharge, onRemoveCharge }) {
  return (
    <FormSection
      title="Additional Charges"
      description="Add shipping, installation, handling, or other charges."
    >
      <div className="space-y-3">
        {charges.length === 0 && (
          <p className="text-sm text-slate-500">No additional charges added yet.</p>
        )}

        {charges.map((charge, index) => (
          <div key={charge.id} className="grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 sm:grid-cols-[1fr_160px_auto]">
            <div>
              <label htmlFor={`charge-name-${charge.id}`} className={labelClassName}>
                Charge {index + 1}
              </label>
              <input
                id={`charge-name-${charge.id}`}
                type="text"
                value={charge.name}
                onChange={(event) => onChargeChange(charge.id, 'name', event.target.value)}
                className={inputClassName}
              />
            </div>
            <div>
              <label htmlFor={`charge-amount-${charge.id}`} className={labelClassName}>
                Amount
              </label>
              <input
                id={`charge-amount-${charge.id}`}
                type="number"
                min="0"
                step="0.01"
                value={charge.amount}
                onChange={(event) => onChargeChange(charge.id, 'amount', event.target.value)}
                className={inputClassName}
              />
            </div>
            <div className="flex items-end">
              <button
                type="button"
                onClick={() => onRemoveCharge(charge.id)}
                className="text-sm font-medium text-red-600 hover:text-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={onAddCharge}
        className="mt-4 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
      >
        + Add Charge
      </button>
    </FormSection>
  )
}

export default AdditionalCharges
