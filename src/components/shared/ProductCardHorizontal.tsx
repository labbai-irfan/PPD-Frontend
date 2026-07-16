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
import { useState, useEffect, useRef } from 'react'

interface ProductCardHorizontalProps {
  product: Product
  className?: string
}

export function ProductCardHorizontal({ product, className }: ProductCardHorizontalProps) {
  const navigate = useNavigate()
  const addItem = useCartStore((s) => s.addItem)
  const inCartQty = useCartStore((s) =>
    s.items.reduce((sum, i) => (i.productId === product.id ? sum + i.quantity : sum), 0),
  )
  const [justAdded, setJustAdded] = useState(false)
  const revertTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => () => clearTimeout(revertTimer.current), [])

  const boughtCount = Math.floor(Math.random() * 3000) + 500

  return (
    <Link
      to={ROUTES.product(product.slug)}
      className={cn(
        'group grid grid-cols-[45%_55%] overflow-hidden rounded-[18px] bg-white shadow-sm ring-1 ring-black/[0.03] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:bg-card dark:ring-white/5',
        className,
      )}
    >
      {/* Left Column - Image */}
      <div className="relative overflow-hidden bg-surface-placeholder dark:bg-muted flex items-center justify-center">
        <img
          src={product.images[0]}
          alt={product.title}
          loading="lazy"
          className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      {/* Right Column - Details with Orange background */}
      <div className="flex flex-col justify-between bg-[#f7941e]/10 p-3.5 sm:p-4">
        <div>
          <div className="mb-1.5">
            <ProductBadge product={product} />
          </div>
          <h3 className="line-clamp-2 text-[13px] font-semibold leading-snug text-card-foreground sm:text-[14px]">
            {product.title}
          </h3>
          <div className="mt-1.5 flex items-center justify-between">
            <RatingBadge rating={product.rating} count={product.ratingCount} size="sm" />
            <span className="text-[9px] font-medium text-muted-foreground flex items-center gap-0.5 sm:text-[10px]">
              <Icon name="people" size={14} className="text-orange-500" />
              {boughtCount > 1000 ? `${(boughtCount / 1000).toFixed(1)}K+` : `${boughtCount}+`} bought
            </span>
          </div>
        </div>

        {/* Price and Button */}
        <div className="mt-2 flex items-center justify-between gap-2">
          <div>
            <s className="text-[10px] text-faint-foreground font-inter block leading-none">{formatCurrency(product.mrp)}</s>
            <span className="font-urbanist text-[15px] font-extrabold text-foreground leading-none">{formatCurrency(product.price)}</span>
          </div>
          <button
            type="button"
            aria-label={`Add ${product.title} to cart`}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              if (product.variants.length > 0) {
                navigate(ROUTES.product(product.slug))
                return
              }
              addItem(product)
              toast.success('Added to cart')
              setJustAdded(true)
              clearTimeout(revertTimer.current)
              revertTimer.current = setTimeout(() => setJustAdded(false), 1200)
            }}
            className={cn(
              'relative flex size-9 shrink-0 items-center justify-center rounded-full text-primary-foreground shadow-glow transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer',
              justAdded ? 'scale-110 bg-success' : 'bg-primary',
            )}
          >
            {justAdded ? (
              <Icon name="check" size={18} weight={700} className="text-white" />
            ) : (
              <img src="/icons/cart.svg" alt="" className="size-4 object-contain" />
            )}
            {inCartQty > 0 && (
              <span className="absolute -right-1 -top-1.5 flex h-[15px] min-w-[15px] items-center justify-center rounded-full bg-success px-0.5 font-inter text-[9px] font-bold leading-none text-white ring-2 ring-card">
                {inCartQty > 9 ? '9+' : inCartQty}
              </span>
            )}
          </button>
        </div>
      </div>
    </Link>
  )
}

export function ProductCardHorizontalSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('grid grid-cols-[45%_55%] overflow-hidden rounded-[18px] bg-card ring-1 ring-border', className)}>
      <Skeleton className="aspect-square" />
      <div className="flex flex-col gap-2 p-4">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <div className="mt-auto flex items-center justify-between">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="size-9 rounded-full" />
        </div>
      </div>
    </div>
  )
}
