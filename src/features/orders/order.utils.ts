import { formatDate } from '@/lib/utils'
import type { Order, OrderStatus } from '@/types'

/** Status → label + pill tone. Shared by the orders list and details screens. */
export const orderStatusMeta: Record<
  OrderStatus,
  { label: string; tone: 'info' | 'success' | 'destructive' | 'warning' }
> = {
  placed: { label: 'Placed', tone: 'warning' },
  confirmed: { label: 'Confirmed', tone: 'warning' },
  shipped: { label: 'Shipped', tone: 'info' },
  'out-for-delivery': { label: 'Out for Delivery', tone: 'info' },
  delivered: { label: 'Delivered', tone: 'success' },
  cancelled: { label: 'Cancelled', tone: 'destructive' },
}

/** Orders tab filter used by the orders list. */
export type OrderTab = 'All' | 'Delivered' | 'Undelivered'
export const ORDER_TABS: OrderTab[] = ['All', 'Delivered', 'Undelivered']

export function matchesOrderTab(order: Order, tab: OrderTab): boolean {
  if (tab === 'All') return true
  if (tab === 'Delivered') return order.status === 'delivered'
  return order.status !== 'delivered' && order.status !== 'cancelled'
}

/** Estimated delivery date shown on order cards (placed + 2 days). */
export function expectedDelivery(order: Order): string {
  const placed = new Date(order.createdAt)
  placed.setDate(placed.getDate() + 2)
  return formatDate(placed)
}

export function orderItemCount(order: Order): number {
  return order.items.reduce((sum, i) => sum + i.quantity, 0)
}
