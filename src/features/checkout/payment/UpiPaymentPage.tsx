import { useRef, useState, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { AtSign, Smartphone } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { ROUTES } from '@/lib/constants'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { PaymentShell, usePaymentFlow } from '@/features/checkout/payment/PaymentShell'

const VPA_PATTERN = /^[a-zA-Z0-9._-]{2,256}@[a-zA-Z]{2,64}$/
const VPA_ERROR = 'Enter a valid UPI ID (e.g. name@okhdfcbank)'
const QUICK_HANDLES = ['@ybl', '@okaxis', '@oksbi', '@okhdfcbank', '@paytm', '@ibl']
const POPULAR_APPS = ['GPay', 'PhonePe', 'Paytm', 'BHIM']

export default function UpiPaymentPage() {
  const flow = usePaymentFlow()
  const inputRef = useRef<HTMLInputElement>(null)
  const [vpa, setVpa] = useState('')
  const [error, setError] = useState<string | null>(null)

  if (!flow.draft && flow.status !== 'success') return <Navigate to={ROUTES.checkout} replace />

  function applyHandle(handle: string) {
    setVpa((current) => {
      const atIndex = current.indexOf('@')
      const name = atIndex === -1 ? current.trim() : current.slice(0, atIndex).trim()
      return name + handle
    })
    setError(null)
    inputRef.current?.focus()
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const value = vpa.trim()
    if (!VPA_PATTERN.test(value)) {
      setError(VPA_ERROR)
      inputRef.current?.focus()
      return
    }
    setError(null)
    void flow.pay({ method: 'upi', vpa: value })
  }

  return (
    <PaymentShell
      flow={flow}
      title="Pay via UPI"
      subtitle="Enter your UPI ID and approve the request in your UPI app"
      processingMessage="Payment request sent — approve it in your UPI app…"
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <Card className="p-4 sm:p-5">
          <Input
            ref={inputRef}
            label="UPI ID"
            placeholder="yourname@bank"
            leftIcon={<AtSign className="size-4" />}
            value={vpa}
            onChange={(e) => {
              setVpa(e.target.value)
              if (error) setError(null)
            }}
            error={error ?? undefined}
            hint="Also called a VPA — find it in your UPI app"
            autoComplete="off"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
          />

          <div className="mt-3 flex flex-wrap gap-2">
            {QUICK_HANDLES.map((handle) => (
              <button
                key={handle}
                type="button"
                onClick={() => applyHandle(handle)}
                className="cursor-pointer rounded-full border border-border bg-card px-3.5 py-2.5 min-h-11 text-xs font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary"
              >
                {handle}
              </button>
            ))}
          </div>

          <div className="mt-5 border-t border-border pt-4">
            <p className="mb-2.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">Popular UPI apps</p>
            <div className="flex flex-wrap gap-2">
              {POPULAR_APPS.map((app) => (
                <button
                  key={app}
                  type="button"
                  onClick={() => inputRef.current?.focus()}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2.5 min-h-11 text-xs font-semibold text-foreground transition-colors hover:border-primary"
                >
                  <Smartphone className="size-3.5 text-primary" />
                  {app}
                </button>
              ))}
            </div>
          </div>
        </Card>

        <Button type="submit" size="lg" className="w-full" loading={flow.status === 'processing'}>
          Pay {formatCurrency(flow.amount)}
        </Button>

        <Card className="border-dashed bg-muted/40 p-3.5 shadow-none">
          <p className="text-xs text-muted-foreground">
            Test mode — any valid UPI ID works. Use{' '}
            <span className="font-semibold text-foreground">fail@upi</span> to simulate a declined payment.
          </p>
        </Card>
      </form>
    </PaymentShell>
  )
}
