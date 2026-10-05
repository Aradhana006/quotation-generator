import { TEMPLATE_FIELD_GROUPS } from '../../data/templateFields'

function FieldPalette({ onAddField }) {
  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-4 py-3">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Field list</h2>
        <p className="mt-1 text-xs text-slate-400">Click Add to place a field on this page.</p>
      </div>
      <div className="flex-1 space-y-4 overflow-auto px-3 py-3">
        {TEMPLATE_FIELD_GROUPS.map((group) => (
          <section key={group.id}>
            <h3 className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              {group.label}
            </h3>
            <ul className="space-y-1">
              {group.fields.map((field) => (
                <li key={field.key}>
                  <button
                    type="button"
                    onClick={() => onAddField(field.key)}
                    className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-sm text-slate-700 hover:bg-slate-100"
                  >
                    <span className="truncate">{field.label}</span>
                    <span className="ml-2 shrink-0 text-[11px] font-medium text-slate-400">Add</span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </aside>
  )
}

export default FieldPalette
