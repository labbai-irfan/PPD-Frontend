import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { ROUTES } from '@/lib/constants'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'

const schema = z.object({
  otp: z.string().length(6, 'OTP must be 6 digits').regex(/^\d+$/, 'OTP must contain only digits'),
})

type FormValues = z.infer<typeof schema>

export default function OtpVerificationPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  const [resendTimer, setResendTimer] = useState(0)
  const phone = location.state?.phone as string | undefined

  if (!phone) {
    return (
      <Card className="p-4 text-center sm:p-8">
        <p className="text-destructive break-words">Phone number not provided. Please start over.</p>
        <Button onClick={() => navigate(ROUTES.login)} className="mt-4 w-full sm:w-auto">Back to Login</Button>
      </Card>
    )
  }

  async function onSubmit(values: FormValues) {
    try {
      // Mock OTP verification
      if (values.otp === '123456') {
        toast.success('OTP verified successfully!')
        navigate(ROUTES.home, { replace: true })
      } else {
        toast.error('Invalid OTP. Please try again.')
      }
    } catch (error) {
      toast.error('Verification failed. Please try again.')
    }
  }

  function handleResend() {
    setResendTimer(60)
    const interval = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) clearInterval(interval)
        return prev - 1
      })
    }, 1000)
    toast.success('OTP resent to ' + phone)
  }

  return (
    <Card className="p-4 sm:p-8">
      <h1 className="text-xl font-bold tracking-tight text-foreground">Verify OTP</h1>
      <p className="mt-1 text-sm text-muted-foreground">Enter the 6-digit code sent to +91 {phone}</p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
        <Input
          label="OTP"
          type="text"
          digitsOnly
          maxLength={6}
          placeholder="000000"
          error={errors.otp?.message}
          {...register('otp')}
        />

        <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>
          Verify OTP
        </Button>

        <div className="text-center">
          {resendTimer > 0 ? (
            <p className="text-sm text-muted-foreground">Resend OTP in {resendTimer}s</p>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              className="inline-block p-2.5 -m-2.5 text-sm font-semibold text-primary hover:underline"
            >
              Resend OTP
            </button>
          )}
        </div>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        <button
          type="button"
          onClick={() => navigate(ROUTES.login)}
          className="inline-block p-2.5 -m-2.5 font-semibold text-primary hover:underline"
        >
          Back to login
        </button>
      </p>
    </Card>
  )
}
