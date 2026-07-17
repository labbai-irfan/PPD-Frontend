import { useEffect, useRef, useState } from 'react'
import { ImageIcon, Pencil, Plus, Trash2, UploadCloud, X } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { apiClient } from '@/services/api/client'

interface Category {
  id: string
  slug: string
  name: string
  icon: string
  description?: string
  image?: string
  productCount: number
}

const emptyForm = { name: '', icon: '📦', description: '', image: '' }

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const apiBase = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/api$/, '')

  const load = () =>
    apiClient
      .get<Category[]>('/categories')
      .then((r) => setCategories(r.data))
      .catch((e: Error) => toast.error(e.message))

  useEffect(() => {
    void load()
  }, [])

  const setField = (field: keyof typeof emptyForm) => (value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }))

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
      setField('image')(`${apiBase}${data.url}`)
      toast.success('Image uploaded')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Upload failed')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const startEdit = (cat: Category) => {
    setEditingId(cat.id)
    setForm({
      name: cat.name,
      icon: cat.icon,
      description: cat.description ?? '',
      image: cat.image ?? '',
    })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setForm(emptyForm)
  }

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error('Category name is required')
      return
    }
    const payload = {
      name: form.name.trim(),
      icon: form.icon || '📦',
      description: form.description.trim(),
      image: form.image,
    }
    setSaving(true)
    try {
      if (editingId) {
        await apiClient.patch(`/admin/categories/${editingId}`, payload)
        toast.success('Category updated')
      } else {
        await apiClient.post('/admin/categories', payload)
        toast.success('Category added')
      }
      cancelEdit()
      void load()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await apiClient.delete(`/admin/categories/${id}`)
      setCategories((prev) => prev.filter((c) => c.id !== id))
      if (editingId === id) cancelEdit()
      toast.success('Category deleted')
    } catch (e) {
      // Backend blocks deletion while products still use the category
      toast.error(e instanceof Error ? e.message : 'Delete failed')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Categories</h1>
        <p className="text-sm text-muted-foreground mt-1">{categories.length} categories</p>
      </div>

      <Card className="p-4 space-y-3">
        <p className="text-sm font-semibold text-foreground">
          {editingId ? 'Edit category' : 'Add a category'}
        </p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            placeholder="Category name..."
            value={form.name}
            onChange={(e) => setField('name')(e.target.value)}
          />
          <Input
            placeholder="📦"
            title="Icon (emoji)"
            className="sm:w-20"
            value={form.icon}
            onChange={(e) => setField('icon')(e.target.value)}
          />
        </div>
        <Input
          placeholder="Short description shown on the category card..."
          value={form.description}
          onChange={(e) => setField('description')(e.target.value)}
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
              <img
                src={form.image}
                alt={form.name ? `${form.name} category image` : 'Category image preview'}
                className="size-16 rounded-lg object-contain bg-muted p-1"
              />
              <button
                onClick={() => setField('image')('')}
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
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="gap-2"
          >
            <UploadCloud className="size-4" />
            {uploading ? 'Uploading...' : form.image ? 'Replace image' : 'Upload image'}
          </Button>
        </div>

        <div className="flex gap-2">
          <Button onClick={() => void handleSave()} disabled={saving || uploading} className="gap-2">
            <Plus className="size-4" />
            {editingId ? 'Save changes' : 'Add'}
          </Button>
          {editingId && (
            <Button variant="outline" onClick={cancelEdit}>
              Cancel
            </Button>
          )}
        </div>
      </Card>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => (
          <Card key={cat.id} className="p-4">
            <div className="flex items-start justify-between">
              <div className="min-w-0">
                {cat.image ? (
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="mb-2 size-12 rounded-lg object-contain bg-muted p-1"
                  />
                ) : (
                  <div className="text-3xl mb-2">{cat.icon.length <= 3 ? cat.icon : '🏷️'}</div>
                )}
                <h3 className="font-semibold text-foreground">{cat.name}</h3>
                {cat.description && (
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{cat.description}</p>
                )}
                <p className="text-sm text-muted-foreground mt-1">{cat.productCount} products</p>
              </div>
              <div className="flex shrink-0 gap-1">
                <button
                  onClick={() => startEdit(cat)}
                  className="p-2 hover:bg-accent rounded-lg text-muted-foreground"
                  aria-label={`Edit ${cat.name}`}
                >
                  <Pencil className="size-4" />
                </button>
                {cat.slug !== 'all' && (
                  <button
                    onClick={() => void handleDelete(cat.id)}
                    className="p-2 hover:bg-destructive/10 rounded-lg text-destructive"
                    aria-label={`Delete ${cat.name}`}
                  >
                    <Trash2 className="size-4" />
                  </button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
