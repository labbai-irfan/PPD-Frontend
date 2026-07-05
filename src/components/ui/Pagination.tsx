import { cn } from '@/lib/utils'
import { Icon } from '@/components/ui/Icon'

interface PaginationProps {
  page: number
  totalPages: number
  onChange: (page: number) => void
  className?: string
}

/** Circular page dots with arrows, from the design listing screens. */
export function Pagination({ page, totalPages, onChange, className }: PaginationProps) {
  if (totalPages <= 1) return null

  const pages: Array<number | '…'> =
    totalPages <= 4
      ? Array.from({ length: totalPages }, (_, i) => i + 1)
      : page <= 2
        ? [1, 2, '…', totalPages]
        : page >= totalPages - 1
          ? [1, '…', totalPages - 1, totalPages]
          : [1, '…', page, totalPages]

  const circle = 'flex size-[30px] items-center justify-center rounded-full text-[13px] font-semibold'

  return (
    <div className={cn('flex items-center justify-center gap-2.5 py-4', className)}>
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
