import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { cn, discountPercent, formatCurrency } from '@/lib/utils'
import { FREE_SHIPPING_THRESHOLD, ROUTES } from '@/lib/constants'
import { useProduct, useRelatedProducts } from '@/hooks/use-catalog'
import { useCartStore } from '@/store/cart.store'
import { useRecentlyViewedStore } from '@/store/recently-viewed.store'
import { useIsWishlisted, useWishlistStore } from '@/store/wishlist.store'
import type { Product } from '@/types'
import { Icon } from '@/components/ui/Icon'
import { Dots } from '@/components/ui/Dots'
import { Skeleton } from '@/components/ui/Skeleton'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { SavePill } from '@/components/shared/ProductBadge'
import { ProductGrid } from '@/components/shared/ProductGrid'
import { TopBar } from '@/components/shared/TopBar'

/** Vertical thumbnail rail + main image, from the design gallery. */
function Gallery({ product }: { product: Product }) {
  const [active, setActive] = useState(0)

  return (
    <div className="flex gap-2.5">
      <div className="flex w-[70px] shrink-0 flex-col gap-2.5">
        {product.images.map((image, i) => (
          <button
            key={image}
            type="button"
            aria-label={`View image ${i + 1}`}
            onClick={() => setActive(i)}
            className={cn(
              'h-[66px] overflow-hidden rounded-xl border-2 bg-card p-1 transition-colors cursor-pointer',
              i === active ? 'border-primary' : 'border-transparent',
            )}
          >
            <img src={image} alt="" className="size-full rounded-lg object-cover" />
          </button>
        ))}
      </div>
      <div className="h-[280px] flex-1 overflow-hidden rounded-2xl bg-card shadow-card md:h-[420px]">
        <img src={product.images[active]} alt={product.title} className="size-full object-cover" />
      </div>
    </div>
  )
}

function LikeChip({ product }: { product: Product }) {
  const wishlisted = useIsWishlisted(product.id)
  const toggle = useWishlistStore((s) => s.toggle)
  const likeCount = ((product.ratingCount * 31) % 900) / 100 + 1.1 // stable pseudo count, e.g. "1.5K"

  return (
    <button
      type="button"
      aria-pressed={wishlisted}
      aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
      onClick={() => {
        toggle(product.id)
        toast(wishlisted ? 'Removed from wishlist' : 'Added to wishlist')
      }}
      className="flex items-center gap-1.5 rounded-full bg-card px-3.5 py-2 shadow-soft transition-transform hover:scale-105 cursor-pointer"
    >
      <Icon name="favorite" size={18} fill={wishlisted} className={wishlisted ? 'text-deal' : 'text-muted-foreground'} />
      <span className="text-xs font-semibold text-ink-soft dark:text-foreground">{likeCount.toFixed(1)}K</span>
    </button>
  )
}

