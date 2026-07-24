import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { UploadCloud, X, Star, ImageIcon, ArrowLeft, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { apiClient } from '@/services/api/client'
import { formatCurrency, mediaUrl } from '@/lib/utils'
import type { ProductTag } from '@/types'

const schema = z.object({
  name: z.string().min(3, 'Product name is required'),
  category: z.string().min(1, 'Category is required'),
  brand: z.string().min(1, 'Brand is required'),
  shortDescription: z.string().optional(),
  description: z.string().min(20, 'Product description must be at least 20 characters'),
  sku: z.string().optional(),
  hsnCode: z.string().optional(),
  unitPrice: z.string().regex(/^\d+(\.\d+)?$/, 'Unit price must be a number').optional(),
  stockQuantity: z.string().regex(/^\d+$/, 'Stock must be a whole number').optional(),
  mrp: z.string().regex(/^\d+(\.\d+)?$/, 'Price must be a number'),
  discountPercent: z.string().optional(),
  gstPercent: z.string().optional(),
  weightPerUnit: z.string().optional(),
  weightUnit: z.enum(['kg', 'g']),
  isPpdOriginal: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  isFreeDelivery: z.boolean().optional(),
  freeDeliveryThreshold: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

interface CategoryOption {
  id: string
  slug: string
  name: string
  parentId?: string | null
}

interface FaqRow {
  question: string
  answer: string
}

interface SpecRow {
  label: string
  value: string
}

interface BatchRow {
  id?: string
  sku: string
  name: string
  quantity: string
  calculatedPrice: string
  discountType: 'none' | 'percentage' | 'fixed'
  discountValue: string
  sellingPrice: string
  pricingMode: 'auto' | 'custom'
  displayOrder: string
  status: 'active' | 'inactive' | 'hidden'
  isDefault: boolean
  image?: string
  description?: string
  badge: 'none' | 'popular' | 'best-seller' | 'recommended' | 'most-value' | 'limited-offer'
  minOrderCount: string
  maxOrderCount: string
}

const emptyFaq: FaqRow = { question: '', answer: '' }
const emptySpec: SpecRow = { label: '', value: '' }
const emptyBatch: BatchRow = {
  sku: '',
  name: '',
  quantity: '1',
  calculatedPrice: '0',
  discountType: 'none',
  discountValue: '0',
  sellingPrice: '0',
  pricingMode: 'auto',
  displayOrder: '0',
  status: 'active',
  isDefault: false,
  badge: 'none',
  minOrderCount: '1',
  maxOrderCount: '99',
}

/** Repeatable-row card: FAQs, Specifications, Batches all share this shape (two fields + add/remove). */
function RepeatableSection<T>({
  title,
  rows,
  setRows,
  empty,
  addLabel,
  renderRow,
}: {
  title: string
  rows: T[]
  setRows: (rows: T[]) => void
  empty: T
  addLabel: string
  renderRow: (row: T, update: (patch: Partial<T>) => void, index: number) => React.ReactNode
}) {
  return (
    <Card className="p-6">
      <h2 className="font-semibold text-foreground mb-4">{title}</h2>
      <div className="space-y-3">
        {rows.map((row, i) => (
          <div key={i} className="flex items-start gap-2">
            <span className="mt-2.5 w-4 shrink-0 text-xs text-muted-foreground">{i + 1}</span>
            <div className="flex-1">{renderRow(row, (patch) => setRows(rows.map((r, ri) => (ri === i ? { ...r, ...patch } : r))), i)}</div>
            <button
              type="button"
              onClick={() => setRows(rows.filter((_, ri) => ri !== i))}
              className="mt-2 shrink-0 p-1.5 rounded-lg text-destructive hover:bg-destructive/10"
              aria-label="Remove row"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => setRows([...rows, empty])}
        className="mt-3 w-full rounded-lg bg-muted py-2.5 text-sm font-semibold text-foreground hover:bg-muted/70 flex items-center justify-center gap-1.5"
      >
        <Plus className="size-4" />
        {addLabel}
      </button>
    </Card>
  )
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

  const [faqs, setFaqs] = useState<FaqRow[]>([])
  const [specs, setSpecs] = useState<SpecRow[]>([])
  const [batches, setBatches] = useState<BatchRow[]>([])
  const [existingTags, setExistingTags] = useState<ProductTag[]>([])

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
        setImages((prev) => [...prev, mediaUrl(data.url)])
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
    defaultValues: { weightUnit: 'kg' },
  })

  const isFreeDelivery = watch('isFreeDelivery')
  const mrp = Number(watch('mrp')) || 0
  const discountPercent = Number(watch('discountPercent')) || 0
  const gstPercent = Number(watch('gstPercent')) || 0
  const finalPrice = useMemo(() => {
    const discounted = mrp * (1 - discountPercent / 100)
    const withGst = discounted * (1 + gstPercent / 100)
    return Math.max(0, Math.round(withGst * 100) / 100)
  }, [mrp, discountPercent, gstPercent])

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
            shortDescription: data.shortDescription ?? '',
            description: data.description,
            sku: data.sku ?? '',
            hsnCode: data.hsnCode ?? '',
            unitPrice: data.unitPrice != null ? String(data.unitPrice) : String(data.price),
            stockQuantity: data.stockQuantity != null ? String(data.stockQuantity) : String(data.stock ?? 0),
            mrp: String(data.mrp),
            discountPercent: data.discountPercent != null ? String(data.discountPercent) : '',
            gstPercent: data.gstPercent != null ? String(data.gstPercent) : '',
            weightPerUnit: data.weightPerUnit != null ? String(data.weightPerUnit) : '',
            weightUnit: data.weightUnit ?? 'kg',
            isPpdOriginal: data.isPpdOriginal ?? false,
            isFeatured: (data.tags ?? []).includes('featured'),
            isFreeDelivery: data.isFreeDelivery ?? false,
            freeDeliveryThreshold: data.freeDeliveryThreshold ? String(data.freeDeliveryThreshold) : '',
          })
          setImages(data.images ?? [])
          setFaqs(data.faqs ?? [])
          setSpecs(data.specs ?? [])
          setExistingTags(data.tags ?? [])
          setBatches(
            (data.batches ?? []).map((b: any) => ({
              id: b._id || b.id,
              sku: b.sku ?? '',
              name: b.name ?? '',
              quantity: String(b.quantity ?? 1),
              calculatedPrice: String(b.calculatedPrice ?? 0),
              discountType: b.discountType ?? 'none',
              discountValue: String(b.discountValue ?? 0),
              sellingPrice: String(b.sellingPrice ?? 0),
              pricingMode: b.pricingMode ?? 'auto',
              displayOrder: String(b.displayOrder ?? 0),
              status: b.status ?? 'active',
              isDefault: b.isDefault ?? false,
              image: b.image ?? '',
              description: b.description ?? '',
              badge: b.badge ?? 'none',
              minOrderCount: String(b.minOrderCount ?? 1),
              maxOrderCount: String(b.maxOrderCount ?? 99),
            }))
          )
        })
        .catch(() => toast.error('Failed to load product'))
    }
  }, [id, isEditing, reset])

  async function submitProduct(values: FormValues, status: 'draft' | 'published') {
    if (batches.length === 0) {
      toast.error('Add at least one stock batch')
      return
    }
    const invalidBatch = batches.some((b) => !b.name || !b.quantity || (b.pricingMode === 'custom' && b.sellingPrice === ''))
    if (invalidBatch) {
      toast.error('Every batch needs a name, quantity, and selling price (if Custom)')
      return
    }

    const tags = new Set(existingTags)
    if (values.isFeatured) tags.add('featured')
    else tags.delete('featured')

    const payload = {
      title: values.name,
      brand: values.brand,
      category: values.category,
      shortDescription: values.shortDescription?.trim() || undefined,
      description: values.description,
      sku: values.sku?.trim() || undefined,
      hsnCode: values.hsnCode?.trim() || undefined,
      unitPrice: values.unitPrice ? Number(values.unitPrice) : finalPrice,
      stockQuantity: values.stockQuantity ? Number(values.stockQuantity) : 0,
      mrp: Number(values.mrp),
      price: values.unitPrice ? Number(values.unitPrice) : finalPrice,
      stock: values.stockQuantity ? Number(values.stockQuantity) : 0,
      discountPercent: values.discountPercent ? Number(values.discountPercent) : undefined,
      gstPercent: values.gstPercent ? Number(values.gstPercent) : undefined,
      weightPerUnit: values.weightPerUnit ? Number(values.weightPerUnit) : undefined,
      weightUnit: values.weightUnit,
      isPpdOriginal: values.isPpdOriginal ?? false,
      isFreeDelivery: values.isFreeDelivery ?? false,
      ...(values.isFreeDelivery && values.freeDeliveryThreshold ? { freeDeliveryThreshold: Number(values.freeDeliveryThreshold) } : {}),
      ...(images.length ? { images } : {}),
      faqs: faqs.filter((f) => f.question.trim() && f.answer.trim()),
      specs: specs.filter((s) => s.label.trim() && s.value.trim()),
      batches: batches.map((b) => {
        const calculatedPrice = (Number(values.unitPrice) || finalPrice) * (Number(b.quantity) || 0)
        let sellingPrice = Number(b.sellingPrice) || 0
        if (b.pricingMode === 'auto') {
          let discountAmount = 0
          const discountValue = Number(b.discountValue) || 0
          if (b.discountType === 'percentage') {
            discountAmount = (calculatedPrice * discountValue) / 100
          } else if (b.discountType === 'fixed') {
            discountAmount = discountValue
          }
          sellingPrice = Math.max(0, calculatedPrice - discountAmount)
        }

        return {
          id: b.id,
          sku: b.sku || `${values.sku || 'BATCH'}-${b.quantity}-${Math.floor(Math.random() * 1000)}`,
          name: b.name,
          quantity: Number(b.quantity),
          calculatedPrice,
          discountType: b.discountType || 'none',
          discountValue: Number(b.discountValue || 0),
          sellingPrice,
          pricingMode: b.pricingMode || 'auto',
          displayOrder: Number(b.displayOrder || 0),
          status: b.status || 'active',
          isDefault: b.isDefault || false,
          image: b.image || undefined,
          description: b.description || undefined,
          badge: b.badge || 'none',
          minOrderCount: Number(b.minOrderCount || 1),
          maxOrderCount: Number(b.maxOrderCount || 99),
        }
      }),
      tags: [...tags],
      status,
    }

    try {
      if (isEditing) {
        await apiClient.patch(`/admin/products/${id}`, payload)
        toast.success(status === 'draft' ? 'Saved as draft' : 'Product updated and published')
      } else {
        await apiClient.post('/admin/products', payload)
        toast.success(status === 'draft' ? 'Saved as draft' : 'Product published')
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
    <form onSubmit={handleSubmit((v) => submitProduct(v, 'published'))} className="space-y-6" noValidate>
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
          <Button
            type="button"
            variant="outline"
            loading={isSubmitting}
            onClick={() => void handleSubmit((v) => submitProduct(v, 'draft'))()}
          >
            Save as Draft
          </Button>
          <Button type="submit" loading={isSubmitting} className="min-w-[140px]">
            Publish Product
          </Button>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* LEFT — details (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <h2 className="font-semibold text-foreground mb-4">Product Information</h2>
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <Input
                  label="Product Name"
                  placeholder="e.g., A5 Notebooks"
                  error={errors.name?.message}
                  {...register('name')}
                />
                <Input
                  label="ISBN"
                  placeholder="e.g., 978-3-16-148410-0"
                  error={errors.sku?.message}
                  {...register('sku')}
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
                  {categories
                    .filter((c) => c.slug !== 'all' && !c.parentId)
                    .map((parent) => {
                      const subcategories = categories.filter((c) => c.parentId === parent.id)
                      if (subcategories.length === 0) {
                        return (
                          <option key={parent.slug} value={parent.slug}>
                            {parent.name}
                          </option>
                        )
                      }
                      return (
                        <optgroup key={parent.slug} label={parent.name}>
                          <option value={parent.slug}>{parent.name}</option>
                          {subcategories.map((sub) => (
                            <option key={sub.slug} value={sub.slug}>
                              {sub.name}
                            </option>
                          ))}
                        </optgroup>
                      )
                    })}
                </select>
                {errors.category && (
                  <p className="mt-1 text-sm text-destructive">{errors.category.message}</p>
                )}
              </div>

              <Input
                label="Short Description"
                placeholder="One-line summary shown above the full description"
                error={errors.shortDescription?.message}
                {...register('shortDescription')}
              />

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Long Description</label>
                <textarea
                  placeholder="Product description (min 20 characters)..."
                  className="w-full min-h-[140px] px-3 py-2.5 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-y"
                  {...register('description')}
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-destructive">{errors.description.message}</p>
                )}
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

          <RepeatableSection<FaqRow>
            title="Product FAQs"
            rows={faqs}
            setRows={setFaqs}
            empty={emptyFaq}
            addLabel="Add FAQ Row"
            renderRow={(row, update) => (
              <div className="grid sm:grid-cols-2 gap-2">
                <Input
                  placeholder="e.g., What is the maximum load it can handle?"
                  value={row.question}
                  onChange={(e) => update({ question: e.target.value })}
                />
                <Input
                  placeholder="e.g., The recommended deflection is..."
                  value={row.answer}
                  onChange={(e) => update({ answer: e.target.value })}
                />
              </div>
            )}
          />

          <RepeatableSection<SpecRow>
            title="Specifications"
            rows={specs}
            setRows={setSpecs}
            empty={emptySpec}
            addLabel="Add Specification"
            renderRow={(row, update) => (
              <div className="grid sm:grid-cols-2 gap-2">
                <Input
                  placeholder="e.g. Colour, Material, Size"
                  value={row.label}
                  onChange={(e) => update({ label: e.target.value })}
                />
                <Input
                  placeholder="e.g. Red, High Carbon Steel, Large"
                  value={row.value}
                  onChange={(e) => update({ value: e.target.value })}
                />
              </div>
            )}
          />
          <p className="-mt-4 text-xs text-muted-foreground">
            Shown as a table on the product page — colour, quantity, material, anything customers should see at a glance.
          </p>

          <Card className="p-6">
            <h2 className="font-semibold text-foreground mb-4">Inventory</h2>
            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <Input label="HSN Code" placeholder="Enter HSN Code" {...register('hsnCode')} />
              <Input
                label="Available Stock (Total Units)"
                type="number"
                placeholder="100"
                error={errors.stockQuantity?.message}
                {...register('stockQuantity')}
              />
            </div>

            <p className="text-sm font-semibold text-foreground mb-2">Packages</p>
            <div className="space-y-4">
              {batches.map((b, i) => {
                const calculatedPrice = Number(watch('unitPrice')) * (Number(b.quantity) || 0)
                let sellingPrice = Number(b.sellingPrice) || 0
                if (b.pricingMode === 'auto') {
                  let discountAmount = 0
                  const discountValue = Number(b.discountValue) || 0
                  if (b.discountType === 'percentage') {
                    discountAmount = (calculatedPrice * discountValue) / 100
                  } else if (b.discountType === 'fixed') {
                    discountAmount = discountValue
                  }
                  sellingPrice = Math.max(0, calculatedPrice - discountAmount)
                }

                const updateBatch = (patch: Partial<BatchRow>) => {
                  setBatches(batches.map((r, ri) => (ri === i ? { ...r, ...patch } : r)))
                }

                return (
                  <div key={i} className="p-5 rounded-2xl border border-border bg-card/30 space-y-4 relative group">
                    <div className="flex items-center justify-between pb-2 border-b border-border">
                      <span className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                        <span className="size-2 rounded-full bg-primary" />
                        Package Option #{i + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => setBatches(batches.filter((_, ri) => ri !== i))}
                        className="p-1 rounded-lg text-destructive hover:bg-destructive/10 transition-colors flex items-center justify-center cursor-pointer"
                        aria-label="Remove batch"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                      <Input
                        label="Batch Name"
                        placeholder="e.g. Small Pack"
                        value={b.name}
                        onChange={(e) => updateBatch({ name: e.target.value })}
                        className="h-[42px]"
                      />
                      <Input
                        label="Pack size (Units)"
                        type="number"
                        placeholder="10"
                        value={b.quantity}
                        onChange={(e) => updateBatch({ quantity: e.target.value })}
                        className="h-[42px]"
                      />
                      <div>
                        <label className="block text-xs font-semibold text-muted-foreground mb-2">Pricing Mode</label>
                        <select
                          className="w-full h-[42px] px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                          value={b.pricingMode}
                          onChange={(e) => updateBatch({ pricingMode: e.target.value as 'auto' | 'custom' })}
                        >
                          <option value="auto">Auto (Unit × Qty)</option>
                          <option value="custom">Custom (Override)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-muted-foreground mb-2">Status</label>
                        <select
                          className="w-full h-[42px] px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                          value={b.status}
                          onChange={(e) => updateBatch({ status: e.target.value as any })}
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                          <option value="hidden">Hidden</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
                      {b.pricingMode === 'auto' ? (
                        <>
                          <div>
                            <label className="block text-xs font-semibold text-muted-foreground mb-2">Discount Type</label>
                            <select
                              className="w-full h-[42px] px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                              value={b.discountType}
                              onChange={(e) => updateBatch({ discountType: e.target.value as 'none' | 'percentage' | 'fixed' })}
                            >
                              <option value="none">No Discount</option>
                              <option value="percentage">Percentage (%)</option>
                              <option value="fixed">Fixed Amount (₹)</option>
                            </select>
                          </div>
                          <Input
                            label="Discount Value"
                            type="number"
                            disabled={b.discountType === 'none'}
                            value={b.discountValue}
                            onChange={(e) => updateBatch({ discountValue: e.target.value })}
                            className="h-[42px]"
                          />
                          <div>
                            <label className="block text-xs font-semibold text-muted-foreground mb-2">
                              Selling Price (₹)
                            </label>
                            <div className="w-full h-[42px] px-3 py-2 border border-border rounded-lg bg-muted text-foreground text-sm font-semibold flex items-center">
                              {formatCurrency(sellingPrice)}
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div>
                            <label className="block text-xs font-semibold text-muted-foreground mb-2">
                              Selling Price (₹)
                            </label>
                            <Input
                              type="number"
                              placeholder="Price"
                              value={b.sellingPrice}
                              onChange={(e) => updateBatch({ sellingPrice: e.target.value })}
                              className="h-[42px]"
                            />
                          </div>
                        </>
                      )}

                      <div className="h-[42px] flex items-center justify-center border border-border rounded-lg bg-card/20 hover:bg-card/50 transition-colors">
                        <label className="flex items-center gap-2.5 cursor-pointer px-4 size-full select-none justify-center">
                          <input
                            type="checkbox"
                            checked={b.isDefault}
                            onChange={(e) => {
                              const checked = e.target.checked
                              setBatches(batches.map((r, ri) => ({
                                ...r,
                                isDefault: ri === i ? checked : checked ? false : r.isDefault
                              })))
                            }}
                            className="size-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
                          />
                          <span className="text-xs font-bold text-foreground">Default Option</span>
                        </label>
                      </div>

                      {b.pricingMode === 'custom' && (
                        <div className="sm:col-span-2" />
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
            <button
              type="button"
              onClick={() => setBatches([...batches, emptyBatch])}
              className="mt-4 w-full rounded-lg bg-muted py-2.5 text-sm font-semibold text-foreground hover:bg-muted/70 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Plus className="size-4" />
              Add a Package Option
            </button>
          </Card>
        </div>

        {/* RIGHT — images + pricing + shipping + publishing (1/3) */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="p-6">
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

          <Card className="p-6">
            <h2 className="font-semibold text-foreground mb-4">Pricing (Per Unit)</h2>
            <div className="space-y-4">
              <Input
                label="Unit Price (₹)"
                type="number"
                placeholder="10"
                error={errors.unitPrice?.message}
                {...register('unitPrice')}
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="MRP (₹)"
                  type="number"
                  placeholder="400"
                  error={errors.mrp?.message}
                  {...register('mrp')}
                />
                <Input label="Discount (%)" type="number" placeholder="0" {...register('discountPercent')} />
                <Input label="GST (%)" type="number" placeholder="0" {...register('gstPercent')} />
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Final Price (Calculated)</label>
                  <div className="px-3 py-2.5 rounded-lg border border-border bg-muted text-foreground font-semibold">
                    {formatCurrency(finalPrice)}
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="font-semibold text-foreground mb-4">Shipping</h2>
            <div className="flex gap-2">
              <div className="flex-1">
                <Input label="Weight (Per Unit)" type="number" placeholder="0" {...register('weightPerUnit')} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Unit</label>
                <select
                  className="px-3 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary h-[42px]"
                  {...register('weightUnit')}
                >
                  <option value="kg">Kg</option>
                  <option value="g">g</option>
                </select>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="font-semibold text-foreground mb-4">Featured</h2>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isFeatured"
                className="size-4 rounded border-border text-primary focus:ring-primary"
                {...register('isFeatured')}
              />
              <label htmlFor="isFeatured" className="text-sm font-medium text-foreground cursor-pointer select-none">
                Featured Product
              </label>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Show this product in the home page featured section.</p>
          </Card>
        </div>
      </div>

      {/* Mobile action bar */}
      <div className="flex sm:hidden gap-3">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          loading={isSubmitting}
          onClick={() => void handleSubmit((v) => submitProduct(v, 'draft'))()}
        >
          Save as Draft
        </Button>
        <Button type="submit" className="flex-1" loading={isSubmitting}>
          Publish
        </Button>
      </div>
    </form>
  )
}
