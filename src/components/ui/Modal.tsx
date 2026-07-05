import { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  className?: string
}

export function Modal({ open, onClose, title, children, className }: ModalProps) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-xs animate-fade-in" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          'relative z-10 w-full max-h-[90vh] overflow-y-auto rounded-t-2xl bg-card p-5 shadow-2xl animate-slide-up',
          'sm:max-w-md sm:rounded-2xl',
          className,
        )}
      >
        <div className="mb-4 flex items-center justify-between gap-4">
          {title && <h2 className="text-base font-bold text-foreground">{title}</h2>}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="ml-auto flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground cursor-pointer"
          >
            <X className="size-4.5" />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  )
}
