import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Package, ShoppingCart, Users, TrendingUp, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { apiClient } from '@/services/api/client'

interface Dashboard {
  revenue: { total: number; thisMonth: number }
  orders: { total: number; thisMonth: number; placed: number; delivered: number; cancelled: number }
  products: { total: number; lowStock: number }
  users: { total: number }
  pendingReviews: number
  recentOrders: { id: string; orderNumber: string; customerName: string; status: string; createdAt: string; pricing: { total: number } }[]
  alerts: { type: 'warning' | 'error' | 'info'; message: string }[]
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<Dashboard | null>(null)

  useEffect(() => {
    void apiClient
      .get<Dashboard>('/admin/dashboard')
      .then((r) => setData(r.data))
      .catch((e: Error) => toast.error(e.message))
  }, [])

  if (!data) return <p className="text-muted-foreground p-8 animate-pulse text-center">Loading dashboard…</p>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Live store overview</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Revenue Card */}
        <Card className="p-5 border-l-4 border-l-success shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[13px] font-medium text-muted-foreground">Total Revenue</p>
              <p className="text-3xl font-bold text-foreground mt-1.5">₹{data.revenue.total.toLocaleString('en-IN')}</p>
              <p className="text-[12px] font-medium text-success mt-2 flex items-center gap-1">
                <TrendingUp className="size-3" />
                ₹{data.revenue.thisMonth.toLocaleString('en-IN')} this month
              </p>
            </div>
            <div className="p-2.5 bg-success/10 rounded-xl text-success">
              <TrendingUp className="size-5" />
            </div>
          </div>
        </Card>

        {/* Orders Card */}
        <Card className="p-5 border-l-4 border-l-primary shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-[13px] font-medium text-muted-foreground">Total Orders</p>
              <p className="text-3xl font-bold text-foreground mt-1.5">{data.orders.total}</p>
            </div>
            <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
              <ShoppingCart className="size-5" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-border/50">
            <div className="text-center">
              <p className="text-[10px] text-muted-foreground uppercase font-semibold">Placed</p>
              <p className="text-sm font-bold text-info mt-0.5">{data.orders.placed}</p>
            </div>
            <div className="text-center border-l border-border/50">
              <p className="text-[10px] text-muted-foreground uppercase font-semibold">Delivered</p>
              <p className="text-sm font-bold text-success mt-0.5">{data.orders.delivered}</p>
            </div>
            <div className="text-center border-l border-border/50">
              <p className="text-[10px] text-muted-foreground uppercase font-semibold">Cancelled</p>
              <p className="text-sm font-bold text-destructive mt-0.5">{data.orders.cancelled}</p>
            </div>
          </div>
        </Card>

        {/* Products Card */}
        <Card className="p-5 border-l-4 border-l-warning shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[13px] font-medium text-muted-foreground">Products</p>
              <p className="text-3xl font-bold text-foreground mt-1.5">{data.products.total}</p>
              <p className="text-[12px] font-medium text-warning mt-2 flex items-center gap-1">
                <AlertCircle className="size-3" />
                {data.products.lowStock} low stock
              </p>
            </div>
            <div className="p-2.5 bg-warning/10 rounded-xl text-warning">
              <Package className="size-5" />
            </div>
          </div>
        </Card>

        {/* Users Card */}
        <Card className="p-5 border-l-4 border-l-info shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[13px] font-medium text-muted-foreground">Active Users</p>
              <p className="text-3xl font-bold text-foreground mt-1.5">{data.users.total}</p>
              <p className="text-[12px] font-medium text-info mt-2 flex items-center gap-1">
                <Users className="size-3" />
                {data.pendingReviews} reviews pending
              </p>
            </div>
            <div className="p-2.5 bg-info/10 rounded-xl text-info">
              <Users className="size-5" />
            </div>
          </div>
        </Card>
      </div>

      {data.alerts.length > 0 && (
        <Card className="p-4 space-y-2">
          {data.alerts.map((a, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              <AlertCircle className={`size-4 shrink-0 ${a.type === 'warning' ? 'text-warning' : a.type === 'error' ? 'text-destructive' : 'text-info'}`} />
              <span className="text-foreground">{a.message}</span>
            </div>
          ))}
        </Card>
      )}

      <Card className="p-3 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <h2 className="font-semibold text-foreground text-sm md:text-base">Recent Orders</h2>
          <Link to="/admin/orders" className="w-full sm:w-auto"><Button variant="outline" className="w-full sm:w-auto">View all</Button></Link>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b">
              <tr>
                <th className="text-left py-2 font-semibold text-muted-foreground">Order</th>
                <th className="text-left py-2 font-semibold text-muted-foreground">Customer</th>
                <th className="text-left py-2 font-semibold text-muted-foreground">Amount</th>
                <th className="text-left py-2 font-semibold text-muted-foreground">Status</th>
                <th className="text-left py-2 font-semibold text-muted-foreground">Date</th>
              </tr>
            </thead>
            <tbody>
              {data.recentOrders.map((o) => (
                <tr key={o.id} className="border-b">
                  <td className="py-2 font-mono font-semibold truncate">{o.orderNumber}</td>
                  <td className="py-2 truncate">{o.customerName}</td>
                  <td className="py-2 font-semibold">₹{o.pricing.total}</td>
                  <td className="py-2">{o.status}</td>
                  <td className="py-2 text-muted-foreground text-xs md:text-sm">{new Date(o.createdAt).toLocaleDateString('en-IN')}</td>
                </tr>
              ))}
              {data.recentOrders.length === 0 && (
                <tr><td colSpan={5} className="py-6 text-center text-muted-foreground">No orders yet</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-3">
          {data.recentOrders.map((o) => (
            <div key={o.id} className="p-3 bg-muted rounded-lg space-y-2">
              <div className="flex justify-between items-start gap-2">
                <div>
                  <p className="text-xs text-muted-foreground">Order ID</p>
                  <p className="font-mono font-semibold text-sm">{o.orderNumber}</p>
                </div>
                <span className="text-xs px-2 py-1 rounded bg-primary/10 text-primary whitespace-nowrap">{o.status}</span>
              </div>
              <div className="flex justify-between items-start gap-2">
                <div>
                  <p className="text-xs text-muted-foreground">Customer</p>
                  <p className="text-sm font-medium truncate">{o.customerName}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Amount</p>
                  <p className="font-semibold text-sm">₹{o.pricing.total}</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">{new Date(o.createdAt).toLocaleDateString('en-IN')}</p>
            </div>
          ))}
          {data.recentOrders.length === 0 && (
            <p className="text-center text-muted-foreground py-4 text-sm">No orders yet</p>
          )}
        </div>
      </Card>
    </div>
  )
}
