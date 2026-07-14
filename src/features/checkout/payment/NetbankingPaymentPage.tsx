import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Landmark } from 'lucide-react'
import { cn, formatCurrency } from '@/lib/utils'
import { ROUTES } from '@/lib/constants'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { PaymentShell, usePaymentFlow } from '@/features/checkout/payment/PaymentShell'

const popularBanks = [
  'State Bank of India',
  'HDFC Bank',
  'ICICI Bank',
  'Axis Bank',
  'Kotak Mahindra Bank',
  'Punjab National Bank',
]

const otherBanks = [
  'Bank of Baroda',
  'Bank of India',
  'Bank of Maharashtra',
  'Canara Bank',
  'Central Bank of India',
  'Federal Bank',
  'IDBI Bank',
  'IDFC First Bank',
  'Indian Bank',
  'Indian Overseas Bank',
  'IndusInd Bank',
  'Karnataka Bank',
  'RBL Bank',
  'South Indian Bank',
  'Union Bank of India',
  'Yes Bank',
]

export default function NetbankingPaymentPage() {
  const flow = usePaymentFlow()
  const [bank, setBank] = useState('')

  if (!flow.draft && flow.status !== 'success') return <Navigate to={ROUTES.checkout} replace />

  // A single `bank` value keeps the tiles and the dropdown mutually exclusive:
  // picking a tile makes the select value '', picking from the select deselects tiles.
  const selectValue = otherBanks.includes(bank) ? bank : ''

  return (
    <PaymentShell
      flow={flow}
      title="Pay via netbanking"
      subtitle="Choose your bank to continue"
      processingMessage="Redirecting to your bank…"
    >
      <div className="space-y-4">
        <Card className="p-4 sm:p-5">
          <h2 className="text-sm font-bold text-foreground">Popular banks</h2>
          <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            {popularBanks.map((name) => (
              <button
                key={name}
                type="button"
                aria-pressed={bank === name}
                onClick={() => setBank(name)}
                className={cn(
                  'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border p-3.5 text-center transition-colors',
                  bank === name ? 'border-primary bg-primary-soft/40' : 'border-border hover:border-muted-foreground/40',
                )}
              >
                <Landmark className="size-5 text-primary" />
                <span className="text-xs font-semibold text-foreground">{name}</span>
              </button>
            ))}
          </div>

          <div className="mt-5">
            <label htmlFor="netbanking-all-banks" className="mb-2 block text-sm font-semibold text-foreground">
              All banks
            </label>
            <select
              id="netbanking-all-banks"
              value={selectValue}
              onChange={(e) => setBank(e.target.value)}
              className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Select your bank</option>
              {otherBanks.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          <Button
            size="lg"
            className="mt-5 w-full"
            disabled={!bank}
            onClick={() => void flow.pay({ method: 'netbanking', bank })}
          >
            Pay {formatCurrency(flow.amount)}
          </Button>
        </Card>

        <Card className="p-3.5 text-center text-xs text-muted-foreground">
          Test mode — any bank completes instantly.
        </Card>
      </div>
    </PaymentShell>
  )
}
