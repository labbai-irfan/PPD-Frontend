import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
})

type FormValues = z.infer<typeof schema>

export default function AdminForgotPasswordPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState<'email' | 'verification'>('email')
  const [resetEmail, setResetEmail] = useState('')
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(values: FormValues) {
    try {
      setResetEmail(values.email)
      setStep('verification')
      toast.success('Recovery link sent to your email!')
    } catch (error) {
      toast.error('Failed to send recovery link')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-6 sm:p-8">
        {step === 'email' ? (
          <>
            <button
              onClick={() => navigate('/admin')}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
            >
              <ArrowLeft className="size-4" />
              Back to Login
            </button>

            <h1 className="text-2xl font-bold text-foreground">Reset Password</h1>
            <p className="text-sm text-muted-foreground mt-2">
              Enter your admin email to receive password reset instructions
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
              <Input
                label="Admin Email"
                type="email"
                placeholder="admin@ppdstore.com"
                leftIcon={<Mail className="size-4" />}
                error={errors.email?.message}
                {...register('email')}
              />

              <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>
                Send Reset Link
              </Button>
            </form>

            <p className="text-xs text-muted-foreground text-center mt-4">
              Check your email for instructions to reset your password
            </p>
          </>
        ) : (
          <>
            <div className="flex justify-center mb-6">
              <div className="bg-success/10 p-3 rounded-full">
                <CheckCircle className="size-8 text-success" />
              </div>
            </div>

            <h1 className="text-2xl font-bold text-center text-foreground">Check Your Email</h1>
            <p className="text-center text-sm text-muted-foreground mt-2">
              Recovery instructions have been sent to {resetEmail}
            </p>

            <div className="mt-6 p-4 bg-muted rounded-lg space-y-2 text-sm">
              <p className="font-semibold text-foreground">Next steps:</p>
              <ol className="list-decimal list-inside text-muted-foreground space-y-1">
                <li>Check your email (including spam folder)</li>
                <li>Click the reset link in the email</li>
                <li>Create a new secure password</li>
                <li>Log in with your new password</li>
              </ol>
            </div>

            <Button
              variant="outline"
              size="lg"
              className="w-full mt-6"
              onClick={() => navigate('/admin')}
            >
              Return to Login
            </Button>
          </>
        )}
      </Card>
    </div>
  )
}
