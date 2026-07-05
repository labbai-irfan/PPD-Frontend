import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { discountPercent, formatCurrency } from '@/lib/utils'
import { ROUTES } from '@/lib/constants'
import { useCartStore } from '@/store/cart.store'
import { useCartSummary } from '@/hooks/use-cart-summary'
import { useRelatedProducts } from '@/hooks/use-catalog'
import { useWishlistStore } from '@/store/wishlist.store'
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
  const off = discountPercent(item.mrp, item.price)

  return (
    <div className="flex gap-3 rounded-2xl bg-card p-3.5 shadow-card">
      <Link to={ROUTES.product(item.productId)} className="size-16 shrink-0 overflow-hidden rounded-[10px] bg-surface-placeholder dark:bg-muted">
        <img src={item.image} alt={item.title} className="size-full object-cover" />
      </Link>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <Link
            to={ROUTES.product(item.productId)}
            className="line-clamp-2 max-w-[180px] text-[13.5px] font-semibold leading-snug text-card-foreground md:max-w-none"
          >
            {item.title}
          </Link>
          <div className="flex shrink-0 gap-3">
            <button
              type="button"
              aria-label="Move to wishlist"
              onClick={() => {
                toggleWishlist(item.productId)
                removeItem(item.key)
                toast('Moved to wishlist')
              }}
              className="cursor-pointer text-icon-idle transition-colors hover:text-deal"
            >
              <Icon name="favorite" size={19} />
            </button>
            <button
              type="button"
              aria-label="Remove from cart"
              onClick={() => {
                removeItem(item.key)
                toast('Removed from cart')
              }}
              className="cursor-pointer text-icon-idle transition-colors hover:text-destructive"
            >
              <Icon name="delete" size={19} />
            </button>
          </div>
        </div>
        <div className="mt-1.5 flex items-center gap-2">
          <span className="text-base font-bold text-foreground">{formatCurrency(item.price)}</span>
          {off > 0 && (
            <>
              <s className="text-xs text-faint-foreground">{formatCurrency(item.mrp)}</s>
              <SavePill>Save {off}%</SavePill>
            </>
          )}
        </div>
        <div className="mt-2 flex justify-end">
          <QuantityStepper
            size="sm"
            value={item.quantity}
            max={Math.min(item.stock, 30)}
            onChange={(qty) => setQuantity(item.key, qty)}
          />
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

      <div className="mt-3 md:mt-6 md:grid md:grid-cols-[1fr_360px] md:items-start md:gap-8">
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
            <div className="flex justify-between border-b border-border pb-3">
              <dt>Delivery Charges</dt>
              <dd className="font-medium text-ink dark:text-foreground">
                {totals.shipping === 0 ? '₹0' : formatCurrency(totals.shipping)}
              </dd>
            </div>
            <div className="flex justify-between pt-3 text-base font-bold text-foreground">
              <dt>Total Amount</dt>
              <dd>{formatCurrency(totals.total)}</dd>
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
          <Link to={ROUTES.allProducts} className="flex items-center gap-1 text-xs font-semibold text-link hover:underline">
            View All
            <Icon name="arrow_forward" size={14} />
          </Link>
        </div>
        <ProductGrid products={alsoLike.data?.slice(0, 6)} loading={alsoLike.isPending} skeletonCount={6} />
        <Dots count={4} active={0} className="mt-3.5" />
      </div>

      {/* Mobile sticky checkout bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 mx-auto flex max-w-md items-center justify-between bg-card px-4 pb-[calc(14px+env(safe-area-inset-bottom))] pt-3 shadow-bar md:hidden">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-foreground">{formatCurrency(totals.total)}</span>
            {savingsPct > 0 && <SavePill>Save {savingsPct}%</SavePill>}
          </div>
          <p className="text-[11.5px] text-muted-foreground">
            {itemCount} {itemCount === 1 ? 'Item' : 'Items'}
          </p>
        </div>
        <Button size="lg" onClick={() => navigate(ROUTES.checkout)} rightIcon={<Icon name="arrow_forward" size={18} />}>
          Proceed to Checkout
        </Button>
      </div>
    </div>
  )
}
