import { cn } from '@/lib/utils'

interface AvatarProps {
  name: string
  src?: string
  size?: number
  className?: string
}

export function Avatar({ name, src, size = 40, className }: AvatarProps) {
  const initials = name
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-soft font-semibold text-primary-soft-foreground select-none',
        className,
      )}
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      {src ? <img src={src} alt={name} className="size-full object-cover" /> : initials || '?'}
    </span>
  )
}
