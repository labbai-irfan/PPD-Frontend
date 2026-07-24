import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { cn, discountPercent, formatCurrency } from '@/lib/utils'
import { FREE_SHIPPING_THRESHOLD, ROUTES } from '@/lib/constants'
import { useProduct, useRelatedProducts } from '@/hooks/use-catalog'
import { useCartStore } from '@/store/cart.store'
import { useRecentlyViewedStore } from '@/store/recently-viewed.store'
import { useIsWishlisted, useWishlistStore } from '@/store/wishlist.store'
import type { Product, ProductFaq, ProductSpec } from '@/types'
import { Icon } from '@/components/ui/Icon'
import { Dots } from '@/components/ui/Dots'
import { Skeleton } from '@/components/ui/Skeleton'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { SavePill } from '@/components/shared/ProductBadge'
import { ProductGrid } from '@/components/shared/ProductGrid'
import { TopBar } from '@/components/shared/TopBar'
import { useScrollHide } from '@/hooks/use-scroll-hide'

/** Vertical thumbnail rail + main image, from the design gallery. */
function Gallery({ product }: { product: Product }) {
  const [active, setActive] = useState(0)

  return (
    // One shared row height: the thumb rail and the main image both fill it,
    // so the main image can never grow taller than the thumbnail column.
    // 294px = 4 thumbs (4×66px) + 3 gaps (3×10px).
    <div className="flex h-[294px] gap-2.5 md:h-[420px]">
      <div className="flex w-[70px] shrink-0 flex-col gap-2.5 overflow-y-auto no-scrollbar">
        {product.images.map((image, i) => (
          <button
            key={image}
            type="button"
            aria-label={`View image ${i + 1}`}
            onClick={() => setActive(i)}
            className={cn(
              'h-[66px] shrink-0 overflow-hidden rounded-xl border-2 bg-card p-1 transition-colors cursor-pointer',
              i === active ? 'border-primary' : 'border-transparent',
            )}
          >
            <img src={image} alt={`${product.title} — view ${i + 1}`} className="size-full rounded-lg object-cover" />
          </button>
        ))}
      </div>
      <div className="h-full flex-1 overflow-hidden rounded-2xl bg-card shadow-card">
        <img src={product.images[active]} alt={product.title} className="size-full object-cover" />
      </div>
    </div>
  )
}

function LikeChip({ product }: { product: Product }) {
  const wishlisted = useIsWishlisted(product.id)
  const toggle = useWishlistStore((s) => s.toggle)
  const calculatedLikes = Math.floor(product.ratingCount * 12.5 + product.reviewCount * 3.2 + (product.stock > 0 ? 14 : 5))
  const formattedLikes = new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(calculatedLikes)

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
      <span className="text-xs font-semibold text-ink-soft dark:text-foreground">{formattedLikes}</span>
    </button>
  )
}

