import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, MailCheck } from 'lucide-react'
import { sleep } from '@/lib/utils'
import { ROUTES } from '@/lib/constants'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'

const schema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
})

type FormValues = z.infer<typeof schema>

export default function ForgotPasswordPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isSubmitSuccessful },
    getValues,
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  async function onSubmit(_values: FormValues) {
    await sleep(800) // mock reset email
  }

  if (isSubmitSuccessful) {
    return (
      <Card className="p-6 text-center sm:p-8">
        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-success/12 text-success">
          <MailCheck className="size-7" />
        </div>
        <h1 className="text-xl font-bold tracking-tight text-foreground">Check your inbox</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          If an account exists for <span className="font-semibold text-foreground">{getValues('email')}</span>, we've
          sent a password reset link.
        </p>
        <Link to={ROUTES.login} className="mt-6 inline-block">
          <Button variant="outline">Back to sign in</Button>
        </Link>
      </Card>
    )
  }

  return (
    <Card className="p-6 sm:p-8">
      <h1 className="text-xl font-bold tracking-tight text-foreground">Forgot your password?</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Enter your email and we'll send you a link to reset it.
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
          Send reset link
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
