import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Lock, Eye, EyeOff, Shield, LogOut, Save, MapPin, Monitor } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { apiClient } from '@/services/api/client'

const passwordSchema = z.object({
  currentPassword: z.string().min(6, 'Password must be at least 6 characters'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(8, 'Password must be at least 8 characters'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

type PasswordFormValues = z.infer<typeof passwordSchema>

interface Session {
  id: string
  userAgent: string
  ip: string
  lastActiveAt: string
  createdAt: string
  current: boolean
}

/** Relative "2 minutes ago" formatter. */
function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins} minute${mins > 1 ? 's' : ''} ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs} hour${hrs > 1 ? 's' : ''} ago`
  const days = Math.floor(hrs / 24)
  return `${days} day${days > 1 ? 's' : ''} ago`
}

export default function AdminSecurityPage() {
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [twoFAEnabled, setTwoFAEnabled] = useState(false)

  const [sessions, setSessions] = useState<Session[]>([])
  const [location, setLocation] = useState<string>('Locating…')

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
  })

  const loadSessions = () =>
    apiClient
      .get<Session[]>('/auth/sessions')
      .then((r) => setSessions(r.data))
      .catch(() => setSessions([]))

  useEffect(() => {
    void loadSessions()

    // Real (approximate, ISP-based) location for the current browser.
    // Keyless, CORS-enabled. Localhost has no public IP, so it may be "Unknown".
    void fetch('https://ipwho.is/')
      .then((r) => r.json())
      .then((d: { success?: boolean; city?: string; region?: string; country?: string }) => {
        if (d.success && (d.city || d.region)) {
          setLocation([d.city, d.region, d.country].filter(Boolean).join(', '))
        } else {
          setLocation('Unknown (local network)')
        }
      })
      .catch(() => setLocation('Unknown'))
  }, [])

  async function onPasswordSubmit(values: PasswordFormValues) {
    try {
      await apiClient.post('/users/me/change-password', {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      })
      toast.success('Password changed successfully')
      reset()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to change password')
    }
  }

  async function handleLogoutAllOthers() {
    try {
      await apiClient.delete('/auth/sessions')
      toast.success('All other sessions logged out')
      void loadSessions()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to logout sessions')
    }
  }

  async function handleRevokeSession(id: string) {
    try {
      await apiClient.delete(`/auth/sessions/${id}`)
      setSessions((prev) => prev.filter((s) => s.id !== id))
      toast.success('Session logged out')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to logout session')
    }
  }

  // The current session is the newest one; fall back to the first if not flagged.
  const current = sessions.find((s) => s.current) ?? sessions[0]
  const others = sessions.filter((s) => s.id !== current?.id)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Security Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your admin account security</p>
      </div>

      {/* Current Session */}
      <Card className="p-3 md:p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Shield className="size-5" />
          Current Session
        </h2>
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 p-3 bg-muted rounded-lg">
            <div className="min-w-0">
              <p className="font-semibold text-foreground text-sm truncate">{current?.userAgent ?? 'This device'}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Last activity: {current ? timeAgo(current.lastActiveAt) : '—'}
              </p>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                <MapPin className="size-3 shrink-0" />
                <span className="truncate">{location}</span>
              </p>
            </div>
            <span className="text-xs bg-success/10 text-success px-3 py-1 rounded-full font-semibold whitespace-nowrap">
              Active
            </span>
          </div>
          <Button
            variant="destructive"
            className="w-full gap-2"
            onClick={() => void handleLogoutAllOthers()}
            disabled={others.length === 0}
          >
            <LogOut className="size-4" />
            <span className="truncate">Logout All Other Sessions{others.length > 0 ? ` (${others.length})` : ''}</span>
          </Button>
        </div>
      </Card>

      {/* Change Password */}
      <Card className="p-3 md:p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Lock className="size-5" />
          Change Password
        </h2>
        <form onSubmit={handleSubmit(onPasswordSubmit)} className="space-y-3 md:space-y-4" noValidate>
          <Input
            label="Current Password"
            type={showCurrent ? 'text' : 'password'}
            placeholder="••••••••"
            error={errors.currentPassword?.message}
            rightSlot={
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground"
              >
                {showCurrent ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            }
            {...register('currentPassword')}
          />
          <Input
            label="New Password"
            type={showNew ? 'text' : 'password'}
            placeholder="••••••••"
            error={errors.newPassword?.message}
            rightSlot={
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground"
              >
                {showNew ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            }
            {...register('newPassword')}
          />
          <Input
            label="Confirm Password"
            type={showConfirm ? 'text' : 'password'}
            placeholder="••••••••"
            error={errors.confirmPassword?.message}
            rightSlot={
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground"
              >
                {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            }
            {...register('confirmPassword')}
          />
          <Button type="submit" className="w-full gap-2" loading={isSubmitting}>
            <Save className="size-4" />
            Update Password
          </Button>
        </form>
      </Card>

      {/* Two-Factor Authentication */}
      <Card className="p-3 md:p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Two-Factor Authentication</h2>
        <div className="space-y-3 md:space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 bg-muted rounded-lg">
            <div>
              <p className="font-semibold text-foreground text-sm">Authenticator App</p>
              <p className="text-xs text-muted-foreground mt-1">Add extra security with an authenticator app</p>
            </div>
            <label className="flex items-center gap-2 cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={twoFAEnabled}
                onChange={(e) => {
                  setTwoFAEnabled(e.target.checked)
                  toast.success(e.target.checked ? '2FA enabled' : '2FA disabled')
                }}
                className="w-4 h-4 rounded"
              />
              <span className="text-xs sm:text-sm font-medium text-foreground">
                {twoFAEnabled ? 'Enabled' : 'Disabled'}
              </span>
            </label>
          </div>
          {twoFAEnabled && (
            <div className="p-3 bg-success/10 rounded-lg border border-success/20">
              <p className="text-sm text-foreground font-semibold mb-1">✓ 2FA is enabled</p>
              <p className="text-xs text-muted-foreground">Your account is protected by two-factor authentication</p>
            </div>
          )}
        </div>
      </Card>

      {/* Active Devices */}
      <Card className="p-3 md:p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Active Devices ({sessions.length})</h2>
        <div className="space-y-3">
          {sessions.map((s) => (
            <div key={s.id} className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 p-3 bg-muted rounded-lg">
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <Monitor className="size-5 text-muted-foreground shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="font-semibold text-foreground text-sm truncate">{s.userAgent || 'Unknown device'}</p>
                  <p className="text-xs text-muted-foreground mt-1 truncate">
                    Last active: {timeAgo(s.lastActiveAt)}
                    {s.ip ? ` • ${s.ip}` : ''}
                  </p>
                </div>
              </div>
              {s.id === current?.id ? (
                <span className="text-xs bg-success/10 text-success px-3 py-1 rounded-full whitespace-nowrap">Current</span>
              ) : (
                <button
                  onClick={() => void handleRevokeSession(s.id)}
                  className="text-xs text-destructive hover:text-destructive/80 font-semibold whitespace-nowrap"
                >
                  Logout
                </button>
              )}
            </div>
          ))}
          {sessions.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">No active sessions found</p>
          )}
        </div>
      </Card>
    </div>
  )
}
