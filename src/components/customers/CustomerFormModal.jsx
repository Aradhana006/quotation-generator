import CustomerFormFields from './CustomerFormFields'

function CustomerFormModal({
  isOpen,
  title,
  customer,
  onChange,
  onSave,
  onCancel,
  isSaving = false,
  saveError = '',
}) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="w-full max-w-2xl rounded-xl border border-slate-200 bg-white shadow-xl">
        <div className="border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        </div>
        <div className="px-6 py-5">
          {saveError && (
            <p className="mb-4 text-sm text-red-600">{saveError}</p>
          )}
          <CustomerFormFields customer={customer} onChange={onChange} />
        </div>
        <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSaving}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={isSaving}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Customer'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default CustomerFormModal
