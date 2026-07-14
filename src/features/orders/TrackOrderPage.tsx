import { useParams } from 'react-router-dom'
import { Truck, MapPin, CheckCircle } from 'lucide-react'
import { Card } from '@/components/ui/Card'

interface OrderStatus {
  step: 'placed' | 'confirmed' | 'shipped' | 'out-for-delivery' | 'delivered'
  label: string
  date: Date
  location?: string
  completed: boolean
}

const mockStatus: OrderStatus[] = [
  { step: 'placed', label: 'Order Placed', date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), completed: true },
  { step: 'confirmed', label: 'Order Confirmed', date: new Date(Date.now() - 4.5 * 24 * 60 * 60 * 1000), completed: true },
  { step: 'shipped', label: 'Shipped', date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), location: 'Delhi', completed: true },
  { step: 'out-for-delivery', label: 'Out for Delivery', date: new Date(Date.now() - 0.5 * 24 * 60 * 60 * 1000), location: 'Bangalore', completed: true },
  { step: 'delivered', label: 'Delivered', date: new Date(), location: 'Your location', completed: false },
]

export default function TrackOrderPage() {
  const { id } = useParams()

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Track Order</h1>
        <p className="mt-2 text-sm text-muted-foreground">Order ID: {id || '#12345'}</p>
      </div>

      <Card className="p-4 md:p-6">
        <div>
          {mockStatus.map((status, index) => (
            <div key={status.step} className={`flex gap-4 ${index < mockStatus.length - 1 ? 'pb-8' : ''}`}>
              {/* Timeline */}
              <div className="flex flex-col items-center">
                <div className={`size-10 rounded-full flex items-center justify-center ${
                  status.completed
                    ? 'bg-success text-white'
                    : 'bg-muted text-muted-foreground border-2 border-muted-foreground'
                }`}>
                  {status.completed ? (
                    <CheckCircle className="size-5" />
                  ) : (
                    <div className="size-3 rounded-full bg-current" />
                  )}
                </div>
                {index < mockStatus.length - 1 && (
                  <div className={`w-0.5 flex-1 mt-2 ${
                    status.completed ? 'bg-success' : 'bg-muted'
                  }`} />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 pt-1">
                <h3 className="font-semibold text-foreground">{status.label}</h3>
                <p className="text-sm text-muted-foreground">
                  {status.date.toLocaleDateString()} at {status.date.toLocaleTimeString()}
                </p>
                {status.location && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                    <MapPin className="size-4" />
                    {status.location}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-4 bg-primary/5 border-primary/20">
        <div className="flex items-start gap-3">
          <Truck className="size-5 text-primary shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-foreground">Estimated Delivery</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Your order is expected to arrive on {new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString()}
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-4 md:p-6">
        <h3 className="font-semibold text-foreground">Delivery Details</h3>
        <div className="mt-4 space-y-3 text-sm">
          <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between sm:gap-4">
            <span className="shrink-0 text-muted-foreground">Delivery Address:</span>
            <span className="break-words text-foreground sm:text-right">123 Main Street, Bangalore 560001</span>
          </div>
          <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between sm:gap-4">
            <span className="shrink-0 text-muted-foreground">Recipient:</span>
            <span className="break-words text-foreground sm:text-right">John Doe</span>
          </div>
          <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between sm:gap-4">
            <span className="shrink-0 text-muted-foreground">Phone:</span>
            <span className="break-words text-foreground sm:text-right">9876543210</span>
          </div>
        </div>
      </Card>
    </div>
  )
}
