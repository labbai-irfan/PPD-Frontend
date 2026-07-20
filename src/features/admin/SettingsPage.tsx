import { useEffect, useState } from 'react'
import { Save, Globe, Search, Share2 } from 'lucide-react'
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
  seoTitle: string
  seoDescription: string
  seoKeywords: string
  facebookUrl: string
  instagramUrl: string
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
        seoTitle: settings.seoTitle,
        seoDescription: settings.seoDescription,
        seoKeywords: settings.seoKeywords,
        facebookUrl: settings.facebookUrl,
        instagramUrl: settings.instagramUrl,
      })
      setSettings(data)
      toast.success('Settings saved')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setIsSaving(false)
    }
  }

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
          <Search className="size-5" /> SEO Settings
        </h2>
        <div className="grid grid-cols-1 gap-3 md:gap-4">
          <Input label="SEO Title" placeholder="Meta title for search engines" value={settings.seoTitle} onChange={(e) => setSettings({ ...settings, seoTitle: e.target.value })} />
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">SEO Description</label>
            <textarea
              value={settings.seoDescription}
              onChange={(e) => setSettings({ ...settings, seoDescription: e.target.value })}
              placeholder="Meta description for search engines (recommended 150-160 characters)"
              className="w-full px-3 py-2 border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm resize-none"
              rows={3}
            />
          </div>
          <Input label="SEO Keywords" placeholder="Comma-separated keywords" value={settings.seoKeywords} onChange={(e) => setSettings({ ...settings, seoKeywords: e.target.value })} />
        </div>
      </Card>

      <Card className="p-3 md:p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Share2 className="size-5" /> Social Media Links
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          <Input label="Facebook URL" type="url" placeholder="https://facebook.com/yourpage" value={settings.facebookUrl} onChange={(e) => setSettings({ ...settings, facebookUrl: e.target.value })} />
          <Input label="Instagram URL" type="url" placeholder="https://instagram.com/yourpage" value={settings.instagramUrl} onChange={(e) => setSettings({ ...settings, instagramUrl: e.target.value })} />
        </div>
      </Card>



      <Button onClick={() => void handleSave()} disabled={isSaving} className="gap-2 w-full">
        <Save className="size-4" />
        {isSaving ? 'Saving…' : 'Save Changes'}
      </Button>
    </div>
  )
}
