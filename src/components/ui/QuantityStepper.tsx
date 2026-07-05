import { cn } from '@/lib/utils'

interface QuantityStepperProps {
  value: number
  min?: number
  max?: number
  onChange: (value: number) => void
  size?: 'sm' | 'md'
  className?: string
}

/** Soft-gold pill stepper from the design cart (− qty +). */
export function QuantityStepper({ value, min = 1, max = 99, onChange, size = 'md', className }: QuantityStepperProps) {
  const btn = cn(
    'flex items-center justify-center font-semibold text-primary-soft-foreground transition-opacity hover:opacity-70 disabled:opacity-35 disabled:pointer-events-none cursor-pointer',
    size === 'sm' ? 'size-6 text-[17px]' : 'size-8 text-lg',
  )

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full bg-primary-soft',
        size === 'sm' ? 'gap-2.5 px-3 py-[3px]' : 'gap-3 px-3.5 py-1',
        className,
      )}
    >
      <button type="button" className={btn} aria-label="Decrease quantity" disabled={value <= min} onClick={() => onChange(value - 1)}>
        −
      </button>
      <span
        className={cn(
          'min-w-[18px] text-center font-semibold tabular-nums text-foreground select-none',
          size === 'sm' ? 'text-[13px]' : 'text-sm',
        )}
        aria-live="polite"
      >
        {value}
      </span>
      <button type="button" className={btn} aria-label="Increase quantity" disabled={value >= max} onClick={() => onChange(value + 1)}>
        +
      </button>
    </div>
  )
}
