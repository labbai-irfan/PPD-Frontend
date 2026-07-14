import { useNavigate, useParams } from 'react-router-dom'
import { AlertTriangle, Home, ArrowLeft, Wifi, Server } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export default function ErrorPage() {
  const navigate = useNavigate()
  const { code } = useParams()
  const errorCode = code || '404'

  const errors: Record<string, { title: string; description: string; icon: typeof AlertTriangle }> = {
    '404': {
      title: 'Page Not Found',
      description: "The page you're looking for doesn't exist or has been moved.",
      icon: AlertTriangle,
    },
    '500': {
      title: 'Server Error',
      description: 'Something went wrong on our end. Please try again later.',
      icon: Server,
    },
    '503': {
      title: 'Service Unavailable',
      description: "We're temporarily down for maintenance. Check back soon!",
      icon: Wifi,
    },
  }

  const error = errors[errorCode] || errors['404']
  const Icon = error.icon

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="size-24 rounded-full bg-destructive/10 flex items-center justify-center">
            <Icon className="size-12 text-destructive" />
          </div>
        </div>

        <div>
          <h1 className="text-5xl font-bold text-foreground mb-2">{errorCode}</h1>
          <h2 className="text-2xl font-semibold text-foreground mb-2">{error.title}</h2>
          <p className="text-muted-foreground">{error.description}</p>
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

        <div className="pt-6 border-t">
          <p className="text-xs text-muted-foreground">
            Error code: <span className="font-mono font-semibold">{errorCode}</span>
          </p>
        </div>
      </div>
    </div>
  )
}
