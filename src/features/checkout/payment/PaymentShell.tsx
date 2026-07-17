import { useCallback, useState, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import { formatCurrency } from '@/lib/utils'
import { ROUTES } from '@/lib/constants'
import { useCartStore } from '@/store/cart.store'
import { useCheckoutStore, type CheckoutDraft } from '@/store/checkout.store'
import { useOrdersStore } from '@/store/orders.store'
import { getPaymentGateway, PaymentError, type PaymentDetails } from '@/services/payments'
import type { PaymentMethodKind } from '@/types'
import { Button, buttonVariants } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'

const METHOD_LABELS: Record<PaymentMethodKind, string> = {
  card: 'Credit / Debit Card',
  upi: 'UPI',
  netbanking: 'Net Banking',
  wallet: 'Wallet',
  cod: 'Cash on Delivery',
}

export interface PaymentFlow {
  draft: CheckoutDraft | null
  /** Total payable — draft?.totals.total ?? 0 */
  amount: number
  status: 'idle' | 'processing' | 'success' | 'failed'
  error: string | null
  pay: (details: PaymentDetails) => Promise<void>
  /** failed -> idle */
  reset: () => void
}

/**
 * Drives an online payment end-to-end: gateway pay -> place order ->
 * success redirect. Every payment page must guard with
 * `if (!flow.draft && flow.status !== 'success') return <Navigate to={ROUTES.checkout} replace />`.
 */
export function usePaymentFlow(): PaymentFlow {
  const navigate = useNavigate()
  const draft = useCheckoutStore((s) => s.draft)
  const clearCheckout = useCheckoutStore((s) => s.clear)
  const clearCart = useCartStore((s) => s.clear)
  const placeOrder = useOrdersStore((s) => s.placeOrder)

  const [status, setStatus] = useState<PaymentFlow['status']>('idle')
  const [error, setError] = useState<string | null>(null)

  const pay = useCallback(
    async (details: PaymentDetails) => {
      if (!draft) return
      setStatus('processing')
      setError(null)
      try {
        const gateway = await getPaymentGateway()
        const result = await gateway.pay({ details, items: draft.items, couponCode: draft.couponCode })

        const payment: { method: PaymentMethodKind; label: string; intentId?: string } = {
          method: draft.method,
          label: METHOD_LABELS[draft.method],
          intentId: result.intentId,
        }
        const order = await placeOrder({
          items: draft.items,
          address: draft.address,
          payment,
          pricing: {
            subtotal: draft.totals.subtotal,
            discount: draft.totals.savings,
            couponCode: draft.couponCode,
            shipping: draft.totals.shipping,
            total: draft.totals.total,
          },
          couponCode: draft.couponCode,
        })

        setStatus('success')
        navigate(ROUTES.checkoutSuccess(order.id), { replace: true })
        clearCart()
        clearCheckout()
      } catch (err) {
        // Closing the gateway window isn't a failure — return to the form quietly.
        if (err instanceof PaymentError && err.code === 'cancelled') {
          setStatus('idle')
          toast.info('Payment cancelled — you have not been charged.')
          return
        }
        setStatus('failed')
        setError(err instanceof Error ? err.message : 'Payment failed. Please try again.')
      }
    },
    [draft, navigate, placeOrder, clearCart, clearCheckout],
  )

  const reset = useCallback(() => {
    setStatus('idle')
    setError(null)
  }, [])

  return { draft, amount: draft?.totals.total ?? 0, status, error, pay, reset }
}

export function PaymentShell({
  flow,
  title,
  subtitle,
  processingMessage,
  children,
}: {
  flow: PaymentFlow
  title: string
  subtitle?: string
  processingMessage?: string
  children: ReactNode
}) {
  const { draft, status, error } = flow

  // Pages guard against a missing draft; this covers the brief
  // success transition after the stores are cleared.
  if (!draft) return null

  const { totals } = draft

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-x-6 gap-y-4">
        <div className="flex items-start gap-4">
          <Link
            to={ROUTES.checkout}
            className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-full border border-border bg-background transition-colors hover:bg-muted group"
          >
            <ArrowLeft className="size-5 text-muted-foreground transition-transform group-hover:-translate-x-0.5" />
            <span className="sr-only">Back to checkout</span>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
            {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Amount payable{' '}
          <span className="ml-1 text-lg font-bold text-foreground">{formatCurrency(flow.amount)}</span>
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div>
          {status === 'failed' ? (
            <Card className="flex flex-col items-center p-8 text-center">
              <XCircle className="size-12 text-destructive" />
              <h2 className="mt-4 text-lg font-bold text-foreground">Payment failed</h2>
              <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
                {error ?? 'Something went wrong while processing your payment.'}
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Button onClick={flow.reset}>Try again</Button>
                <Link to={ROUTES.checkout} className={buttonVariants({ variant: 'outline' })}>
                  Choose another method
                </Link>
              </div>
            </Card>
          ) : (
            children
          )}
        </div>

        {/* Order summary */}
        <div className="h-fit space-y-4 lg:sticky lg:top-[calc(var(--header-h)+1rem)]">
          <Card className="p-4">
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-muted-foreground">
              Order summary ({draft.items.length} {draft.items.length === 1 ? 'item' : 'items'})
            </h2>
            <ul className="mb-4 space-y-3">
              {draft.items.map((item) => (
                <li key={item.key} className="flex items-center gap-3">
                  <img src={item.image} alt={item.title} className="size-12 shrink-0 rounded-lg object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium text-foreground">{item.title}</p>
                    <p className="text-xs text-muted-foreground">Qty {item.quantity}</p>
                  </div>
                  <p className="text-xs font-bold text-foreground">{formatCurrency(item.price * item.quantity)}</p>
                </li>
              ))}
            </ul>

            <dl className="space-y-2 border-t border-border pt-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd className="font-medium text-foreground">{formatCurrency(totals.subtotal)}</dd>
              </div>
              {totals.couponDiscount > 0 && (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Coupon{draft.couponCode ? ` (${draft.couponCode})` : ''}</dt>
                  <dd className="font-medium text-success">− {formatCurrency(totals.couponDiscount)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Delivery</dt>
                <dd className={totals.shipping === 0 ? 'font-medium text-success' : 'font-medium text-foreground'}>
                  {totals.shipping === 0 ? 'FREE' : formatCurrency(totals.shipping)}
                </dd>
              </div>
              <div className="flex justify-between border-t border-border pt-2.5 text-base font-bold text-foreground">
                <dt>Total payable</dt>
                <dd>{formatCurrency(totals.total)}</dd>
              </div>
            </dl>
          </Card>
        </div>
      </div>

      {status === 'processing' && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-3 bg-background/80 backdrop-blur">
          <Spinner className="size-9 text-primary" />
          <p className="text-sm font-semibold text-foreground">{processingMessage ?? 'Processing your payment…'}</p>
          <p className="text-xs text-muted-foreground">Do not press back or refresh</p>
        </div>
      )}
    </div>
  )
}
