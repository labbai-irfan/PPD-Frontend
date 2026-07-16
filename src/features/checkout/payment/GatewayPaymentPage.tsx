import { Navigate } from 'react-router-dom'
import { CreditCard, Landmark, Lock, ShieldCheck, Smartphone } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { ROUTES } from '@/lib/constants'
import type { OnlineMethod } from '@/services/payments'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { PaymentShell, usePaymentFlow } from '@/features/checkout/payment/PaymentShell'

const METHOD_COPY: Record<OnlineMethod, { title: string; subtitle: string; icon: typeof Smartphone }> = {
  upi: {
    title: 'Pay via UPI',
    subtitle: 'Google Pay, PhonePe, Paytm, BHIM and any UPI app',
    icon: Smartphone,
  },
  card: {
    title: 'Pay by card',
    subtitle: 'Visa, Mastercard, RuPay and Amex — entered in the secure gateway',
    icon: CreditCard,
  },
  netbanking: {
    title: 'Pay via netbanking',
    subtitle: 'All major Indian banks',
    icon: Landmark,
  },
}

/**
 * Payment page used when the Razorpay provider is active: instead of our own
 * instrument forms, the shopper completes the payment inside Razorpay's
 * hosted checkout (PCI-compliant — card/UPI details never touch our code).
 */
export default function GatewayPaymentPage() {
  const flow = usePaymentFlow()

  if (!flow.draft && flow.status !== 'success') return <Navigate to={ROUTES.checkout} replace />
  if (!flow.draft) return null

  const method = flow.draft.method
  if (method !== 'upi' && method !== 'card' && method !== 'netbanking') {
    return <Navigate to={ROUTES.checkout} replace />
  }

  const copy = METHOD_COPY[method]
  const Icon = copy.icon

  return (
    <PaymentShell
      flow={flow}
      title={copy.title}
      subtitle={copy.subtitle}
      processingMessage="Complete the payment in the secure window…"
    >
      <div className="space-y-5">
        <Card className="p-4 sm:p-6">
          <div className="flex items-start gap-4">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
              <Icon className="size-5" />
            </span>
            <div className="min-w-0">
              <h2 className="text-base font-bold text-foreground">Secure checkout via Razorpay</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                A secure payment window will open where you can finish paying with{' '}
                {method === 'upi' ? 'your UPI app or UPI ID' : method === 'card' ? 'your card' : 'your bank account'}.
                Your payment details are handled entirely by Razorpay and never reach our servers.
              </p>
            </div>
          </div>

          <ol className="mt-5 space-y-2.5 border-t border-border pt-4 text-sm text-muted-foreground">
            <li className="flex items-center gap-2.5">
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-muted text-[11px] font-bold text-foreground">1</span>
              The secure Razorpay window opens
            </li>
            <li className="flex items-center gap-2.5">
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-muted text-[11px] font-bold text-foreground">2</span>
              Complete the payment of {formatCurrency(flow.amount)}
            </li>
            <li className="flex items-center gap-2.5">
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-muted text-[11px] font-bold text-foreground">3</span>
              We confirm it and place your order instantly
            </li>
          </ol>
        </Card>

        <Button
          size="lg"
          className="w-full"
          leftIcon={<Lock className="size-4" />}
          loading={flow.status === 'processing'}
          onClick={() => void flow.pay({ method, gateway: true })}
        >
          Pay {formatCurrency(flow.amount)} securely
        </Button>

        <p className="flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
          <ShieldCheck className="size-4 shrink-0 text-success" />
          256-bit encrypted · PCI DSS compliant · You can cancel anytime before paying
        </p>
      </div>
    </PaymentShell>
  )
}
