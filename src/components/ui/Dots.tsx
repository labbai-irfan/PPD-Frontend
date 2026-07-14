import { cn } from '@/lib/utils'

interface DotsProps {
  count: number
  active: number
  /** 'brand' for cream sections (orange active), 'light' for colored blocks (white active) */
  tone?: 'brand' | 'light'
  onSelect?: (index: number) => void
  className?: string
}

/** Carousel dots: active dot stretches into a pill, exactly as in the design. */
export function Dots({ count, active, tone = 'brand', onSelect, className }: DotsProps) {
  if (count <= 1) return null
  return (
    <div className={cn('flex items-center justify-center gap-1.5', className)}>
      {Array.from({ length: count }, (_, i) => {
        const isActive = i === active
        return (
          <button
            key={i}
            type="button"
            aria-label={`Go to slide ${i + 1}`}
            onClick={onSelect ? () => onSelect(i) : undefined}
            className={cn(
              'flex items-center justify-center',
              onSelect ? '-m-1.5 cursor-pointer p-2.5' : 'cursor-default',
            )}
          >
            <span
              className={cn(
                'h-1.5 rounded-full transition-all duration-300',
                isActive ? 'w-5' : 'w-1.5',
                tone === 'brand'
                  ? isActive
                    ? 'bg-primary'
                    : 'bg-dot'
                  : isActive
                    ? 'bg-white'
                    : 'bg-white/50',
              )}
            />
          </button>
        )
      })}
    </div>
  )
}
