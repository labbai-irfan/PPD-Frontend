import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { discountPercent, formatCurrency } from '@/lib/utils'
import { ROUTES } from '@/lib/constants'
import { useCartStore } from '@/store/cart.store'
import { useCartSummary } from '@/hooks/use-cart-summary'
import { useRelatedProducts } from '@/hooks/use-catalog'
import { useWishlistStore, useIsWishlisted } from '@/store/wishlist.store'
import type { CartItem } from '@/types'
import { Icon } from '@/components/ui/Icon'
import { Dots } from '@/components/ui/Dots'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { QuantityStepper } from '@/components/ui/QuantityStepper'
import { SavePill } from '@/components/shared/ProductBadge'
import { ProductGrid } from '@/components/shared/ProductGrid'
import { TopBar } from '@/components/shared/TopBar'

function CartItemCard({ item }: { item: CartItem }) {
  const { removeItem, setQuantity } = useCartStore()
  const toggleWishlist = useWishlistStore((s) => s.toggle)
  const isWishlisted = useIsWishlisted(item.productId)
  const off = discountPercent(item.mrp, item.price)

  const maxPacks = item.batchQuantity ? Math.floor(item.stock / item.batchQuantity) : 99

  return (
    <div className="flex gap-3 rounded-2xl bg-card p-3 shadow-card">
      <Link to={ROUTES.product(item.productId)} className="size-[76px] shrink-0 flex items-center justify-center rounded-xl bg-white border border-black/[0.04] p-1.5 shadow-sm dark:bg-muted dark:border-white/5">
        <img src={item.image} alt={item.title} className="max-h-full max-w-full object-contain" />
      </Link>
      <div className="min-w-0 flex-1 flex flex-col justify-between py-0.5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <Link
              to={ROUTES.product(item.productId)}
              className="line-clamp-1 pr-2 text-[13.5px] font-semibold leading-tight text-card-foreground hover:underline"
            >
              {item.title}
            </Link>
            {item.batchName && (
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {item.batchName} ({item.batchQuantity} Units)
              </p>
            )}
            {item.batchSku && (
              <p className="text-[9px] text-muted-foreground font-mono">
                SKU: {item.batchSku}
              </p>
            )}
          </div>
          <div className="flex shrink-0 gap-1 text-icon-idle">
            <button
              type="button"
              aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
              onClick={() => {
                toggleWishlist(item.productId)
                toast(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist')
              }}
              className="cursor-pointer p-2.5 -m-1.5 rounded-full transition-colors hover:text-deal"
            >
              <Icon
                name="favorite"
                size={18}
                fill={isWishlisted}
                className={isWishlisted ? 'text-deal' : 'text-icon-idle'}
              />
            </button>
            <button
              type="button"
              aria-label="Remove from cart"
              onClick={() => {
                removeItem(item.key)
                toast('Removed from cart')
              }}
              className="cursor-pointer p-2.5 -m-1.5 rounded-full transition-colors hover:text-destructive"
            >
              <Icon name="delete" size={18} />
            </button>
          </div>
        </div>
        
        <div className="mt-2 flex flex-wrap items-end justify-between gap-y-3 gap-x-1">
          <div className="flex flex-col gap-1">
            <span className="text-[15px] font-bold text-foreground leading-none">{formatCurrency(item.price)}</span>
            {off > 0 && (
              <div className="flex items-center gap-1.5">
                <s className="text-[11px] text-faint-foreground leading-none">{formatCurrency(item.mrp)}</s>
                <SavePill className="text-[9px] px-1.5 py-0.5">Save {off}%</SavePill>
              </div>
            )}
          </div>
          <div className="shrink-0">
            <QuantityStepper
              value={item.quantity}
              max={Math.max(1, maxPacks)}
              onChange={(qty) => setQuantity(item.key, qty)}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CartPage() {
  const navigate = useNavigate()
  const { items, coupon, itemCount, savingsPct, ...totals } = useCartSummary()
  const alsoLike = useRelatedProducts(items[0]?.productId ?? 'p1')

  if (items.length === 0) {
    return (
      <div>
        <TopBar title="My Cart" cartTone="solid" />
        <EmptyState
          icon={<Icon name="shopping_bag" size={36} />}
          title="Your cart is empty"
          description="Everything for school is one tap away. Start exploring!"
          action={
            <Link to={ROUTES.products}>
              <Button>Continue shopping</Button>
            </Link>
          }
        />
      </div>
    )
  }

  return (
    <div className="pb-24 md:pb-0">
      <TopBar title="My Cart" cartTone="solid" />
      <h1 className="hidden text-2xl font-bold text-foreground md:block">My Cart</h1>

      <div className="mt-3 md:mt-6 md:grid md:grid-cols-[1fr_320px] md:items-start md:gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-3">
          {items.map((item) => (
            <CartItemCard key={item.key} item={item} />
          ))}
        </div>

        {/* Summary */}
        <div className="mt-3.5 rounded-2xl bg-card p-4 shadow-card md:sticky md:top-[calc(var(--header-h)+1.5rem)] md:mt-0">
          <dl className="text-[13px] text-ink-label dark:text-muted-foreground">
            <div className="flex justify-between pb-3">
              <dt>Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'})</dt>
              <dd className="font-medium text-ink dark:text-foreground">{formatCurrency(totals.mrpTotal)}</dd>
            </div>
            <div className="flex justify-between pb-3">
              <dt>Discount</dt>
              <dd className="font-medium text-success">−{formatCurrency(totals.savings)}</dd>
            </div>
            {totals.couponDiscount > 0 && (
              <div className="flex justify-between pb-3">
                <dt>Coupon ({coupon?.code})</dt>
                <dd className="font-medium text-success">−{formatCurrency(totals.couponDiscount)}</dd>
              </div>
            )}
            <div className="flex justify-between pt-3 border-t border-border text-base font-bold text-foreground">
              <dt>Total Amount</dt>
              <dd>{formatCurrency(totals.subtotal - totals.couponDiscount)}</dd>
            </div>
          </dl>
          <p className="mt-2.5 text-[10.5px] leading-snug text-faint-foreground">
            Prices and discounts may change based on stock and ongoing offers.
          </p>
          <Button size="lg" className="mt-4 hidden w-full md:flex" onClick={() => navigate(ROUTES.checkout)} rightIcon={<Icon name="arrow_forward" size={18} />}>
            Proceed to Checkout
          </Button>
        </div>
      </div>

      {/* You may also like */}
      <div className="mt-5 md:mt-10">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-bold text-foreground">You May Also Like</h2>
          <Link to={ROUTES.allProducts} className="flex items-center gap-1 py-2 -my-2 text-xs font-semibold text-link hover:underline">
            View All
            <Icon name="arrow_forward" size={14} />
          </Link>
        </div>
        <ProductGrid products={alsoLike.data?.slice(0, 6)} loading={alsoLike.isPending} skeletonCount={6} />
        <Dots count={4} active={0} className="mt-3.5" />
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 mx-auto flex max-w-md items-center justify-between bg-card px-4 pb-[calc(14px+env(safe-area-inset-bottom))] pt-3 shadow-bar md:hidden">
        <div className="flex flex-col justify-center min-w-0 pr-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="truncate min-w-0 text-base font-bold leading-none text-foreground min-[360px]:text-lg">{formatCurrency(totals.subtotal - totals.couponDiscount)}</span>
            {savingsPct > 0 && <SavePill className="shrink-0 text-[10px] px-2 py-0.5">Save {savingsPct}%</SavePill>}
          </div>
          <span className="mt-1 text-[11px] font-medium leading-none text-muted-foreground whitespace-nowrap">
            ({itemCount} {itemCount === 1 ? 'Item' : 'Items'})
          </span>
        </div>
        <Button size="lg" className="shrink-0" onClick={() => navigate(ROUTES.checkout)} rightIcon={<Icon name="arrow_forward" size={18} />}>
          <span className="sm:hidden">Checkout</span>
          <span className="hidden sm:inline">Proceed to Checkout</span>
        </Button>
      </div>
    </div>
  )
}
