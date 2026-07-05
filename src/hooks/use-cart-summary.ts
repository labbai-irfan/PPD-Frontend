import { getCartTotals, useCartStore } from '@/store/cart.store'

/**
 * Single source for derived cart figures used by the cart, checkout and
 * sticky bars. Keeps the totals math in one place (store) and exposes the
 * commonly-needed extras (item count, savings %) so screens don't recompute.
 */
export function useCartSummary() {
  const items = useCartStore((s) => s.items)
  const coupon = useCartStore((s) => s.coupon)
  const totals = getCartTotals(items, coupon)

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0)
  const savingsPct =
    totals.mrpTotal > 0 ? Math.round(((totals.savings + totals.couponDiscount) / totals.mrpTotal) * 100) : 0

  return { items, coupon, itemCount, savingsPct, ...totals }
}
