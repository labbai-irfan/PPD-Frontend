import { useEffect, useState } from 'react'
import { Plus, X, Trash2, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { apiClient } from '@/services/api/client'

interface BannerItem {
  title: string
  subtitle?: string
  cta?: string
  href?: string
  image?: string
}

interface Banner {
  id: string
  type: 'static' | 'carousel'
  placement?: 'hero' | 'bundle'
  title: string
  items?: BannerItem[]
  subtitle?: string
  cta?: string
  href?: string
  image?: string
  tone?: string
  sortOrder: number
  isActive: boolean
  createdAt: string
}

interface BannerForm {
  type: 'static' | 'carousel'
  placement: 'hero' | 'bundle'
  title: string
  subtitle: string
  cta: string
  href: string
  image: string
  tone: string
  items: BannerItem[]
  sortOrder: number
  isActive: boolean
}

const emptyForm: BannerForm = {
  type: 'static',
  placement: 'hero',
  title: '',
  subtitle: '',
  cta: 'Shop Now',
  href: '/',
  image: '',
  tone: 'bg-gradient-to-r from-orange-400 to-orange-600',
  items: [],
  sortOrder: 0,
  isActive: true,
}

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<BannerForm>(emptyForm)
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
      type: banner.type,
      placement: banner.placement || 'hero',
      title: banner.title,
      subtitle: banner.subtitle || '',
      cta: banner.cta || 'Shop Now',
      href: banner.href || '/',
      image: banner.image || '',
      tone: banner.tone || 'bg-gradient-to-r from-orange-400 to-orange-600',
      items: banner.items || [],
      sortOrder: banner.sortOrder,
      isActive: banner.isActive,
    })
    setEditingId(banner.id)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this banner?')) return
    try {
      await apiClient.delete(`/admin/banners/${id}`)
      setBanners((prev) => prev.filter((b) => b.id !== id))
      toast.success('Banner deleted')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Delete failed')
    }
  }

  const handleToggleActive = async (banner: Banner) => {
    try {
      await apiClient.patch(`/admin/banners/${banner.id}`, { isActive: !banner.isActive })
      setBanners((prev) =>
        prev.map((b) => (b.id === banner.id ? { ...b, isActive: !b.isActive } : b)),
      )
      toast.success(banner.isActive ? 'Banner hidden' : 'Banner shown')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Update failed')
    }
  }

  /** Visual banner card: banner-shaped image preview with status/order badges + actions. */
  const renderBannerCard = (banner: Banner, wide = false) => (
    <Card key={banner.id} className="group overflow-hidden flex flex-col">
      <div className={`relative w-full overflow-hidden bg-muted ${wide ? 'aspect-[3/1]' : 'aspect-[396/189]'}`}>
        {banner.image ? (
          <img
            src={banner.image}
            alt={banner.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">No image</div>
        )}
        <span
          className={`absolute left-2.5 top-2.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide shadow ${
            banner.isActive ? 'bg-emerald-500 text-white' : 'bg-gray-700/80 text-white'
          }`}
        >
          {banner.isActive ? 'Live' : 'Hidden'}
        </span>
        <span className="absolute right-2.5 top-2.5 rounded-full bg-black/50 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur">
          #{banner.sortOrder}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-3.5 md:p-4">
        <h3 className="font-semibold text-foreground truncate">{banner.title}</h3>
        {banner.subtitle && <p className="text-xs text-muted-foreground truncate mt-0.5">{banner.subtitle}</p>}
        {banner.href && (
          <span className="mt-2 inline-block w-fit max-w-full truncate rounded-md bg-muted px-2 py-1 text-[11px] text-muted-foreground">
            {banner.href}
          </span>
        )}
        <div className="mt-3 flex items-center gap-2 border-t border-border pt-3">
          <Button onClick={() => handleToggleActive(banner)} variant="outline" size="sm" className="flex-1 gap-1.5">
            {banner.isActive ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
            {banner.isActive ? 'Hide' : 'Show'}
          </Button>
          <Button onClick={() => handleEdit(banner)} size="sm" className="flex-1">
            Edit
          </Button>
          <Button
            onClick={() => handleDelete(banner.id)}
            variant="outline"
            size="sm"
            className="shrink-0 text-destructive hover:text-destructive"
            aria-label={`Delete ${banner.title}`}
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      </div>
    </Card>
  )

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
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">Banner Type</label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value as 'static' | 'carousel' })}
              className="w-full px-3 py-2 border rounded-lg bg-background text-foreground"
            >
              <option value="static">Static Banner</option>
              <option value="carousel">Carousel (Multiple Slides)</option>
            </select>
          </div>

          {form.type === 'static' && (
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Placement</label>
              <select
                value={form.placement}
                onChange={(e) => setForm({ ...form, placement: e.target.value as 'hero' | 'bundle' })}
                className="w-full px-3 py-2 border rounded-lg bg-background text-foreground"
              >
                <option value="hero">Home hero carousel (top of home page)</option>
                <option value="bundle">Build-Your-Bundle band (above Shop by Packages)</option>
              </select>
            </div>
          )}

          <Input
            label="Title"
            placeholder="Summer Sale"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />

          {form.type === 'static' ? (
            <>
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
                    <img src={form.image} alt={form.title ? `${form.title} banner preview` : 'Banner image preview'} className="w-full h-full object-cover" />
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
            </>
          ) : (
            <div className="space-y-3 border-t pt-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-foreground">Carousel Items</h3>
                <Button
                  onClick={() => {
                    const newItem: BannerItem = { title: '', subtitle: '', cta: 'Shop Now', href: '/', image: '' }
                    setForm({ ...form, items: [...(form.items || []), newItem] })
                  }}
                  size="sm"
                  className="gap-1"
                >
                  <Plus className="size-4" />
                  Add Item
                </Button>
              </div>

              {form.items?.map((item, idx) => (
                <Card key={`item-${idx}`} className="p-3 border space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-foreground">Item {idx + 1}</h4>
                    <button
                      onClick={() => {
                        setForm({
                          ...form,
                          items: form.items?.filter((_, i) => i !== idx) || [],
                        })
                      }}
                      className="text-destructive hover:text-destructive/80"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>

                  <Input
                    label="Title"
                    placeholder="Item title"
                    value={item.title}
                    onChange={(e) => {
                      const updated = [...(form.items || [])]
                      updated[idx] = { ...item, title: e.target.value }
                      setForm({ ...form, items: updated })
                    }}
                  />

                  <Input
                    label="Subtitle"
                    placeholder="Item subtitle"
                    value={item.subtitle || ''}
                    onChange={(e) => {
                      const updated = [...(form.items || [])]
                      updated[idx] = { ...item, subtitle: e.target.value }
                      setForm({ ...form, items: updated })
                    }}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <Input
                      label="CTA"
                      placeholder="Shop Now"
                      value={item.cta || ''}
                      onChange={(e) => {
                        const updated = [...(form.items || [])]
                        updated[idx] = { ...item, cta: e.target.value }
                        setForm({ ...form, items: updated })
                      }}
                    />
                    <Input
                      label="Link"
                      placeholder="/products"
                      value={item.href || ''}
                      onChange={(e) => {
                        const updated = [...(form.items || [])]
                        updated[idx] = { ...item, href: e.target.value }
                        setForm({ ...form, items: updated })
                      }}
                    />
                  </div>
                </Card>
              ))}
            </div>
          )}

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

      {/* Home hero carousel slides (static banners, placement: hero) */}
      {banners.some((b) => (!b.type || b.type === 'static') && b.placement !== 'bundle') && (
        <Card className="p-4 md:p-6 space-y-4 bg-gradient-to-br from-blue-50/50 to-transparent dark:from-blue-950/20">
          <div>
            <h2 className="text-lg font-semibold text-foreground">🎠 Home Hero Carousel</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Slides rotating at the top of the home page</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
            {banners
              .filter((b) => (!b.type || b.type === 'static') && b.placement !== 'bundle')
              .map((banner) => renderBannerCard(banner))}
          </div>
        </Card>
      )}

      {/* Build-Your-Bundle band (placement: bundle) */}
      {banners.some((b) => b.placement === 'bundle') && (
        <Card className="p-4 md:p-6 space-y-4 bg-gradient-to-br from-orange-50/60 to-transparent dark:from-orange-950/20">
          <div>
            <h2 className="text-lg font-semibold text-foreground">🎁 Build-Your-Bundle Band</h2>
            <p className="text-xs text-muted-foreground mt-0.5">The wide promo band above "Shop by Packages" — shown exactly this wide on the home page</p>
          </div>
          <div className="max-w-3xl">
            {banners.filter((b) => b.placement === 'bundle').map((banner) => renderBannerCard(banner, true))}
          </div>
        </Card>
      )}

      {/* Carousel Banners */}
      {banners.some((b) => b.type === 'carousel') && (
        <Card className="p-4 md:p-6 space-y-4 bg-gradient-to-br from-amber-50/50 to-transparent dark:from-amber-950/20">
          <h2 className="text-lg font-semibold text-foreground">🎠 Carousels</h2>
          <div className="space-y-3">
            {banners
              .filter((b) => b.type === 'carousel')
              .map((banner) => (
                <Card key={banner.id} className="p-3 md:p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-foreground">{banner.title}</h3>
                      <p className="text-xs text-muted-foreground">{banner.items?.length || 0} slides</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleToggleActive(banner)}
                        variant="outline"
                        size="sm"
                      >
                        {banner.isActive ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
                      </Button>
                      <Button onClick={() => handleEdit(banner)} variant="outline" size="sm">
                        Edit
                      </Button>
                      <Button
                        onClick={() => handleDelete(banner.id)}
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {banner.items?.map((item, idx) => (
                      <div key={`${banner.id}-item-${idx}`} className="rounded-lg overflow-hidden bg-muted">
                        {item.image ? (
                          <img src={item.image} alt={item.title} className="w-full h-20 object-cover" />
                        ) : (
                          <div className="w-full h-20 bg-muted-foreground/10 flex items-center justify-center">
                            <span className="text-xs text-muted-foreground">No image</span>
                          </div>
                        )}
                        <div className="p-2">
                          <p className="text-xs font-medium truncate text-foreground">{item.title}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
          </div>
        </Card>
      )}

      {banners.length === 0 && !showForm && (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">No banners yet. Create one to get started!</p>
        </Card>
      )}
    </div>
  )
}
