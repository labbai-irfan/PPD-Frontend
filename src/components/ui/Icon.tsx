import type { CSSProperties } from 'react'
import { cn } from '@/lib/utils'

interface IconProps {
  /** Material Symbols name, e.g. "shopping_bag", "star", "arrow_forward" */
  name: string
  size?: number
  /** Filled style (font-variation FILL 1) — the design uses this for active/brand icons */
  fill?: boolean
  weight?: number
  className?: string
  /** Extra inline styles (e.g. dynamic brand colors) */
  style?: CSSProperties
}

/**
 * Material Symbols Outlined icon — the icon system used by the PPD design.
 * Color comes from `className` text color (or `style.color`); size in px.
 */
export function Icon({ name, size = 20, fill = false, weight = 400, className, style }: IconProps) {
  return (
    <span
      className={cn('material-symbol shrink-0', className)}
      style={{
        fontSize: size,
        fontVariationSettings: `'FILL' ${fill ? 1 : 0}, 'wght' ${weight}, 'GRAD' 0, 'opsz' 24`,
        ...style,
      }}
      aria-hidden="true"
    >
      {name}
    </span>
  )
}
