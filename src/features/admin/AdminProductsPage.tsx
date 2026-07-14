import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, Edit2, Trash2, Eye } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { apiClient } from '@/services/api/client'

interface AdminProduct {
  id: string
  title: string
  category: string
  price: number
  stock: number
  isActive: boolean
  salesCount: number
  images: string[]
}

interface AdminProductList {
  items: AdminProduct[]
  total: number
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<AdminProduct[]>([])
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  const load = useCallback(async (q: string) => {
    try {
      const { data } = await apiClient.get<AdminProductList>('/admin/products', {
        params: { ...(q ? { q } : {}), pageSize: 50 },
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
    const t = setTimeout(() => void load(search), search ? 300 : 0)
    return () => clearTimeout(t)
  }, [search, load])

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
          </p>
        </div>
        <Link to="/admin/products/add" className="w-full sm:w-auto">
          <Button className="gap-2 w-full sm:w-auto justify-center">
            <Plus className="size-4" />
            Add Product
          </Button>
        </Link>
      </div>

      <Card className="p-3 md:p-4">
        <Input
          placeholder="Search products..."
          leftIcon={<Search className="size-4" />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
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
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    product.isActive
                      ? 'bg-success/10 text-success'
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {product.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="py-3 flex gap-1.5">
                  <Link to={`/admin/products/${product.id}/edit`}>
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
                    onClick={() => handleDelete(product.id)}
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
                <div className="flex items-center gap-2 mt-2">
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
              <Link to={`/admin/products/${product.id}/edit`} className="flex-1">
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
                onClick={() => handleDelete(product.id)}
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
    </div>
  )
}
