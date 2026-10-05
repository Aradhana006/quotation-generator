function UnsavedChangesDialog({ open, onStay, onLeave }) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-slate-900">You have unsaved changes.</h2>
        <p className="mt-2 text-sm text-slate-600">
          If you leave now, field positions and styles that were not saved will be lost.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onStay}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Stay
          </button>
          <button
            type="button"
            onClick={onLeave}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            Leave
          </button>
        </div>
      </div>
    </div>
  )
}

export default UnsavedChangesDialog
