import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { cn, formatCurrency } from '@/lib/utils'
import { ROUTES } from '@/lib/constants'
import type { Product } from '@/types'
import { useCartStore } from '@/store/cart.store'
import { Icon } from '@/components/ui/Icon'
import { RatingBadge } from '@/components/ui/Rating'
import { Skeleton } from '@/components/ui/Skeleton'
import { ProductBadge } from '@/components/shared/ProductBadge'
import { WishlistButton } from '@/components/shared/WishlistButton'

interface ProductCardProps {
  product: Product
  className?: string
}

/**
 * The design's ProductCard: image, badge + heart row, 2-line title,
 * ★ rating, struck MRP, then price with the round orange add-to-cart button.
 */
export function ProductCard({ product, className }: ProductCardProps) {
  const navigate = useNavigate()
  const addItem = useCartStore((s) => s.addItem)

  return (
    <Link
      to={ROUTES.product(product.id)}
      className={cn(
        'group flex flex-col rounded-[14px] bg-card p-2 shadow-card transition-shadow duration-300 hover:shadow-card-hover',
        className,
      )}
    >
      <div className="relative aspect-square overflow-hidden rounded-[10px] bg-surface-placeholder dark:bg-muted">
        <img
          src={product.images[0]}
          alt={product.title}
          loading="lazy"
          className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      <div className="mt-2 flex items-center justify-between gap-1 px-0.5">
        <ProductBadge product={product} />
        <WishlistButton productId={product.id} className="ml-auto" />
      </div>

      <div className="flex flex-1 flex-col px-0.5 pb-1">
        <h3 className="mt-1 line-clamp-2 min-h-[34px] text-xs font-medium leading-snug text-card-foreground">
          {product.title}
        </h3>
        <RatingBadge rating={product.rating} count={product.ratingCount} className="mt-1" />
        <s className="mt-1.5 text-[11px] text-faint-foreground">{formatCurrency(product.mrp)}</s>
        <div className="mt-0.5 flex items-center justify-between">
          <span className="text-[15px] font-bold text-foreground">{formatCurrency(product.price)}</span>
          <button
            type="button"
            aria-label={`Add ${product.title} to cart`}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              if (product.variants.length > 0) {
                navigate(ROUTES.product(product.id))
                return
              }
              addItem(product)
              toast.success('Added to cart')
            }}
            className="flex size-[34px] items-center justify-center rounded-full bg-primary text-primary-foreground shadow-glow transition-transform hover:scale-110 active:scale-95 cursor-pointer"
          >
            <img src="/icons/cart.svg" alt="" className="size-[17px] object-contain" />
          </button>
        </div>
      </div>
    </Link>
  )
}

export function ProductCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-[14px] bg-card p-2 shadow-card', className)}>
      <Skeleton className="aspect-square rounded-[10px]" />
      <div className="space-y-1.5 px-0.5 py-2">
        <Skeleton className="h-4 w-16 rounded-full" />
        <Skeleton className="h-3.5 w-full" />
        <Skeleton className="h-3.5 w-3/4" />
        <Skeleton className="h-3 w-14" />
        <div className="flex items-center justify-between pt-0.5">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="size-[34px] rounded-full" />
        </div>
      </div>
    </div>
  )
}
