import { useEffect, useState } from 'react'
import { Plus, Trash2, Search, MapPin } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { LocationPicker } from '@/components/location/LocationPicker'
import { apiClient } from '@/services/api/client'

interface DeliveryChargeRule {
  id: string
  country: string
  state: string
  city: string
  pincode: string
  charge: number
  createdAt: string
}

interface FormState {
  country: string
  state: string
  city: string
  pincode: string
  charge: string
}

const initialForm: FormState = {
  country: 'India',
  state: '',
  city: '',
  pincode: '',
  charge: '',
}

function locationFromForm(form: FormState) {
  return {
    country: form.country,
    state: form.state,
    city: form.city,
    pincode: form.pincode,
  }
}

export default function AdminDeliveryChargesPage() {
  const [rules, setRules] = useState<DeliveryChargeRule[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [form, setForm] = useState<FormState>(initialForm)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    try {
      const { data } = await apiClient.get<DeliveryChargeRule[]>('/admin/delivery-charges')
      setRules(data)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load rules')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this delivery charge rule?')) return
    try {
      await apiClient.delete(`/admin/delivery-charges/${id}`)
      setRules((prev) => prev.filter((r) => r.id !== id))
      toast.success('Delivery charge rule deleted')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Delete failed')
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.country.trim()) {
      toast.error('Country is required')
      return
    }
    const chargeVal = parseFloat(form.charge)
    if (isNaN(chargeVal) || chargeVal < 0) {
      toast.error('Please enter a valid delivery charge')
      return
    }

    setSaving(true)
    try {
      await apiClient.post('/admin/delivery-charges', {
        country: form.country,
        state: form.state,
        city: form.city,
        pincode: form.pincode,
        charge: chargeVal,
      })
      toast.success('Delivery charge rule saved')
      setShowAddModal(false)
      setForm(initialForm)
      void load()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save rule')
    } finally {
      setSaving(false)
    }
  }

  const filteredRules = rules.filter((rule) => {
    const term = search.toLowerCase()
    return (
      rule.country.toLowerCase().includes(term) ||
      rule.state.toLowerCase().includes(term) ||
      rule.city.toLowerCase().includes(term) ||
      rule.pincode.toLowerCase().includes(term)
    )
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Delivery Charges</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Configure country, state, city, and pincode specific delivery rates.
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="gap-2 w-full sm:w-auto justify-center">
          <Plus className="size-4" />
          Add Charge Rule
        </Button>
      </div>

      <Card className="p-3 md:p-4">
        <Input
          placeholder="Search rules..."
          leftIcon={<Search className="size-4" />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </Card>

      {/* Desktop View */}
      <Card className="hidden md:block p-4 md:p-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b">
            <tr>
              <th className="text-left py-3 font-semibold text-muted-foreground">Country</th>
              <th className="text-left py-3 font-semibold text-muted-foreground">State</th>
              <th className="text-left py-3 font-semibold text-muted-foreground">City</th>
              <th className="text-left py-3 font-semibold text-muted-foreground">Pincode</th>
              <th className="text-left py-3 font-semibold text-muted-foreground">Delivery Charge</th>
              <th className="text-left py-3 font-semibold text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRules.map((rule) => (
              <tr key={rule.id} className="border-b hover:bg-muted/50 transition-colors">
                <td className="py-3 font-medium text-foreground capitalize">{rule.country}</td>
                <td className="py-3 text-muted-foreground capitalize">{rule.state || 'All States'}</td>
                <td className="py-3 text-muted-foreground capitalize">{rule.city || 'All Cities'}</td>
                <td className="py-3 text-muted-foreground">{rule.pincode || 'All Pincodes'}</td>
                <td className="py-3 font-semibold text-foreground">₹{rule.charge}</td>
                <td className="py-3">
                  <button
                    onClick={() => handleDelete(rule.id)}
                    className="p-2 hover:bg-destructive/10 rounded-lg text-destructive transition-colors"
                    title="Delete Rule"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </td>
              </tr>
            ))}
            {!loading && filteredRules.length === 0 && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-muted-foreground">
                  No delivery charge rules configured.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>

      {/* Mobile View */}
      <div className="md:hidden space-y-3">
        {filteredRules.map((rule) => (
          <Card key={rule.id} className="p-4 space-y-3">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-sm font-semibold text-foreground capitalize">
                  <MapPin className="size-3.5 text-primary" />
                  {rule.country}
                </div>
                <div className="text-xs text-muted-foreground capitalize">
                  {rule.state ? `State: ${rule.state}` : 'All States'}
                  {rule.city ? ` · City: ${rule.city}` : ''}
                  {rule.pincode ? ` · Pincode: ${rule.pincode}` : ''}
                </div>
              </div>
              <button
                onClick={() => handleDelete(rule.id)}
                className="p-2 hover:bg-destructive/10 rounded-lg text-destructive transition-colors"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
            <div className="flex justify-between items-center pt-2 border-t text-sm">
              <span className="text-muted-foreground">Charge</span>
              <span className="font-bold text-foreground">₹{rule.charge}</span>
            </div>
          </Card>
        ))}
        {!loading && filteredRules.length === 0 && (
          <div className="py-12 text-center text-muted-foreground">
            No delivery charge rules configured.
          </div>
        )}
      </div>

      <Modal open={showAddModal} onClose={() => setShowAddModal(false)} title="Add Delivery Charge Rule">
        <form onSubmit={handleSave} className="space-y-4">
          <LocationPicker
            value={locationFromForm(form)}
            onChange={(location) =>
              setForm((prev) => ({
                ...prev,
                country: location.country,
                state: location.state,
                city: location.city,
                pincode: location.pincode,
              }))
            }
            optionalFields={['state', 'city', 'pincode']}
          />
          <Input
            label="Delivery Charge (₹)"
            type="number"
            min="0"
            step="0.01"
            placeholder="e.g. 50"
            value={form.charge}
            onChange={(e) => setForm({ ...form, charge: e.target.value })}
            required
          />
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => setShowAddModal(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={saving}
              className="w-full sm:w-auto"
            >
              Save Rule
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
