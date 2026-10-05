function CustomerResponseActions({ permissions, message, onAccept, onReject, onRequestChanges }) {
  const canAct = permissions?.canAccept || permissions?.canReject || permissions?.canRequestChanges

  if (!canAct) {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-5 text-center">
        <p className="text-sm font-medium text-slate-800">
          {message || 'This quotation is not available for a response.'}
        </p>
      </section>
    )
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5">
      {message && <p className="mb-4 text-center text-sm text-slate-600">{message}</p>}
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
        <button
          type="button"
          onClick={onAccept}
          disabled={!permissions.canAccept}
          className="min-h-11 rounded-lg bg-green-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-green-800 disabled:opacity-50"
        >
          Accept Quotation
        </button>
        <button
          type="button"
          onClick={onReject}
          disabled={!permissions.canReject}
          className="min-h-11 rounded-lg bg-red-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-800 disabled:opacity-50"
        >
          Reject Quotation
        </button>
        <button
          type="button"
          onClick={onRequestChanges}
          disabled={!permissions.canRequestChanges}
          className="min-h-11 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 hover:bg-slate-50 disabled:opacity-50"
        >
          Request Changes
        </button>
      </div>
    </section>
  )
}

export default CustomerResponseActions
