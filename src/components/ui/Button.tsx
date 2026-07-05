import type { ComponentProps, ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Spinner } from '@/components/ui/Spinner'

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'link'
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon'

/* Design language: fully-rounded pills; primary CTAs use the orange gradient. */
const base =
  'inline-flex items-center justify-center gap-2 rounded-full font-semibold whitespace-nowrap transition-all duration-200 select-none disabled:pointer-events-none disabled:opacity-55 active:scale-[0.98] cursor-pointer'

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-grad-primary text-primary-foreground shadow-glow hover:brightness-105',
  secondary: 'bg-primary-soft text-primary-soft-foreground hover:bg-chip',
  outline: 'border border-border-strong bg-card text-foreground shadow-soft hover:bg-muted',
  ghost: 'bg-transparent text-foreground hover:bg-muted',
  destructive: 'bg-destructive text-destructive-foreground hover:opacity-90',
  link: 'bg-transparent text-link underline-offset-4 hover:underline p-0 h-auto',
}

const sizes: Record<ButtonSize, string> = {
  sm: 'h-9 px-4 text-xs',
  md: 'h-11 px-5 text-sm',
  lg: 'h-[52px] px-7 text-[15px] font-bold',
  icon: 'h-10 w-10 p-0',
}

/** Class builder so Links and other elements can look like buttons. */
export function buttonVariants(opts: { variant?: ButtonVariant; size?: ButtonSize; className?: string } = {}) {
  const { variant = 'primary', size = 'md', className } = opts
  return cn(base, variants[variant], sizes[size], className)
}

export interface ButtonProps extends ComponentProps<'button'> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  leftIcon?: ReactNode
  rightIcon?: ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  leftIcon,
  rightIcon,
  className,
  children,
  disabled,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonVariants({ variant, size, className })}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Spinner className="size-4" /> : leftIcon}
      {children}
      {!loading && rightIcon}
    </button>
  )
}
