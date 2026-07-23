import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Lock } from 'lucide-react'
import { ROUTES } from '@/lib/constants'
import { useAuthStore } from '@/store/auth.store'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

/**
 * Route guard: renders child routes when signed in, otherwise displays a
 * 'Not Logged In' view with a button to navigate to the login page.
 */
export default function RequireAuth() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const location = useLocation()
  const navigate = useNavigate()

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-[75vh] flex-col justify-center py-10 px-2 sm:px-0">
        <Card className="p-6 sm:p-8 text-center flex flex-col items-center shadow-sm border-0 sm:border">
          <div className="mb-6 flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Lock className="size-8" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Authentication Required</h1>
          <p className="mt-2 text-sm text-muted-foreground max-w-xs">
            Please sign in to access your profile, track orders, and manage your account.
          </p>

          <Button 
            onClick={() => navigate(ROUTES.login, { state: { from: location.pathname + location.search } })}
            className="mt-8 w-full sm:w-auto min-w-[200px]"
            size="lg"
          >
            Sign in to continue
          </Button>
        </Card>
      </div>
    )
  }
  return <Outlet />
}
