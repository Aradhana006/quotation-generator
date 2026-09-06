function QuotationActions({ onSaveDraft, onFinalize, onCancel, isEditing }) {
  return (
    <div className="flex flex-wrap gap-3 rounded-lg border border-slate-200 bg-white p-4">
      <button
        type="button"
        onClick={onSaveDraft}
        className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
      >
        Save Draft
      </button>
      <button
        type="button"
        onClick={onFinalize}
        className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
      >
        {isEditing ? 'Update & Finalize' : 'Finalize Quotation'}
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition hover:text-slate-900"
      >
        Cancel
      </button>
    </div>
  )
}

export default QuotationActions
