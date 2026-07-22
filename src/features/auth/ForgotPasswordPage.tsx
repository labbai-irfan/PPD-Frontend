import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AlertCircle, Mail } from 'lucide-react'
import { toast } from 'sonner'
import { apiClient } from '@/services/api/client'
import { ROUTES } from '@/lib/constants'
import { emailSchema } from '@/lib/validation'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'

const schema = z.object({
  email: emailSchema,
})

type FormValues = z.infer<typeof schema>

export default function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  async function onSubmit(values: FormValues) {
    setFormError(null)
    try {
      await apiClient.post('/auth/forgot-password', { email: values.email })
      toast.success('If an account exists, a reset code is on its way.')
      navigate(`${ROUTES.resetPassword}?email=${encodeURIComponent(values.email)}`)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to send reset code. Please try again.'
      setFormError(message)
      toast.error(message)
    }
  }

  return (
    <Card className="p-4 sm:p-8">
      <h1 className="text-xl font-bold tracking-tight text-foreground">Forgot your password?</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Enter your email and we'll send you a 6-digit code to reset it.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
        {formError && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive"
          >
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <span>{formError}</span>
          </div>
        )}
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          leftIcon={<Mail className="size-4" />}
          error={errors.email?.message}
          {...register('email')}
        />
        <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>
          Send reset code
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Remembered it?{' '}
        <Link to={ROUTES.login} className="font-semibold text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </Card>
  )
}
