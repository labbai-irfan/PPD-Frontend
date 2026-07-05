import { cn } from '@/lib/utils'
import { Icon } from '@/components/ui/Icon'

interface RatingBadgeProps {
  rating: number
  count?: number
  size?: 'sm' | 'md'
  className?: string
}

/** Inline "★ 4.8 (49)" rating row — gold filled star, per the design. */
export function RatingBadge({ rating, count, size = 'sm', className }: RatingBadgeProps) {
  const starSize = size === 'sm' ? 14 : 16
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1',
        size === 'sm' ? 'text-[11.5px]' : 'text-[13px]',
        className,
      )}
    >
      <Icon name="star" size={starSize} fill className="text-rating" />
      <span className="font-semibold text-foreground">{Number(rating).toFixed(1)}</span>
      {count != null && <span className="text-faint-foreground">({Intl.NumberFormat('en-IN').format(count)})</span>}
    </span>
  )
}

interface RatingStarsProps {
  rating: number
  size?: number
  className?: string
}

/** Five-star row with fractional fill — used in review lists. */
export function RatingStars({ rating, size = 16, className }: RatingStarsProps) {
  return (
    <div className={cn('flex items-center gap-0.5', className)} aria-label={`Rated ${rating} out of 5`}>
      {Array.from({ length: 5 }, (_, i) => {
        const fill = Math.min(Math.max(rating - i, 0), 1)
        return (
          <span key={i} className="relative inline-block" style={{ width: size, height: size }}>
            <Icon name="star" size={size} fill className="absolute inset-0 text-rating-empty" />
            <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
              <Icon name="star" size={size} fill className="text-rating" />
            </span>
          </span>
        )
      })}
    </div>
  )
}
