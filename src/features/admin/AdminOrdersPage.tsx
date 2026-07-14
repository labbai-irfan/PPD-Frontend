import { useCallback, useEffect, useState, useRef } from 'react'
import { Search, ChevronDown } from 'lucide-react'
import { toast } from 'sonner'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { apiClient } from '@/services/api/client'

interface AdminOrder {
  id: string
  orderNumber: string
  customerName: string
  status: string
  createdAt: string
  items: { quantity: number }[]
  pricing: { total: number }
}

/** Forward transitions mirroring the backend's STATUS_TRANSITIONS. */
const NEXT_STATUS: Record<string, string[]> = {
  placed: ['confirmed', 'cancelled'],
  confirmed: ['processing', 'shipped', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['out-for-delivery', 'delivered'],
  'out-for-delivery': ['delivered'],
  delivered: [],
  cancelled: [],
  returned: [],
}

const STATUS_STYLE: Record<string, string> = {
  placed: 'bg-warning/10 text-warning',
  confirmed: 'bg-primary/10 text-primary',
  processing: 'bg-primary/10 text-primary',
  shipped: 'bg-info/10 text-info',
  'out-for-delivery': 'bg-info/10 text-info',
  delivered: 'bg-success/10 text-success',
  cancelled: 'bg-destructive/10 text-destructive',
  returned: 'bg-muted text-muted-foreground',
}

function StatusDropdown({
  options,
  onSelect,
  className = '',
}: {
  options: string[]
  onSelect: (status: string) => void
  className?: string
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (options.length === 0) {
    return <span className="text-xs text-muted-foreground">final</span>
  }

  return (
    <div className={`relative ${className}`} ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-2 px-3 py-1.5 border border-border rounded-lg bg-card hover:bg-muted text-foreground text-xs md:text-sm font-medium transition-colors shadow-sm"
      >
        <span>Change...</span>
        <ChevronDown className={`size-3.5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      
      {open && (
        <div className="absolute top-full left-0 mt-1 w-40 bg-card border border-border rounded-lg shadow-lg overflow-hidden z-50">
          <div className="py-1">
            {options.map((s) => (
              <button
                key={s}
                onClick={() => {
                  onSelect(s)
                  setOpen(false)
                }}
                className="w-full text-left px-3 py-2 text-xs md:text-sm hover:bg-primary/10 hover:text-primary transition-colors capitalize font-medium"
              >
                {s.replace(/-/g, ' ')}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  const load = useCallback(async (q: string) => {
    try {
      const { data } = await apiClient.get<{ items: AdminOrder[]; total: number }>(
        '/admin/orders',
        { params: { ...(q ? { q } : {}), pageSize: 50 } },
      )
      setOrders(data.items)
      setTotal(data.total)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load orders')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const t = setTimeout(() => void load(search), search ? 300 : 0)
    return () => clearTimeout(t)
  }, [search, load])

  const handleStatusChange = async (order: AdminOrder, status: string) => {
    try {
      const { data } = await apiClient.patch<AdminOrder>(
        `/admin/orders/${order.orderNumber}/status`,
        { status },
      )
      setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, status: data.status } : o)))
      toast.success(`${order.orderNumber} → ${data.status}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Status update failed')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Orders</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {loading ? 'Loading…' : `${total} orders`}
        </p>
      </div>

      <Card className="p-3 md:p-4">
        <Input
          placeholder="Search by order number or customer..."
          leftIcon={<Search className="size-4" />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </Card>

      {/* Desktop Table */}
      <Card className="hidden md:block p-4 md:p-6 overflow-x-auto min-h-[400px]">
        <table className="w-full text-sm">
          <thead className="border-b">
            <tr>
              <th className="text-left py-3 font-semibold text-muted-foreground">Order ID</th>
              <th className="text-left py-3 font-semibold text-muted-foreground">Customer</th>
              <th className="text-left py-3 font-semibold text-muted-foreground">Items</th>
              <th className="text-left py-3 font-semibold text-muted-foreground">Amount</th>
              <th className="text-left py-3 font-semibold text-muted-foreground">Date</th>
              <th className="text-left py-3 font-semibold text-muted-foreground">Status</th>
              <th className="text-left py-3 font-semibold text-muted-foreground w-36">Move To</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => {
              const nextOptions = NEXT_STATUS[order.status] ?? []
              return (
                <tr key={order.id} className="border-b hover:bg-muted/50 transition-colors">
                  <td className="py-3 font-mono font-semibold text-foreground">{order.orderNumber}</td>
                  <td className="py-3 text-foreground">{order.customerName}</td>
                  <td className="py-3 text-muted-foreground">
                    {order.items.reduce((n, i) => n + i.quantity, 0)} items
                  </td>
                  <td className="py-3 font-semibold">₹{order.pricing.total}</td>
                  <td className="py-3 text-muted-foreground">
                    {new Date(order.createdAt).toLocaleDateString('en-IN')}
                  </td>
                  <td className="py-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS_STYLE[order.status] ?? 'bg-muted'}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="py-3">
                    <StatusDropdown
                      options={nextOptions}
                      onSelect={(val) => void handleStatusChange(order, val)}
                    />
                  </td>
                </tr>
              )
            })}
            {!loading && orders.length === 0 && (
              <tr>
                <td colSpan={7} className="py-8 text-center text-muted-foreground">
                  No orders yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {orders.map((order) => {
          const nextOptions = NEXT_STATUS[order.status] ?? []
          return (
            <Card key={order.id} className="p-4">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-mono font-semibold text-foreground text-sm">{order.orderNumber}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{order.customerName}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${STATUS_STYLE[order.status] ?? 'bg-muted'}`}>
                    {order.status}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <p className="text-muted-foreground">Items</p>
                    <p className="font-semibold text-foreground mt-0.5">
                      {order.items.reduce((n, i) => n + i.quantity, 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Amount</p>
                    <p className="font-semibold text-foreground mt-0.5">₹{order.pricing.total}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Date</p>
                    <p className="font-semibold text-foreground mt-0.5">
                      {new Date(order.createdAt).toLocaleDateString('en-IN')}
                    </p>
                  </div>
                </div>

                <StatusDropdown
                  options={nextOptions}
                  onSelect={(val) => void handleStatusChange(order, val)}
                  className="mt-2"
                />
              </div>
            </Card>
          )
        })}
        {!loading && orders.length === 0 && (
          <div className="py-12 text-center text-muted-foreground">
            No orders yet
          </div>
        )}
      </div>
    </div>
  )
}
