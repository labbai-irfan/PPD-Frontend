import { useCallback, useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Plus, Search, Edit2, Trash2, Eye } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Pagination } from '@/components/ui/Pagination'
import { apiClient } from '@/services/api/client'

const PAGE_SIZE = 20

interface AdminProduct {
  id: string
  title: string
  category: string
  price: number
  stock: number
  isActive: boolean
  salesCount: number
  images: string[]
  status?: 'draft' | 'published'
}

interface AdminProductList {
  items: AdminProduct[]
  total: number
}

interface CategoryOption {
  id: string
  slug: string
  name: string
  parentId?: string
}

/** Mirrors the params AdminProductQueryDto accepts; '' means "no filter". */
interface Filters {
  status: '' | 'active' | 'inactive'
  category: string
  stockStatus: '' | 'in-stock' | 'low' | 'out'
  sort: 'newest' | 'name-asc' | 'stock-asc' | 'stock-desc'
}

const selectClass =
  'w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary'

export default function AdminProductsPage() {
  /*
   * Page and filters live in the URL, not component state: editing a product and
   * coming back must land on the page you left, and browser Back must restore it.
   */
  const [params, setParams] = useSearchParams()
  const search = params.get('q') ?? ''
  const page = Number(params.get('page') ?? '1')
  const filters: Filters = {
    status: (params.get('status') as Filters['status']) ?? '',
    category: params.get('category') ?? '',
    stockStatus: (params.get('stockStatus') as Filters['stockStatus']) ?? '',
    sort: (params.get('sort') as Filters['sort']) ?? 'newest',
  }

  const [products, setProducts] = useState<AdminProduct[]>([])
  const [categories, setCategories] = useState<CategoryOption[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [productToDelete, setProductToDelete] = useState<AdminProduct | null>(null)
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const filtersApplied = Object.values(filters).filter((v) => v && v !== 'newest').length
  /** The list URL to return to after editing — carried along as router state. */
  const listUrl = `/admin/products${params.toString() ? `?${params}` : ''}`

  useEffect(() => {
    void apiClient
      .get<CategoryOption[]>('/categories')
      .then(({ data }) => setCategories(data.filter((c) => c.slug !== 'all')))
      .catch(() => {})
  }, [])

  /* Keyed on the query string, not the derived objects — those are new every render. */
  const queryString = params.toString()

  const load = useCallback(async (qs: string) => {
    const sp = new URLSearchParams(qs)
    const pick = (key: string) => (sp.get(key) ? { [key]: sp.get(key) } : {})
    try {
      const { data } = await apiClient.get<AdminProductList>('/admin/products', {
        params: {
          ...pick('q'),
          ...pick('status'),
          ...pick('category'),
          ...pick('stockStatus'),
          sort: sp.get('sort') ?? 'newest',
          page: Number(sp.get('page') ?? '1'),
          pageSize: PAGE_SIZE,
        },
      })
      setProducts(data.items)
      setTotal(data.total)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load products')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const t = setTimeout(() => void load(queryString), search ? 300 : 0)
    return () => clearTimeout(t)
  }, [queryString, search, load])

  /**
   * Writes one search param. Every change except paging drops `page`, since page 3
   * of the old result set is meaningless once the set changes.
   */
  function update(key: string, value: string, opts?: { keepPage?: boolean; replace?: boolean }) {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    if (!opts?.keepPage) next.delete('page')
    setParams(next, { replace: opts?.replace })
  }

  function setFilter(key: keyof Filters, value: string) {
    update(key, key === 'sort' && value === 'newest' ? '' : value)
  }

  function setPage(next: number) {
    update('page', next > 1 ? String(next) : '', { keepPage: true })
  }

  const handleDelete = async (id: string) => {
    try {
      await apiClient.delete(`/admin/products/${id}`)
      setProducts((prev) => prev.filter((p) => p.id !== id))
      setTotal((t) => t - 1)
      toast.success('Product deleted')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Delete failed')
    }
  }

  const handleToggle = async (id: string) => {
    try {
      const { data } = await apiClient.post<AdminProduct>(`/admin/products/${id}/toggle`)
      setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, isActive: data.isActive } : p)))
      toast.success(data.isActive ? 'Product is now live' : 'Product hidden from store')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Toggle failed')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Products</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {loading ? 'Loading…' : `${total} products`}
            {!loading && (filtersApplied > 0 || search) && (
              <>
                {' · '}
                <button
                  type="button"
                  onClick={() => setParams(new URLSearchParams())}
                  className="font-semibold text-primary hover:underline"
                >
                  Clear filters
                </button>
              </>
            )}
          </p>
        </div>
        <Link to="/admin/products/add" state={{ from: listUrl }} className="w-full sm:w-auto">
          <Button className="gap-2 w-full sm:w-auto justify-center">
            <Plus className="size-4" />
            Add Product
          </Button>
        </Link>
      </div>

      <Card className="grid gap-3 p-3 sm:grid-cols-2 lg:grid-cols-5 md:p-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Search</label>
          <Input
            placeholder="Search products..."
            leftIcon={<Search className="size-4" />}
            value={search}
            /* replace: typing shouldn't push a history entry per keystroke */
            onChange={(e) => update('q', e.target.value, { replace: true })}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Category</label>
          <select
            className={selectClass}
            value={filters.category}
            onChange={(e) => setFilter('category', e.target.value)}
          >
            <option value="">All categories</option>
            {categories
              .filter((c) => !c.parentId)
              .map((parent) => {
                const subs = categories.filter((c) => c.parentId === parent.id)
                return subs.length === 0 ? (
                  <option key={parent.slug} value={parent.slug}>
                    {parent.name}
                  </option>
                ) : (
                  <optgroup key={parent.slug} label={parent.name}>
                    <option value={parent.slug}>{parent.name} (all)</option>
                    {subs.map((sub) => (
                      <option key={sub.slug} value={sub.slug}>
                        {sub.name}
                      </option>
                    ))}
                  </optgroup>
                )
              })}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Status</label>
          <select
            className={selectClass}
            value={filters.status}
            onChange={(e) => setFilter('status', e.target.value)}
          >
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Stock</label>
          <select
            className={selectClass}
            value={filters.stockStatus}
            onChange={(e) => setFilter('stockStatus', e.target.value)}
          >
            <option value="">Any stock</option>
            <option value="in-stock">In Stock</option>
            <option value="low">Low Stock</option>
            <option value="out">Out of Stock</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Sort By</label>
          <select
            className={selectClass}
            value={filters.sort}
            onChange={(e) => setFilter('sort', e.target.value)}
          >
            <option value="newest">Newest</option>
            <option value="name-asc">Name (A-Z)</option>
            <option value="stock-asc">Stock (Low to High)</option>
            <option value="stock-desc">Stock (High to Low)</option>
          </select>
        </div>
      </Card>

      {/* Desktop Table */}
      <Card className="hidden md:block p-4 md:p-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b">
            <tr>
              <th className="text-left py-3 font-semibold text-muted-foreground w-12"></th>
              <th className="text-left py-3 font-semibold text-muted-foreground">Product Name</th>
              <th className="text-left py-3 font-semibold text-muted-foreground">Category</th>
              <th className="text-left py-3 font-semibold text-muted-foreground">Price</th>
              <th className="text-left py-3 font-semibold text-muted-foreground">Stock</th>
              <th className="text-left py-3 font-semibold text-muted-foreground">Sales</th>
              <th className="text-left py-3 font-semibold text-muted-foreground">Status</th>
              <th className="text-left py-3 font-semibold text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-b hover:bg-muted/50 transition-colors">
                <td className="py-3">
                  {product.images?.[0] ? (
                    <img
                      src={product.images[0]}
                      alt={product.title}
                      loading="lazy"
                      className="size-10 rounded-lg object-cover border border-border bg-muted"
                    />
                  ) : (
                    <div className="size-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground text-xs">
                      —
                    </div>
                  )}
                </td>
                <td className="py-3 font-medium text-foreground">{product.title}</td>
                <td className="py-3 text-muted-foreground capitalize">{product.category}</td>
                <td className="py-3 font-semibold">₹{product.price}</td>
                <td className="py-3">
                  <span className={product.stock > 0 ? 'text-success' : 'text-destructive'}>
                    {product.stock} items
                  </span>
                </td>
                <td className="py-3 text-muted-foreground">{product.salesCount}</td>
                <td className="py-3">
                  <div className="flex flex-wrap gap-1.5">
                    {product.status === 'draft' && (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-warning/10 text-warning">
                        Draft
                      </span>
                    )}
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      product.isActive
                        ? 'bg-success/10 text-success'
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {product.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </td>
                <td className="py-3 flex gap-1.5">
                  <Link to={`/admin/products/${product.id}/edit`} state={{ from: listUrl }}>
                    <button className="p-2 hover:bg-primary/10 rounded-lg text-primary transition-colors" title="Edit">
                      <Edit2 className="size-4" />
                    </button>
                  </Link>
                  <button
                    onClick={() => handleToggle(product.id)}
                    className="p-2 hover:bg-warning/10 rounded-lg text-warning transition-colors"
                    title={product.isActive ? 'Hide from store' : 'Make live'}
                  >
                    <Eye className="size-4" />
                  </button>
                  <button
                    onClick={() => setProductToDelete(product)}
                    className="p-2 hover:bg-destructive/10 rounded-lg text-destructive transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </td>
              </tr>
            ))}
            {!loading && products.length === 0 && (
              <tr>
                <td colSpan={8} className="py-8 text-center text-muted-foreground">
                  No products found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {products.map((product) => (
          <Card key={product.id} className="p-4">
            <div className="flex gap-3">
              {product.images?.[0] ? (
                <img
                  src={product.images[0]}
                  alt={product.title}
                  loading="lazy"
                  className="size-16 rounded-lg object-cover border border-border bg-muted shrink-0"
                />
              ) : (
                <div className="size-16 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
                  —
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground truncate">{product.title}</h3>
                <p className="text-xs text-muted-foreground mt-0.5 capitalize">{product.category}</p>
                <div className="flex gap-3 mt-2 text-sm">
                  <span className="font-semibold">₹{product.price}</span>
                  <span className={product.stock > 0 ? 'text-success' : 'text-destructive'}>
                    {product.stock} items
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-2">
                  {product.status === 'draft' && (
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-warning/10 text-warning">
                      Draft
                    </span>
                  )}
                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                    product.isActive
                      ? 'bg-success/10 text-success'
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {product.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-3 pt-3 border-t">
              <Link to={`/admin/products/${product.id}/edit`} state={{ from: listUrl }} className="flex-1">
                <button className="w-full p-2 text-xs font-medium text-primary hover:bg-primary/10 rounded-lg transition-colors">
                  Edit
                </button>
              </Link>
              <button
                onClick={() => handleToggle(product.id)}
                className="flex-1 p-2 text-xs font-medium text-warning hover:bg-warning/10 rounded-lg transition-colors"
              >
                {product.isActive ? 'Hide' : 'Show'}
              </button>
              <button
                onClick={() => setProductToDelete(product)}
                className="flex-1 p-2 text-xs font-medium text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </Card>
        ))}
        {!loading && products.length === 0 && (
          <div className="py-12 text-center text-muted-foreground">
            No products found
          </div>
        )}
      </div>

      <Pagination page={page} totalPages={totalPages} onChange={setPage} />

      <Modal
        open={!!productToDelete}
        onClose={() => setProductToDelete(null)}
        title="Confirm Deletion"
      >
        <div className="space-y-4 text-center sm:text-left">
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete <span className="font-semibold text-foreground">"{productToDelete?.title}"</span>? This action cannot be undone.
          </p>
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => setProductToDelete(null)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                if (productToDelete) {
                  await handleDelete(productToDelete.id)
                  setProductToDelete(null)
                }
              }}
              className="w-full sm:w-auto"
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
