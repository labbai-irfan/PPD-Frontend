import { useState } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Lock, KeyRound } from 'lucide-react'
import { toast } from 'sonner'
import { ROUTES } from '@/lib/constants'
import { apiClient } from '@/services/api/client'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'

const schema = z.object({
  otp: z.string().length(6, 'OTP must be exactly 6 digits'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type FormValues = z.infer<typeof schema>

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const email = searchParams.get('email')

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  if (!email) {
    return (
      <Card className="p-4 text-center sm:p-8">
        <p className="text-destructive break-words">Invalid request. Please start the password reset process again.</p>
        <Link to={ROUTES.forgotPassword} className="block sm:inline-block">
          <Button className="mt-4 w-full sm:w-auto">Forgot Password</Button>
        </Link>
      </Card>
    )
  }

  async function onSubmit(values: FormValues) {
    if (!email) return
    try {
      await apiClient.post('/auth/reset-password', { email, otp: values.otp, password: values.password })
      toast.success('Password reset successfully!')
      navigate(ROUTES.login, { replace: true })
    } catch (error) {
      toast.error('Failed to reset password. Please check your OTP and try again.')
    }
  }

  return (
    <Card className="p-4 sm:p-8">
      <h1 className="text-xl font-bold tracking-tight text-foreground">Reset Your Password</h1>
      <p className="mt-1 text-sm text-muted-foreground">Enter your new password below.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
        <Input
          label="6-Digit Reset Code"
          type="text"
          placeholder="123456"
          leftIcon={<KeyRound className="size-4" />}
          error={errors.otp?.message}
          {...register('otp')}
        />

        <Input
          label="New Password"
          type={showPassword ? 'text' : 'password'}
          autoComplete="new-password"
          placeholder="••••••••"
          leftIcon={<Lock className="size-4" />}
          rightSlot={
            <button
              type="button"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              onClick={() => setShowPassword((v) => !v)}
              className="flex size-11 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          }
          error={errors.password?.message}
          {...register('password')}
        />

        <Input
          label="Confirm Password"
          type={showConfirm ? 'text' : 'password'}
          autoComplete="new-password"
          placeholder="••••••••"
          leftIcon={<Lock className="size-4" />}
          rightSlot={
            <button
              type="button"
              aria-label={showConfirm ? 'Hide password' : 'Show password'}
              onClick={() => setShowConfirm((v) => !v)}
              className="flex size-11 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
            >
              {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          }
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>
          Reset Password
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Remember your password?{' '}
        <Link to={ROUTES.login} className="font-semibold text-primary hover:underline">
          Sign in here
        </Link>
      </p>
    </Card>
  )
}
