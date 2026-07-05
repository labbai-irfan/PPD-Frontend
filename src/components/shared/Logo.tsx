import { cn } from '@/lib/utils'

interface LogoProps {
  size?: number
  className?: string
}

/** The red PPD logo square. */
export function Logo({ size = 38, className }: LogoProps) {
  return (
    <span
      className={cn(
        'flex shrink-0 items-center justify-center rounded-[9px] bg-deal font-extrabold text-white select-none',
        className,
      )}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.32) }}
      aria-label="PPD"
    >
      PPD
    </span>
  )
}