/** Admin-entered colour/material/size etc. — rendered as a simple two-column table. */
function SpecsTable({ specs }: { specs: ProductSpec[] }) {
  return (
    <div className="mt-4">
      <h2 className="mb-2 text-base font-bold text-foreground">Specifications</h2>
      <div className="overflow-hidden rounded-xl border border-border-strong">
        {specs.map((spec, i) => (
          <div
            key={spec.label + i}
            className={cn('flex text-[12.5px]', i % 2 === 0 ? 'bg-white dark:bg-card/50' : 'bg-muted/40 dark:bg-card/20')}
          >
            <span className="w-2/5 shrink-0 px-4 py-2.5 font-semibold text-ink-muted dark:text-muted-foreground">
              {spec.label}
            </span>
            <span className="flex-1 px-4 py-2.5 text-foreground">{spec.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function FaqAccordion({ faqs }: { faqs: ProductFaq[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <div className="mt-4">
      <h2 className="mb-2 text-base font-bold text-foreground">Frequently Asked Questions</h2>
      <div className="space-y-2">
        {faqs.map((faq, i) => {
          const open = openIndex === i
          return (
            <div key={faq.question + i} className="overflow-hidden rounded-xl border border-border-strong">
              <button
                type="button"
                onClick={() => setOpenIndex(open ? null : i)}
                className="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-[12.5px] font-semibold text-foreground cursor-pointer"
              >
                {faq.question}
                <Icon name={open ? 'expand_less' : 'expand_more'} size={18} className="shrink-0 text-muted-foreground" />
              </button>
              {open && (
                <p className="border-t border-border-strong px-4 py-2.5 text-[12.5px] leading-relaxed text-ink-muted dark:text-muted-foreground">
                  {faq.answer}
                </p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function ProductDetailsPage() {
  const { idOrSlug = '' } = useParams()
  const id = idOrSlug
  const navigate = useNavigate()
  const isBarHidden = useScrollHide()
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
    <div className="pb-[calc(6rem+env(safe-area-inset-bottom))] md:pb-0">
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
          {product.sku && (
            <p className="mt-1 text-[12px] text-muted-foreground">ISBN: <span className="font-semibold text-foreground">{product.sku}</span></p>
          )}
          {product.shortDescription && (
            <p className="mt-1 text-[13px] leading-snug text-subtle-foreground">{product.shortDescription}</p>
          )}

          <div className="mt-2 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[13px]">
            <span className="flex items-center gap-1">
              <Icon name="star" size={16} fill className="text-rating" />
              <span className="font-semibold text-foreground">{product.rating.toFixed(1)}</span>
              <span className="text-faint-foreground">({product.ratingCount})</span>
            </span>
            <span className="text-[#d8cfc2]">|</span>
            <span className="flex items-center gap-1.5 text-subtle-foreground">
              <Icon name="group" size={17} fill className="text-accent" />
              <b className="font-semibold text-ink dark:text-foreground">
                {product.bought
                  ? product.bought.split(' ')[0]
                  : new Intl.NumberFormat('en-US').format(Math.floor(product.ratingCount * 3.4 + product.reviewCount * 1.2 + 21))}
              </b>
              Brought this week
            </span>
          </div>

          <div className="mt-3.5 flex flex-wrap items-center gap-x-2.5 gap-y-1">
            <span className="text-[22px] font-bold text-foreground sm:text-[27px]">{formatCurrency(product.price)}</span>
            <s className="text-base text-faint-foreground">{formatCurrency(product.mrp)}</s>
            {save > 0 && (
              <SavePill className="px-3 py-1.5 text-xs">
                {discountPercent(product.mrp, product.price)}% OFF
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
          <div className="mt-3 rounded-xl border border-border-strong bg-white px-4 py-3 text-[12.5px] leading-relaxed text-ink-muted dark:bg-card/50 dark:text-muted-foreground">
            {product.description}
          </div>

          {product.specs && product.specs.length > 0 && <SpecsTable specs={product.specs} />}
          {product.faqs && product.faqs.length > 0 && <FaqAccordion faqs={product.faqs} />}

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

      {/* Mobile sticky action bar — pill-shaped, slides down on scroll */}
      <div
        className={cn(
          'fixed inset-x-0 bottom-0 z-40 mx-auto max-w-md sm:max-w-xl md:hidden',
          'px-4 pb-[calc(14px+env(safe-area-inset-bottom))] pt-3',
          'transition-transform duration-300 ease-in-out',
          isBarHidden ? 'translate-y-full' : 'translate-y-0',
        )}
      >
        <div className="flex gap-3 rounded-[28px] bg-card px-4 py-3 shadow-bar">
        <Button variant="secondary" size="lg" className="flex-1" onClick={handleAddToCart} disabled={outOfStock}>
          {outOfStock ? 'Out of stock' : 'Add to Cart'}
        </Button>
        <Button size="lg" className="flex-1" onClick={handleBuyNow} disabled={outOfStock}>
          Buy Now
        </Button>
        </div>
      </div>
    </div>
  )
}
