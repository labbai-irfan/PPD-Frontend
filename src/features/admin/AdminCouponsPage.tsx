import { useEffect, useState } from 'react'
import { Plus, Copy, Trash2, X } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { apiClient } from '@/services/api/client'

interface AdminCoupon {
  id: string
  code: string
  kind: 'flat' | 'percent'
  value: number
  minOrder: number
  maxDiscount: number | null
  expiresAt: string
  usedCount: number
  status: 'active' | 'inactive' | 'expired'
}

const emptyForm = { code: '', kind: 'flat' as 'flat' | 'percent', value: '', minOrder: '0', expiresAt: '' }

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<AdminCoupon[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)

  const load = () =>
    apiClient
      .get<AdminCoupon[]>('/admin/coupons')
      .then((r) => setCoupons(r.data))
      .catch((e: Error) => toast.error(e.message))

  useEffect(() => {
    void load()
  }, [])

  const handleCreate = async () => {
    if (!form.code || !form.value || !form.expiresAt) {
      toast.error('Code, discount value and expiry are required')
      return
    }
    try {
      await apiClient.post('/admin/coupons', {
        code: form.code,
        kind: form.kind,
        value: Number(form.value),
        minOrder: Number(form.minOrder) || 0,
        expiresAt: new Date(form.expiresAt).toISOString(),
      })
      toast.success('Coupon created')
      setForm(emptyForm)
      setShowForm(false)
      void load()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Create failed')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await apiClient.delete(`/admin/coupons/${id}`)
      setCoupons((prev) => prev.filter((c) => c.id !== id))
      toast.success('Coupon deleted')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Delete failed')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Coupons</h1>
          <p className="text-sm text-muted-foreground mt-1">{coupons.length} coupons</p>
        </div>
        <Button onClick={() => setShowForm((v) => !v)} className="gap-2 w-full sm:w-auto">
          {showForm ? <X className="size-4" /> : <Plus className="size-4" />}
          {showForm ? 'Close' : 'Create Coupon'}
        </Button>
      </div>

      {showForm && (
        <Card className="p-3 md:p-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input label="Code" placeholder="SUMMER20" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} />
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Type</label>
              <select
                value={form.kind}
                onChange={(e) => setForm({ ...form, kind: e.target.value as 'flat' | 'percent' })}
                className="w-full px-3 py-2 border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="flat">Flat (₹)</option>
                <option value="percent">Percent (%)</option>
              </select>
            </div>
            <Input label={form.kind === 'flat' ? 'Discount (₹)' : 'Discount (%)'} type="number" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} />
            <Input label="Min Order (₹)" type="number" value={form.minOrder} onChange={(e) => setForm({ ...form, minOrder: e.target.value })} />
            <Input label="Expires On" type="date" value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} />
          </div>
          <Button onClick={() => void handleCreate()} className="w-full">Create Coupon</Button>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
        {coupons.map((coupon) => (
          <Card key={coupon.id} className="p-3 md:p-4">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <code className="bg-muted px-2 py-1 rounded font-mono text-sm font-bold text-primary">{coupon.code}</code>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    coupon.status === 'active' ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'
                  }`}>
                    {coupon.status}
                  </span>
                </div>
                <div className="space-y-1 text-sm">
                  <p className="text-foreground">
                    Discount: <span className="font-semibold">{coupon.kind === 'percent' ? `${coupon.value}%` : `₹${coupon.value}`}</span>
                    {coupon.maxDiscount ? <span className="text-xs text-muted-foreground"> (max ₹{coupon.maxDiscount})</span> : null}
                  </p>
                  <p className="text-muted-foreground text-xs">Min order: ₹{coupon.minOrder}</p>
                  <p className="text-muted-foreground text-xs">Expires: {new Date(coupon.expiresAt).toLocaleDateString('en-IN')}</p>
                  <p className="text-muted-foreground text-xs">Used: {coupon.usedCount} times</p>
                </div>
              </div>
              <div className="flex gap-2 shrink-0 sm:flex-col">
                <button
                  onClick={() => { void navigator.clipboard.writeText(coupon.code); toast.success('Code copied!') }}
                  className="p-2.5 hover:bg-primary/10 rounded-lg text-primary touch-target"
                >
                  <Copy className="size-4" />
                </button>
                <button onClick={() => void handleDelete(coupon.id)} className="p-2.5 hover:bg-destructive/10 rounded-lg text-destructive touch-target">
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
