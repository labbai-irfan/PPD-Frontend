import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { STORAGE_KEYS } from '@/lib/constants'
import { uid } from '@/lib/utils'
import { seedOrders } from '@/mocks/orders'
import type { Address, CartItem, Order, PaymentMethodKind } from '@/types'

interface PlaceOrderInput {
  items: CartItem[]
  address: Address
  payment: { method: PaymentMethodKind; label: string }
  pricing: Order['pricing']
}

interface OrdersState {
  orders: Order[]
  placeOrder: (input: PlaceOrderInput) => Order
  cancelOrder: (id: string) => void
}

export const useOrdersStore = create<OrdersState>()(
  persist(
    (set) => ({
      orders: seedOrders(),

      placeOrder: (input) => {
        const order: Order = {
          id: uid('ORD').toUpperCase(),
          items: input.items,
          status: 'placed',
          createdAt: new Date().toISOString(),
          address: input.address,
          payment: input.payment,
          pricing: input.pricing,
        }
        set((state) => ({ orders: [order, ...state.orders] }))
        return order
      },

      cancelOrder: (id) =>
        set((state) => ({
          orders: state.orders.map((o) => (o.id === id ? { ...o, status: 'cancelled' } : o)),
        })),
    }),
    {
      name: STORAGE_KEYS.orders,
      merge: (persisted, current) => {
        const state = { ...current, ...(persisted as OrdersState) }
        if (!state.orders?.length) state.orders = seedOrders()
        return state
      },
    },
  ),
)
