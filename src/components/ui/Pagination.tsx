import { cn } from '@/lib/utils'
import { Icon } from '@/components/ui/Icon'

interface PaginationProps {
  page: number
  totalPages: number
  onChange: (page: number) => void
  className?: string
}

/**
 * First page, last page, and the current page with a neighbour either side —
 * so the next page is always one click away, not an arrow-step. Always emits at
 * most 7 slots, and keeps that width near the edges so the bar doesn't jump.
 */
export function pageWindow(page: number, totalPages: number): Array<number | '…'> {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1)

  const start = Math.max(2, Math.min(page - 1, totalPages - 4))
  const end = Math.min(totalPages - 1, Math.max(page + 1, 5))

  const slots: Array<number | '…'> = [1]
  if (start > 2) slots.push('…')
  for (let i = start; i <= end; i++) slots.push(i)
  if (end < totalPages - 1) slots.push('…')
  slots.push(totalPages)
  return slots
}

/** Circular page dots with arrows, from the design listing screens. */
export function Pagination({ page, totalPages, onChange, className }: PaginationProps) {
  if (totalPages <= 1) return null

  const pages = pageWindow(page, totalPages)

  const circle = 'flex size-[30px] items-center justify-center rounded-full text-[13px] font-semibold'

  return (
    <div className={cn('flex flex-wrap items-center justify-center gap-2.5 py-4', className)}>
      <button
        type="button"
        aria-label="Previous page"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        className={cn(circle, 'bg-card shadow-soft cursor-pointer disabled:cursor-default')}
      >
        <Icon name="arrow_back" size={16} className={page <= 1 ? 'text-muted-foreground' : 'text-primary'} />
      </button>

      {pages.map((p, i) =>
        p === '…' ? (
          <span key={`gap-${i}`} className="text-sm tracking-widest text-muted-foreground">
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            aria-label={`Page ${p}`}
            aria-current={p === page ? 'page' : undefined}
            onClick={() => onChange(p)}
            className={cn(
              circle,
              'cursor-pointer',
              p === page ? 'bg-primary text-primary-foreground' : 'bg-card text-ink-soft shadow-soft dark:text-foreground',
            )}
          >
            {p}
          </button>
        ),
      )}

      <button
        type="button"
        aria-label="Next page"
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
        className={cn(circle, 'bg-card shadow-soft cursor-pointer disabled:cursor-default')}
      >
        <Icon name="arrow_forward" size={16} className={page >= totalPages ? 'text-muted-foreground' : 'text-primary'} />
      </button>
    </div>
  )
}
