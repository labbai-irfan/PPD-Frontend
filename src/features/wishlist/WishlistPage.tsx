import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Heart, ArrowLeft } from 'lucide-react'
import { ROUTES } from '@/lib/constants'
import { useWishlistStore } from '@/store/wishlist.store'
import { useProductsByIds } from '@/hooks/use-catalog'
import { ProductGrid } from '@/components/shared/ProductGrid'
import { EmptyState } from '@/components/ui/EmptyState'
import { Button } from '@/components/ui/Button'

export default function WishlistPage() {
  const navigate = useNavigate()
  const ids = useWishlistStore((s) => s.ids)
  const remove = useWishlistStore((s) => s.remove)
  const { data, isPending } = useProductsByIds(ids)

  // Automatically remove stale/deleted product IDs from wishlist
  useEffect(() => {
    if (!isPending && data && ids.length > 0) {
      const fetchedIds = new Set(data.map((p: any) => p.id || p._id));
      const staleIds = ids.filter((id) => !fetchedIds.has(id));
      if (staleIds.length > 0) {
        staleIds.forEach((id) => remove(id));
      }
    }
  }, [data, isPending, ids, remove])

  if (ids.length === 0) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4">
        <div className="mb-8 flex items-center gap-1">
          <button
            onClick={() => navigate(-1)}
            className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white border border-border transition-colors hover:bg-muted group shadow-sm"
          >
            <ArrowLeft className="size-5 text-foreground transition-transform group-hover:-translate-x-0.5" />
            <span className="sr-only">Back</span>
          </button>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">My Wishlist</h1>
        </div>
        <EmptyState
          icon={<Heart />}
          title="Your wishlist is empty"
          description="Tap the heart on any product to save it here for later."
          action={
            <Link to={ROUTES.products}>
              <Button>Start shopping</Button>
            </Link>
          }
        />
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4">
      <div className="mb-8 flex items-center gap-1">
        <button
          onClick={() => navigate(-1)}
          className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white border border-border transition-colors hover:bg-muted group shadow-sm"
        >
          <ArrowLeft className="size-5 text-foreground transition-transform group-hover:-translate-x-0.5" />
          <span className="sr-only">Back</span>
        </button>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">My Wishlist</h1>
      </div>
      <div>
        <p className="mb-6 text-sm text-muted-foreground">
          {ids.length} saved {ids.length === 1 ? 'item' : 'items'}
        </p>
        <ProductGrid
          products={data}
          loading={isPending}
          skeletonCount={ids.length}
          className="grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"
        />
      </div>
    </div>
  )
}
