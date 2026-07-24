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
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  return (
    <>
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
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="h-full flex-1 overflow-hidden rounded-2xl bg-card shadow-card cursor-pointer focus:outline-none transition-transform hover:scale-[1.01]"
        >
          <img src={product.images[active]} alt={product.title} className="size-full object-cover" />
        </button>
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm transition-opacity duration-300 animate-fade-in"
          onClick={() => setIsOpen(false)}
        >
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="absolute right-4 top-4 z-50 flex size-12 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition-colors hover:bg-white/20 cursor-pointer"
            aria-label="Close image viewer"
          >
            <Icon name="close" size={24} />
          </button>
          
          <div
            className="relative max-h-[85vh] max-w-[90vw]"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={product.images[active]}
              alt={product.title}
              className="max-h-[85vh] max-w-[90vw] rounded-lg object-contain shadow-2xl animate-in zoom-in-95 duration-200"
            />
          </div>
        </div>
      )}
    </>
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

  const [selectedBatchId, setSelectedBatchId] = useState<string>('')
  const [batchCount, setBatchCount] = useState<number>(1)

  const selectedBatch = product?.batches?.find((b) => (b._id === selectedBatchId || (b as any).id === selectedBatchId)) || null

  useEffect(() => {
    if (product) addRecentlyViewed(product.id)
  }, [product, addRecentlyViewed])

  useEffect(() => {
    if (product?.batches && product.batches.length > 0) {
      const defaultBatch = product.batches.find((b) => b.isDefault && b.status === 'active') || product.batches.find((b) => b.status === 'active')
      const defaultId = defaultBatch?._id || (defaultBatch as any)?.id
      if (defaultBatch && defaultId) {
        setSelectedBatchId(defaultId)
        setBatchCount(1)
      }
    }
  }, [product])

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

  const displayedPrice = selectedBatch ? selectedBatch.sellingPrice * batchCount : (product?.price ?? 0)
  const displayedMrp = selectedBatch ? selectedBatch.calculatedPrice * batchCount : (product?.mrp ?? 0)
  const save = displayedMrp - displayedPrice
  const outOfStock = selectedBatch 
    ? ((product?.stockQuantity ?? product?.stock ?? 0) < (selectedBatch.quantity * batchCount))
    : (product?.stock ?? 0) === 0

  function handleAddToCart() {
    if (!product) return
    if (product.batches && product.batches.length > 0) {
      if (!selectedBatch) {
        toast.error('Please select a package option')
        return
      }
      addItem(product, selectedBatch, batchCount)
    } else {
      const dummyBatch: any = {
        _id: 'default',
        sku: product.sku || product.id,
        name: 'Standard Unit',
        quantity: 1,
        calculatedPrice: product.price,
        sellingPrice: product.price,
        pricingMode: 'auto',
      }
      addItem(product, dummyBatch, 1)
    }
    toast.success('Added to cart')
  }

  function handleBuyNow() {
    if (!product) return
    if (product.batches && product.batches.length > 0) {
      if (!selectedBatch) {
        toast.error('Please select a package option')
        return
      }
      addItem(product, selectedBatch, batchCount)
    } else {
      const dummyBatch: any = {
        _id: 'default',
        sku: product.sku || product.id,
        name: 'Standard Unit',
        quantity: 1,
        calculatedPrice: product.price,
        sellingPrice: product.price,
        pricingMode: 'auto',
      }
      addItem(product, dummyBatch, 1)
    }
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
            <span className="text-[22px] font-bold text-foreground sm:text-[27px]">{formatCurrency(displayedPrice)}</span>
            <s className="text-base text-faint-foreground">{formatCurrency(displayedMrp)}</s>
            {save > 0 && (
              <SavePill className="px-3 py-1.5 text-xs">
                {discountPercent(displayedMrp, displayedPrice)}% OFF
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

          {/* Batches Selection */}
          {product.batches && product.batches.length > 0 && (
            <div className="mt-4 space-y-3">
              <h2 className="text-base font-bold text-foreground">Select Package Option</h2>
              <div className="space-y-2">
                {product.batches.map((batch) => {
                  const isDefault = batch.isDefault
                  const isInactive = batch.status === 'inactive'
                  const isHidden = batch.status === 'hidden'
                  
                  if (isHidden) return null

                  const totalAvailable = product.stockQuantity ?? product.stock
                  const canBuy = totalAvailable >= batch.quantity && !isInactive
                  const batchId = batch._id || (batch as any).id || ''
                  const isSelected = selectedBatchId === batchId

                  // Low stock warnings
                  let stockWarning = ""
                  if (!canBuy) {
                    stockWarning = "Out of Stock"
                  } else if (totalAvailable - batch.quantity < 10) {
                    stockWarning = `Only ${totalAvailable} units left`
                  }

                  return (
                    <button
                      key={batchId}
                      type="button"
                      disabled={!canBuy}
                      onClick={() => {
                        setSelectedBatchId(batchId)
                        setBatchCount(1)
                      }}
                      className={cn(
                        "w-full flex items-center justify-between gap-3 rounded-xl border p-3 text-left transition-colors cursor-pointer",
                        !canBuy
                          ? "opacity-50 cursor-not-allowed bg-muted/40 border-border"
                          : isSelected
                            ? "border-primary bg-primary-soft/40 shadow-sm"
                            : "border-border hover:border-muted-foreground/40 bg-card"
                      )}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-foreground text-sm">{batch.name}</span>
                          {batch.badge && batch.badge !== 'none' && (
                            <span className="rounded-full bg-deal/10 px-2 py-0.5 text-[10px] font-bold text-deal capitalize">
                              {batch.badge.replace('-', ' ')}
                            </span>
                          )}
                          {isDefault && (
                            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Pack size: <span className="font-semibold text-foreground">{batch.quantity} Units</span>
                          {batch.description && ` · ${batch.description}`}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-bold text-foreground text-sm">
                          {formatCurrency(batch.sellingPrice)}
                        </div>
                        {batch.discountType !== 'none' && batch.discountValue > 0 && (
                          <div className="text-[10.5px] font-semibold text-success">
                            {batch.discountType === 'percentage'
                              ? `${batch.discountValue}% OFF`
                              : `Save ${formatCurrency(batch.discountValue)}`}
                          </div>
                        )}
                        {stockWarning && (
                          <div className={cn("text-[10px] font-bold mt-0.5", !canBuy ? "text-destructive" : "text-warning")}>
                            {stockWarning}
                          </div>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>

              {selectedBatch && (
                <div className="rounded-xl border border-border-strong bg-muted/20 p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-muted-foreground">Select Quantity (Packs)</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={batchCount <= (selectedBatch.minOrderCount || 1)}
                        onClick={() => setBatchCount(c => c - 1)}
                        className="flex size-7 items-center justify-center rounded-lg border border-border bg-card hover:bg-muted text-foreground disabled:opacity-40"
                      >
                        -
                      </button>
                      <span className="text-sm font-bold text-foreground w-6 text-center">{batchCount}</span>
                      <button
                        type="button"
                        disabled={
                          batchCount >= (selectedBatch.maxOrderCount || 99) ||
                          (selectedBatch.quantity * (batchCount + 1) > (product.stockQuantity ?? product.stock))
                        }
                        onClick={() => setBatchCount(c => c + 1)}
                        className="flex size-7 items-center justify-center rounded-lg border border-border bg-card hover:bg-muted text-foreground disabled:opacity-40"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  
                  {/* Real-time remaining stock preview */}
                  <div className="flex items-center justify-between text-xs border-t border-border pt-2 mt-1">
                    <span className="text-muted-foreground">Units Selected: <b className="text-foreground">{selectedBatch.quantity * batchCount}</b></span>
                    <span className="text-muted-foreground">Remaining Stock: <b className="text-foreground">{Math.max(0, (product.stockQuantity ?? product.stock) - selectedBatch.quantity * batchCount)}</b></span>
                  </div>
                </div>
              )}
            </div>
          )}

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
