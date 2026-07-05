import { BadgePercent, Copy } from 'lucide-react'
import { toast } from 'sonner'
import { formatCurrency, formatDate } from '@/lib/utils'
import { useCoupons } from '@/hooks/use-catalog'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'

export default function CouponsPage() {
  const { data, isPending } = useCoupons()

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-1 text-2xl font-bold tracking-tight text-foreground">Coupons & Offers</h1>
      <p className="mb-6 text-sm text-muted-foreground">Apply these at checkout to save more.</p>

      <div className="space-y-4">
        {isPending
          ? Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="h-32 rounded-card" />)
          : data?.map((coupon) => (
              <Card key={coupon.code} className="flex items-stretch overflow-hidden">
                <div className="flex w-14 shrink-0 items-center justify-center bg-primary-soft text-primary-soft-foreground">
                  <BadgePercent className="size-6" />
                </div>
                <div className="flex-1 border-l border-dashed border-border p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge>{coupon.code}</Badge>
                    <span className="text-xs text-muted-foreground">
                      Valid till {formatDate(coupon.expiresAt)}
                    </span>
                  </div>
                  <h3 className="mt-2 text-sm font-bold text-foreground">{coupon.title}</h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">{coupon.description}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Min. order {formatCurrency(coupon.minOrder)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(coupon.code)
                    toast.success(`Copied ${coupon.code}`)
                  }}
                  className="flex items-center gap-1.5 self-center px-4 text-sm font-bold text-primary transition-opacity hover:opacity-75 cursor-pointer"
                >
                  <Copy className="size-4" /> Copy
                </button>
              </Card>
            ))}
      </div>
    </div>
  )
}
