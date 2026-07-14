import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Lock, Mail, User } from 'lucide-react'
import { toast } from 'sonner'
import { ROUTES } from '@/lib/constants'
import { useAuthStore } from '@/store/auth.store'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'

const schema = z
  .object({
    name: z.string().min(2, 'Enter your full name'),
    email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
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

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const from: string = location.state?.from ?? ROUTES.home

  async function onSubmit(values: FormValues) {
    const user = await registerUser(values.name, values.email, values.password)
    toast.success(`Welcome to Shopora, ${user.name.split(' ')[0]}!`)
    navigate(from, { replace: true })
  }

  return (
    <Card className="p-4 sm:p-8">
      <h1 className="text-xl font-bold tracking-tight text-foreground">Create your account</h1>
      <p className="mt-1 text-sm text-muted-foreground">Join Shopora — it takes less than a minute.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
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
        <Input
          label="Password"
          type={showPassword ? 'text' : 'password'}
          autoComplete="new-password"
          placeholder="At least 6 characters"
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
          label="Confirm password"
          type="password"
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
