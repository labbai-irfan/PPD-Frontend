import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

export type BadgeVariant = 'default' | 'secondary' | 'outline' | 'success' | 'warning' | 'destructive' | 'deal'

const variants: Record<BadgeVariant, string> = {
  default: 'bg-primary-soft text-primary-soft-foreground',
  secondary: 'bg-secondary text-secondary-foreground',
  outline: 'border border-border text-muted-foreground',
  success: 'bg-success/12 text-success',
  warning: 'bg-warning/15 text-warning-foreground dark:text-warning',
  destructive: 'bg-destructive/12 text-destructive',
  deal: 'bg-deal text-white',
}

export interface BadgeProps extends ComponentProps<'span'> {
  variant?: BadgeVariant
}

export function Badge({ variant = 'default', className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-bold tracking-wide uppercase',
        variants[variant],
        className,
      )}
      {...props}
    />
  )
}
