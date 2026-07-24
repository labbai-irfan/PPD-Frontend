import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { PhoneInput } from '@/components/ui/PhoneInput'
import { LocationPicker } from '@/components/location/LocationPicker'
import { useAddressStore } from '@/store/address.store'

const schema = z.object({
  name: z.string().min(2, 'Address name is required'),
  phone: z.string().regex(/^\d{10}$/, 'Enter a valid 10-digit mobile number'),
  line1: z.string().min(3, 'Street address is required'),
  line2: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  country: z.string().min(2, 'Country is required'),
  pincode: z.string().regex(/^\d{6}$/, 'Enter a valid 6-digit pincode'),
  type: z.enum(['home', 'work', 'other']).optional(),
})

type FormValues = z.infer<typeof schema>

export default function AddAddressPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditing = !!id
  const { addresses, loaded, fetchAddresses, add, update } = useAddressStore()

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { type: 'home', country: 'India' },
  })

  useEffect(() => {
    if (!loaded) void fetchAddresses().catch(() => {})
  }, [loaded, fetchAddresses])

  useEffect(() => {
    if (isEditing && loaded) {
      const existing = addresses.find((a) => a.id === id)
      if (existing) {
        reset({
          name: existing.name,
          phone: existing.phone,
          line1: existing.line1,
          line2: existing.line2 ?? '',
          city: existing.city,
          state: existing.state,
          country: existing.country ?? 'India',
          pincode: existing.pincode,
          type: existing.type ?? 'home',
        })
      }
    }
  }, [isEditing, loaded, id, addresses, reset])

  async function onSubmit(values: FormValues) {
    try {
      if (isEditing && id) {
        await update(id, values)
        toast.success('Address updated')
      } else {
        await add(values)
        toast.success('Address added')
      }
      navigate('/addresses')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save address')
    }
  }

  return (
    <Card className="max-w-2xl mx-auto p-4 md:p-6">
      <h1 className="text-2xl font-bold text-foreground">{isEditing ? 'Edit' : 'Add'} Address</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
        <Input
          label="Address Name (Home, Office, etc.)"
          placeholder="Home"
          error={errors.name?.message}
          {...register('name')}
        />

        <PhoneInput
          label="Phone Number"
          placeholder="10-digit phone"
          error={errors.phone?.message}
          {...register('phone')}
        />

        <Input
          label="Street Address"
          placeholder="123 Main Street"
          error={errors.line1?.message}
          {...register('line1')}
        />

        <Input
          label="Street Address Line 2 (Optional)"
          placeholder="Apartment, suite, etc."
          error={errors.line2?.message}
          {...register('line2')}
        />

        <Controller
          name="country"
          control={control}
          render={() => (
            <LocationPicker
              value={{
                country: watch('country'),
                state: watch('state'),
                city: watch('city'),
                pincode: watch('pincode'),
              }}
              onChange={(location) => {
                setValue('country', location.country, { shouldValidate: true })
                setValue('state', location.state, { shouldValidate: true })
                setValue('city', location.city, { shouldValidate: true })
                setValue('pincode', location.pincode, { shouldValidate: true })
              }}
              errors={{
                country: errors.country?.message,
                state: errors.state?.message,
                city: errors.city?.message,
                pincode: errors.pincode?.message,
              }}
            />
          )}
        />

        <div className="flex flex-col gap-3 pt-4 sm:flex-row">
          <Button type="submit" size="lg" className="flex-1" loading={isSubmitting}>
            {isEditing ? 'Update' : 'Add'} Address
          </Button>
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="flex-1"
            onClick={() => navigate('/addresses')}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  )
}
