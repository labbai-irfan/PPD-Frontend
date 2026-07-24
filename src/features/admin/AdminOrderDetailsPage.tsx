import { useEffect, useState, useRef } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, ChevronDown, Clock, ShieldAlert } from 'lucide-react'
import { toast } from 'sonner'
import { formatCurrency, formatDate } from '@/lib/utils'
import { apiClient } from '@/services/api/client'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'

interface StatusEvent {
  status: string
  at: string
  location: string
  note: string
}

interface OrderItem {
  key: string
  productId: string
  title: string
  brand: string
  image: string
  price: number
  mrp: number
  quantity: number
  selections: Record<string, string>
}

interface OrderAddress {
  name: string
  phone: string
  country: string
  line1: string
  line2?: string
  city: string
  state: string
  pincode: string
  type: string
}

interface AdminOrderDetail {
  id: string
  orderNumber: string
  customerName: string
  userId: string
  status: string
  createdAt: string
  items: OrderItem[]
  address: OrderAddress
  payment: {
    method: string
    label: string
    status: string
    transactionId?: string
    paidAt?: string
  }
  pricing: {
    subtotal: number
    discount: number
    couponCode?: string
    shipping: number
    total: number
  }
  statusHistory: StatusEvent[]
  cancelReason?: string
}

const NEXT_STATUS: Record<string, string[]> = {
  placed: ['confirmed', 'cancelled'],
  confirmed: ['processing', 'shipped', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['out-for-delivery', 'delivered'],
  'out-for-delivery': ['delivered'],
  delivered: ['returned'],
  cancelled: [],
  returned: [],
}

const STATUS_STYLE: Record<string, string> = {
  placed: 'bg-warning/10 text-warning border border-warning/20',
  confirmed: 'bg-primary/10 text-primary border border-primary/20',
  processing: 'bg-primary/10 text-primary border border-primary/20',
  shipped: 'bg-info/10 text-info border border-info/20',
  'out-for-delivery': 'bg-info/10 text-info border border-info/20',
  delivered: 'bg-success/10 text-success border border-success/20',
  cancelled: 'bg-destructive/10 text-destructive border border-destructive/20',
  returned: 'bg-muted text-muted-foreground border border-border',
}

export default function AdminOrderDetailsPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState<AdminOrderDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Status transition form values
  const [note, setNote] = useState('')
  const [location, setLocation] = useState('')

  const fetchOrder = async () => {
    try {
      const { data } = await apiClient.get<AdminOrderDetail>(`/admin/orders/${id}`)
      setOrder(data)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to fetch order details')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void fetchOrder()
  }, [id])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setStatusDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleStatusChange = async (nextStatus: string) => {
    if (!order) return
    setUpdating(true)
    try {
      const { data } = await apiClient.patch<AdminOrderDetail>(
        `/admin/orders/${order.orderNumber}/status`,
        { status: nextStatus, location, note }
      )
      setOrder(data)
      setNote('')
      setLocation('')
      setStatusDropdownOpen(false)
      toast.success(`Order status advanced to ${nextStatus}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update order status')
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="text-muted-foreground text-sm">Loading order details...</div>
      </div>
    )
  }

  if (!order) {
    return (
      <Card className="p-8 text-center max-w-lg mx-auto">
        <ShieldAlert className="size-12 text-destructive mx-auto mb-4" />
        <h2 className="text-lg font-bold text-foreground">Order Not Found</h2>
        <p className="text-sm text-muted-foreground mt-2">
          The order with ID or number "{id}" could not be retrieved.
        </p>
        <Button onClick={() => navigate('/admin/orders')} className="mt-6">
          Back to Orders
        </Button>
      </Card>
    )
  }

  const nextOptions = NEXT_STATUS[order.status] ?? []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/orders')}
            className="flex size-10 items-center justify-center rounded-full border bg-card hover:bg-muted text-foreground transition-colors shadow-sm"
          >
            <ArrowLeft className="size-4" />
          </button>
          <div>
            <h1 className="text-xl md:text-2xl font-bold font-mono text-foreground">{order.orderNumber}</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Customer: <span className="font-semibold text-foreground">{order.customerName}</span> · Placed on {formatDate(order.createdAt)}
            </p>
          </div>
        </div>

        {/* Status Actions */}
        <div className="flex flex-wrap items-center gap-3" ref={dropdownRef}>
          <span className={`px-3 py-1.5 rounded-full text-xs font-semibold uppercase ${STATUS_STYLE[order.status] ?? 'bg-muted'}`}>
            {order.status}
          </span>

          {nextOptions.length > 0 ? (
            <div className="relative">
              <button
                onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-semibold text-sm rounded-xl hover:bg-primary/95 transition-all shadow-sm cursor-pointer"
              >
                <span>Update Status</span>
                <ChevronDown className={`size-4 transition-transform duration-200 ${statusDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {statusDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-card border border-border rounded-2xl shadow-xl p-4 z-50 space-y-3">
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Advance Status to:</h3>
                  <div className="grid grid-cols-1 gap-1.5">
                    {nextOptions.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => void handleStatusChange(opt)}
                        disabled={updating}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-primary-soft hover:text-primary rounded-lg transition-colors capitalize font-semibold"
                      >
                        {opt.replace(/-/g, ' ')}
                      </button>
                    ))}
                  </div>

                  <div className="border-t pt-3 space-y-2">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Status details (Optional)</p>
                    <Input
                      placeholder="Current Location"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="h-8 text-xs"
                    />
                    <Input
                      placeholder="Internal / External Note"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      className="h-8 text-xs"
                    />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <span className="text-xs text-muted-foreground italic">Order is in final state</span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Items and Status History */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items Table */}
          <Card className="p-4 md:p-6 space-y-4">
            <h2 className="text-base font-bold text-foreground">Items Ordered</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground text-xs font-bold uppercase tracking-wider">
                    <th className="text-left pb-3">Product</th>
                    <th className="text-center pb-3">Qty</th>
                    <th className="text-right pb-3">Price</th>
                    <th className="text-right pb-3">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {order.items.map((item) => (
                    <tr key={item.key} className="align-middle">
                      <td className="py-4 flex gap-3">
                        <div className="size-12 shrink-0 overflow-hidden rounded-lg bg-muted border">
                          <img src={item.image} alt={item.title} className="size-full object-cover" />
                        </div>
                        <div className="min-w-0">
                          <Link to={`/products/PPD/${item.productId}`} className="font-semibold text-foreground hover:text-primary hover:underline line-clamp-1">
                            {item.title}
                          </Link>
                          {item.brand && <p className="text-xs text-muted-foreground mt-0.5">{item.brand}</p>}
                          {Object.keys(item.selections || {}).length > 0 && (
                            <div className="flex gap-1.5 flex-wrap mt-1">
                              {Object.entries(item.selections).map(([key, val]) => (
                                <span key={key} className="text-[10px] bg-muted px-1.5 py-0.5 rounded font-medium text-subtle-foreground">
                                  {key}: {val}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-4 text-center text-foreground font-medium">{item.quantity}</td>
                      <td className="py-4 text-right text-foreground font-mono">{formatCurrency(item.price)}</td>
                      <td className="py-4 text-right text-foreground font-semibold font-mono">{formatCurrency(item.price * item.quantity)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Delivery Address Details (Address Table) */}
          <Card className="p-4 md:p-6 space-y-4">
            <h2 className="text-base font-bold text-foreground">Delivery Address</h2>
            
            <div className="p-4 bg-muted/30 rounded-xl border border-border flex items-start justify-between gap-4">
              <div className="text-sm text-foreground leading-relaxed">
                <p className="font-bold">{order.address.name}</p>
                <p>{order.address.line1}</p>
                {order.address.line2 && <p>{order.address.line2}</p>}
                <p>{order.address.city}, {order.address.state} - {order.address.pincode}</p>
                <p>{order.address.country}</p>
                <p className="text-xs text-muted-foreground mt-2">Phone: +91 {order.address.phone}</p>
              </div>
              <button
                onClick={() => {
                  const txt = `${order.address.name}\n${order.address.line1}${order.address.line2 ? '\n' + order.address.line2 : ''}\n${order.address.city}, ${order.address.state} - ${order.address.pincode}\n${order.address.country}\nPhone: +91 ${order.address.phone}`
                  navigator.clipboard.writeText(txt)
                  toast.success('Address copied!')
                }}
                className="px-2.5 py-1.5 rounded-lg border border-border bg-card hover:bg-muted text-xs font-bold transition-colors cursor-pointer text-foreground shrink-0"
              >
                Copy Address
              </button>
            </div>

            <div className="overflow-hidden rounded-xl border border-border">
              <table className="w-full text-sm">
                <tbody>
                  <tr className="border-b bg-muted/20">
                    <td className="px-4 py-3 font-semibold text-muted-foreground w-1/3">Recipient Name</td>
                    <td className="px-4 py-3 text-foreground font-medium">{order.address.name}</td>
                  </tr>
                  <tr className="border-b">
                    <td className="px-4 py-3 font-semibold text-muted-foreground">Mobile Phone</td>
                    <td className="px-4 py-3 text-foreground font-mono">+91 {order.address.phone}</td>
                  </tr>
                  <tr className="border-b bg-muted/20">
                    <td className="px-4 py-3 font-semibold text-muted-foreground">Address Type</td>
                    <td className="px-4 py-3 text-foreground"><span className="capitalize bg-primary-soft text-primary font-semibold text-xs px-2 py-0.5 rounded-full">{order.address.type}</span></td>
                  </tr>
                  <tr className="border-b">
                    <td className="px-4 py-3 font-semibold text-muted-foreground">Street / Line 1</td>
                    <td className="px-4 py-3 text-foreground">{order.address.line1}</td>
                  </tr>
                  {order.address.line2 && (
                    <tr className="border-b bg-muted/20">
                      <td className="px-4 py-3 font-semibold text-muted-foreground">Locality / Line 2</td>
                      <td className="px-4 py-3 text-foreground">{order.address.line2}</td>
                    </tr>
                  )}
                  <tr className="border-b">
                    <td className="px-4 py-3 font-semibold text-muted-foreground">City</td>
                    <td className="px-4 py-3 text-foreground">{order.address.city}</td>
                  </tr>
                  <tr className="border-b bg-muted/20">
                    <td className="px-4 py-3 font-semibold text-muted-foreground">State</td>
                    <td className="px-4 py-3 text-foreground">{order.address.state}</td>
                  </tr>
                  <tr className="border-b">
                    <td className="px-4 py-3 font-semibold text-muted-foreground">Country</td>
                    <td className="px-4 py-3 text-foreground">{order.address.country}</td>
                  </tr>
                  <tr className="bg-muted/20">
                    <td className="px-4 py-3 font-semibold text-muted-foreground">PIN Code</td>
                    <td className="px-4 py-3 text-foreground font-semibold font-mono">{order.address.pincode}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>

          {/* Status Timeline History */}
          <Card className="p-4 md:p-6 space-y-4">
            <h2 className="text-base font-bold text-foreground">Status Log & History</h2>
            <div className="relative border-l-2 border-border pl-6 ml-3 space-y-6">
              {order.statusHistory.map((history, idx) => (
                <div key={idx} className="relative">
                  {/* Point Indicator */}
                  <span className="absolute -left-[31px] top-0 flex size-5 items-center justify-center rounded-full bg-card border-2 border-primary text-primary">
                    <Clock className="size-3" />
                  </span>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold capitalize text-foreground">{history.status.replace(/-/g, ' ')}</span>
                      <span className="text-xs text-muted-foreground">{new Date(history.at).toLocaleString('en-IN')}</span>
                    </div>
                    {history.location && (
                      <p className="text-xs font-medium text-subtle-foreground">
                        Location: <span className="text-foreground">{history.location}</span>
                      </p>
                    )}
                    {history.note && (
                      <p className="text-xs text-muted-foreground bg-muted/50 p-2 rounded-lg border border-border inline-block">
                        {history.note}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right column: Pricing and Payment details */}
        <div className="space-y-6">
          {/* Billing Card */}
          <Card className="p-4 md:p-6 space-y-4">
            <h2 className="text-base font-bold text-foreground">Order Totals</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span className="font-mono text-foreground">{formatCurrency(order.pricing.subtotal)}</span>
              </div>
              
              {order.pricing.discount > 0 && (
                <div className="flex justify-between text-muted-foreground">
                  <span>Discount</span>
                  <span className="font-mono text-destructive">-{formatCurrency(order.pricing.discount)}</span>
                </div>
              )}

              {order.pricing.couponCode && (
                <div className="flex justify-between text-muted-foreground">
                  <span>Coupon Code</span>
                  <span className="font-semibold text-success">{order.pricing.couponCode}</span>
                </div>
              )}

              <div className="flex justify-between text-muted-foreground">
                <span>Shipping Fees</span>
                <span className="font-mono text-foreground">
                  {order.pricing.shipping === 0 ? 'FREE' : formatCurrency(order.pricing.shipping)}
                </span>
              </div>

              <div className="border-t border-border pt-3 flex justify-between font-bold text-base text-foreground">
                <span>Total Amount</span>
                <span className="font-mono">{formatCurrency(order.pricing.total)}</span>
              </div>
            </div>
          </Card>

          {/* Payment Card */}
          <Card className="p-4 md:p-6 space-y-4">
            <h2 className="text-base font-bold text-foreground">Payment Details</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Payment Method</span>
                <span className="font-semibold text-foreground capitalize">{order.payment.method}</span>
              </div>

              <div className="flex justify-between text-muted-foreground">
                <span>Method Label</span>
                <span className="font-medium text-foreground">{order.payment.label}</span>
              </div>

              <div className="flex justify-between text-muted-foreground">
                <span>Payment Status</span>
                <span className="capitalize font-semibold text-foreground">
                  <Badge variant={
                    order.payment.status === 'paid' ? 'success' :
                    order.payment.status === 'refunded' ? 'secondary' :
                    order.payment.status === 'failed' ? 'destructive' : 'warning'
                  }>
                    {order.payment.status}
                  </Badge>
                </span>
              </div>

              {order.payment.transactionId && (
                <div className="flex justify-between text-muted-foreground">
                  <span>Transaction ID</span>
                  <span className="font-mono text-foreground text-xs break-all text-right">{order.payment.transactionId}</span>
                </div>
              )}

              {order.payment.paidAt && (
                <div className="flex justify-between text-muted-foreground">
                  <span>Paid Timestamp</span>
                  <span className="text-foreground text-xs text-right">{new Date(order.payment.paidAt).toLocaleString('en-IN')}</span>
                </div>
              )}
            </div>
          </Card>

          {order.status === 'cancelled' && order.cancelReason && (
            <Card className="p-4 md:p-6 border border-destructive/20 bg-destructive/5 space-y-2">
              <h3 className="text-sm font-bold text-destructive flex items-center gap-1.5">
                <ShieldAlert className="size-4" />
                Cancellation Reason
              </h3>
              <p className="text-xs text-destructive-foreground leading-relaxed">
                {order.cancelReason}
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
