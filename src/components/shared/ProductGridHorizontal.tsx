import type { Product } from '@/types'
import { cn } from '@/lib/utils'
import { ProductCardHorizontal, ProductCardHorizontalSkeleton } from '@/components/shared/ProductCardHorizontal'

interface ProductGridHorizontalProps {
  products?: Product[]
  loading?: boolean
  skeletonCount?: number
  className?: string
}

export function ProductGridHorizontal({ products, loading, skeletonCount = 6, className }: ProductGridHorizontalProps) {
  return (
    <div className={cn('flex flex-col gap-2.5 md:gap-3', className)}>
      {loading
        ? Array.from({ length: skeletonCount }, (_, i) => <ProductCardHorizontalSkeleton key={i} />)
        : products?.map((product) => <ProductCardHorizontal key={product.id} product={product} />)}
    </div>
  )
}
