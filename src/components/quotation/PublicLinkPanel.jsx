import { formatDate } from '../../utils/quotationCalculations'

function PublicLinkPanel({
  publicLink,
  canShare,
  generating,
  copying,
  sharing,
  revoking,
  onGenerate,
  onCopy,
  onShare,
  onRevoke,
}) {
  if (!canShare) {
    return (
      <section className="rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="mb-2 text-lg font-semibold text-slate-900">Public Link</h2>
        <p className="text-sm text-slate-500">This quotation cannot be shared.</p>
      </section>
    )
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5">
      <h2 className="mb-4 text-lg font-semibold text-slate-900">Public Link</h2>

      {publicLink?.url ? (
        <div className="space-y-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Link</p>
            <p className="mt-1 break-all text-sm text-slate-800">{publicLink.url}</p>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-slate-600">
            <p>
              <span className="font-medium text-slate-800">Status:</span> Active
            </p>
            <p>
              <span className="font-medium text-slate-800">Expires:</span>{' '}
              {formatDate(publicLink.expiresAt)}
            </p>
          </div>
        </div>
      ) : (
        <p className="text-sm text-slate-500">
          No active public link yet. Generate a secure link for the customer.
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onGenerate}
          disabled={generating}
          className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {generating ? 'Working…' : 'Generate Link'}
        </button>
        <button
          type="button"
          onClick={onCopy}
          disabled={!publicLink?.url || copying}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 disabled:opacity-60"
        >
          {copying ? 'Copying…' : 'Copy Link'}
        </button>
        <button
          type="button"
          onClick={onShare}
          disabled={!publicLink?.url || sharing}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 disabled:opacity-60"
        >
          {sharing ? 'Sharing…' : 'Share'}
        </button>
        <button
          type="button"
          onClick={onRevoke}
          disabled={!publicLink?.url || revoking}
          className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-700 disabled:opacity-60"
        >
          {revoking ? 'Revoking…' : 'Revoke Link'}
        </button>
      </div>
    </section>
  )
}

export default PublicLinkPanel
