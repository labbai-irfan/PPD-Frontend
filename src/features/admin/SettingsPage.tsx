import { useEffect, useState } from 'react'
import { Save, Bell, Lock, Globe } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { apiClient } from '@/services/api/client'

interface AdminSettings {
  siteName: string
  siteEmail: string
  sitePhone: string
  currency: string
  emailNotifications: boolean
  orderNotifications: boolean
  reviewNotifications: boolean
  maxProductsPerPage: number
  sessionTimeoutMinutes: number
  maintenanceMode: boolean
  freeShippingThreshold: number
  shippingFee: number
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<AdminSettings | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    void apiClient
      .get<AdminSettings>('/admin/settings')
      .then((r) => setSettings(r.data))
      .catch((e: Error) => toast.error(e.message))
  }, [])

  if (!settings) return <p className="text-muted-foreground">Loading settings…</p>

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const { data } = await apiClient.patch<AdminSettings>('/admin/settings', {
        siteName: settings.siteName,
        siteEmail: settings.siteEmail,
        sitePhone: settings.sitePhone,
        currency: settings.currency,
        emailNotifications: settings.emailNotifications,
        orderNotifications: settings.orderNotifications,
        reviewNotifications: settings.reviewNotifications,
        maxProductsPerPage: Number(settings.maxProductsPerPage),
        sessionTimeoutMinutes: Number(settings.sessionTimeoutMinutes),
        maintenanceMode: settings.maintenanceMode,
        freeShippingThreshold: Number(settings.freeShippingThreshold),
        shippingFee: Number(settings.shippingFee),
      })
      setSettings(data)
      toast.success('Settings saved')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setIsSaving(false)
    }
  }

  const toggle = (key: keyof AdminSettings) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setSettings({ ...settings, [key]: e.target.checked })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Site configuration (saved to database)</p>
      </div>

      <Card className="p-3 md:p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Globe className="size-5" /> Site Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          <Input label="Site Name" value={settings.siteName} onChange={(e) => setSettings({ ...settings, siteName: e.target.value })} />
          <Input label="Site Email" type="email" value={settings.siteEmail} onChange={(e) => setSettings({ ...settings, siteEmail: e.target.value })} />
          <Input label="Contact Phone" value={settings.sitePhone} onChange={(e) => setSettings({ ...settings, sitePhone: e.target.value })} />
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">Currency</label>
            <select
              value={settings.currency}
              onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            >
              <option value="INR">Indian Rupee (₹)</option>
              <option value="USD">US Dollar ($)</option>
              <option value="EUR">Euro (€)</option>
            </select>
          </div>
        </div>
      </Card>

      <Card className="p-3 md:p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Bell className="size-5" /> Notifications
        </h2>
        <div className="space-y-3">
          {([
            ['emailNotifications', 'Email Notifications'],
            ['orderNotifications', 'Order Notifications'],
            ['reviewNotifications', 'Review Notifications'],
          ] as const).map(([key, label]) => (
            <label key={key} className="flex items-center gap-3 cursor-pointer p-2 -m-2 rounded hover:bg-muted">
              <input type="checkbox" checked={settings[key]} onChange={toggle(key)} className="w-4 h-4 rounded" />
              <span className="text-sm text-foreground">{label}</span>
            </label>
          ))}
        </div>
      </Card>

      <Card className="p-3 md:p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Lock className="size-5" /> Store & System
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mb-4">
          <Input label="Max Products Per Page" type="number" value={String(settings.maxProductsPerPage)} onChange={(e) => setSettings({ ...settings, maxProductsPerPage: Number(e.target.value) })} />
          <Input label="Session Timeout (minutes)" type="number" value={String(settings.sessionTimeoutMinutes)} onChange={(e) => setSettings({ ...settings, sessionTimeoutMinutes: Number(e.target.value) })} />
          <Input label="Free Shipping Above (₹)" type="number" value={String(settings.freeShippingThreshold)} onChange={(e) => setSettings({ ...settings, freeShippingThreshold: Number(e.target.value) })} />
          <Input label="Shipping Fee (₹)" type="number" value={String(settings.shippingFee)} onChange={(e) => setSettings({ ...settings, shippingFee: Number(e.target.value) })} />
        </div>
        <label className="flex items-center gap-3 cursor-pointer border-t pt-4 p-2 -m-2 rounded hover:bg-muted">
          <input type="checkbox" checked={settings.maintenanceMode} onChange={toggle('maintenanceMode')} className="w-4 h-4 rounded shrink-0" />
          <div>
            <span className="text-sm font-semibold text-foreground">Maintenance Mode</span>
            <p className="text-xs text-muted-foreground">Put the store under maintenance</p>
          </div>
        </label>
      </Card>

      <Button onClick={() => void handleSave()} disabled={isSaving} className="gap-2 w-full">
        <Save className="size-4" />
        {isSaving ? 'Saving…' : 'Save Changes'}
      </Button>
    </div>
  )
}
