import { create } from 'zustand'
import type { Address, CartItem, PaymentMethodKind } from '@/types'

/**
 * Snapshot of the checkout taken when the shopper picks an online payment
 * method. Deliberately NOT persisted — refreshing a payment page drops the
 * draft and the page redirects back to /checkout (by design).
 */
export interface CheckoutDraft {
  items: CartItem[]
  address: Address
  method: PaymentMethodKind
  couponCode?: string
  totals: {
    subtotal: number
    couponDiscount: number
    savings: number
    shipping: number
    total: number
  }
}

interface CheckoutState {
  draft: CheckoutDraft | null
  start: (draft: CheckoutDraft) => void
  clear: () => void
}

export const useCheckoutStore = create<CheckoutState>()((set) => ({
  draft: null,
  start: (draft) => set({ draft }),
  clear: () => set({ draft: null }),
}))
