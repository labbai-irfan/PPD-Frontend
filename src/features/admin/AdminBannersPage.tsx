import { useEffect, useState } from 'react'
import { Plus, X, Trash2, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { apiClient } from '@/services/api/client'

interface Banner {
  _id: string
  title: string
  subtitle?: string
  cta?: string
  href?: string
  image?: string
  tone?: string
  sortOrder: number
  isActive: boolean
  createdAt: string
}

const emptyForm = {
  title: '',
  subtitle: '',
  cta: 'Shop Now',
  href: '/',
  image: '',
  tone: 'bg-gradient-to-r from-orange-400 to-orange-600',
  sortOrder: 0,
  isActive: true,
}

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [uploading, setUploading] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const load = () =>
    apiClient
      .get<Banner[]>('/admin/banners')
      .then((r) => setBanners(r.data))
      .catch((e: Error) => toast.error(e.message))

  useEffect(() => {
    void load()
  }, [])

  const handleImageUpload = async (file: File) => {
    if (!file) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await apiClient.post<{ url: string }>('/admin/uploads/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setForm({ ...form, image: res.data.url })
      toast.success('Image uploaded')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async () => {
    if (!form.title) {
      toast.error('Title is required')
      return
    }
    try {
      if (editingId) {
        await apiClient.patch(`/admin/banners/${editingId}`, form)
        toast.success('Banner updated')
      } else {
        await apiClient.post('/admin/banners', form)
        toast.success('Banner created')
      }
      setForm(emptyForm)
      setEditingId(null)
      setShowForm(false)
      void load()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Save failed')
    }
  }

  const handleEdit = (banner: Banner) => {
    setForm({
      title: banner.title,
      subtitle: banner.subtitle || '',
      cta: banner.cta || 'Shop Now',
      href: banner.href || '/',
      image: banner.image || '',
      tone: banner.tone || 'bg-gradient-to-r from-orange-400 to-orange-600',
      sortOrder: banner.sortOrder,
      isActive: banner.isActive,
    })
    setEditingId(banner._id)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this banner?')) return
    try {
      await apiClient.delete(`/admin/banners/${id}`)
      setBanners((prev) => prev.filter((b) => b._id !== id))
      toast.success('Banner deleted')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Delete failed')
    }
  }

  const handleToggleActive = async (banner: Banner) => {
    try {
      await apiClient.patch(`/admin/banners/${banner._id}`, { isActive: !banner.isActive })
      setBanners((prev) =>
        prev.map((b) => (b._id === banner._id ? { ...b, isActive: !b.isActive } : b)),
      )
      toast.success(banner.isActive ? 'Banner hidden' : 'Banner shown')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Update failed')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Banners</h1>
          <p className="text-sm text-muted-foreground mt-1">{banners.length} banners</p>
        </div>
        <Button onClick={() => {
          setForm(emptyForm)
          setEditingId(null)
          setShowForm((v) => !v)
        }} className="gap-2 w-full sm:w-auto">
          {showForm ? <X className="size-4" /> : <Plus className="size-4" />}
          {showForm ? 'Close' : 'New Banner'}
        </Button>
      </div>

      {showForm && (
        <Card className="p-3 md:p-4 space-y-3">
          <Input
            label="Title"
            placeholder="Summer Sale"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <Input
            label="Subtitle"
            placeholder="Get 50% off on select items"
            value={form.subtitle}
            onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input
              label="CTA Button Text"
              placeholder="Shop Now"
              value={form.cta}
              onChange={(e) => setForm({ ...form, cta: e.target.value })}
            />
            <Input
              label="Link"
              placeholder="/products/summer"
              value={form.href}
              onChange={(e) => setForm({ ...form, href: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">Banner Image</label>
            <div className="flex gap-2">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
                disabled={uploading}
                className="flex-1 px-3 py-2 border rounded-lg bg-background text-foreground cursor-pointer"
              />
              {uploading && <span className="text-xs text-muted-foreground">Uploading...</span>}
            </div>
            {form.image && (
              <div className="mt-2 relative w-full h-32 bg-muted rounded-lg overflow-hidden">
                <img src={form.image} alt="preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input
              label="Gradient/Tone"
              placeholder="bg-gradient-to-r from-orange-400 to-orange-600"
              value={form.tone}
              onChange={(e) => setForm({ ...form, tone: e.target.value })}
            />
            <Input
              label="Sort Order"
              type="number"
              value={form.sortOrder}
              onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              className="w-4 h-4 rounded"
            />
            <label htmlFor="isActive" className="text-sm font-medium text-foreground">
              Show on home page
            </label>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleSave}
              className="flex-1"
            >
              {editingId ? 'Update' : 'Create'}
            </Button>
            <Button
              onClick={() => {
                setForm(emptyForm)
                setEditingId(null)
                setShowForm(false)
              }}
              variant="outline"
            >
              Cancel
            </Button>
          </div>
        </Card>
      )}

      <div className="space-y-2">
        {banners.map((banner) => (
          <Card key={banner._id} className="p-3 md:p-4 flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
            {banner.image && (
              <div className="w-full md:w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                <img src={banner.image} alt={banner.title} className="w-full h-full object-cover" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground truncate">{banner.title}</h3>
              {banner.subtitle && <p className="text-xs text-muted-foreground truncate">{banner.subtitle}</p>}
              <div className="mt-1 flex flex-wrap gap-2">
                {banner.href && <span className="text-xs bg-muted px-2 py-1 rounded">{banner.href}</span>}
                <span className="text-xs bg-muted px-2 py-1 rounded">Order: {banner.sortOrder}</span>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap md:flex-nowrap">
              <Button
                onClick={() => handleToggleActive(banner)}
                variant="outline"
                size="sm"
                className="flex-1 md:flex-none"
              >
                {banner.isActive ? (
                  <Eye className="size-4" />
                ) : (
                  <EyeOff className="size-4" />
                )}
              </Button>
              <Button
                onClick={() => handleEdit(banner)}
                variant="outline"
                size="sm"
                className="flex-1 md:flex-none"
              >
                Edit
              </Button>
              <Button
                onClick={() => handleDelete(banner._id)}
                variant="outline"
                size="sm"
                className="flex-1 md:flex-none text-destructive hover:text-destructive"
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {banners.length === 0 && !showForm && (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">No banners yet. Create one to get started!</p>
        </Card>
      )}
    </div>
  )
}
