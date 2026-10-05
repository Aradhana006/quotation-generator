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
      description="Select saved products/services or add custom line items."
    >
      {productsLoading && (
        <p className="mb-4 text-sm text-slate-500">Loading products...</p>
      )}

      {!productsLoading && products.length === 0 && (
        <p className="mb-4 text-sm text-slate-500">
          No products found. Add products from Products & Services, or add custom items below.
        </p>
      )}

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        {!productsLoading && products.length > 0 && (
          <div className="flex-1">
            <label htmlFor="selectProduct" className="mb-1 block text-sm font-medium text-slate-700">
              Select Product / Service
            </label>
            <select
              id="selectProduct"
              defaultValue=""
              onChange={handleProductSelect}
              className={inputClassName}
            >
              <option value="" disabled>Choose a product...</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex items-end">
          <button
            type="button"
            onClick={onAddItem}
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 sm:w-auto"
          >
            + Add Custom Item
          </button>
        </div>
      </div>

      {itemsError && (
        <p className="mb-4 text-sm text-red-600">{itemsError}</p>
      )}

      {items.length === 0 && (
        <p className="text-sm text-slate-500">Please add at least one quotation item.</p>
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
    </FormSection>
  )
}

export default QuoteItems
