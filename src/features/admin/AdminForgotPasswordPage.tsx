import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AlertCircle, ArrowLeft, Eye, EyeOff, KeyRound, Lock, Mail } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { apiClient } from '@/services/api/client'
import { emailSchema, otpSchema, passwordSchema } from '@/lib/validation'

const emailFormSchema = z.object({ email: emailSchema })
type EmailForm = z.infer<typeof emailFormSchema>

const resetFormSchema = z
  .object({
    otp: otpSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })
type ResetForm = z.infer<typeof resetFormSchema>

export default function AdminForgotPasswordPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState<'email' | 'reset'>('email')
  const [resetEmail, setResetEmail] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const emailForm = useForm<EmailForm>({ resolver: zodResolver(emailFormSchema) })
  const resetForm = useForm<ResetForm>({ resolver: zodResolver(resetFormSchema) })

  async function onRequestCode(values: EmailForm) {
    setFormError(null)
    try {
      // Backend always answers 200 (no account enumeration); an OTP is emailed
      // only if an admin account exists for this address.
      await apiClient.post('/admin/auth/forgot-password', { email: values.email })
      setResetEmail(values.email)
      setStep('reset')
      toast.success('If an admin account exists, a 6-digit code has been sent.')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to send the reset code. Please try again.'
      setFormError(message)
      toast.error(message)
    }
  }

  async function onResetPassword(values: ResetForm) {
    setFormError(null)
    try {
      await apiClient.post('/auth/reset-password', {
        email: resetEmail,
        otp: values.otp,
        password: values.password,
      })
      toast.success('Password reset successfully! Please sign in.')
      navigate('/admin', { replace: true })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to reset password. Check your code and try again.'
      setFormError(message)
      toast.error(message)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-6 sm:p-8">
        <button
          onClick={() => (step === 'reset' ? setStep('email') : navigate('/admin'))}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="size-4" />
          {step === 'reset' ? 'Change email' : 'Back to Login'}
        </button>

        {formError && (
          <div
            role="alert"
            className="mb-4 flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive"
          >
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        {step === 'email' ? (
          <>
            <h1 className="text-2xl font-bold text-foreground">Reset Password</h1>
            <p className="text-sm text-muted-foreground mt-2">
              Enter your admin email and we'll send you a 6-digit reset code.
            </p>

            <form onSubmit={emailForm.handleSubmit(onRequestCode)} className="mt-6 space-y-4" noValidate>
              <Input
                label="Admin Email"
                type="email"
                autoComplete="email"
                placeholder="admin@ppdstore.com"
                leftIcon={<Mail className="size-4" />}
                error={emailForm.formState.errors.email?.message}
                {...emailForm.register('email')}
              />

              <Button type="submit" size="lg" className="w-full" loading={emailForm.formState.isSubmitting}>
                Send Reset Code
              </Button>
            </form>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-foreground">Enter Reset Code</h1>
            <p className="text-sm text-muted-foreground mt-2">
              We sent a 6-digit code to <span className="font-medium text-foreground">{resetEmail}</span>. Enter it
              below with your new password.
            </p>

            <form onSubmit={resetForm.handleSubmit(onResetPassword)} className="mt-6 space-y-4" noValidate>
              <Input
                label="6-Digit Reset Code"
                type="text"
                digitsOnly
                maxLength={6}
                autoComplete="one-time-code"
                placeholder="123456"
                leftIcon={<KeyRound className="size-4" />}
                error={resetForm.formState.errors.otp?.message}
                {...resetForm.register('otp')}
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
                error={resetForm.formState.errors.password?.message}
                {...resetForm.register('password')}
              />

              <Input
                label="Confirm Password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="••••••••"
                leftIcon={<Lock className="size-4" />}
                error={resetForm.formState.errors.confirmPassword?.message}
                {...resetForm.register('confirmPassword')}
              />

              <Button type="submit" size="lg" className="w-full" loading={resetForm.formState.isSubmitting}>
                Reset Password
              </Button>

              <button
                type="button"
                onClick={emailForm.handleSubmit(onRequestCode)}
                className="mx-auto block p-2 text-sm font-semibold text-primary hover:underline"
              >
                Resend code
              </button>
            </form>
          </>
        )}
      </Card>
    </div>
  )
}
