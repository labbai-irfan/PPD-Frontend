import { useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Check, PackageX } from 'lucide-react'
import { toast } from 'sonner'
import { cn, formatCurrency, formatDate } from '@/lib/utils'
import { ROUTES } from '@/lib/constants'
import { useOrdersStore } from '@/store/orders.store'
import type { OrderStatus } from '@/types'
import { StatusPill } from '@/components/shared/ProductBadge'
import { Badge, type BadgeVariant } from '@/components/ui/Badge'
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
  const fetchOrders = useOrdersStore((s) => s.fetchOrders)
  const loaded = useOrdersStore((s) => s.loaded)

  useEffect(() => {
    if (!loaded) void fetchOrders().catch(() => {})
  }, [loaded, fetchOrders])

  if (!order) {
    if (!loaded) return null // still fetching
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

  const paymentBadge: { variant: BadgeVariant; label: string } | null =
    order.payment.status === 'paid'
      ? { variant: 'success', label: 'Paid' }
      : order.payment.status === 'refunded'
        ? { variant: 'secondary', label: 'Refunded' }
        : order.payment.status === 'failed'
          ? { variant: 'destructive', label: 'Failed' }
          : order.payment.method === 'cod'
            ? { variant: 'warning', label: 'Pay on delivery' }
            : null

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="break-all font-mono text-xl font-bold tracking-tight text-foreground">{order.id}</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">Placed on {formatDate(order.createdAt)}</p>
        </div>
        <StatusPill tone={status.tone} className="text-xs">{status.label}</StatusPill>
      </div>

      {/* Status timeline */}
      {order.status !== 'cancelled' && (
        <Card className="mb-5 p-5">
          <ol className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between sm:gap-0">
            {timeline.map((step, i) => {
              const reached = i <= currentStep
              const isLast = i === timeline.length - 1
              return (
                <li key={step.status} className="relative flex flex-1 items-start gap-3 text-left sm:flex-col sm:items-center sm:gap-0 sm:text-center">
                  {!isLast && (
                    <span
                      className={cn(
                        'absolute left-3.5 top-8 h-[calc(100%+0.75rem)] w-0.5 sm:left-1/2 sm:top-3.5 sm:h-0.5 sm:w-full',
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
                  <span className={cn('pt-1.5 text-[11px] font-medium leading-tight sm:mt-2 sm:max-w-16 sm:pt-0', reached ? 'text-foreground' : 'text-muted-foreground')}>
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
          <p className="mt-1 text-sm text-muted-foreground">Phone: +91 {order.address.phone}</p>
        </Card>

        <Card className="p-4">
          <h2 className="mb-2.5 text-sm font-bold uppercase tracking-wider text-muted-foreground">Payment & totals</h2>
          <dl className="space-y-1.5 text-sm">
            <div className="flex justify-between">
              <dt className="shrink-0 text-muted-foreground">Method</dt>
              <dd className="flex flex-wrap items-center justify-end gap-2 text-right font-medium text-foreground">
                {order.payment.label}
                {paymentBadge && <Badge variant={paymentBadge.variant}>{paymentBadge.label}</Badge>}
              </dd>
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
          className="mt-6 w-full text-destructive hover:bg-destructive/8 sm:w-auto"
          onClick={() => {
            void cancelOrder(order.id)
              .then(() =>
                toast('Order cancelled', {
                  description: 'Any payment made will be refunded in 3–5 business days.',
                }),
              )
              .catch((err: Error) => toast.error(err.message))
          }}
        >
          Cancel order
        </Button>
      )}
    </div>
  )
}
