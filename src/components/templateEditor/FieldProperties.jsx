import { getTemplateFieldLabel } from '../../data/templateFields'

function NumberField({ label, value, onChange, min, max, step = 1 }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-slate-400">
        {label}
      </span>
      <input
        type="number"
        min={min}
        max={max}
        step={step}
        value={Number.isFinite(value) ? value : ''}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm text-slate-800"
      />
    </label>
  )
}

function FieldProperties({
  field,
  onChange,
  onDelete,
  onDuplicate,
}) {
  if (!field) {
    return (
      <aside className="flex h-full w-72 shrink-0 flex-col border-l border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-4 py-3">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Field config
          </h2>
        </div>
        <p className="px-4 py-6 text-sm text-slate-500">
          Select a field on the canvas to edit its position and style.
        </p>
      </aside>
    )
  }

  function update(partial) {
    onChange(field.id, partial)
  }

  return (
    <aside className="flex h-full w-72 shrink-0 flex-col border-l border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-4 py-3">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Field config
        </h2>
        <p className="mt-1 text-sm font-medium text-slate-900">{getTemplateFieldLabel(field.field)}</p>
        <p className="mt-0.5 font-mono text-[11px] text-slate-400">{field.field}</p>
      </div>

      <div className="flex-1 space-y-3 overflow-auto px-4 py-4">
        <div className="grid grid-cols-2 gap-3">
          <NumberField label="X" value={Math.round(field.x)} onChange={(x) => update({ x })} min={0} max={600} />
          <NumberField label="Y" value={Math.round(field.y)} onChange={(y) => update({ y })} min={0} max={840} />
          <NumberField label="Width" value={Math.round(field.width)} onChange={(width) => update({ width })} min={16} max={595} />
          <NumberField label="Height" value={Math.round(field.height)} onChange={(height) => update({ height })} min={12} max={800} />
          <NumberField label="Font size" value={field.fontSize} onChange={(fontSize) => update({ fontSize })} min={6} max={48} />
        </div>

        <label className="block">
          <span className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-slate-400">
            Font weight
          </span>
          <select
            value={field.fontWeight}
            onChange={(event) => update({ fontWeight: event.target.value })}
            className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
          >
            <option value="normal">Normal</option>
            <option value="bold">Bold</option>
          </select>
        </label>

        <label className="block">
          <span className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-slate-400">
            Alignment
          </span>
          <select
            value={field.alignment}
            onChange={(event) => update({ alignment: event.target.value })}
            className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
          >
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
          </select>
        </label>

        <label className="block">
          <span className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-slate-400">
            Color
          </span>
          <input
            type="color"
            value={field.color || '#111827'}
            onChange={(event) => update({ color: event.target.value })}
            className="h-9 w-full cursor-pointer rounded-md border border-slate-300 bg-white"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-slate-400">
            Visibility
          </span>
          <select
            value={field.visibility || 'always'}
            onChange={(event) => update({ visibility: event.target.value })}
            className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
          >
            <option value="always">Always</option>
            <option value="conditional">Conditional</option>
          </select>
        </label>

        {field.field === 'items.table' && (
          <p className="rounded-md bg-slate-50 px-3 py-2 text-xs text-slate-500">
            Item table columns are stored with this field. A column drag-and-drop builder will
            be added later.
          </p>
        )}
      </div>

      <div className="space-y-2 border-t border-slate-200 px-4 py-3">
        <button
          type="button"
          onClick={() => onDuplicate(field.id)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Duplicate
        </button>
        <button
          type="button"
          onClick={() => onDelete(field.id)}
          className="w-full rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
        >
          Delete Field
        </button>
      </div>
    </aside>
  )
}

export default FieldProperties
