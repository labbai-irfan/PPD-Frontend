import { useNavigate } from 'react-router-dom'
import { AlertTriangle, Home, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export default function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="size-24 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="size-12 text-destructive" />
          </div>
        </div>

        <div>
          <h1 className="text-5xl font-bold text-foreground mb-2">404</h1>
          <h2 className="text-2xl font-semibold text-foreground mb-2">Page Not Found</h2>
          <p className="text-muted-foreground">The page you're looking for doesn't exist or has been moved.</p>
        </div>

        <div className="flex gap-3 flex-col sm:flex-row">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="gap-2 flex-1"
          >
            <ArrowLeft className="size-4" />
            Go Back
          </Button>
          <Button
            onClick={() => navigate('/')}
            className="gap-2 flex-1"
          >
            <Home className="size-4" />
            Home
          </Button>
        </div>
      </div>
    </div>
  )
}
