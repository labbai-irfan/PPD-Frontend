import { Link, useParams } from 'react-router-dom'
import { CheckCircle2, PackageCheck } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { ROUTES } from '@/lib/constants'
import { useOrdersStore } from '@/store/orders.store'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

export default function OrderSuccessPage() {
  const { orderId = '' } = useParams()
  const order = useOrdersStore((s) => s.orders.find((o) => o.id === orderId))

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center py-10 text-center">
      <div className="animate-slide-up">
        <CheckCircle2 className="mx-auto size-20 text-success" strokeWidth={1.5} />
        <h1 className="mt-5 text-2xl font-bold tracking-tight text-foreground">Order placed successfully!</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Thank you for shopping with us. We've emailed your order confirmation.
        </p>
      </div>

      <Card className="mt-8 w-full p-5 text-left">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Order ID</p>
            <p className="mt-0.5 font-mono text-sm font-bold text-foreground">{orderId}</p>
          </div>
          <PackageCheck className="size-8 text-primary" />
        </div>
        {order && (
          <dl className="mt-4 space-y-1.5 border-t border-border pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Items</dt>
              <dd className="font-medium text-foreground">{order.items.length}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Payment</dt>
              <dd className="font-medium text-foreground">{order.payment.label}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Delivering to</dt>
              <dd className="font-medium text-foreground">
                {order.address.city}, {order.address.pincode}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Total paid</dt>
              <dd className="font-bold text-foreground">{formatCurrency(order.pricing.total)}</dd>
            </div>
          </dl>
        )}
      </Card>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link to={order ? ROUTES.order(order.id) : ROUTES.orders}>
          <Button variant="outline">Track order</Button>
        </Link>
        <Link to={ROUTES.home}>
          <Button>Continue shopping</Button>
        </Link>
      </div>
    </div>
  )
}
