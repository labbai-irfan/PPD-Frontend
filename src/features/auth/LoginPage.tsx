import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Lock, Mail } from 'lucide-react'
import { toast } from 'sonner'
import { ROUTES } from '@/lib/constants'
import { useAuthStore } from '@/store/auth.store'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'

const schema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type FormValues = z.infer<typeof schema>

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const login = useAuthStore((s) => s.login)
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const from: string = location.state?.from ?? ROUTES.home

  async function onSubmit(values: FormValues) {
    const user = await login(values.email, values.password)
    toast.success(`Welcome back, ${user.name.split(' ')[0]}!`)
    navigate(from, { replace: true })
  }

  return (
    <Card className="p-6 sm:p-8">
      <h1 className="text-xl font-bold tracking-tight text-foreground">Welcome back</h1>
      <p className="mt-1 text-sm text-muted-foreground">Sign in to continue shopping.</p>

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
        <Input
          label="Password"
          type={showPassword ? 'text' : 'password'}
          autoComplete="current-password"
          placeholder="••••••••"
          leftIcon={<Lock className="size-4" />}
          rightSlot={
            <button
              type="button"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              onClick={() => setShowPassword((v) => !v)}
              className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          }
          error={errors.password?.message}
          {...register('password')}
        />

        <div className="flex justify-end">
          <Link to={ROUTES.forgotPassword} className="text-sm font-semibold text-primary hover:underline">
            Forgot password?
          </Link>
        </div>

        <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>
          Sign in
        </Button>

        <Button 
          type="button" 
          variant="outline"
          size="lg" 
          className="w-full" 
          onClick={async () => {
            const user = await login('demo@example.com', 'demo123')
            toast.success(`Welcome back, ${user.name.split(' ')[0]}!`)
            navigate(from, { replace: true })
          }}
        >
          Demo Login
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        New to Shopora?{' '}
        <Link to={ROUTES.register} state={location.state} className="font-semibold text-primary hover:underline">
          Create an account
        </Link>
      </p>
    </Card>
  )
}
