import { getTemplateFieldLabel } from '../../data/templateFields'
import { isMappedFieldVisible, resolveTemplateField } from '../../utils/resolveTemplateField'
import { formatCurrency } from '../../utils/quotationCalculations'

function ItemTablePreview({ field, quotation, scale }) {
  const items = quotation.items || []
  const currency = quotation.quotationDetails?.currency || 'INR'
  const columns = field.columns?.length
    ? field.columns
    : [
        { key: 'description', label: 'Description', width: 220 },
        { key: 'quantity', label: 'Qty', width: 40 },
        { key: 'unitPrice', label: 'Price', width: 80 },
        { key: 'total', label: 'Total', width: 80 },
      ]
  const totalWidth = columns.reduce((sum, column) => sum + Number(column.width || 0), 0) || 1

  return (
    <table className="w-full border-collapse" style={{ fontSize: Math.max(7, field.fontSize * scale) }}>
      <thead>
        <tr className="bg-slate-900 text-white">
          {columns.map((column) => (
            <th
              key={column.key}
              className="px-1 py-0.5 text-left font-semibold"
              style={{ width: `${(Number(column.width) / totalWidth) * 100}%` }}
            >
              {column.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {items.map((item, index) => (
          <tr key={`${item.id || index}`} className={index % 2 ? 'bg-slate-50' : 'bg-white'}>
            {columns.map((column) => {
              const values = {
                description: item.description,
                specification: item.specification,
                quantity: item.quantity,
                unit: item.unit,
                unitPrice: formatCurrency(item.unitPrice || 0, currency),
                discount:
                  item.discountType === 'fixed'
                    ? formatCurrency(item.discountValue || 0, currency)
                    : `${Number(item.discountValue) || 0}%`,
                tax: `${Number(item.taxRate) || 0}%`,
                total: formatCurrency(item.lineTotal || 0, currency),
              }
              return (
                <td key={column.key} className="truncate px-1 py-0.5 align-top">
                  {values[column.key] ?? ''}
                </td>
              )
            })}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function MappedFieldView({
  field,
  quotation,
  scale = 1,
  showHidden = false,
}) {
  const hidden = !isMappedFieldVisible(field, quotation)
  if (hidden && !showHidden) return null

  const value = resolveTemplateField(field.field, quotation)
  const isImage = field.field === 'company.logo' || field.field === 'signature.image'

  return (
    <div
      className="h-full w-full overflow-hidden whitespace-pre-wrap break-words"
      style={{
        fontSize: field.fontSize * scale,
        fontWeight: field.fontWeight,
        textAlign: field.alignment,
        color: field.color,
        opacity: hidden ? 0.45 : 1,
        lineHeight: 1.25,
      }}
    >
      {field.field === 'items.table' ? (
        <ItemTablePreview field={field} quotation={quotation} scale={scale} />
      ) : isImage && value ? (
        <img src={value} alt={getTemplateFieldLabel(field.field)} className="h-full w-full object-contain" />
      ) : (
        value || getTemplateFieldLabel(field.field)
      )}
    </div>
  )
}

export default MappedFieldView
