import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { FREE_SHIPPING_THRESHOLD, SHIPPING_FEE, STORAGE_KEYS } from '@/lib/constants'
import { clamp } from '@/lib/utils'
import type { CartItem, Product } from '@/types'

export interface AppliedCoupon {
  code: string
  discount: number
}

interface CartState {
  items: CartItem[]
  coupon: AppliedCoupon | null
  addItem: (product: Product, selections?: Record<string, string>, quantity?: number) => void
  removeItem: (key: string) => void
  setQuantity: (key: string, quantity: number) => void
  clear: () => void
  applyCoupon: (coupon: AppliedCoupon) => void
  removeCoupon: () => void
}

export function cartItemKey(productId: string, selections: Record<string, string> = {}): string {
  const variant = Object.entries(selections)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join('|')
  return variant ? `${productId}:${variant}` : productId
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      coupon: null,

      addItem: (product, selections = {}, quantity = 1) =>
        set((state) => {
          const key = cartItemKey(product.id, selections)
          const existing = state.items.find((i) => i.key === key)
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.key === key ? { ...i, quantity: clamp(i.quantity + quantity, 1, i.stock) } : i,
              ),
            }
          }
          const item: CartItem = {
            key,
            productId: product.id,
            title: product.title,
            brand: product.brand,
            image: product.images[0] ?? '',
            price: product.price,
            mrp: product.mrp,
            quantity: clamp(quantity, 1, product.stock),
            stock: product.stock,
            selections,
          }
          return { items: [item, ...state.items] }
        }),

      removeItem: (key) =>
        set((state) => {
          const items = state.items.filter((i) => i.key !== key)
          return { items, coupon: items.length ? state.coupon : null }
        }),

      setQuantity: (key, quantity) =>
        set((state) => ({
          items: state.items.map((i) => (i.key === key ? { ...i, quantity: clamp(quantity, 1, i.stock) } : i)),
        })),

      clear: () => set({ items: [], coupon: null }),
      applyCoupon: (coupon) => set({ coupon }),
      removeCoupon: () => set({ coupon: null }),
    }),
    { name: STORAGE_KEYS.cart },
  ),
)

/** Derived pricing for cart + checkout. Single source of truth for totals. */
export function getCartTotals(items: CartItem[], coupon: AppliedCoupon | null) {
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const mrpTotal = items.reduce((sum, i) => sum + i.mrp * i.quantity, 0)
  const savings = mrpTotal - subtotal
  const couponDiscount = coupon?.discount ?? 0
  const shipping = items.length === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE
  const total = Math.max(0, subtotal - couponDiscount + shipping)
  return { subtotal, mrpTotal, savings, couponDiscount, shipping, total }
}

export function useCartCount(): number {
  return useCartStore((s) => s.items.reduce((sum, i) => sum + i.quantity, 0))
}
