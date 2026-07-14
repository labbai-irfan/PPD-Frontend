import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail } from 'lucide-react'
import { toast } from 'sonner'
import { apiClient } from '@/services/api/client'
import { ROUTES } from '@/lib/constants'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'

const schema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
})

type FormValues = z.infer<typeof schema>

export default function ForgotPasswordPage() {
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  async function onSubmit(values: FormValues) {
    try {
      await apiClient.post('/auth/forgot-password', { email: values.email })
      toast.success('Check your email for the reset code.')
      navigate(`${ROUTES.resetPassword}?email=${encodeURIComponent(values.email)}`)
    } catch (error) {
      toast.error('Failed to send reset code. Please try again.')
    }
  }

  return (
    <Card className="p-4 sm:p-8">
      <h1 className="text-xl font-bold tracking-tight text-foreground">Forgot your password?</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Enter your email and we'll send you a 6-digit code to reset it.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
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
