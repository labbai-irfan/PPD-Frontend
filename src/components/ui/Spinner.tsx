import { cn } from '@/lib/utils'

export function Spinner({ className }: { className?: string }) {
  return (
    <svg
      className={cn('size-5 animate-spin text-current', className)}
      viewBox="0 0 24 24"
      fill="none"
      role="status"
      aria-label="Loading"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-80"
        fill="currentColor"
        d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  )
}

/** Full-area centered loader for route/section suspense states. */
export function LoadingView({ label = 'Loading…', className }: { label?: string; className?: string }) {
  return (
    <div className={cn('flex min-h-[40vh] flex-col items-center justify-center gap-3', className)}>
      <Spinner className="size-8 text-primary" />
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  )
}
