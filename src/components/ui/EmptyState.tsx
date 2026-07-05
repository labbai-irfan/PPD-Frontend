import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex min-h-[45vh] flex-col items-center justify-center px-6 py-16 text-center', className)}>
      {icon && (
        <div className="mb-5 flex size-20 items-center justify-center rounded-full bg-muted text-muted-foreground [&_svg]:size-9">
          {icon}
        </div>
      )}
      <h2 className="text-lg font-bold text-foreground">{title}</h2>
      {description && <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}
