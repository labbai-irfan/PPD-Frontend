import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useIsWishlisted, useWishlistStore } from '@/store/wishlist.store'
import { Icon } from '@/components/ui/Icon'

interface WishlistButtonProps {
  productId: string
  size?: number
  className?: string
}

/** Bare heart toggle as it appears on the design's product cards. */
export function WishlistButton({ productId, size = 19, className }: WishlistButtonProps) {
  const wishlisted = useIsWishlisted(productId)
  const toggle = useWishlistStore((s) => s.toggle)

  return (
    <button
      type="button"
      aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
      aria-pressed={wishlisted}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        toggle(productId)
        toast(wishlisted ? 'Removed from wishlist' : 'Added to wishlist')
      }}
      className={cn(
        'flex items-center justify-center transition-transform hover:scale-110 active:scale-95 cursor-pointer',
        className,
      )}
    >
      <Icon
        name="favorite"
        size={size}
        fill={wishlisted}
        className={wishlisted ? 'text-deal' : 'text-icon-idle'}
      />
    </button>
  )
}
