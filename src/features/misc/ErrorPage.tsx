import { useRouteError, useNavigate } from 'react-router-dom'
import { Icon } from '@/components/ui/Icon'
import { Button } from '@/components/ui/Button'

export default function ErrorPage() {
  const error = useRouteError() as any
  const navigate = useNavigate()

  console.error('Unhandled route error:', error)

  const errorMessage = error?.statusText || error?.message || 'An unexpected error occurred.'
  const errorStatus = error?.status || '500'

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center bg-card p-8 rounded-3xl border border-border shadow-soft relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute -top-12 -right-12 size-40 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 size-40 bg-deal/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-destructive/10 text-destructive mb-6">
            <Icon name="error" size={36} className="text-deal" />
          </div>

          <span className="text-xs font-bold uppercase tracking-wider text-deal px-3 py-1 bg-deal/10 rounded-full">
            Error {errorStatus}
          </span>

          <h1 className="mt-4 text-3xl font-extrabold text-foreground tracking-tight sm:text-4xl font-display">
            Oops! System Error
          </h1>
          
          <p className="mt-3 text-sm text-muted-foreground max-w-xs mx-auto leading-relaxed">
            Something went wrong while rendering this section of the application.
          </p>

          {/* Details */}
          <div className="mt-5 p-4 rounded-xl border border-border-strong bg-muted/30 text-left font-mono text-xs text-subtle-foreground overflow-x-auto max-h-36 no-scrollbar">
            <p className="font-semibold text-foreground">Stack Trace Info:</p>
            <p className="mt-1 whitespace-pre-wrap">{errorMessage}</p>
          </div>

          <div className="mt-8 flex flex-col gap-3">
            <Button
              onClick={() => {
                navigate('/')
                window.location.reload()
              }}
              size="lg"
              className="w-full font-bold shadow-soft"
            >
              Go to Home Page
            </Button>
            
            <a
              href="https://eaznexora.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-card border border-border-strong px-4 py-3 text-sm font-bold text-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              <Icon name="hub" size={18} className="text-primary" />
              Connect to EazNexora
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
