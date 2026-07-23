import { useEffect, useRef, useState } from 'react'
import {
  Eye,
  EyeOff,
  ImageIcon,
  Minus,
  Package as PackageIcon,
  Pencil,
  Plus,
  Trash2,
  UploadCloud,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { apiClient } from '@/services/api/client'
import { formatCurrency } from '@/lib/utils'

interface ProductOption {
  id: string
  slug: string
  title: string
  images: string[]
  price: number
  stock: number
}

interface FormItem {
  productId: string
  title: string
  image: string
  price: number
  quantity: number
}

interface AdminPackageItem {
  productId: string
  title: string
  image: string
  price: number
  mrp: number
  quantity: number
}

interface AdminPackage {
  id: string
  slug: string
  name: string
  description: string
  image?: string
  isActive: boolean
  price: number
  originalTotal: number
  itemCount: number
  items: AdminPackageItem[]
}

const emptyForm = { name: '', description: '', image: '', price: '', isActive: true }

/** Admin manager for real, product-backed package bundles ("Shop by Packages"). */
export default function AdminPackagesPage() {
  const [packages, setPackages] = useState<AdminPackage[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [items, setItems] = useState<FormItem[]>([])
  const [search, setSearch] = useState('')
  const [results, setResults] = useState<ProductOption[]>([])
  const [searching, setSearching] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const apiBase = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/api$/, '')

  const load = () =>
    apiClient
      .get<AdminPackage[]>('/admin/packages')
      .then((r) => setPackages(r.data))
      .catch((e: Error) => toast.error(e.message))
      .finally(() => setLoading(false))

  useEffect(() => {
    void load()
  }, [])

  useEffect(() => {
    if (!search.trim()) {
      setResults([])
      return
    }
    setSearching(true)
    const handle = setTimeout(() => {
      apiClient
        .get<{ items: ProductOption[] }>('/products', { params: { q: search, pageSize: 8 } })
        .then((r) => setResults(r.data.items))
        .catch(() => setResults([]))
        .finally(() => setSearching(false))
    }, 350)
    return () => clearTimeout(handle)
  }, [search])

  function addItem(product: ProductOption) {
    if (items.some((i) => i.productId === product.id)) {
      toast.error('Already in this package')
      return
    }
    setItems((prev) => [
      ...prev,
      { productId: product.id, title: product.title, image: product.images[0] ?? '', price: product.price, quantity: 1 },
    ])
    setSearch('')
    setResults([])
  }

  function removeItem(productId: string) {
    setItems((prev) => prev.filter((i) => i.productId !== productId))
  }

  function setQuantity(productId: string, quantity: number) {
    setItems((prev) => prev.map((i) => (i.productId === productId ? { ...i, quantity: Math.max(1, quantity) } : i)))
  }

  async function uploadImage(file: File) {
    if (!file.type.startsWith('image/')) {
      toast.error('Please choose an image file (JPG, PNG or WebP)')
      return
    }
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const { data } = await apiClient.post<{ url: string }>('/admin/uploads/image', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setForm((prev) => ({ ...prev, image: `${apiBase}${data.url}` }))
      toast.success('Image uploaded')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Upload failed')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  function startEdit(pkg: AdminPackage) {
    setEditingId(pkg.id)
    setForm({
      name: pkg.name,
      description: pkg.description ?? '',
      image: pkg.image ?? '',
      price: String(pkg.price),
      isActive: pkg.isActive,
    })
    setItems(
      pkg.items.map((i) => ({ productId: i.productId, title: i.title, image: i.image, price: i.price, quantity: i.quantity })),
    )
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function cancelEdit() {
    setEditingId(null)
    setForm(emptyForm)
    setItems([])
    setSearch('')
    setResults([])
  }

  async function handleSave() {
    if (!form.name.trim()) {
      toast.error('Package name is required')
      return
    }
    if (items.length === 0) {
      toast.error('Add at least one product to the package')
      return
    }
    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      image: form.image || undefined,
      items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
      price: form.price.trim() ? Number(form.price) : undefined,
      isActive: form.isActive,
    }
    setSaving(true)
    try {
      if (editingId) {
        await apiClient.patch(`/admin/packages/${editingId}`, payload)
        toast.success('Package updated')
      } else {
        await apiClient.post('/admin/packages', payload)
        toast.success('Package created')
      }
      cancelEdit()
      void load()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  async function handleToggleActive(pkg: AdminPackage) {
    try {
      await apiClient.patch(`/admin/packages/${pkg.id}`, { isActive: !pkg.isActive })
      setPackages((prev) => prev.map((p) => (p.id === pkg.id ? { ...p, isActive: !p.isActive } : p)))
      toast.success(pkg.isActive ? 'Package hidden' : 'Package shown')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Update failed')
    }
  }

  async function handleDelete(id: string) {
    try {
      await apiClient.delete(`/admin/packages/${id}`)
      setPackages((prev) => prev.filter((p) => p.id !== id))
      if (editingId === id) cancelEdit()
      toast.success('Package deleted')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Delete failed')
    }
  }

  const itemsTotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Packages</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Curated product bundles shown in "Shop by Packages" ({packages.length} packages)
        </p>
      </div>

      <Card className="p-4 space-y-3">
        <p className="text-sm font-semibold text-foreground">{editingId ? 'Edit package' : 'Create a package'}</p>

        <Input
          placeholder="Package name (e.g. Complete Writing Kit)..."
          value={form.name}
          onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
        />
        <Input
          placeholder="Short description shown on the package card..."
          value={form.description}
          onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
        />

        <div className="flex items-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) void uploadImage(file)
            }}
          />
          {form.image ? (
            <div className="relative">
              <img src={form.image} alt="Package" className="size-16 rounded-lg object-contain bg-muted p-1" />
              <button
                onClick={() => setForm((prev) => ({ ...prev, image: '' }))}
                className="absolute -top-2 -right-2 rounded-full bg-destructive p-0.5 text-white"
                aria-label="Remove image"
              >
                <X className="size-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex size-16 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <ImageIcon className="size-6" />
            </div>
          )}
          <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="gap-2">
            <UploadCloud className="size-4" />
            {uploading ? 'Uploading...' : form.image ? 'Replace image' : 'Upload image'}
          </Button>
        </div>

        <div className="relative">
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Add products to this package</label>
          <Input placeholder="Search products by name..." value={search} onChange={(e) => setSearch(e.target.value)} />
          {search.trim() && (
            <div className="absolute z-10 mt-1 max-h-64 w-full overflow-y-auto rounded-lg border border-border bg-card shadow-lg">
              {searching ? (
                <p className="p-3 text-sm text-muted-foreground">Searching...</p>
              ) : results.length === 0 ? (
                <p className="p-3 text-sm text-muted-foreground">No products found</p>
              ) : (
                results.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => addItem(p)}
                    className="flex w-full items-center gap-2.5 px-3 py-2 text-left hover:bg-accent"
                  >
                    <img src={p.images[0]} alt={p.title} className="size-9 shrink-0 rounded-md bg-muted object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">{p.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatCurrency(p.price)} · {p.stock} in stock
                      </p>
                    </div>
                    <Plus className="size-4 shrink-0 text-muted-foreground" />
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="space-y-2 rounded-lg border border-border p-3">
            {items.map((item) => (
              <div key={item.productId} className="flex items-center gap-2.5">
                <img src={item.image} alt={item.title} className="size-10 shrink-0 rounded-md bg-muted object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{formatCurrency(item.price)} each</p>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <button
                    onClick={() => setQuantity(item.productId, item.quantity - 1)}
                    className="rounded p-1 hover:bg-accent"
                    aria-label={`Decrease ${item.title} quantity`}
                  >
                    <Minus className="size-3.5" />
                  </button>
                  <span className="w-6 text-center text-sm font-semibold">{item.quantity}</span>
                  <button
                    onClick={() => setQuantity(item.productId, item.quantity + 1)}
                    className="rounded p-1 hover:bg-accent"
                    aria-label={`Increase ${item.title} quantity`}
                  >
                    <Plus className="size-3.5" />
                  </button>
                </div>
                <button
                  onClick={() => removeItem(item.productId)}
                  className="shrink-0 rounded-lg p-1.5 text-destructive hover:bg-destructive/10"
                  aria-label={`Remove ${item.title}`}
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            ))}
            <p className="pt-1 text-xs text-muted-foreground">
              Sum of item prices: <span className="font-semibold text-foreground">{formatCurrency(itemsTotal)}</span>
            </p>
          </div>
        )}

        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">
            Bundle price (optional — leave blank to charge the sum of item prices)
          </label>
          <Input
            type="number"
            placeholder={itemsTotal ? String(itemsTotal) : '0'}
            value={form.price}
            onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))}
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="package-isActive"
            checked={form.isActive}
            onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.checked }))}
            className="size-4 rounded"
          />
          <label htmlFor="package-isActive" className="text-sm font-medium text-foreground">
            Show on home page
          </label>
        </div>

        <div className="flex gap-2">
          <Button onClick={() => void handleSave()} disabled={saving || uploading} className="gap-2">
            <Plus className="size-4" />
            {editingId ? 'Save changes' : 'Create package'}
          </Button>
          {editingId && (
            <Button variant="outline" onClick={cancelEdit}>
              Cancel
            </Button>
          )}
        </div>
      </Card>

      {loading ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Loading...</p>
        </Card>
      ) : packages.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">No packages yet. Create one above to get started!</p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {packages.map((pkg) => (
            <Card key={pkg.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="min-w-0">
                  {pkg.image ? (
                    <img src={pkg.image} alt={pkg.name} className="mb-2 size-12 rounded-lg bg-muted object-contain p-1" />
                  ) : (
                    <div className="mb-2 flex size-12 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                      <PackageIcon className="size-6" />
                    </div>
                  )}
                  <h3 className="font-semibold text-foreground">{pkg.name}</h3>
                  {pkg.description && <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{pkg.description}</p>}
                  <p className="mt-1 text-sm text-muted-foreground">
                    {pkg.itemCount} items · {formatCurrency(pkg.price)}
                  </p>
                </div>
                <div className="flex shrink-0 gap-1">
                  <button
                    onClick={() => void handleToggleActive(pkg)}
                    className="rounded-lg p-2 text-muted-foreground hover:bg-accent"
                    aria-label={pkg.isActive ? `Hide ${pkg.name}` : `Show ${pkg.name}`}
                  >
                    {pkg.isActive ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
                  </button>
                  <button
                    onClick={() => startEdit(pkg)}
                    className="rounded-lg p-2 text-muted-foreground hover:bg-accent"
                    aria-label={`Edit ${pkg.name}`}
                  >
                    <Pencil className="size-4" />
                  </button>
                  <button
                    onClick={() => void handleDelete(pkg.id)}
                    className="rounded-lg p-2 text-destructive hover:bg-destructive/10"
                    aria-label={`Delete ${pkg.name}`}
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
