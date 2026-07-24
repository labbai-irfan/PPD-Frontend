import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { FREE_SHIPPING_THRESHOLD, SHIPPING_FEE, STORAGE_KEYS } from '@/lib/constants'
import { clamp } from '@/lib/utils'
import type { CartItem, Product, ProductBatch } from '@/types'

export interface AppliedCoupon {
  code: string
  discount: number
}

interface CartState {
  items: CartItem[]
  coupon: AppliedCoupon | null
  addItem: (product: Product, batch?: ProductBatch, batchCount?: number, selections?: Record<string, string>) => void
  removeItem: (key: string) => void
  setQuantity: (key: string, batchCount: number) => void
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

      addItem: (product, batch, batchCount = 1, selections = {}) =>
        set((state) => {
          let selectedBatch = batch
          if (!selectedBatch) {
            if (product.batches && product.batches.length > 0) {
              selectedBatch = product.batches.find((b) => b.isDefault && b.status === 'active') ||
                              product.batches.find((b) => b.status === 'active') ||
                              product.batches[0]
            } else {
              selectedBatch = {
                sku: product.sku || product.id,
                name: 'Standard Option',
                quantity: 1,
                calculatedPrice: product.price,
                discountType: 'none',
                discountValue: 0,
                sellingPrice: product.price,
                pricingMode: 'auto',
                displayOrder: 0,
                status: 'active',
                isDefault: true,
                badge: 'none',
                minOrderCount: 1,
                maxOrderCount: 99,
              }
            }
          }

          const key = cartItemKey(product.id, { ...selections, batchId: selectedBatch._id ?? '' })
          const existing = state.items.find((i) => i.key === key)
          if (existing) {
            const newCount = clamp(existing.quantity + batchCount, selectedBatch.minOrderCount || 1, selectedBatch.maxOrderCount || 99)
            return {
              items: state.items.map((i) =>
                i.key === key
                  ? {
                      ...i,
                      quantity: newCount,
                      batchCount: newCount,
                      totalUnits: selectedBatch.quantity * newCount,
                      totalAmount: selectedBatch.sellingPrice * newCount,
                    }
                  : i,
              ),
            }
          }
          const item: CartItem = {
            key,
            productId: product.id,
            title: product.title,
            brand: product.brand,
            image: selectedBatch.image || product.images[0] || '',
            price: selectedBatch.sellingPrice,
            mrp: selectedBatch.calculatedPrice,
            quantity: batchCount,
            stock: product.stockQuantity ?? product.stock,
            selections: { ...selections, batchId: selectedBatch._id ?? '' },
            batchId: selectedBatch._id,
            batchSku: selectedBatch.sku,
            batchName: selectedBatch.name,
            unitPrice: product.unitPrice ?? product.price,
            batchQuantity: selectedBatch.quantity,
            batchPrice: selectedBatch.sellingPrice,
            batchCount: batchCount,
            totalUnits: selectedBatch.quantity * batchCount,
            totalAmount: selectedBatch.sellingPrice * batchCount,
            pricingMode: selectedBatch.pricingMode,
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
          items: state.items.map((i) => {
            if (i.key === key) {
              const count = clamp(quantity, 1, 99)
              const batchQty = i.batchQuantity ?? 1
              const batchPrice = i.batchPrice ?? i.price
              return {
                ...i,
                quantity: count,
                batchCount: count,
                totalUnits: batchQty * count,
                totalAmount: batchPrice * count,
              }
            }
            return i
          }),
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
  const subtotal = items.reduce((sum, i) => sum + (i.batchPrice ?? i.price) * i.quantity, 0)
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
