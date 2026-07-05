import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Banknote, Check, CreditCard, MapPin, Plus, Smartphone, Wallet } from 'lucide-react'
import { toast } from 'sonner'
import { cn, formatCurrency } from '@/lib/utils'
import { ROUTES } from '@/lib/constants'
import { getCartTotals, useCartStore } from '@/store/cart.store'
import { useAddressStore } from '@/store/address.store'
import { useOrdersStore } from '@/store/orders.store'
import type { PaymentMethodKind } from '@/types'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { AddressForm } from '@/features/address/AddressForm'

const paymentOptions: Array<{ method: PaymentMethodKind; label: string; description: string; icon: typeof Wallet }> = [
  { method: 'upi', label: 'UPI', description: 'Google Pay, PhonePe, Paytm & more', icon: Smartphone },
  { method: 'card', label: 'Credit / Debit Card', description: 'Visa, Mastercard, RuPay, Amex', icon: CreditCard },
  { method: 'wallet', label: 'Wallet', description: 'Pay with Shopora wallet balance', icon: Wallet },
  { method: 'cod', label: 'Cash on Delivery', description: 'Pay when your order arrives', icon: Banknote },
]

function StepHeading({ step, title, done }: { step: number; title: string; done?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <span
        className={cn(
          'flex size-7 items-center justify-center rounded-full text-xs font-bold',
          done ? 'bg-success text-success-foreground' : 'bg-primary text-primary-foreground',
        )}
      >
        {done ? <Check className="size-4" /> : step}
      </span>
      <h2 className="text-base font-bold text-foreground">{title}</h2>
    </div>
  )
}

export default function CheckoutPage() {
  const navigate = useNavigate()
  const { items, coupon, clear } = useCartStore()
  const totals = getCartTotals(items, coupon)

  const { addresses, add } = useAddressStore()
  const placeOrder = useOrdersStore((s) => s.placeOrder)

  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    () => addresses.find((a) => a.isDefault)?.id ?? addresses[0]?.id ?? null,
  )
  const [showAddressForm, setShowAddressForm] = useState(addresses.length === 0)
  const [payment, setPayment] = useState<PaymentMethodKind>('upi')
  const [placing, setPlacing] = useState(false)

  if (items.length === 0) return <Navigate to={ROUTES.cart} replace />

  const selectedAddress = addresses.find((a) => a.id === selectedAddressId) ?? null

  async function handlePlaceOrder() {
    if (!selectedAddress) {
      toast.error('Please select a delivery address')
      return
    }
    setPlacing(true)
    await new Promise((r) => setTimeout(r, 900)) // simulate payment processing
    const paymentLabel = paymentOptions.find((p) => p.method === payment)?.label ?? payment
    const order = placeOrder({
      items,
      address: selectedAddress,
      payment: { method: payment, label: paymentLabel },
      pricing: {
        subtotal: totals.subtotal,
        discount: totals.savings,
        couponCode: coupon?.code,
        shipping: totals.shipping,
        total: totals.total,
      },
    })
    clear()
    navigate(ROUTES.checkoutSuccess(order.id), { replace: true })
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold tracking-tight text-foreground">Checkout</h1>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          {/* Step 1 — Address */}
          <Card className="p-4 sm:p-5">
            <StepHeading step={1} title="Delivery address" done={Boolean(selectedAddress) && !showAddressForm} />

            {addresses.length > 0 && (
              <div className="mt-4 space-y-2.5">
                {addresses.map((address) => (
                  <label
                    key={address.id}
                    className={cn(
                      'flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition-colors',
                      selectedAddressId === address.id ? 'border-primary bg-primary-soft/40' : 'border-border hover:border-muted-foreground/40',
                    )}
                  >
                    <input
                      type="radio"
                      name="address"
                      checked={selectedAddressId === address.id}
                      onChange={() => setSelectedAddressId(address.id)}
                      className="mt-1 size-4 accent-(--primary)"
                    />
                    <span className="min-w-0 text-sm">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-foreground">{address.name}</span>
                        <Badge variant="secondary" className="capitalize">{address.type}</Badge>
                        {address.isDefault && <Badge>Default</Badge>}
                      </span>
                      <span className="mt-1 block text-muted-foreground">
                        {address.line1}
                        {address.line2 ? `, ${address.line2}` : ''}, {address.city}, {address.state} — {address.pincode}
                      </span>
                      <span className="mt-0.5 block text-muted-foreground">Phone: {address.phone}</span>
                    </span>
                  </label>
                ))}
              </div>
            )}

            {showAddressForm ? (
              <div className="mt-4 border-t border-border pt-4">
                <AddressForm
                  onSave={(values) => {
                    const created = add(values)
                    setSelectedAddressId(created.id)
                    setShowAddressForm(false)
                    toast.success('Address saved')
                  }}
                  onCancel={addresses.length > 0 ? () => setShowAddressForm(false) : undefined}
                />
              </div>
            ) : (
              <Button variant="outline" size="sm" className="mt-4" leftIcon={<Plus className="size-4" />} onClick={() => setShowAddressForm(true)}>
                Add new address
              </Button>
            )}
          </Card>

          {/* Step 2 — Payment */}
          <Card className="p-4 sm:p-5">
            <StepHeading step={2} title="Payment method" />
            <div className="mt-4 space-y-2.5">
              {paymentOptions.map((option) => (
                <label
                  key={option.method}
                  className={cn(
                    'flex cursor-pointer items-center gap-3.5 rounded-xl border p-3.5 transition-colors',
                    payment === option.method ? 'border-primary bg-primary-soft/40' : 'border-border hover:border-muted-foreground/40',
                  )}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={payment === option.method}
                    onChange={() => setPayment(option.method)}
                    className="size-4 accent-(--primary)"
                  />
                  <option.icon className="size-5 text-primary" />
                  <span className="text-sm">
                    <span className="block font-semibold text-foreground">{option.label}</span>
                    <span className="text-muted-foreground">{option.description}</span>
                  </span>
                </label>
              ))}
            </div>
          </Card>
        </div>

        {/* Order summary */}
        <div className="h-fit space-y-4 lg:sticky lg:top-[calc(var(--header-h)+1rem)]">
          <Card className="p-4">
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-muted-foreground">
              Order summary ({items.length} {items.length === 1 ? 'item' : 'items'})
            </h2>
            <ul className="mb-4 space-y-3">
              {items.map((item) => (
                <li key={item.key} className="flex items-center gap-3">
                  <img src={item.image} alt="" className="size-12 shrink-0 rounded-lg object-cover" />
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
                  <dt className="text-muted-foreground">Coupon ({coupon?.code})</dt>
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

            <Button size="lg" className="mt-4 w-full" loading={placing} onClick={handlePlaceOrder}>
              {placing ? 'Processing…' : `Place order · ${formatCurrency(totals.total)}`}
            </Button>
            <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
              <MapPin className="size-3.5" />
              {selectedAddress ? `Delivering to ${selectedAddress.city}, ${selectedAddress.pincode}` : 'Select a delivery address'}
            </p>
          </Card>
        </div>
      </div>
    </div>
  )
}