export default function ProductDetailsPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const { data: product, isPending, isError } = useProduct(id)
  const related = useRelatedProducts(id)

  const addItem = useCartStore((s) => s.addItem)
  const addRecentlyViewed = useRecentlyViewedStore((s) => s.add)

  useEffect(() => {
    if (product) addRecentlyViewed(product.id)
  }, [product, addRecentlyViewed])

  if (isPending) {
    return (
      <div>
        <TopBar />
        <div className="mt-3 flex gap-2.5">
          <div className="flex w-[70px] flex-col gap-2.5">
            {Array.from({ length: 4 }, (_, i) => (
              <Skeleton key={i} className="h-[66px] rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-[280px] flex-1 rounded-2xl" />
        </div>
        <Skeleton className="mt-4 h-8 w-32 rounded-full" />
        <Skeleton className="mt-4 h-6 w-3/4" />
        <Skeleton className="mt-3 h-9 w-40" />
        <Skeleton className="mt-4 h-16 w-full rounded-xl" />
      </div>
    )
  }

  if (isError || !product) {
    return (
      <EmptyState
        icon={<Icon name="production_quantity_limits" size={36} />}
        title="Product not found"
        description="This product may have been removed or the link is incorrect."
        action={<Button onClick={() => navigate(ROUTES.products)}>Browse products</Button>}
      />
    )
  }

  const save = product.mrp - product.price
  const outOfStock = product.stock === 0

  function handleAddToCart() {
    addItem(product!)
    toast.success('Added to cart')
  }

  function handleBuyNow() {
    addItem(product!)
    navigate(ROUTES.cart)
  }

  return (
    <div className="pb-24 md:pb-0">
      <TopBar />

      <div className="md:grid md:grid-cols-2 md:gap-10">
        <div className="mt-3 md:mt-0">
          <Gallery product={product} />
        </div>

        <div>
          <div className="mt-3.5 flex items-center justify-between md:mt-0">
            {product.tags.includes('trending') ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-chip px-3.5 py-2 text-xs font-semibold text-chip-foreground">
                <Icon name="local_fire_department" size={16} fill className="text-link" />
                Trending
              </span>
            ) : (
              <span />
            )}
            <div className="flex items-center gap-2.5">
              <LikeChip product={product} />
              <button
                type="button"
                aria-label="Share"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href)
                  toast.success('Link copied')
                }}
                className="flex size-10 items-center justify-center rounded-full bg-card shadow-soft transition-transform hover:scale-105 cursor-pointer"
              >
                <Icon name="ios_share" size={19} className="text-ink-soft dark:text-foreground" />
              </button>
            </div>
          </div>

          <h1 className="mt-3.5 text-[21px] font-bold leading-tight text-foreground md:text-2xl">{product.title}</h1>

          <div className="mt-2 flex items-center gap-2.5 text-[13px]">
            <span className="flex items-center gap-1">
              <Icon name="star" size={16} fill className="text-rating" />
              <span className="font-semibold text-foreground">{product.rating.toFixed(1)}</span>
              <span className="text-faint-foreground">({product.ratingCount})</span>
            </span>
            <span className="text-[#d8cfc2]">|</span>
            <span className="flex items-center gap-1.5 text-subtle-foreground">
              <Icon name="group" size={17} fill className="text-accent" />
              <b className="font-semibold text-ink dark:text-foreground">
                {product.bought?.split(' ')[0] ?? '1,680'}
              </b>
              Brought this week
            </span>
          </div>

          <div className="mt-3.5 flex items-center gap-2.5">
            <span className="text-[27px] font-bold text-foreground">{formatCurrency(product.price)}</span>
            <s className="text-base text-faint-foreground">{formatCurrency(product.mrp)}</s>
            {save > 0 && (
              <SavePill className="px-3 py-1.5 text-xs">
                Save {save >= 1 ? formatCurrency(Math.round(save)) : `${discountPercent(product.mrp, product.price)}%`}
              </SavePill>
            )}
          </div>

          {/* delivery banner */}
          <div className="mt-3.5 flex items-center gap-3 rounded-xl bg-success-soft px-4 py-3">
            <img src="/icons/truck.svg" alt="Delivery Truck" className="size-[26px] object-contain" />
            <div>
              <p className="text-[13.5px] font-semibold text-success-deep">
                Free delivery on order above {formatCurrency(FREE_SHIPPING_THRESHOLD)}
              </p>
              <p className="text-[11.5px] text-[#4a8a63] dark:text-success-deep/80">
                Dispatch by {product.deliveryDays <= 1 ? 'Today' : 'Tomorrow'}
              </p>
            </div>
          </div>

          {/* description box */}
          <div className="mt-3 rounded-xl border border-border-strong px-4 py-3 text-[12.5px] leading-relaxed text-ink-muted dark:text-muted-foreground">
            {product.description}
          </div>

          {/* Desktop actions */}
          <div className="mt-6 hidden gap-3 md:flex">
            <Button variant="secondary" size="lg" className="flex-1" onClick={handleAddToCart} disabled={outOfStock}>
              {outOfStock ? 'Out of stock' : 'Add to Cart'}
            </Button>
            <Button size="lg" className="flex-1" onClick={handleBuyNow} disabled={outOfStock}>
              Buy Now
            </Button>
          </div>
        </div>
      </div>

      {/* You may also like */}
      <div className="mt-5 md:mt-12">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-bold text-foreground">You May Also Like</h2>
          <button
            type="button"
            onClick={() => navigate(ROUTES.allProducts)}
            className="flex items-center gap-1 text-xs font-semibold text-link hover:underline cursor-pointer"
          >
            View All
            <Icon name="arrow_forward" size={14} />
          </button>
        </div>
        <ProductGrid products={related.data?.slice(0, 6)} loading={related.isPending} skeletonCount={6} />
        <Dots count={4} active={0} className="mt-3.5" />
      </div>

      {/* Mobile sticky action bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 mx-auto flex max-w-md gap-3 bg-card px-4 pb-[calc(14px+env(safe-area-inset-bottom))] pt-3 shadow-bar md:hidden">
        <Button variant="secondary" size="lg" className="flex-1" onClick={handleAddToCart} disabled={outOfStock}>
          {outOfStock ? 'Out of stock' : 'Add to Cart'}
        </Button>
        <Button size="lg" className="flex-1" onClick={handleBuyNow} disabled={outOfStock}>
          Buy Now
        </Button>
      </div>
    </div>
  )
}
