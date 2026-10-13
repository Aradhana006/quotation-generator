import FormSection from './FormSection'
import QuoteItem from './QuoteItem'
import { inputClassName } from './formStyles'

function QuoteItems({
  items,
  products,
  productsLoading = false,
  onItemChange,
  onAddItem,
  onAddProductItem,
  onRemoveItem,
  itemErrors = {},
  itemsError,
}) {
  function handleProductSelect(event) {
    const productId = event.target.value
    if (!productId) return
    onAddProductItem(productId)
    event.target.value = ''
  }

  return (
    <FormSection
      title="Quotation Items"
      description="Start with one line. Select a product to add it, or add a new custom item below."
    >
      {productsLoading && (
        <p className="mb-4 text-sm text-slate-500">Loading products...</p>
      )}

      {!productsLoading && products.length === 0 && (
        <p className="mb-4 text-sm text-slate-500">
          No saved products found. Use Add new item for custom lines, or add products from Products & Services.
        </p>
      )}

      {!productsLoading && products.length > 0 && (
        <div className="mb-4">
          <label htmlFor="selectProduct" className="mb-1 block text-sm font-medium text-slate-700">
            Select Product / Service
          </label>
          <select
            id="selectProduct"
            defaultValue=""
            onChange={handleProductSelect}
            className={inputClassName}
          >
            <option value="" disabled>
              Choose a product to add...
            </option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {itemsError && (
        <p className="mb-4 text-sm text-red-600">{itemsError}</p>
      )}

      {items.length === 0 && (
        <p className="mb-4 text-sm text-slate-500">Please add at least one quotation item.</p>
      )}

      <div className="space-y-4">
        {items.map((item, index) => (
          <QuoteItem
            key={item.id}
            item={item}
            index={index}
            onChange={onItemChange}
            onRemove={onRemoveItem}
            canRemove={items.length > 1}
            errors={itemErrors[index] || {}}
          />
        ))}
      </div>

      <div className="mt-4">
        <button
          type="button"
          onClick={onAddItem}
          className="rounded-lg border border-dashed border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:border-teal-300 hover:bg-teal-50/50"
        >
          + Add new item
        </button>
      </div>
    </FormSection>
  )
}

export default QuoteItems
