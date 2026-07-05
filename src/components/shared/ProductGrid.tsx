import type { Product } from '@/types'
import { cn } from '@/lib/utils'
import { ProductCard, ProductCardSkeleton } from '@/components/shared/ProductCard'

interface ProductGridProps {
  products?: Product[]
  loading?: boolean
  skeletonCount?: number
  className?: string
}

/** 3-column grid from the design; widens responsively on tablet/desktop. */
export function ProductGrid({ products, loading, skeletonCount = 9, className }: ProductGridProps) {
  return (
    <div className={cn('grid grid-cols-3 gap-2.5 md:grid-cols-4 md:gap-4 xl:grid-cols-5', className)}>
      {loading
        ? Array.from({ length: skeletonCount }, (_, i) => <ProductCardSkeleton key={i} />)
        : products?.map((product) => <ProductCard key={product.id} product={product} />)}
    </div>
  )
}
