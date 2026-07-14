import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'
import { ROUTES } from '@/lib/constants'
import { useWishlistStore } from '@/store/wishlist.store'
import { useProductsByIds } from '@/hooks/use-catalog'
import { ProductGrid } from '@/components/shared/ProductGrid'
import { EmptyState } from '@/components/ui/EmptyState'
import { Button } from '@/components/ui/Button'

export default function WishlistPage() {
  const ids = useWishlistStore((s) => s.ids)
  const { data, isPending } = useProductsByIds(ids)

  if (ids.length === 0) {
    return (
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
    )
  }

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold tracking-tight text-foreground">My Wishlist</h1>
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
  )
}
