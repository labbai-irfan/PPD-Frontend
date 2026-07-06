import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'
import { Icon } from '@/components/ui/Icon'

interface CircleIconButtonProps extends ComponentProps<'button'> {
  icon: string
  label: string
  iconSize?: number
  fill?: boolean
  /** 'light' = white circle (back/menu); 'solid' = orange circle (filter FAB) */
  tone?: 'light' | 'solid'
  size?: number
}

/** Round icon button used across the design for back / menu / filter actions. */
export function CircleIconButton({
  icon,
  label,
  iconSize = 22,
  fill = false,
  tone = 'light',
  size = 42,
  className,
  ...props
}: CircleIconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full transition-transform hover:scale-105 active:scale-95 cursor-pointer',
        tone === 'light' ? 'bg-card text-ink shadow-pill dark:text-foreground' : 'bg-primary text-primary-foreground shadow-glow',
        className,
      )}
      style={{ width: size, height: size }}
      {...props}
    >
      {icon.endsWith('.svg') ? (
        <img src={icon} alt={label} style={{ width: iconSize, height: iconSize }} className="object-contain" />
      ) : (
        <Icon name={icon} size={iconSize} fill={fill} />
      )}
    </button>
  )
}
