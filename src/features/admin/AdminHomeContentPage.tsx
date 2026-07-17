import { useEffect, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { apiClient } from '@/services/api/client'

interface PackageCard {
  name: string
  blurb: string
  price: number
  image: string
  href: string
}

const emptyPackage: PackageCard = {
  name: '',
  blurb: '',
  price: 0,
  image: '',
  href: '/products/all?category=stationery',
}

/** Admin editor for the home page "Shop by Packages" cards. */
export default function AdminHomeContentPage() {
  const [packages, setPackages] = useState<PackageCard[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null)

  useEffect(() => {
    apiClient
      .get<{ packages?: PackageCard[] } | null>('/admin/home')
      .then((r) => setPackages(r.data?.packages ?? []))
      .catch((e: Error) => toast.error(e.message))
      .finally(() => setLoading(false))
  }, [])

  const updatePackage = (idx: number, patch: Partial<PackageCard>) => {
    setPackages((prev) => prev.map((p, i) => (i === idx ? { ...p, ...patch } : p)))
  }

  const handleImageUpload = async (idx: number, file: File) => {
    setUploadingIdx(idx)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await apiClient.post<{ url: string }>('/admin/uploads/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      updatePackage(idx, { image: res.data.url })
      toast.success('Image uploaded')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Upload failed')
    } finally {
      setUploadingIdx(null)
    }
  }

  const handleSave = async () => {
    if (packages.some((p) => !p.name)) {
      toast.error('Every package needs a name')
      return
    }
    setSaving(true)
    try {
      await apiClient.patch('/admin/home', { packages })
      toast.success('Packages saved')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Home Sections</h1>
          <p className="text-sm text-muted-foreground mt-1">
            "Shop by Packages" cards shown on the home page ({packages.length} cards)
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setPackages((prev) => [...prev, { ...emptyPackage }])}
            className="gap-2"
          >
            <Plus className="size-4" />
            Add Package
          </Button>
          <Button onClick={handleSave} disabled={saving || loading}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {loading ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Loading...</p>
        </Card>
      ) : packages.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">No package cards yet. Add one to get started!</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {packages.map((pkg, idx) => (
            <Card key={idx} className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-foreground">Package {idx + 1}</h3>
                <button
                  onClick={() => setPackages((prev) => prev.filter((_, i) => i !== idx))}
                  className="text-destructive hover:text-destructive/80"
                  aria-label={`Remove package ${idx + 1}`}
                >
                  <Trash2 className="size-4" />
                </button>
              </div>

              <Input
                label="Name"
                placeholder="Complete Writing Kit"
                value={pkg.name}
                onChange={(e) => updatePackage(idx, { name: e.target.value })}
              />
              <Input
                label="Description"
                placeholder="Perfect for a fresh start to the year"
                value={pkg.blurb}
                onChange={(e) => updatePackage(idx, { blurb: e.target.value })}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input
                  label="Starting Price (₹)"
                  type="number"
                  value={pkg.price}
                  onChange={(e) => updatePackage(idx, { price: Number(e.target.value) })}
                />
                <Input
                  label="Link"
                  placeholder="/products/all?category=stationery"
                  value={pkg.href}
                  onChange={(e) => updatePackage(idx, { href: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Image</label>
                <div className="flex items-center gap-3">
                  {pkg.image && (
                    <img src={pkg.image} alt={pkg.name || 'Package'} className="size-14 rounded-lg object-contain bg-muted shrink-0" />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && handleImageUpload(idx, e.target.files[0])}
                    disabled={uploadingIdx === idx}
                    className="flex-1 min-w-0 px-3 py-2 border rounded-lg bg-background text-foreground cursor-pointer"
                  />
                  {uploadingIdx === idx && <span className="text-xs text-muted-foreground">Uploading...</span>}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
