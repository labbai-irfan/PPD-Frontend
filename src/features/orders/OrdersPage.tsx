import { useState } from 'react'
import { Link } from 'react-router-dom'
import { cn, formatCurrency, formatDate } from '@/lib/utils'
import { ROUTES } from '@/lib/constants'
import { useOrdersStore } from '@/store/orders.store'
import { useProducts } from '@/hooks/use-catalog'
import type { Order } from '@/types'
import { Icon } from '@/components/ui/Icon'
import { Dots } from '@/components/ui/Dots'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { StatusPill } from '@/components/shared/ProductBadge'
import { ProductGrid } from '@/components/shared/ProductGrid'
import { TopBar } from '@/components/shared/TopBar'
import {
  expectedDelivery,
  matchesOrderTab,
  orderItemCount,
  orderStatusMeta,
  ORDER_TABS,
  type OrderTab,
} from '@/features/orders/order.utils'

function OrderCard({ order }: { order: Order }) {
  const status = orderStatusMeta[order.status]
  const itemCount = orderItemCount(order)
  const first = order.items[0]

  return (
    <div className="rounded-2xl bg-card p-3.5 shadow-card">
      <div className="flex gap-3">
        {/* 3D Stacked Card-on-card Layer */}
        <div className="relative h-[92px] w-[94px] shrink-0 select-none">
          {/* Back Card (Layer 3) */}
          <div className="absolute left-0 top-[2px] h-[78px] w-[78px] rounded-2xl border border-black/[0.04] bg-white opacity-40 shadow-sm dark:border-white/5 dark:bg-muted"></div>
          {/* Middle Card (Layer 2) */}
          <div className="absolute left-[6px] top-[6px] h-[78px] w-[78px] rounded-2xl border border-black/[0.04] bg-white opacity-70 shadow-sm dark:border-white/5 dark:bg-muted"></div>
          {/* Front Card (Layer 1) */}
          <div className="absolute left-[12px] top-[10px] flex h-[78px] w-[78px] items-center justify-center rounded-2xl border border-black/[0.06] bg-white p-1 shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:border-white/10 dark:bg-muted">
            {first && <img src={first.image} alt="" className="max-h-full max-w-full object-contain rounded-xl" />}
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <StatusPill tone={status.tone}>{status.label}</StatusPill>
            <span className="text-base font-bold text-foreground">{formatCurrency(order.pricing.total)}</span>
          </div>
          <div className="mt-1.5 flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[11.5px] text-muted-foreground">
                Order ID: <b className="font-semibold text-ink dark:text-foreground">#{order.id}</b>
              </p>
              <p className="mt-0.5 line-clamp-1 max-w-[180px] text-[12.5px] font-semibold text-card-foreground md:max-w-none">
                {first?.title}
                {order.items.length > 1 ? ' &…' : ''}
              </p>
              <p className="mt-0.5 text-[10.5px] text-faint-foreground">Placed on {formatDate(order.createdAt)}</p>
            </div>
            <span className="shrink-0 whitespace-nowrap text-[11.5px] text-faint-foreground">
              {itemCount} items
            </span>
          </div>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
        <span className="text-xs text-ink-label dark:text-muted-foreground">
          Expected Delivery :{' '}
          <b className="font-semibold text-ink dark:text-foreground">{expectedDelivery(order)}</b>
        </span>
        <Link to={ROUTES.order(order.id)} className="flex items-center gap-0.5 text-xs font-semibold text-link">
          View Details
          <Icon name="expand_more" size={16} />
        </Link>
      </div>
    </div>
  )
}

export default function OrdersPage() {
  const orders = useOrdersStore((s) => s.orders)
  const [tab, setTab] = useState<OrderTab>('All')
  const orderAgain = useProducts({ pageSize: 6 })

  const filtered = orders.filter((o) => matchesOrderTab(o, tab))

  return (
    <div>
      <TopBar leading="menu" cartTone="solid" />

      <div className="flex items-center justify-between gap-3 pb-3 pt-2.5 md:pt-0">
        <h1 className="text-[19px] font-bold text-foreground md:text-2xl">Your Orders</h1>
        <div className="flex items-center rounded-full bg-card p-1 shadow-soft">
          {ORDER_TABS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={cn(
                'rounded-full px-3 py-1.5 text-[12.5px] font-semibold transition-colors cursor-pointer md:px-4',
                tab === t ? 'bg-primary text-primary-foreground' : 'text-ink-muted dark:text-muted-foreground',
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {orders.length === 0 ? (
        <EmptyState
          icon={<Icon name="shopping_basket" size={36} />}
          title="No orders yet"
          description="When you place an order, it will show up here."
          action={
            <Link to={ROUTES.products}>
              <Button>Start shopping</Button>
            </Link>
          }
        />
      ) : filtered.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">No {tab.toLowerCase()} orders.</p>
      ) : (
        <div className="space-y-3 md:grid md:grid-cols-2 md:gap-4 md:space-y-0 xl:grid-cols-3">
          {filtered.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}

      <h2 className="mb-3 mt-6 text-base font-bold text-foreground">Order Again</h2>
      <ProductGrid products={orderAgain.data?.items} loading={orderAgain.isPending} skeletonCount={6} />
      <Dots count={4} active={0} className="mt-3.5" />
    </div>
  )
}
