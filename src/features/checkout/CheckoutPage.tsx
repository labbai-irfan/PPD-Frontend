import { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Banknote, Check, CreditCard, MapPin, Plus, ShieldCheck, ArrowLeft, Lock } from 'lucide-react'
import { toast } from 'sonner'
import { cn, formatCurrency } from '@/lib/utils'
import { ROUTES } from '@/lib/constants'
import { getCartTotals, useCartStore } from '@/store/cart.store'
import { useAddressStore } from '@/store/address.store'
import { useCheckoutStore } from '@/store/checkout.store'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { AddressForm } from '@/features/address/AddressForm'
import { apiClient } from '@/services/api/client'

type CheckoutMethod = 'online' | 'cod'

const paymentOptions: Array<{ method: CheckoutMethod; label: string; description: string; icon: typeof CreditCard }> = [
  { method: 'online', label: 'Online Payment', description: 'UPI, Cards, Netbanking & more via Razorpay', icon: CreditCard },
  { method: 'cod', label: 'Cash on Delivery', description: 'Pay in cash when your order arrives', icon: Banknote },
];

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
  const { items, coupon } = useCartStore()
  const baseTotals = getCartTotals(items, coupon)

  const { addresses, add, update, fetchAddresses, loaded } = useAddressStore()
  const startCheckout = useCheckoutStore((s) => s.start)

  useEffect(() => {
    if (!loaded) void fetchAddresses().catch(() => {})
  }, [loaded, fetchAddresses])

  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    () => addresses.find((a) => a.isDefault)?.id ?? addresses[0]?.id ?? null,
  )
  const [showAddressForm, setShowAddressForm] = useState(addresses.length === 0)
  const [editingAddress, setEditingAddress] = useState<any | null>(null)
  const [payment, setPayment] = useState<CheckoutMethod>('online')
  const [placing] = useState(false)

  if (items.length === 0) return <Navigate to={ROUTES.cart} replace />

  const selectedAddress = addresses.find((a) => a.id === selectedAddressId) ?? null

  const [customShippingFee, setCustomShippingFee] = useState<number | null>(null)

  const subtotal = baseTotals.subtotal
  const couponDiscount = baseTotals.couponDiscount
  const savings = baseTotals.savings
  const shipping = selectedAddress ? (customShippingFee !== null ? customShippingFee : baseTotals.shipping) : 0
  const total = Math.max(0, subtotal - couponDiscount + shipping)

  const totals = {
    subtotal,
    couponDiscount,
    savings,
    shipping,
    total,
  }

  useEffect(() => {
    if (!selectedAddress) {
      setCustomShippingFee(null)
      return
    }

    let active = true
    const fetchShipping = async () => {
      try {
        const { data } = await apiClient.post<{ charge: number }>('/delivery-charges/calculate', {
          country: selectedAddress.country,
          state: selectedAddress.state,
          city: selectedAddress.city,
          pincode: selectedAddress.pincode,
          subtotal: subtotal - couponDiscount,
        })
        if (active) {
          setCustomShippingFee(data.charge)
        }
      } catch (error) {
        console.error('Failed to calculate delivery charge', error)
      }
    }

    void fetchShipping()
    return () => {
      active = false
    }
  }, [selectedAddress, subtotal, couponDiscount])

  async function handlePlaceOrder() {
    if (!selectedAddress) {
      toast.error('Please select a delivery address')
      return
    }

    if (payment === 'cod') {
      toast.error('Cash on Delivery is not available now.');
      return;
    }

    // Online payment flow – always use the online method
    startCheckout({
      items,
      address: selectedAddress,
      method: 'upi', // default online method; user picks inside Razorpay/forms
      couponCode: coupon?.code,
      totals: {
        subtotal: totals.subtotal,
        couponDiscount: totals.couponDiscount,
        savings: totals.savings,
        shipping: totals.shipping,
        total: totals.total,
      },
    })
    navigate(ROUTES.checkoutPayment('upi'))
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex size-10 shrink-0 items-center justify-center rounded-full border border-border bg-background transition-colors hover:bg-muted hover:text-foreground group cursor-pointer"
        >
          <ArrowLeft className="size-5 text-muted-foreground transition-transform group-hover:-translate-x-0.5" />
          <span className="sr-only">Back to cart</span>
        </button>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Checkout</h1>
      </div>

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
                      'flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition-colors relative group',
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
                    <span className="min-w-0 flex-1 text-sm">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-foreground">{address.name}</span>
                        <Badge variant="secondary" className="capitalize">{address.type}</Badge>
                        {address.isDefault && <Badge>Default</Badge>}
                      </span>
                      <span className="mt-1 block break-words text-muted-foreground">
                        {address.line1}
                        {address.line2 ? `, ${address.line2}` : ''}, {address.city}, {address.state}, {address.country} — {address.pincode}
                      </span>
                      <span className="mt-0.5 block text-muted-foreground">Phone: +91 {address.phone}</span>
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        setEditingAddress(address)
                        setShowAddressForm(true)
                      }}
                      className="px-2.5 py-1.5 rounded-lg border border-border bg-card hover:bg-muted text-xs font-bold transition-colors cursor-pointer text-foreground shrink-0 self-center"
                    >
                      Edit
                    </button>
                  </label>
                ))}
              </div>
            )}

            {showAddressForm ? (
              <div className="mt-4 border-t border-border pt-4">
                <AddressForm
                  initial={editingAddress || undefined}
                  onSave={async (values) => {
                    if (editingAddress) {
                      await update(editingAddress.id, values)
                      setEditingAddress(null)
                    } else {
                      const created = await add(values)
                      setSelectedAddressId(created.id)
                    }
                    setShowAddressForm(false)
                    toast.success('Address saved')
                  }}
                  onCancel={() => {
                    setShowAddressForm(false)
                    setEditingAddress(null)
                  }}
                  submitLabel={editingAddress ? 'Update address' : 'Save address'}
                />
              </div>
            ) : (
              <Button variant="outline" size="sm" className="mt-4 w-full sm:w-auto" leftIcon={<Plus className="size-4" />} onClick={() => setShowAddressForm(true)}>
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
                      'flex items-center gap-3.5 rounded-xl border p-3.5 transition-colors',
                      // Highlight selected online option
                      payment === option.method && option.method !== 'cod'
                        ? 'border-primary bg-primary-soft/40'
                        : 'border-border hover:border-muted-foreground/40',
                      // Dim COD option to indicate unavailability
                      option.method === 'cod' ? 'opacity-50 cursor-not-allowed' : '',
                    )}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={payment === option.method}
                      disabled={option.method === 'cod'}
                      onChange={() => setPayment(option.method)}
                      className="size-4 accent-(--primary)"
                    />
                    <option.icon className="size-5 text-primary" />
                    <span className="text-sm flex flex-col">
                      <span className="flex items-center">
                        <span className="block font-semibold text-foreground">{option.label}</span>
                        {option.method === 'cod' && (
                          <>
                            <Lock className="ml-2 size-4 text-red-500" />
                            <span className="ml-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-600">
                              Not Available
                            </span>
                          </>
                        )}
                      </span>
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
                  <dt className="text-muted-foreground">Coupon ({coupon?.code})</dt>
                  <dd className="font-medium text-success">− {formatCurrency(totals.couponDiscount)}</dd>
                </div>
              )}
              {selectedAddress !== null && (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Delivery</dt>
                  <dd className={totals.shipping === 0 ? 'font-medium text-success' : 'font-medium text-foreground'}>
                    {totals.shipping === 0 ? 'FREE' : formatCurrency(totals.shipping)}
                  </dd>
                </div>
              )}
              <div className="flex justify-between border-t border-border pt-2.5 text-base font-bold text-foreground">
                <dt>Total payable</dt>
                <dd>{formatCurrency(totals.total)}</dd>
              </div>
            </dl>

            <Button size="lg" className="mt-4 w-full" loading={placing} onClick={handlePlaceOrder}>
               {placing
                 ? 'Processing…'
                 : `Continue to payment · ${formatCurrency(totals.total)}`}
            </Button>
             {payment !== 'cod' && (
               <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
                 <ShieldCheck className="size-3.5 text-success" />
                 100% secure payments
               </p>
             )}
             {/* COD not available */}
             <p className="mt-2 text-sm text-muted-foreground">Cash on Delivery is not available now.</p>
            <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
              <MapPin className="size-3.5" />
              {selectedAddress ? `Delivering to ${selectedAddress.city}, ${selectedAddress.state}, ${selectedAddress.country} — ${selectedAddress.pincode}` : 'Select a delivery address'}
            </p>
          </Card>
        </div>
      </div>
    </div>
  )
}
