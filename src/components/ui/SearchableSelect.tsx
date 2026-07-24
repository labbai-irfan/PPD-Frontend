import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { ChevronDown, Loader2, Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface SearchableSelectOption {
  value: string
  label: string
  sublabel?: string
}

interface SearchableSelectProps {
  label?: string
  placeholder?: string
  searchPlaceholder?: string
  options: SearchableSelectOption[]
  value: string
  onChange: (value: string, option?: SearchableSelectOption) => void
  error?: string
  hint?: string
  disabled?: boolean
  loading?: boolean
  emptyMessage?: string
  className?: string
}

export function SearchableSelect({
  label,
  placeholder = 'Select…',
  searchPlaceholder = 'Search…',
  options,
  value,
  onChange,
  error,
  hint,
  disabled,
  loading,
  emptyMessage = 'No results found',
  className,
}: SearchableSelectProps) {
  const autoId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')

  const selected = useMemo(
    () => options.find((option) => option.value === value),
    [options, value],
  )

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (!term) return options
    return options.filter(
      (option) =>
        option.label.toLowerCase().includes(term) ||
        option.sublabel?.toLowerCase().includes(term) ||
        option.value.toLowerCase().includes(term),
    )
  }, [options, query])

  useEffect(() => {
    if (!open) return

    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
        setQuery('')
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [open])

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => searchRef.current?.focus())
    }
  }, [open])

  const describedById = error || hint ? `${autoId}-desc` : undefined

  return (
    <div ref={rootRef} className={cn('relative w-full', className)}>
      {label && (
        <label htmlFor={autoId} className="mb-1.5 block text-sm font-medium text-foreground">
          {label}
        </label>
      )}

      <button
        id={autoId}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedById}
        onClick={() => {
          if (disabled) return
          setOpen((prev) => !prev)
          if (open) setQuery('')
        }}
        className={cn(
          'flex h-11 w-full items-center justify-between gap-2 rounded-xl border border-input bg-card px-4 text-left text-sm shadow-xs transition-colors',
          'focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/25',
          disabled && 'cursor-not-allowed opacity-60',
          error && 'border-destructive focus:border-destructive focus:ring-destructive/20',
        )}
      >
        <span className={cn('truncate', !selected && 'text-muted-foreground/70')}>
          {selected ? selected.label : placeholder}
        </span>
        <span className="flex shrink-0 items-center gap-1 text-muted-foreground">
          {loading && <Loader2 className="size-4 animate-spin" />}
          {selected && !disabled && (
            <span
              role="button"
              tabIndex={-1}
              aria-label="Clear selection"
              className="rounded p-0.5 hover:bg-muted"
              onClick={(event) => {
                event.stopPropagation()
                onChange('')
                setOpen(false)
                setQuery('')
              }}
            >
              <X className="size-3.5" />
            </span>
          )}
          <ChevronDown className={cn('size-4 transition-transform', open && 'rotate-180')} />
        </span>
      </button>

      {open && (
        <div className="absolute z-50 mt-1.5 w-full overflow-hidden rounded-xl border border-border bg-card shadow-lg">
          <div className="border-b border-border p-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                ref={searchRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={searchPlaceholder}
                className="h-10 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/25"
              />
            </div>
          </div>

          <ul role="listbox" className="max-h-56 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <li className="px-4 py-3 text-sm text-muted-foreground">{emptyMessage}</li>
            ) : (
              filtered.map((option) => (
                <li key={option.value}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={option.value === value}
                    onClick={() => {
                      onChange(option.value, option)
                      setOpen(false)
                      setQuery('')
                    }}
                    className={cn(
                      'flex w-full flex-col px-4 py-2.5 text-left text-sm transition-colors hover:bg-muted/70',
                      option.value === value && 'bg-primary-soft font-medium text-primary-soft-foreground',
                    )}
                  >
                    <span>{option.label}</span>
                    {option.sublabel && (
                      <span className="text-xs text-muted-foreground">{option.sublabel}</span>
                    )}
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}

      {error ? (
        <p id={describedById} className="mt-1.5 text-xs font-medium text-destructive">
          {error}
        </p>
      ) : hint ? (
        <p id={describedById} className="mt-1.5 text-xs text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  )
}
