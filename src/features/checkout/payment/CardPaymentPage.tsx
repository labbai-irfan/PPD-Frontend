import { useState, type ChangeEvent, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { CreditCard, Lock, ShieldCheck } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { ROUTES } from '@/lib/constants'
import { cvvLength, detectCardBrand, expiryValid, formatCardNumber, luhnValid, parseExpiry } from '@/lib/card'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { PaymentShell, usePaymentFlow } from '@/features/checkout/payment/PaymentShell'

type Field = 'number' | 'name' | 'expiry' | 'cvv'

export default function CardPaymentPage() {
  const flow = usePaymentFlow()
  const [number, setNumber] = useState('')
  const [name, setName] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvv, setCvv] = useState('')
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({})

  if (!flow.draft && flow.status !== 'success') return <Navigate to={ROUTES.checkout} replace />

  const digits = number.replace(/\D/g, '')
  const brand = detectCardBrand(digits)
  const requiredLength = brand === 'amex' ? 15 : 16
  const cvvLen = cvvLength(brand)

  const errors: Partial<Record<Field, string>> = {}
  if (digits.length === 0) errors.number = 'Enter your card number'
  else if (digits.length < requiredLength) errors.number = 'Card number is incomplete'
  else if (!luhnValid(digits)) errors.number = 'This card number looks invalid — check and try again'
  if (name.trim().length < 2) errors.name = 'Enter the name on the card'
  const parsedExpiry = parseExpiry(expiry)
  if (!parsedExpiry || parsedExpiry.month < 1 || parsedExpiry.month > 12) errors.expiry = 'Enter a valid expiry (MM/YY)'
  else if (!expiryValid(expiry)) errors.expiry = 'This card has expired'
  if (cvv.length !== cvvLen) errors.cvv = `Enter the ${cvvLen}-digit CVV`

  const formValid = Object.keys(errors).length === 0

  function markTouched(field: Field) {
    setTouched((current) => ({ ...current, [field]: true }))
  }

  function visibleError(field: Field) {
    return touched[field] ? errors[field] : undefined
  }

  function handleNumberChange(e: ChangeEvent<HTMLInputElement>) {
    const nextDigits = e.target.value.replace(/\D/g, '')
    setNumber(formatCardNumber(nextDigits, detectCardBrand(nextDigits)))
  }

  function handleExpiryChange(e: ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value
    const nextDigits = raw.replace(/\D/g, '').slice(0, 4)
    if (nextDigits.length >= 3) setExpiry(`${nextDigits.slice(0, 2)}/${nextDigits.slice(2)}`)
    else if (nextDigits.length === 2 && raw.length > expiry.length) setExpiry(`${nextDigits}/`)
    else setExpiry(nextDigits)
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setTouched({ number: true, name: true, expiry: true, cvv: true })
    if (!formValid) return
    void flow.pay({ method: 'card', card: { number: digits, name: name.trim(), expiry, cvv } })
  }

  return (
    <PaymentShell
      flow={flow}
      title="Pay by card"
      subtitle="We accept Visa, Mastercard, RuPay, Amex and Discover"
      processingMessage="Contacting your bank…"
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <Card className="space-y-4 p-4 sm:p-5">
          <Input
            label="Card number"
            placeholder="1234 5678 9012 3456"
            leftIcon={<CreditCard className="size-4" />}
            rightSlot={
              brand !== 'unknown' ? (
                <span className="pr-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{brand}</span>
              ) : undefined
            }
            className={brand !== 'unknown' ? 'pr-24' : undefined}
            inputMode="numeric"
            autoComplete="cc-number"
            maxLength={19}
            value={number}
            onChange={handleNumberChange}
            onBlur={() => markTouched('number')}
            error={visibleError('number')}
          />
          <Input
            label="Name on card"
            placeholder="Name as printed on the card"
            autoComplete="cc-name"
            value={name}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
            onBlur={() => markTouched('name')}
            error={visibleError('name')}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Expiry"
              placeholder="MM/YY"
              inputMode="numeric"
              autoComplete="cc-exp"
              maxLength={5}
              value={expiry}
              onChange={handleExpiryChange}
              onBlur={() => markTouched('expiry')}
              error={visibleError('expiry')}
            />
            <Input
              label="CVV"
              type="password"
              digitsOnly
              placeholder={'•'.repeat(cvvLen)}
              autoComplete="cc-csc"
              maxLength={cvvLen}
              rightSlot={<Lock className="mr-1.5 size-4 text-muted-foreground" />}
              value={cvv}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setCvv(e.target.value)}
              onBlur={() => markTouched('cvv')}
              error={visibleError('cvv')}
            />
          </div>
        </Card>

        <Button type="submit" size="lg" className="w-full" disabled={!formValid} loading={flow.status === 'processing'}>
          Pay {formatCurrency(flow.amount)}
        </Button>

        <Card className="border-dashed bg-muted/40 p-3.5 shadow-none">
          <p className="text-xs text-muted-foreground">
            Test mode — any valid-looking card works. Use a card ending in{' '}
            <span className="font-semibold text-foreground">0002</span> to simulate a decline.
          </p>
        </Card>

        <p className="flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
          <ShieldCheck className="size-4 shrink-0 text-success" />
          Your card details are encrypted and never stored on our servers.
        </p>
      </form>
    </PaymentShell>
  )
}
