import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { ROUTES } from '@/lib/constants'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { PhoneInput } from '@/components/ui/PhoneInput'

const schema = z.object({
  phone: z.string().min(10, 'Phone must be at least 10 digits').regex(/^\d+$/, 'Phone must contain only digits'),
})

type FormValues = z.infer<typeof schema>

export default function PhoneVerificationPage() {
  const navigate = useNavigate()
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(values: FormValues) {
    try {
      toast.success('OTP sent to ' + values.phone)
      navigate(ROUTES.otpVerification, { state: { phone: values.phone }, replace: true })
    } catch (error) {
      toast.error('Failed to send OTP. Please try again.')
    }
  }

  return (
    <Card className="p-4 sm:p-8">
      <h1 className="text-xl font-bold tracking-tight text-foreground">Verify Phone Number</h1>
      <p className="mt-1 text-sm text-muted-foreground">We'll send you an OTP to verify your phone number.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
        <PhoneInput
          label="Phone Number"
          placeholder="10-digit phone number"
          error={errors.phone?.message}
          {...register('phone')}
        />

        <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>
          Send OTP
        </Button>
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
