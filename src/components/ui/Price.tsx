import { cn, discountPercent, formatCurrency } from '@/lib/utils'
import { SavePill } from '@/components/shared/ProductBadge'

interface PriceProps {
  price: number
  mrp?: number
  size?: 'sm' | 'md' | 'lg'
  /** green "Save 22%" pill next to the price (PDP, cart rows) */
  showSave?: boolean
  className?: string
}

const sizeStyles = {
  sm: { price: 'text-[15px] font-bold', mrp: 'text-[11px]' },
  md: { price: 'text-base font-bold', mrp: 'text-xs' },
  lg: { price: 'text-[27px] font-bold', mrp: 'text-base' },
} as const

/** Inline price row: dark bold price, struck MRP, optional green save pill. */
export function Price({ price, mrp, size = 'md', showSave = false, className }: PriceProps) {
  const styles = sizeStyles[size]
  const off = mrp ? discountPercent(mrp, price) : 0

  return (
    <div className={cn('flex flex-wrap items-center gap-x-2 gap-y-1', className)}>
      <span className={cn('text-foreground', styles.price)}>{formatCurrency(price)}</span>
      {mrp != null && off > 0 && (
        <s className={cn('font-normal text-faint-foreground', styles.mrp)}>{formatCurrency(mrp)}</s>
      )}
      {showSave && off > 0 && <SavePill>Save {off}%</SavePill>}
    </div>
  )
}
