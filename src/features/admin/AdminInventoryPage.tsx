import { useCallback, useEffect, useState } from 'react'
import { Boxes, Eye, EyeOff, Plus, RefreshCw, Search } from 'lucide-react'
import { toast } from 'sonner'
import { cn, formatCurrency } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { apiClient } from '@/services/api/client'

import type { ProductBatch } from '@/types'

const PAGE_SIZE = 10
const LOW_STOCK_THRESHOLD = 10

type StatusTab = 'active' | 'inactive'
type StockStatus = 'in-stock' | 'low' | 'out'
type SortOption = 'newest' | 'name-asc' | 'stock-asc' | 'stock-desc'

interface InventoryProduct {
  id: string
  title: string
  category: string
  stock: number
  isActive: boolean
  images: string[]
  updatedAt: string
  batches?: ProductBatch[]
}

interface CategoryOption {
  id: string
  slug: string
  name: string
}

function stockStatusOf(stock: number): StockStatus {
  if (stock <= 0) return 'out'
  if (stock < LOW_STOCK_THRESHOLD) return 'low'
  return 'in-stock'
}

const stockBadge: Record<StockStatus, { label: string; className: string }> = {
  'in-stock': { label: 'In Stock', className: 'bg-success/15 text-success' },
  low: { label: 'Low', className: 'bg-warning/15 text-warning' },
  out: { label: 'Out of Stock', className: 'bg-destructive/15 text-destructive' },
}

const rowTint: Record<StockStatus, string> = {
  'in-stock': 'bg-success/5',
  low: 'bg-warning/10',
  out: 'bg-destructive/5',
}

