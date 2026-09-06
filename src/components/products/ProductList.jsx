import ProductCard from './ProductCard'

function ProductList({ products, onEdit, onDelete }) {
  if (products.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
        No products or services saved yet. Click &quot;+ Add Product&quot; to create your first item.
      </div>
    )
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}

export default ProductList
