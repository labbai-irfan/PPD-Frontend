import { cn, discountPercent } from '@/lib/utils'
import type { Product } from '@/types'

/**
 * Product badge from the design cards: own-brand items get the red
 * "PPD Original" pill, everything else a green "Save X%" pill.
 */
export function ProductBadge({ product, className }: { product: Product; className?: string }) {
  const isOwnBrand = product.isPpdOriginal ?? product.brand === 'PPD'
  const off = discountPercent(product.mrp, product.price)
  if (!isOwnBrand && off === 0) return null

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-full px-1.5 py-[2.5px] text-[8.5px] font-bold text-white whitespace-nowrap shrink-0 sm:px-2.5 sm:py-[3px] sm:text-[10px]',
        isOwnBrand ? 'bg-deal' : 'bg-success',
        className,
      )}
    >
      {isOwnBrand ? 'PPD Original' : `Save ${off}%`}
    </span>
  )
}

/** Green "Save ₹50" / "Save 22%" pill used on PDP and cart rows. */
export function SavePill({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full bg-success px-2.5 py-[3px] text-[10px] font-semibold text-success-foreground',
        className,
      )}
    >
      {children}
    </span>
  )
}

/** Status pill (e.g. "Shipped") — soft blue, from the orders design. */
export function StatusPill({
  children,
  tone = 'info',
  className,
}: {
  children: React.ReactNode
  tone?: 'info' | 'success' | 'destructive' | 'warning'
  className?: string
}) {
  const tones = {
    info: 'bg-info-soft text-info',
    success: 'bg-success-soft text-success-deep',
    destructive: 'bg-destructive-soft text-destructive',
    warning: 'bg-chip text-chip-foreground',
  }
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-[3px] text-[10.5px] font-semibold',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}
