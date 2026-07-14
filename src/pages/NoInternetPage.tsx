import { useEffect, useState } from 'react'
import { WifiOff, RefreshCw, Smartphone } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export default function NoInternetPage() {
  const [isOnline, setIsOnline] = useState(true)
  const [attempting, setAttempting] = useState(false)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (isOnline) {
    return null
  }

  const handleRetry = async () => {
    setAttempting(true)
    try {
      const response = await fetch('https://www.google.com/favicon.ico', { mode: 'no-cors' })
      if (response.status === 200) {
        setIsOnline(true)
        window.location.reload()
      }
    } catch (e) {
      console.error('Still offline', e)
    } finally {
      setAttempting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-background flex items-center justify-center p-4">
      <div className="max-w-sm w-full space-y-6 text-center">
        <div className="flex justify-center">
          <div className="size-24 rounded-full bg-warning/10 flex items-center justify-center animate-pulse">
            <WifiOff className="size-12 text-warning" />
          </div>
        </div>

        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">No Internet Connection</h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            You appear to be offline. Check your connection and try again.
          </p>
        </div>

        <div className="space-y-2 bg-muted p-4 rounded-lg text-left text-xs text-muted-foreground">
          <p className="flex items-center gap-2">
            <span className="text-lg">📡</span> Check WiFi or mobile data
          </p>
          <p className="flex items-center gap-2">
            <span className="text-lg">🔄</span> Restart your connection
          </p>
          <p className="flex items-center gap-2">
            <Smartphone className="size-4" /> Check airplane mode is off
          </p>
        </div>

        <Button
          onClick={handleRetry}
          disabled={attempting}
          className="w-full gap-2"
          size="lg"
        >
          <RefreshCw className={`size-4 ${attempting ? 'animate-spin' : ''}`} />
          {attempting ? 'Checking Connection…' : 'Try Again'}
        </Button>

        <p className="text-xs text-muted-foreground">
          You can still access cached pages while offline.
        </p>
      </div>
    </div>
  )
}
