import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { cn } from '@/lib/utils'
import type { Address } from '@/types'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { PhoneInput } from '@/components/ui/PhoneInput'

const schema = z.object({
  name: z.string().min(2, 'Enter the recipient name'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number'),
  pincode: z.string().regex(/^\d{6}$/, 'Enter a valid 6-digit pincode'),
  line1: z.string().min(3, 'Enter house / flat / street'),
  line2: z.string().optional(),
  city: z.string().min(2, 'Enter city'),
  state: z.string().min(2, 'Enter state'),
  type: z.enum(['home', 'work', 'other']),
  isDefault: z.boolean(),
})

export type AddressFormValues = z.infer<typeof schema>

interface AddressFormProps {
  initial?: Partial<Address>
  onSave: (values: AddressFormValues) => void
  onCancel?: () => void
  submitLabel?: string
}

export function AddressForm({ initial, onSave, onCancel, submitLabel = 'Save address' }: AddressFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<AddressFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: initial?.name ?? '',
      phone: initial?.phone ?? '',
      pincode: initial?.pincode ?? '',
      line1: initial?.line1 ?? '',
      line2: initial?.line2 ?? '',
      city: initial?.city ?? '',
      state: initial?.state ?? '',
      type: initial?.type ?? 'home',
      isDefault: initial?.isDefault ?? false,
    },
  })

  const selectedType = watch('type')

  return (
    <form onSubmit={handleSubmit(onSave)} className="space-y-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Full name" placeholder="Recipient name" error={errors.name?.message} {...register('name')} />
        <PhoneInput label="Mobile number" placeholder="10-digit number" error={errors.phone?.message} {...register('phone')} />
      </div>
      <Input label="Address (house no, building, street)" placeholder="Flat 4B, Sunrise Apartments" error={errors.line1?.message} {...register('line1')} />
      <Input label="Locality / area (optional)" placeholder="Near City Mall" error={errors.line2?.message} {...register('line2')} />
      <div className="grid gap-4 sm:grid-cols-3">
        <Input label="Pincode" digitsOnly placeholder="560001" maxLength={6} error={errors.pincode?.message} {...register('pincode')} />
        <Input label="City" placeholder="Bengaluru" error={errors.city?.message} {...register('city')} />
        <Input label="State" placeholder="Karnataka" error={errors.state?.message} {...register('state')} />
      </div>

      <div>
        <p className="mb-1.5 text-sm font-medium text-foreground">Address type</p>
        <div className="flex gap-2">
          {(['home', 'work', 'other'] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setValue('type', type)}
              className={cn(
                'h-11 rounded-lg border px-4 text-sm font-medium capitalize transition-colors cursor-pointer',
                selectedType === type
                  ? 'border-primary bg-primary-soft font-semibold text-primary-soft-foreground'
                  : 'border-border text-foreground hover:border-muted-foreground/50',
              )}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <label className="flex min-h-11 cursor-pointer items-center gap-2.5 text-sm text-foreground">
        <input type="checkbox" className="size-4 accent-(--primary)" {...register('isDefault')} />
        Make this my default address
      </label>

      <div className="flex flex-col gap-3 pt-1 sm:flex-row">
        <Button type="submit" className="w-full sm:w-auto" loading={isSubmitting}>
          {submitLabel}
        </Button>
        {onCancel && (
          <Button type="button" variant="ghost" className="w-full sm:w-auto" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  )
}
