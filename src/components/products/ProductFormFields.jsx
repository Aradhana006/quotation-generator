import { inputClassName, labelClassName } from '../quotation/formStyles'

function ProductFormFields({ product, onChange, errors = {} }) {
  function handleChange(field) {
    return (event) => onChange(field, event.target.value)
  }

  function fieldClass(field) {
    return `${inputClassName} ${errors[field] ? 'border-red-400' : ''}`
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <label htmlFor="name" className={labelClassName}>Name</label>
        <input
          id="name"
          value={product.name}
          onChange={handleChange('name')}
          className={fieldClass('name')}
        />
        {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
      </div>

      <div className="sm:col-span-2">
        <label htmlFor="description" className={labelClassName}>Description</label>
        <textarea
          id="description"
          rows={3}
          value={product.description}
          onChange={handleChange('description')}
          className={inputClassName}
        />
      </div>

      <div>
        <label htmlFor="unit" className={labelClassName}>Unit</label>
        <input
          id="unit"
          value={product.unit}
          onChange={handleChange('unit')}
          className={fieldClass('unit')}
        />
        {errors.unit && <p className="mt-1 text-xs text-red-600">{errors.unit}</p>}
      </div>

      <div>
        <label htmlFor="defaultPrice" className={labelClassName}>Default Price</label>
        <input
          id="defaultPrice"
          type="number"
          min="0"
          step="0.01"
          value={product.defaultPrice}
          onChange={handleChange('defaultPrice')}
          className={fieldClass('defaultPrice')}
        />
        {errors.defaultPrice && (
          <p className="mt-1 text-xs text-red-600">{errors.defaultPrice}</p>
        )}
      </div>

      <div>
        <label htmlFor="defaultTax" className={labelClassName}>Default Tax (%)</label>
        <input
          id="defaultTax"
          type="number"
          min="0"
          step="0.01"
          value={product.defaultTax}
          onChange={handleChange('defaultTax')}
          className={fieldClass('defaultTax')}
        />
        {errors.defaultTax && (
          <p className="mt-1 text-xs text-red-600">{errors.defaultTax}</p>
        )}
      </div>
    </div>
  )
}

export default ProductFormFields
