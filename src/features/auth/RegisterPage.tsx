import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AlertCircle, Check, Eye, EyeOff, Lock, Mail, User, X } from 'lucide-react'
import { toast } from 'sonner'
import { APP_NAME, ROUTES } from '@/lib/constants'
import { emailSchema, passwordSchema, PASSWORD_RULES } from '@/lib/validation'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/auth.store'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'

const schema = z
  .object({
    name: z.string().min(2, 'Enter your full name').max(100, 'Name is too long'),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  })

type FormValues = z.infer<typeof schema>

export default function RegisterPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const registerUser = useAuthStore((s) => s.register)
  const [showPassword, setShowPassword] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), mode: 'onTouched' })

  const passwordValue = watch('password') ?? ''
  const from: string = location.state?.from ?? ROUTES.home

  async function onSubmit(values: FormValues) {
    setFormError(null)
    try {
      const user = await registerUser(values.name, values.email, values.password)
      toast.success(`Welcome to ${APP_NAME}, ${user.name.split(' ')[0]}!`)
      navigate(from, { replace: true })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to create your account. Please try again.'
      setFormError(message)
      toast.error(message)
    }
  }

  return (
    <Card className="p-4 sm:p-8">
      <h1 className="text-xl font-bold tracking-tight text-foreground">Create your account</h1>
      <p className="mt-1 text-sm text-muted-foreground">Join {APP_NAME} — it takes less than a minute.</p>

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
          label="Full name"
          autoComplete="name"
          placeholder="Priya Sharma"
          leftIcon={<User className="size-4" />}
          error={errors.name?.message}
          {...register('name')}
        />
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          leftIcon={<Mail className="size-4" />}
          error={errors.email?.message}
          {...register('email')}
        />
        <div>
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder="Create a strong password"
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
            {...register('password')}
          />
          {(passwordValue.length > 0 || errors.password) && (
            <ul className="mt-2 grid grid-cols-1 gap-1 sm:grid-cols-2">
              {PASSWORD_RULES.map((rule) => {
                const ok = rule.test(passwordValue)
                return (
                  <li
                    key={rule.label}
                    className={cn('flex items-center gap-1.5 text-xs', ok ? 'text-success' : 'text-muted-foreground')}
                  >
                    {ok ? <Check className="size-3.5 shrink-0" /> : <X className="size-3.5 shrink-0" />}
                    {rule.label}
                  </li>
                )
              })}
            </ul>
          )}
        </div>
        <Input
          label="Confirm password"
          type={showPassword ? 'text' : 'password'}
          autoComplete="new-password"
          placeholder="Re-enter your password"
          leftIcon={<Lock className="size-4" />}
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>
          Create account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link to={ROUTES.login} state={location.state} className="font-semibold text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </Card>
  )
}
