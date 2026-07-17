import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { UploadCloud, X, Star, ImageIcon, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { apiClient } from '@/services/api/client'

const schema = z.object({
  name: z.string().min(3, 'Product name is required'),
  category: z.string().min(1, 'Category is required'),
  price: z.string().regex(/^\d+(\.\d+)?$/, 'Price must be a number'),
  mrp: z.string().regex(/^\d+(\.\d+)?$/, 'MRP must be a number'),
  stock: z.string().regex(/^\d+$/, 'Stock must be a whole number'),
  brand: z.string().min(1, 'Brand is required'),
  description: z.string().min(20, 'Product description must be at least 20 characters'),
  isPpdOriginal: z.boolean().optional(),
  isFreeDelivery: z.boolean().optional(),
  freeDeliveryThreshold: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

interface CategoryOption {
  slug: string
  name: string
}

export default function AddProductPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditing = !!id
  const [categories, setCategories] = useState<CategoryOption[]>([])
  const [images, setImages] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const apiBase = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/api$/, '')

  async function uploadFiles(files: FileList | File[]) {
    const list = Array.from(files).filter((f) => f.type.startsWith('image/'))
    if (list.length === 0) {
      toast.error('Please choose image files (JPG, PNG or WebP)')
      return
    }
    setUploading(true)
    try {
      for (const file of list) {
        const fd = new FormData()
        fd.append('file', file)
        const { data } = await apiClient.post<{ url: string }>('/admin/uploads/image', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        setImages((prev) => [...prev, `${apiBase}${data.url}`])
      }
      toast.success(list.length > 1 ? `${list.length} images uploaded` : 'Image uploaded')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const { register, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  const isFreeDelivery = watch('isFreeDelivery')

  useEffect(() => {
    void apiClient
      .get<CategoryOption[]>('/categories')
      .then(({ data }) => setCategories(data.filter((c) => c.slug !== 'all')))
      .catch(() => {})

    if (isEditing) {
      void apiClient
        .get(`/products/${id}`)
        .then(({ data }) => {
          reset({
            name: data.title,
            brand: data.brand,
            category: data.category,
            price: String(data.price),
            mrp: String(data.mrp),
            description: data.description,
            isPpdOriginal: data.isPpdOriginal ?? false,
            isFreeDelivery: data.isFreeDelivery ?? false,
            freeDeliveryThreshold: data.freeDeliveryThreshold ? String(data.freeDeliveryThreshold) : '',
          })
          setImages(data.images ?? [])
        })
        .catch(() => toast.error('Failed to load product'))
    }
  }, [id, isEditing, reset])

  async function onSubmit(values: FormValues) {
    const payload = {
      title: values.name,
      brand: values.brand,
      category: values.category,
      price: Number(values.price),
      mrp: Number(values.mrp),
      description: values.description,
      isPpdOriginal: values.isPpdOriginal ?? false,
      isFreeDelivery: values.isFreeDelivery ?? false,
      ...(values.isFreeDelivery && values.freeDeliveryThreshold ? { freeDeliveryThreshold: Number(values.freeDeliveryThreshold) } : {}),
      ...(images.length ? { images } : {}),
    }

    try {
      if (isEditing) {
        await apiClient.patch(`/admin/products/${id}`, payload)
        toast.success('Product updated successfully!')
      } else {
        await apiClient.post('/admin/products', payload)
        toast.success('Product added successfully!')
      }
      navigate('/admin/products')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save product')
    }
  }

  const makeCover = (index: number) =>
    setImages((prev) => {
      const next = [...prev]
      const [picked] = next.splice(index, 1)
      return [picked, ...next]
    })

  const removeImage = (index: number) =>
    setImages((prev) => prev.filter((_, i) => i !== index))

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/admin/products')}
            className="p-2 rounded-lg hover:bg-muted text-muted-foreground"
          >
            <ArrowLeft className="size-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {isEditing ? 'Edit Product' : 'Add New Product'}
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {isEditing ? 'Update the product details' : 'Fill in the details to add a new product'}
            </p>
          </div>
        </div>
        <div className="hidden sm:flex gap-3">
          <Button type="button" variant="outline" onClick={() => navigate('/admin/products')}>
            Cancel
          </Button>
          <Button type="submit" loading={isSubmitting} className="min-w-[140px]">
            {isEditing ? 'Save Changes' : 'Add Product'}
          </Button>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* LEFT — details (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <h2 className="font-semibold text-foreground mb-4">Product Details</h2>
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <Input
                  label="Product Name"
                  placeholder="e.g., A5 Notebooks"
                  error={errors.name?.message}
                  {...register('name')}
                />
                <Input
                  label="Brand"
                  placeholder="e.g., PPD"
                  error={errors.brand?.message}
                  {...register('brand')}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Category</label>
                <select
                  className="w-full px-3 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  {...register('category')}
                >
                  <option value="">Select category…</option>
                  {categories.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="mt-1 text-sm text-destructive">{errors.category.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label="Price (₹)"
                  type="number"
                  placeholder="299"
                  error={errors.price?.message}
                  {...register('price')}
                />
                <Input
                  label="MRP (₹)"
                  type="number"
                  placeholder="400"
                  error={errors.mrp?.message}
                  {...register('mrp')}
                />
                <Input
                  label="Stock"
                  type="number"
                  placeholder="150"
                  error={errors.stock?.message}
                  {...register('stock')}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isPpdOriginal"
                  className="size-4 rounded border-border text-primary focus:ring-primary"
                  {...register('isPpdOriginal')}
                />
                <label htmlFor="isPpdOriginal" className="text-sm font-medium text-foreground cursor-pointer select-none">
                  Mark as "PPD Original"
                </label>
              </div>

              <div className="flex flex-col gap-1.5 mt-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isFreeDelivery"
                    className="size-4 rounded border-border text-primary focus:ring-primary"
                    {...register('isFreeDelivery')}
                  />
                  <label htmlFor="isFreeDelivery" className="text-sm font-medium text-foreground cursor-pointer select-none">
                    Offer Free Delivery
                  </label>
                </div>
                {isFreeDelivery && (
                  <div className="ml-6 mt-1">
                    <Input
                      type="number"
                      placeholder="Min amount (e.g. 499) or leave empty for unconditional"
                      error={errors.freeDeliveryThreshold?.message}
                      {...register('freeDeliveryThreshold')}
                    />
                  </div>
                )}
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="font-semibold text-foreground mb-4">Description</h2>
            <textarea
              placeholder="Product description (min 20 characters)..."
              className="w-full min-h-[160px] px-3 py-2.5 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-y"
              {...register('description')}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-destructive">{errors.description.message}</p>
            )}
          </Card>
        </div>

        {/* RIGHT — images (1/3) */}
        <div className="lg:col-span-1">
          <Card className="p-6 lg:sticky lg:top-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-foreground">Product Images</h2>
              <span className="text-xs text-muted-foreground">{images.length} added</span>
            </div>

            {/* Dropzone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault()
                setDragActive(true)
              }}
              onDragLeave={(e) => {
                e.preventDefault()
                setDragActive(false)
              }}
              onDrop={(e) => {
                e.preventDefault()
                setDragActive(false)
                if (e.dataTransfer.files?.length) void uploadFiles(e.dataTransfer.files)
              }}
              className={`flex flex-col items-center justify-center text-center rounded-xl border-2 border-dashed px-4 py-8 cursor-pointer transition-colors ${
                dragActive
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50 hover:bg-muted/50'
              }`}
            >
              <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                <UploadCloud className="size-6 text-primary" />
              </div>
              <p className="text-sm font-medium text-foreground">
                {uploading ? 'Uploading…' : 'Drag & drop images here'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                or <span className="text-primary font-semibold">browse files</span>
              </p>
              <p className="text-[11px] text-muted-foreground mt-2">JPG, PNG or WebP · up to 5 MB each</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={(e) => {
                if (e.target.files?.length) void uploadFiles(e.target.files)
                e.target.value = ''
              }}
              className="hidden"
            />

            {/* Thumbnails */}
            {images.length > 0 ? (
              <div className="grid grid-cols-3 gap-2 mt-4">
                {images.map((url, i) => (
                  <div
                    key={url + i}
                    className="group relative aspect-square rounded-lg overflow-hidden border border-border bg-muted"
                  >
                    <img src={url} alt={i === 0 ? 'Product cover image' : `Product image ${i + 1}`} className="w-full h-full object-cover" />
                    {i === 0 && (
                      <span className="absolute top-1 left-1 bg-primary text-primary-foreground text-[10px] font-semibold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                        <Star className="size-2.5 fill-current" /> Cover
                      </span>
                    )}
                    {/* Hover controls */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                      {i !== 0 && (
                        <button
                          type="button"
                          onClick={() => makeCover(i)}
                          title="Set as cover"
                          className="p-1.5 rounded-md bg-white/90 text-foreground hover:bg-white"
                        >
                          <Star className="size-3.5" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        title="Remove"
                        className="p-1.5 rounded-md bg-white/90 text-destructive hover:bg-white"
                      >
                        <X className="size-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                <ImageIcon className="size-4" />
                No images yet — the first one becomes the cover.
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Mobile action bar */}
      <div className="flex sm:hidden gap-3">
        <Button type="submit" size="lg" className="flex-1" loading={isSubmitting}>
          {isEditing ? 'Save Changes' : 'Add Product'}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="flex-1"
          onClick={() => navigate('/admin/products')}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
