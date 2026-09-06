import { inputClassName, labelClassName } from '../quotation/formStyles'

function ProductFormFields({ product, onChange }) {
  function handleChange(field) {
    return (event) => onChange(field, event.target.value)
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <label htmlFor="name" className={labelClassName}>Name</label>
        <input id="name" value={product.name} onChange={handleChange('name')} placeholder="Website Development" className={inputClassName} />
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="description" className={labelClassName}>Description</label>
        <textarea id="description" rows={3} value={product.description} onChange={handleChange('description')} placeholder="Detailed description for quotations" className={inputClassName} />
      </div>
      <div>
        <label htmlFor="unit" className={labelClassName}>Unit</label>
        <input id="unit" value={product.unit} onChange={handleChange('unit')} placeholder="Project / Hour / Piece" className={inputClassName} />
      </div>
      <div>
        <label htmlFor="defaultPrice" className={labelClassName}>Default Price</label>
        <input id="defaultPrice" type="number" min="0" step="0.01" value={product.defaultPrice} onChange={handleChange('defaultPrice')} className={inputClassName} />
      </div>
      <div>
        <label htmlFor="defaultTax" className={labelClassName}>Default Tax (%)</label>
        <input id="defaultTax" type="number" min="0" step="0.01" value={product.defaultTax} onChange={handleChange('defaultTax')} className={inputClassName} />
      </div>
    </div>
  )
}

export default ProductFormFields
