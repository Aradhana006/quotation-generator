import FormSection from './FormSection'
import QuoteItem from './QuoteItem'

function QuoteItems({ items, onItemChange, onAddItem, onRemoveItem }) {
  return (
    <FormSection
      title="Quotation Items"
      description="Add products or services to this quotation."
    >
      <div className="space-y-4">
        {items.map((item, index) => (
          <QuoteItem
            key={item.id}
            item={item}
            index={index}
            onChange={onItemChange}
            onRemove={onRemoveItem}
            canRemove={items.length > 1}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={onAddItem}
        className="mt-4 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
      >
        + Add Item
      </button>
    </FormSection>
  )
}

export default QuoteItems
