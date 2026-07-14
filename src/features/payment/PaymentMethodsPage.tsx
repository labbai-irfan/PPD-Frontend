import { useEffect, useState } from 'react'
import { Plus, Trash2, CreditCard, Smartphone, Wallet, X } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { apiClient } from '@/services/api/client'

interface ApiPaymentMethod {
  id: string
  type: 'card' | 'upi' | 'wallet'
  brand: string
  last4: string
  expiry: string
  upiId: string
  isDefault: boolean
}

const emptyForm = { type: 'card' as 'card' | 'upi' | 'wallet', brand: '', last4: '', expiry: '', upiId: '' }

export default function PaymentMethodsPage() {
  const [methods, setMethods] = useState<ApiPaymentMethod[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)

  const load = () =>
    apiClient
      .get<ApiPaymentMethod[]>('/payment-methods')
      .then((r) => setMethods(r.data))
      .catch((e: Error) => toast.error(e.message))

  useEffect(() => {
    void load()
  }, [])

  async function handleAdd() {
    if (form.type === 'card' && (!form.last4 || !form.brand)) {
      toast.error('Card brand and last 4 digits are required')
      return
    }
    if (form.type === 'upi' && !form.upiId) {
      toast.error('UPI ID is required')
      return
    }
    try {
      await apiClient.post('/payment-methods', form)
      toast.success('Payment method saved')
      setForm(emptyForm)
      setShowForm(false)
      void load()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Save failed')
    }
  }

  async function handleDelete(id: string) {
    try {
      await apiClient.delete(`/payment-methods/${id}`)
      setMethods((prev) => prev.filter((m) => m.id !== id))
      toast.success('Payment method removed')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Delete failed')
    }
  }

  async function handleSetDefault(id: string) {
    try {
      await apiClient.post(`/payment-methods/${id}/default`)
      void load()
      toast.success('Default payment method updated')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Update failed')
    }
  }

  const iconFor = (type: string) =>
    type === 'upi' ? <Smartphone className="size-5" /> : type === 'wallet' ? <Wallet className="size-5" /> : <CreditCard className="size-5" />

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-foreground">Payment Methods</h1>
        <Button onClick={() => setShowForm((v) => !v)} className="gap-2 w-full sm:w-auto">
          {showForm ? <X className="size-4" /> : <Plus className="size-4" />}
          {showForm ? 'Close' : 'Add'}
        </Button>
      </div>

      {showForm && (
        <Card className="p-4 space-y-3">
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">Type</label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value as typeof form.type })}
              className="w-full h-11 px-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="card">Card</option>
              <option value="upi">UPI</option>
              <option value="wallet">Wallet</option>
            </select>
          </div>
          {form.type === 'card' && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Input label="Brand" placeholder="Visa" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} />
              <Input label="Last 4" digitsOnly placeholder="4242" maxLength={4} value={form.last4} onChange={(e) => setForm({ ...form, last4: e.target.value })} />
              <Input label="Expiry" placeholder="12/27" value={form.expiry} onChange={(e) => setForm({ ...form, expiry: e.target.value })} />
            </div>
          )}
          {form.type === 'upi' && (
            <Input label="UPI ID" placeholder="name@okbank" value={form.upiId} onChange={(e) => setForm({ ...form, upiId: e.target.value })} />
          )}
          {form.type === 'wallet' && (
            <Input label="Wallet Name" placeholder="Paytm" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} />
          )}
          <Button onClick={() => void handleAdd()} className="w-full">Save</Button>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 items-start">
        {methods.map((m) => (
          <Card key={m.id} className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="p-2 bg-primary/10 rounded-lg text-primary shrink-0">{iconFor(m.type)}</div>
              <div className="min-w-0">
                <p className="font-semibold text-foreground truncate">
                  {m.type === 'upi' ? m.upiId : m.type === 'wallet' ? `${m.brand} Wallet` : `${m.brand} •••• ${m.last4}`}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  {m.expiry && <span className="text-xs text-muted-foreground">Expires {m.expiry}</span>}
                  {m.isDefault ? (
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded font-semibold">Default</span>
                  ) : (
                    <button onClick={() => void handleSetDefault(m.id)} className="inline-flex min-h-11 items-center py-2 -my-2 text-xs font-semibold text-primary hover:text-primary/80">
                      Set default
                    </button>
                  )}
                </div>
              </div>
            </div>
            <button onClick={() => void handleDelete(m.id)} className="p-3 shrink-0 hover:bg-destructive/10 rounded-lg text-destructive">
              <Trash2 className="size-5" />
            </button>
          </Card>
        ))}
        {methods.length === 0 && !showForm && (
          <Card className="p-8 text-center text-muted-foreground sm:col-span-2">No saved payment methods</Card>
        )}
      </div>
    </div>
  )
}
