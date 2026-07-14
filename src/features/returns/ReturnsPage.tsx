import { useState } from 'react'
import { Package, Send, Clock } from 'lucide-react'
import { Badge, type BadgeVariant } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

interface ReturnRequest {
  id: string
  orderId: string
  productName: string
  reason: string
  status: 'pending' | 'approved' | 'rejected' | 'completed'
  requestDate: Date
  refundAmount: number
}

const mockReturns: ReturnRequest[] = [
  {
    id: 'ret1',
    orderId: '#12345',
    productName: 'A5 Classic Spiral Bound Notebooks',
    reason: 'Damaged packaging',
    status: 'approved',
    requestDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    refundAmount: 299,
  },
]

const statusVariant: Record<ReturnRequest['status'], BadgeVariant> = {
  pending: 'warning',
  approved: 'success',
  rejected: 'destructive',
  completed: 'secondary',
}

export default function ReturnsPage() {
  const [returns] = useState<ReturnRequest[]>(mockReturns)

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Returns & RMA</h1>
        <p className="mt-2 text-sm text-muted-foreground">Manage your return requests</p>
      </div>

      {returns.length === 0 ? (
        <Card className="p-8 text-center">
          <Package className="mx-auto size-12 text-muted-foreground" />
          <p className="mt-4 font-semibold text-foreground">No return requests</p>
          <p className="mt-1 text-sm text-muted-foreground">You haven't initiated any returns yet</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {returns.map((ret) => (
            <Card key={ret.id} className="p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="break-words font-semibold text-foreground">{ret.productName}</h3>
                    <Badge variant={statusVariant[ret.status]}>
                      {ret.status.charAt(0).toUpperCase() + ret.status.slice(1)}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">Order: {ret.orderId}</p>
                  <p className="text-sm text-muted-foreground">Reason: {ret.reason}</p>
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="size-4" />
                      {ret.requestDate.toLocaleDateString()}
                    </span>
                    <span className="font-semibold text-foreground">
                      ₹{ret.refundAmount} to be refunded
                    </span>
                  </div>
                </div>
                {ret.status === 'approved' && (
                  <Button className="w-full gap-2 sm:w-auto sm:shrink-0">
                    <Send className="size-4" />
                    Send Package
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <Card className="p-4 bg-primary/5 border-primary/20">
        <h3 className="font-semibold text-foreground">How to initiate a return?</h3>
        <ol className="mt-3 space-y-2 text-sm text-muted-foreground list-decimal ml-5">
          <li>Go to "My Orders"</li>
          <li>Select the order with the item you want to return</li>
          <li>Click "Return Item"</li>
          <li>Select the reason and submit</li>
          <li>Wait for approval (usually 24-48 hours)</li>
          <li>Once approved, ship the item back</li>
        </ol>
      </Card>
    </div>
  )
}
