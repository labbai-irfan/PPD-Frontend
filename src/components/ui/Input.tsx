import { useId, type ChangeEvent, type ComponentProps, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends ComponentProps<'input'> {
  label?: string
  error?: string
  hint?: string
  leftIcon?: ReactNode
  rightSlot?: ReactNode
  /** Accept digits 0-9 only — strips other characters on type/paste and shows the numeric keyboard */
  digitsOnly?: boolean
}

export function Input({ label, error, hint, leftIcon, rightSlot, className, id, digitsOnly, onChange, inputMode, ...props }: InputProps) {
  const autoId = useId()
  const inputId = id ?? autoId

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    if (digitsOnly) {
      const digits = e.target.value.replace(/\D/g, '')
      if (digits !== e.target.value) e.target.value = digits
    }
    onChange?.(e)
  }

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-foreground">
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-muted-foreground">
            {leftIcon}
          </span>
        )}
        <input
          id={inputId}
          className={cn(
            'h-11 w-full rounded-xl border border-input bg-card px-4 text-sm text-foreground shadow-xs transition-colors',
            'placeholder:text-muted-foreground/70',
            'focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/25',
            leftIcon && 'pl-10',
            rightSlot && 'pr-11',
            error && 'border-destructive focus:border-destructive focus:ring-destructive/20',
            className,
          )}
          aria-invalid={error ? true : undefined}
          inputMode={inputMode ?? (digitsOnly ? 'numeric' : undefined)}
          onChange={handleChange}
          {...props}
        />
        {rightSlot && <span className="absolute inset-y-0 right-2 flex items-center">{rightSlot}</span>}
      </div>
      {error ? (
        <p className="mt-1.5 text-xs font-medium text-destructive">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  )
}
