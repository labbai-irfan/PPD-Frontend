import { Link, useNavigate, useParams } from 'react-router-dom'
import { Check, PackageX } from 'lucide-react'
import { toast } from 'sonner'
import { cn, formatCurrency, formatDate } from '@/lib/utils'
import { ROUTES } from '@/lib/constants'
import { useOrdersStore } from '@/store/orders.store'
import type { OrderStatus } from '@/types'
import { StatusPill } from '@/components/shared/ProductBadge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { Price } from '@/components/ui/Price'
import { orderStatusMeta } from '@/features/orders/order.utils'

const timeline: Array<{ status: OrderStatus; label: string }> = [
  { status: 'placed', label: 'Order placed' },
  { status: 'confirmed', label: 'Confirmed' },
  { status: 'shipped', label: 'Shipped' },
  { status: 'out-for-delivery', label: 'Out for delivery' },
  { status: 'delivered', label: 'Delivered' },
]

export default function OrderDetailsPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const order = useOrdersStore((s) => s.orders.find((o) => o.id === id))
  const cancelOrder = useOrdersStore((s) => s.cancelOrder)

  if (!order) {
    return (
      <EmptyState
        icon={<PackageX />}
        title="Order not found"
        description="We couldn't find this order in your account."
        action={<Button onClick={() => navigate(ROUTES.orders)}>View all orders</Button>}
      />
    )
  }

  const status = orderStatusMeta[order.status]
  const currentStep = timeline.findIndex((t) => t.status === order.status)
  const cancellable = order.status === 'placed' || order.status === 'confirmed'

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-mono text-xl font-bold tracking-tight text-foreground">{order.id}</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">Placed on {formatDate(order.createdAt)}</p>
        </div>
        <StatusPill tone={status.tone} className="text-xs">{status.label}</StatusPill>
      </div>

      {/* Status timeline */}
      {order.status !== 'cancelled' && (
        <Card className="mb-5 p-5">
          <ol className="flex items-start justify-between">
            {timeline.map((step, i) => {
              const reached = i <= currentStep
              const isLast = i === timeline.length - 1
              return (
                <li key={step.status} className={cn('relative flex flex-col items-center text-center', !isLast && 'flex-1')}>
                  {!isLast && (
                    <span
                      className={cn(
                        'absolute left-1/2 top-3.5 h-0.5 w-full',
                        i < currentStep ? 'bg-success' : 'bg-border',
                      )}
                      aria-hidden="true"
                    />
                  )}
                  <span
                    className={cn(
                      'relative z-10 flex size-7 items-center justify-center rounded-full border-2',
                      reached ? 'border-success bg-success text-success-foreground' : 'border-border bg-card text-muted-foreground',
                    )}
                  >
                    {reached ? <Check className="size-4" /> : <span className="size-1.5 rounded-full bg-current" />}
                  </span>
                  <span className={cn('mt-2 max-w-16 text-[11px] font-medium leading-tight', reached ? 'text-foreground' : 'text-muted-foreground')}>
                    {step.label}
                  </span>
                </li>
              )
            })}
          </ol>
        </Card>
      )}

      {/* Items */}
      <Card className="mb-5 divide-y divide-border">
        {order.items.map((item) => (
          <div key={item.key} className="flex gap-4 p-4">
            <Link to={ROUTES.product(item.productId)} className="size-16 shrink-0 overflow-hidden rounded-lg bg-muted">
              <img src={item.image} alt={item.title} className="size-full object-cover" />
            </Link>
            <div className="min-w-0 flex-1">
              <Link to={ROUTES.product(item.productId)} className="line-clamp-2 text-sm font-medium text-foreground hover:text-primary">
                {item.title}
              </Link>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Qty {item.quantity}
                {Object.entries(item.selections).map(([type, value]) => ` · ${type}: ${value}`)}
              </p>
              <Price price={item.price * item.quantity} size="sm" className="mt-1" />
            </div>
          </div>
        ))}
      </Card>

      <div className="grid gap-5 sm:grid-cols-2">
        <Card className="p-4">
          <h2 className="mb-2.5 text-sm font-bold uppercase tracking-wider text-muted-foreground">Delivery address</h2>
          <p className="text-sm font-bold text-foreground">{order.address.name}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {order.address.line1}
            {order.address.line2 ? `, ${order.address.line2}` : ''}, {order.address.city}, {order.address.state} —{' '}
            {order.address.pincode}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">Phone: {order.address.phone}</p>
        </Card>

        <Card className="p-4">
          <h2 className="mb-2.5 text-sm font-bold uppercase tracking-wider text-muted-foreground">Payment & totals</h2>
          <dl className="space-y-1.5 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Method</dt>
              <dd className="font-medium text-foreground">{order.payment.label}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd className="font-medium text-foreground">{formatCurrency(order.pricing.subtotal)}</dd>
            </div>
            {order.pricing.couponCode && (
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Coupon ({order.pricing.couponCode})</dt>
                <dd className="font-medium text-success">applied</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Delivery</dt>
              <dd className="font-medium text-foreground">
                {order.pricing.shipping === 0 ? 'FREE' : formatCurrency(order.pricing.shipping)}
              </dd>
            </div>
            <div className="flex justify-between border-t border-border pt-2 font-bold text-foreground">
              <dt>Total</dt>
              <dd>{formatCurrency(order.pricing.total)}</dd>
            </div>
          </dl>
        </Card>
      </div>

      {cancellable && (
        <Button
          variant="outline"
          className="mt-6 text-destructive hover:bg-destructive/8"
          onClick={() => {
            cancelOrder(order.id)
            toast('Order cancelled', { description: 'Any payment made will be refunded in 3–5 business days.' })
          }}
        >
          Cancel order
        </Button>
      )}
    </div>
  )
}
