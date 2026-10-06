import { Link } from 'react-router-dom'
import { formatDate } from '../../utils/quotationCalculations'
import StatusBadge from './StatusBadge'

function RevisionHistory({ revisions = [], currentId }) {
  if (!revisions.length) return null

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5">
      <h2 className="text-lg font-semibold text-slate-900">Revision History</h2>
      <div className="mt-4 divide-y divide-slate-100">
        {revisions.map((revision) => (
          <div key={revision.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
            <div>
              <p className="font-medium text-slate-900">
                Revision {revision.revisionNumber}
                {revision.isLatest ? (
                  <span className="ml-2 rounded-full bg-slate-900 px-2 py-0.5 text-[11px] font-medium text-white">
                    Latest
                  </span>
                ) : null}
                {revision.id === currentId ? (
                  <span className="ml-2 text-xs text-slate-500">This document</span>
                ) : null}
              </p>
              <p className="text-sm text-slate-500">{formatDate(revision.createdAt?.split?.('T')[0] || revision.createdAt)}</p>
            </div>
            <div className="flex items-center gap-3">
              <StatusBadge status={revision.status} />
              {revision.id !== currentId ? (
                <Link
                  to={`/quotations/${revision.id}`}
                  className="text-sm font-medium text-slate-700 hover:text-slate-900"
                >
                  View
                </Link>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default RevisionHistory
