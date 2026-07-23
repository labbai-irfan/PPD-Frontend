import type { ReactNode } from 'react'
import { useSmartRecommendations, useTrendingRecommendations } from '@/hooks/use-recommendations'
import type { Product } from '@/types'

interface RecommendationsSectionProps {
  /** Title to display above the section */
  title?: string
  /** Number of products to show */
  limit?: number
  /** Whether to use personalized (true) or trending (false) recommendations */
  strategy?: 'smart' | 'trending'
  /** Children render function */
  children?: (props: { products: Product[]; isLoading: boolean; error: Error | null }) => ReactNode
}

/**
 * Smart Recommendations Section
 *
 * Automatically selects the best recommendation strategy:
 * - Authenticated users with purchase history → personalized
 * - New/unauthenticated users → trending
 *
 * @example
 * ```tsx
 * <RecommendationsSection title="Recommended For You" limit={12}>
 *   {({ products, isLoading }) => (
 *     <div className="grid grid-cols-4 gap-4">
 *       {isLoading && <Skeleton />}
 *       {products?.map(p => <ProductCard key={p._id} product={p} />)}
 *     </div>
 *   )}
 * </RecommendationsSection>
 * ```
 */
export function RecommendationsSection({
  title = 'Recommended For You',
  limit = 12,
  strategy = 'smart',
  children,
}: RecommendationsSectionProps) {
  const smartQuery = useSmartRecommendations(limit)
  const trendingQuery = useTrendingRecommendations(limit)

  const query = strategy === 'smart' ? smartQuery : trendingQuery
  const { data: products = [], isLoading, error } = query

  // Default render if no children provided
  if (!children) {
    return (
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8">{title}</h2>

          {isLoading && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array(limit)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="bg-gray-200 h-64 rounded animate-pulse" />
                ))}
            </div>
          )}

          {error && (
            <div className="text-center py-8 text-red-600">
              Failed to load recommendations
            </div>
          )}

          {products.length === 0 && !isLoading && (
            <div className="text-center py-8 text-gray-500">
              No products available
            </div>
          )}

          {products.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((product) => (
                <ProductCardPlaceholder key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>
    )
  }

  return children({ products, isLoading, error: error instanceof Error ? error : null })
}

/**
 * Horizontal Scrolling Recommendations
 * Great for homepage or sidebar sections
 */
export function RecommendationsCarousel({
  title = 'Trending Now',
  limit = 10,
}: Omit<RecommendationsSectionProps, 'children' | 'strategy'>) {
  const { data: products = [], isLoading } = useTrendingRecommendations(limit)

  return (
    <section className="py-8">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>

      {isLoading ? (
        <div className="flex gap-2.5 overflow-x-auto flex-nowrap no-scrollbar snap-x">
          {Array(limit)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="flex-shrink-0 w-48 h-48 bg-gray-200 rounded animate-pulse" />
            ))}
        </div>
      ) : (
        <div className="flex justify-between gap-1.5 md:justify-start md:gap-4 px-4 overflow-x-auto flex-nowrap no-scrollbar snap-x snap-mandatory scroll-px-4 pb-2 pt-1 -mx-4 md:mx-0 md:px-0">
          {products.map((product) => (
            <div
              key={product.id}
              className="flex-shrink-0 w-48 snap-start border rounded-lg overflow-hidden hover:shadow-lg transition"
            >
              <img
                src={product.images[0] || '/placeholder.jpg'}
                alt={product.title}
                className="w-full h-32 object-cover"
              />
              <div className="p-3">
                <p className="font-medium text-sm truncate">{product.title}</p>
                <p className="text-lg font-bold text-primary">₹{product.price}</p>
                <div className="flex items-center gap-1 text-xs">
                  <span>⭐ {product.rating}</span>
                  <span className="text-gray-500">({product.ratingCount})</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

/**
 * Placeholder Product Card
 * Replace with your actual ProductCard component
 */
function ProductCardPlaceholder({ product }: { product: Product }) {
  return (
    <a href={`/products/${product.slug}`} className="group">
      <div className="relative bg-gray-100 rounded-lg overflow-hidden mb-3 aspect-square">
        <img
          src={product.images[0] || '/placeholder.jpg'}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-110 transition"
        />

        {product.isPpdOriginal && (
          <div className="absolute top-2 right-2 bg-blue-600 text-white px-2 py-1 rounded text-xs font-semibold">
            PPD Original
          </div>
        )}

        {product.isFreeDelivery && (
          <div className="absolute bottom-2 left-2 bg-green-600 text-white px-2 py-1 rounded text-xs font-semibold">
            Free Delivery
          </div>
        )}
      </div>

      <div className="space-y-1">
        <h3 className="font-medium text-sm line-clamp-2 group-hover:text-primary">
          {product.title}
        </h3>

        <p className="text-xs text-gray-500">{product.brand}</p>

        <div className="flex items-center gap-1">
          <span className="text-lg font-bold text-primary">₹{product.price}</span>
          {product.mrp > product.price && (
            <span className="text-xs text-gray-500 line-through">₹{product.mrp}</span>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1">
            <span>⭐</span>
            <span className="font-medium">{product.rating.toFixed(1)}</span>
            <span className="text-gray-500">({product.ratingCount})</span>
          </div>
        </div>

        {product.tags.includes('deal') && (
          <p className="text-red-600 text-xs font-semibold">🔥 Hot Deal</p>
        )}

        {product.tags.includes('new') && (
          <p className="text-blue-600 text-xs font-semibold">✨ New</p>
        )}
      </div>
    </a>
  )
}

export default RecommendationsSection
