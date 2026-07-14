import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Lock, Mail, Shield, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { useAuthStore } from '@/store/auth.store'

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type FormValues = z.infer<typeof schema>

export default function AdminLoginPage() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [loginAttempts, setLoginAttempts] = useState(0)
  const [isLocked, setIsLocked] = useState(false)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(values: FormValues) {
    if (isLocked) {
      toast.error('Too many login attempts. Try again later.')
      return
    }

    try {
      // Real backend auth — server enforces lockout (5 fails = 30 min) and rejects non-admins
      await useAuthStore.getState().adminLogin(values.email, values.password)
      toast.success('Admin login successful!')

      if (rememberMe) {
        localStorage.setItem('adminRememberMe', 'true')
      }

      navigate('/admin/dashboard', { replace: true })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Invalid credentials'
      const attempts = loginAttempts + 1
      setLoginAttempts(attempts)
      if (message.toLowerCase().includes('locked') || attempts >= 5) {
        setIsLocked(true)
      }
      toast.error(message)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-6 sm:p-8">
        <div className="flex justify-center mb-6">
          <div className="bg-primary/10 p-3 rounded-lg">
            <Shield className="size-8 text-primary" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-center text-foreground">Admin Portal</h1>
        <p className="text-center text-sm text-muted-foreground mt-2">PPD Store Administration</p>

        {isLocked && (
          <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex gap-2">
            <AlertCircle className="size-5 text-destructive shrink-0 mt-0.5" />
            <div className="text-sm text-destructive">
              <p className="font-semibold">Account Locked</p>
              <p className="text-xs mt-1">Please try again after 30 minutes</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
          <Input
            label="Admin Email"
            type="email"
            autoComplete="email"
            placeholder="admin@ppdstore.com"
            leftIcon={<Mail className="size-4" />}
            error={errors.email?.message}
            disabled={isLocked}
            {...register('email')}
          />

          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder="••••••••"
            leftIcon={<Lock className="size-4" />}
            rightSlot={
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                disabled={isLocked}
                className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground cursor-pointer disabled:opacity-50"
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            }
            error={errors.password?.message}
            disabled={isLocked}
            {...register('password')}
          />

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={isLocked}
                className="w-4 h-4 rounded accent-primary disabled:opacity-50"
              />
              <span className="text-sm text-muted-foreground">Remember me</span>
            </label>
            <Link
              to="/admin/forgot-password"
              className="text-sm text-primary hover:text-primary/80 font-semibold"
            >
              Forgot password?
            </Link>
          </div>

          <Button type="submit" size="lg" className="w-full" loading={isSubmitting} disabled={isLocked}>
            Sign In to Admin
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t space-y-3">
          <p className="text-xs text-muted-foreground text-center font-semibold">
            Demo Credentials (for testing)
          </p>
          <div className="bg-muted p-3 rounded-lg space-y-1">
            <p className="text-xs text-foreground">
              <span className="font-semibold">Email:</span> admin@ppdstore.com
            </p>
            <p className="text-xs text-foreground">
              <span className="font-semibold">Password:</span> admin123
            </p>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            🔒 Keep your credentials secure
          </p>
        </div>

        <div className="mt-4 pt-4 border-t text-center">
          <p className="text-xs text-muted-foreground">
            Not an admin?{' '}
            <Link to="/" className="text-primary hover:text-primary/80 font-semibold">
              Back to Store
            </Link>
          </p>
        </div>
      </Card>
    </div>
  )
}
