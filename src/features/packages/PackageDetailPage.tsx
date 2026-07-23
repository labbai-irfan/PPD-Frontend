import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { discountPercent, formatCurrency } from '@/lib/utils'
import { ROUTES } from '@/lib/constants'
import { usePackage } from '@/hooks/use-catalog'
import { catalogRepository } from '@/services/repositories/catalog'
import { useCartStore } from '@/store/cart.store'
import { Icon } from '@/components/ui/Icon'
import { Skeleton } from '@/components/ui/Skeleton'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { SavePill } from '@/components/shared/ProductBadge'
import { TopBar } from '@/components/shared/TopBar'

export default function PackageDetailPage() {
  const { slug = '' } = useParams()
  const navigate = useNavigate()
  const { data: pkg, isPending, isError } = usePackage(slug)
  const addItem = useCartStore((s) => s.addItem)
  const [adding, setAdding] = useState(false)

  if (isPending) {
    return (
      <div>
        <TopBar />
        <Skeleton className="mt-3 h-56 w-full rounded-2xl" />
        <Skeleton className="mt-4 h-7 w-2/3" />
        <Skeleton className="mt-3 h-20 w-full rounded-xl" />
        <Skeleton className="mt-3 h-20 w-full rounded-xl" />
      </div>
    )
  }

  if (isError || !pkg) {
    return (
      <EmptyState
        icon={<Icon name="inventory_2" size={36} />}
        title="Package not found"
        description="This package may have been removed or the link is incorrect."
        action={<Button onClick={() => navigate(ROUTES.packages)}>Browse packages</Button>}
      />
    )
  }

  const unavailable = pkg.items.some((item) => !item.isActive || item.stock < item.quantity)

  /** Resolves each item to its live Product record and adds it to the cart at the package's quantity. */
  async function addPackageToCart(): Promise<boolean> {
    setAdding(true)
    try {
      const products = await catalogRepository.getProductsByIds(pkg!.items.map((i) => i.productId))
      const byId = new Map(products.map((p) => [p.id, p]))
      let addedAny = false
      for (const item of pkg!.items) {
        const product = byId.get(item.productId)
        if (product && product.stock >= item.quantity) {
          addItem(product, {}, item.quantity)
          addedAny = true
        }
      }
      if (!addedAny) toast.error('These items are currently unavailable')
      return addedAny
    } catch {
      toast.error('Could not add this package — please try again')
      return false
    } finally {
      setAdding(false)
    }
  }

  async function handleAddToCart() {
    if (await addPackageToCart()) toast.success(`${pkg!.name} added to cart`)
  }

  async function handleBuyNow() {
    if (await addPackageToCart()) navigate(ROUTES.cart)
  }

  return (
    <div className="pb-[calc(6rem+env(safe-area-inset-bottom))] md:pb-0">
      <TopBar />

      {pkg.image && (
        <div className="mt-3 overflow-hidden rounded-2xl bg-card shadow-card">
          <img src={pkg.image} alt={pkg.name} className="h-56 w-full object-cover" />
        </div>
      )}

      <h1 className="mt-3.5 text-[21px] font-bold leading-tight text-foreground md:text-2xl">{pkg.name}</h1>
      {pkg.description && (
        <p className="mt-1.5 text-[13px] leading-relaxed text-subtle-foreground">{pkg.description}</p>
      )}

      <div className="mt-3.5 flex flex-wrap items-center gap-x-2.5 gap-y-1">
        <span className="text-[22px] font-bold text-foreground sm:text-[27px]">{formatCurrency(pkg.price)}</span>
        {pkg.originalTotal > pkg.price && (
          <>
            <s className="text-base text-faint-foreground">{formatCurrency(pkg.originalTotal)}</s>
            <SavePill className="px-3 py-1.5 text-xs">{discountPercent(pkg.originalTotal, pkg.price)}% OFF</SavePill>
          </>
        )}
      </div>
      <p className="mt-1 text-xs text-muted-foreground">{pkg.itemCount} items in this package</p>

      <div className="mt-5 space-y-2.5">
        <h2 className="text-base font-bold text-foreground">What's inside</h2>
        {pkg.items.map((item) => (
          <Link
            key={item.productId}
            to={ROUTES.product(item.slug)}
            className="flex items-center gap-3 rounded-xl border border-border bg-card p-2.5 transition-colors hover:bg-accent/40"
          >
            <img src={item.image} alt={item.title} className="size-14 shrink-0 rounded-lg bg-muted object-cover" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-foreground">{item.title}</p>
              <p className="text-xs text-muted-foreground">
                {item.brand} · Qty {item.quantity}
              </p>
              {(!item.isActive || item.stock < item.quantity) && (
                <p className="text-xs font-semibold text-destructive">Currently unavailable</p>
              )}
            </div>
            <div className="shrink-0 text-right">
              <p className="text-sm font-bold text-foreground">{formatCurrency(item.price * item.quantity)}</p>
              {item.mrp > item.price && (
                <p className="text-xs text-faint-foreground line-through">
                  {formatCurrency(item.mrp * item.quantity)}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>

      {unavailable && (
        <p className="mt-3 text-xs font-medium text-destructive">
          Some items in this package are out of stock — only available items will be added.
        </p>
      )}

      {/* Desktop actions */}
      <div className="mt-6 hidden gap-3 md:flex">
        <Button variant="secondary" size="lg" className="flex-1" onClick={() => void handleAddToCart()} disabled={adding}>
          Add Package to Cart
        </Button>
        <Button size="lg" className="flex-1" onClick={() => void handleBuyNow()} disabled={adding}>
          Buy Now
        </Button>
      </div>

      {/* Mobile sticky action bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 mx-auto flex max-w-md gap-3 bg-card px-4 pb-[calc(14px+env(safe-area-inset-bottom))] pt-3 shadow-bar sm:max-w-xl md:hidden">
        <Button variant="secondary" size="lg" className="flex-1" onClick={() => void handleAddToCart()} disabled={adding}>
          Add Package
        </Button>
        <Button size="lg" className="flex-1" onClick={() => void handleBuyNow()} disabled={adding}>
          Buy Now
        </Button>
      </div>
    </div>
  )
}
