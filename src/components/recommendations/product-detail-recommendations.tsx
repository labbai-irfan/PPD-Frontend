import { useRecommendationsByCategory } from '@/hooks/use-recommendations'
import type { Product } from '@/types'

interface ProductDetailRecommendationsProps {
  /** Current product (for exclusion and category) */
  product?: Product
  /** Number of recommendations */
  limit?: number
}

/**
 * Product Detail Page Recommendations
 *
 * Shows more products from the same category as the current product.
 * Excludes the current product from results.
 *
 * @example
 * ```tsx
 * function ProductDetail({ slug }: { slug: string }) {
 *   const { data: product } = useProduct(slug)
 *
 *   return (
 *     <>
 *       <ProductInfo product={product} />
 *       <ProductDetailRecommendations product={product} limit={8} />
 *     </>
 *   )
 * }
 * ```
 */
export function ProductDetailRecommendations({
  product,
  limit = 8,
}: ProductDetailRecommendationsProps) {
  const { data: recommendations = [], isLoading } = useRecommendationsByCategory(
    product?.category || '',
    product?.id,
    limit,
    !!product,
  )

  if (!product || !product.category) {
    return null
  }

  return (
    <section className="py-12 border-t">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-2xl font-bold mb-8">More in {product.category}</h2>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array(limit)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="bg-gray-200 h-64 rounded animate-pulse" />
              ))}
          </div>
        ) : recommendations.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No more products in this category
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {recommendations.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

/**
 * Compact product card for recommendation sections
 */
function ProductCard({ product }: { product: Product }) {
  return (
    <a href={`/products/${product.slug}`} className="group">
      <div className="relative bg-gray-100 rounded-lg overflow-hidden mb-3 aspect-square">
        <img
          src={product.images[0] || '/placeholder.jpg'}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-110 transition"
        />

        {product.tags.includes('deal') && (
          <div className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 rounded text-xs font-bold">
            Deal
          </div>
        )}

        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white font-semibold">Out of Stock</span>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <h3 className="font-medium text-sm line-clamp-2 group-hover:text-blue-600">
          {product.title}
        </h3>

        <div className="flex items-center justify-between">
          <div>
            <span className="text-lg font-bold text-gray-900">₹{product.price}</span>
            {product.mrp > product.price && (
              <>
                <span className="text-xs text-gray-500 line-through ml-1">₹{product.mrp}</span>
                <span className="text-xs font-semibold text-green-600 ml-1">
                  {Math.round(((product.mrp - product.price) / product.mrp) * 100)}% off
                </span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1">
          <span className="text-yellow-500">★</span>
          <span className="font-medium text-sm">{product.rating.toFixed(1)}</span>
          <span className="text-gray-500 text-xs">({product.ratingCount})</span>
        </div>

        {product.isFreeDelivery && (
          <div className="text-green-600 text-xs font-semibold">✓ Free Delivery</div>
        )}
      </div>
    </a>
  )
}

export default ProductDetailRecommendations