export default function AdminInventoryPage() {
  const [stats, setStats] = useState({ total: 0, addedThisMonth: 0 })
  const [orderStats, setOrderStats] = useState({ pending: 0, completed: 0 })
  const [categories, setCategories] = useState<Map<string, string>>(new Map())

  const [tab, setTab] = useState<StatusTab>('active')
  const [search, setSearch] = useState('')
  const [stockFilter, setStockFilter] = useState<StockStatus | ''>('')
  const [sort, setSort] = useState<SortOption>('newest')
  const [page, setPage] = useState(1)

  const [products, setProducts] = useState<InventoryProduct[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [stockEdits, setStockEdits] = useState<Record<string, number>>({})
  const [saving, setSaving] = useState(false)

  const [batchesFor, setBatchesFor] = useState<InventoryProduct | null>(null)
  const [newPackageName, setNewPackageName] = useState('')
  const [newBatchQty, setNewBatchQty] = useState('')
  const [newPackagePrice, setNewPackagePrice] = useState('')
  const [addingBatch, setAddingBatch] = useState(false)

  useEffect(() => {
    apiClient
      .get<{ total: number; addedThisMonth: number }>('/admin/products/stats')
      .then((r) => setStats(r.data))
      .catch(() => {})

    apiClient
      .get<{ orders: { total: number; delivered: number; cancelled: number } }>('/admin/dashboard')
      .then((r) => {
        const { total, delivered, cancelled } = r.data.orders
        setOrderStats({ pending: Math.max(0, total - delivered - cancelled), completed: delivered })
      })
      .catch(() => {})

    apiClient
      .get<CategoryOption[]>('/categories')
      .then((r) => setCategories(new Map(r.data.map((c) => [c.slug, c.name]))))
      .catch(() => {})
  }, [])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await apiClient.get<{ items: InventoryProduct[]; total: number }>('/admin/products', {
        params: {
          status: tab,
          ...(search ? { q: search } : {}),
          ...(stockFilter ? { stockStatus: stockFilter } : {}),
          sort,
          page,
          pageSize: PAGE_SIZE,
        },
      })
      setProducts(data.items)
      setTotal(data.total)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to load inventory')
    } finally {
      setLoading(false)
    }
  }, [tab, search, stockFilter, sort, page])

  useEffect(() => {
    const t = setTimeout(() => void load(), search ? 300 : 0)
    return () => clearTimeout(t)
  }, [load, search])

  // Filters that change the result set reset pagination and the current selection/edits.
  useEffect(() => {
    setPage(1)
    setSelected(new Set())
    setStockEdits({})
  }, [tab, search, stockFilter, sort])

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  function toggleSelectAll() {
    setSelected((prev) => (prev.size === products.length ? new Set() : new Set(products.map((p) => p.id))))
  }

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function editStock(id: string, value: string) {
    const n = Math.max(0, Number(value) || 0)
    setStockEdits((prev) => ({ ...prev, [id]: n }))
  }

  async function handleSaveChanges() {
    const entries = Object.entries(stockEdits)
    if (entries.length === 0) return
    setSaving(true)
    try {
      const results = await Promise.allSettled(
        entries.map(([id, stock]) => apiClient.patch(`/admin/products/${id}`, { stock })),
      )
      const failed = results.filter((r) => r.status === 'rejected').length
      if (failed > 0) toast.error(`${failed} update(s) failed`)
      if (failed < entries.length) toast.success(`Stock updated for ${entries.length - failed} product(s)`)
      setStockEdits({})
      void load()
    } finally {
      setSaving(false)
    }
  }

  function openBatches(p: InventoryProduct) {
    setBatchesFor(p)
    setNewPackageName('')
    setNewBatchQty('')
    setNewPackagePrice('')
  }

  async function handleAddBatch() {
    if (!batchesFor) return
    const name = newPackageName.trim()
    const quantity = Number(newBatchQty)
    const price = Number(newPackagePrice)
    
    if (!name) {
      toast.error('Enter a package name')
      return
    }
    if (!quantity || quantity <= 0) {
      toast.error('Enter a package quantity')
      return
    }
    if (!newPackagePrice || price < 0) {
      toast.error('Enter a package selling price')
      return
    }
    setAddingBatch(true)
    try {
      const newBatch: any = {
        name,
        quantity,
        sellingPrice: price,
        calculatedPrice: price,
        pricingMode: 'custom',
        status: 'active',
        sku: `${batchesFor.title.replace(/\s+/g, '-').toUpperCase()}-${quantity}-${Math.floor(Math.random() * 1000)}`,
        isDefault: batchesFor.batches?.length === 0,
      }
      const batches = [...(batchesFor.batches ?? []), newBatch]
      await apiClient.patch(`/admin/products/${batchesFor.id}`, { batches })
      toast.success(`Added package ${name} to ${batchesFor.title}`)
      setBatchesFor(null)
      void load()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to add package')
    } finally {
      setAddingBatch(false)
    }
  }

  async function handleBulkToggle() {
    if (selected.size === 0) return
    const ids = [...selected]
    try {
      await Promise.all(ids.map((id) => apiClient.post(`/admin/products/${id}/toggle`)))
      toast.success(tab === 'active' ? `${ids.length} product(s) hidden` : `${ids.length} product(s) shown`)
      setSelected(new Set())
      void load()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Bulk update failed')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Inventory</h1>
        <p className="mt-1 text-sm text-muted-foreground">Stock levels, availability and quick edits</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Card className="p-4">
          <p className="text-xs font-medium text-muted-foreground">Total Inventory</p>
          <p className="mt-1.5 text-2xl font-bold text-foreground">{stats.total}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-medium text-muted-foreground">Added This Month</p>
          <p className="mt-1.5 text-2xl font-bold text-foreground">{stats.addedThisMonth}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-medium text-muted-foreground">Orders Pending</p>
          <p className="mt-1.5 text-2xl font-bold text-foreground">{orderStats.pending}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-medium text-muted-foreground">Orders Completed</p>
          <p className="mt-1.5 text-2xl font-bold text-foreground">{orderStats.completed}</p>
        </Card>
      </div>

      {/* Filters */}
      <Card className="grid gap-3 p-4 md:grid-cols-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Search</label>
          <Input
            placeholder="Product name..."
            leftIcon={<Search className="size-4" />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Stock Status</label>
          <select
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value as StockStatus | '')}
          >
            <option value="">All statuses</option>
            <option value="in-stock">In Stock</option>
            <option value="low">Low Stock</option>
            <option value="out">Out of Stock</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Sort By</label>
          <select
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
          >
            <option value="newest">Newest</option>
            <option value="name-asc">Name (A-Z)</option>
            <option value="stock-asc">Stock (Low to High)</option>
            <option value="stock-desc">Stock (High to Low)</option>
          </select>
        </div>
        <div className="flex items-end">
          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={() => {
              setSearch('')
              setStockFilter('')
              setSort('newest')
            }}
          >
            <RefreshCw className="size-4" />
            Reset filters
          </Button>
        </div>
      </Card>

      {/* Tabs + bulk actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1 rounded-lg bg-muted p-1">
          <button
            onClick={() => setTab('active')}
            className={cn(
              'rounded-md px-3.5 py-1.5 text-sm font-semibold transition-colors',
              tab === 'active' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground',
            )}
          >
            All Products
          </button>
          <button
            onClick={() => setTab('inactive')}
            className={cn(
              'rounded-md px-3.5 py-1.5 text-sm font-semibold transition-colors',
              tab === 'inactive' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground',
            )}
          >
            Hidden Products
          </button>
        </div>

        {selected.size > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">{selected.size} selected</span>
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => void handleBulkToggle()}>
              {tab === 'active' ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
              {tab === 'active' ? 'Hide selected' : 'Show selected'}
            </Button>
          </div>
        )}
      </div>

      {/* Table */}
      <Card className="overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead className="border-b border-border">
            <tr>
              <th className="w-10 py-3 pl-4">
                <input
                  type="checkbox"
                  checked={products.length > 0 && selected.size === products.length}
                  onChange={toggleSelectAll}
                  className="size-4 rounded"
                />
              </th>
              <th className="py-3 text-left font-semibold text-muted-foreground">Image</th>
              <th className="py-3 text-left font-semibold text-muted-foreground">Product Name</th>
              <th className="py-3 text-left font-semibold text-muted-foreground">Category</th>
              <th className="py-3 text-left font-semibold text-muted-foreground">Stock</th>
              <th className="py-3 text-left font-semibold text-muted-foreground">Packages</th>
              <th className="py-3 text-left font-semibold text-muted-foreground">Stock Status</th>
              <th className="py-3 pr-4 text-left font-semibold text-muted-foreground">Last Updated</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => {
              const stock = stockEdits[p.id] ?? p.stock
              const status = stockStatusOf(stock)
              return (
                <tr key={p.id} className={cn('border-b border-border transition-colors', rowTint[status])}>
                  <td className="py-2.5 pl-4">
                    <input
                      type="checkbox"
                      checked={selected.has(p.id)}
                      onChange={() => toggleSelect(p.id)}
                      className="size-4 rounded"
                    />
                  </td>
                  <td className="py-2.5">
                    {p.images?.[0] ? (
                      <img src={p.images[0]} alt={p.title} className="size-10 rounded-lg border border-border bg-muted object-cover" />
                    ) : (
                      <div className="flex size-10 items-center justify-center rounded-lg bg-muted text-xs text-muted-foreground">—</div>
                    )}
                  </td>
                  <td className="py-2.5 pr-3 font-medium text-foreground">{p.title}</td>
                  <td className="py-2.5 pr-3 text-muted-foreground">{categories.get(p.category) ?? p.category}</td>
                  <td className="py-2.5 pr-3">
                    <input
                      type="number"
                      min={0}
                      value={stock}
                      onChange={(e) => editStock(p.id, e.target.value)}
                      className="w-20 rounded-lg border border-border bg-background px-2 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </td>
                  <td className="py-2.5 pr-3">
                    <button
                      type="button"
                      onClick={() => openBatches(p)}
                      className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-foreground hover:bg-accent"
                    >
                      <Boxes className="size-3.5" />
                      {p.batches?.length ? `${p.batches.length} package${p.batches.length > 1 ? 's' : ''}` : 'Add package'}
                    </button>
                  </td>
                  <td className="py-2.5 pr-3">
                    <span className={cn('rounded-full px-2.5 py-1 text-xs font-semibold', stockBadge[status].className)}>
                      {stockBadge[status].label}
                    </span>
                  </td>
                  <td className="py-2.5 pr-4 text-muted-foreground">
                    {p.updatedAt ? new Date(p.updatedAt).toLocaleDateString() : '—'}
                  </td>
                </tr>
              )
            })}
            {!loading && products.length === 0 && (
              <tr>
                <td colSpan={8} className="py-10 text-center text-muted-foreground">
                  No products found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
        >
          Previous
        </Button>
        <span className="text-sm text-muted-foreground">
          Page {page} / {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
        >
          Next
        </Button>
      </div>

      {/* Save changes bar */}
      {Object.keys(stockEdits).length > 0 && (
        <div className="sticky bottom-4 flex justify-end">
          <Card className="flex items-center gap-3 p-3 shadow-lg">
            <span className="text-sm text-muted-foreground">
              {Object.keys(stockEdits).length} stock change(s) pending
            </span>
            <Button onClick={() => void handleSaveChanges()} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </Card>
        </div>
      )}

      <Modal open={!!batchesFor} onClose={() => setBatchesFor(null)} title={batchesFor ? `Packages — ${batchesFor.title}` : ''}>
        {batchesFor && (
          <div className="space-y-4">
            {batchesFor.batches?.length ? (
              <div className="space-y-2">
                {batchesFor.batches.map((b, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2.5 text-sm border border-border">
                    <div>
                      <span className="font-bold text-foreground">{b.name}</span>
                      <span className="text-xs text-muted-foreground ml-2">({b.quantity} units)</span>
                      {b.isDefault && (
                        <span className="ml-2 rounded-full bg-primary/10 px-1.5 py-0.5 text-[9px] font-bold text-primary">Default</span>
                      )}
                      <span className={`ml-2 rounded-full px-1.5 py-0.5 text-[9px] font-bold ${b.status === 'active' ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
                        {b.status}
                      </span>
                    </div>
                    <span className="font-semibold text-foreground">{formatCurrency(b.sellingPrice)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No packages configured yet.</p>
            )}

            <div className="border-t border-border pt-4">
              <p className="mb-2 text-sm font-semibold text-foreground">Add a new package option</p>
              <div className="grid grid-cols-1 gap-2">
                <Input
                  placeholder="Package Name (e.g. Small Pack)"
                  value={newPackageName}
                  onChange={(e) => setNewPackageName(e.target.value)}
                />
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="number"
                    placeholder="Pack Size (Units)"
                    value={newBatchQty}
                    onChange={(e) => setNewBatchQty(e.target.value)}
                  />
                  <Input
                    type="number"
                    placeholder="Selling Price (₹)"
                    value={newPackagePrice}
                    onChange={(e) => setNewPackagePrice(e.target.value)}
                  />
                </div>
              </div>
              <Button className="mt-3 w-full gap-2" onClick={() => void handleAddBatch()} disabled={addingBatch}>
                <Plus className="size-4" />
                {addingBatch ? 'Adding...' : 'Add Package'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
