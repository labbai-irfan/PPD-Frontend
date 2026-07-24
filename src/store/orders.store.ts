import { create } from 'zustand'
import { apiClient } from '@/services/api/client'
import type { Address, CartItem, Order, PaymentMethodKind } from '@/types'

interface PlaceOrderInput {
  items: CartItem[]
  address: Address
  payment: { method: PaymentMethodKind; label: string; intentId?: string }
  pricing: Order['pricing']
  couponCode?: string
}

/** Backend order shape (subset used here). */
interface ApiOrder extends Omit<Order, 'id'> {
  id: string
  orderNumber: string
}

/** Backend orders carry both a Mongo id and an ORD-XXXXX number; the UI uses the number. */
function toFrontendOrder(o: ApiOrder): Order {
  return { ...o, id: o.orderNumber }
}

interface OrdersState {
  orders: Order[]
  loaded: boolean
  loading: boolean
  /** Fetch my orders from the API (no-op when already loading). */
  fetchOrders: () => Promise<void>
  placeOrder: (input: PlaceOrderInput) => Promise<Order>
  cancelOrder: (id: string) => Promise<void>
}

export const useOrdersStore = create<OrdersState>()((set, get) => ({
  orders: [],
  loaded: false,
  loading: false,

  fetchOrders: async () => {
    if (get().loading) return
    set({ loading: true })
    try {
      const { data } = await apiClient.get<{ items: ApiOrder[] }>('/orders', {
        params: { pageSize: 50 },
      })
      set({ orders: data.items.map(toFrontendOrder), loaded: true })
    } finally {
      set({ loading: false })
    }
  },

  placeOrder: async (input) => {
    // Server recomputes all pricing — we only send what it needs
    const { data } = await apiClient.post<ApiOrder>('/orders', {
      items: input.items.map((item) => ({
        productId: item.productId,
        batchId: item.batchId || 'default',
        quantity: item.quantity,
        selections: item.selections ?? {},
      })),
      address: {
        id: input.address.id,
        name: input.address.name,
        phone: input.address.phone,
        line1: input.address.line1,
        line2: input.address.line2,
        city: input.address.city,
        state: input.address.state,
        pincode: input.address.pincode,
        type: input.address.type ?? 'home',
      },
      payment: input.payment,
      ...(input.couponCode ? { couponCode: input.couponCode } : {}),
    })
    const order = toFrontendOrder(data)
    set((state) => ({ orders: [order, ...state.orders] }))
    return order
  },

  cancelOrder: async (id) => {
    const { data } = await apiClient.post<ApiOrder>(`/orders/${id}/cancel`, {})
    const updated = toFrontendOrder(data)
    set((state) => ({
      orders: state.orders.map((o) => (o.id === id ? updated : o)),
    }))
  },
}))
