import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Truck, FileText } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { PhoneInput } from '@/components/ui/PhoneInput'

const schema = z.object({
  organizationName: z.string().min(3, 'Organization name is required'),
  contactPerson: z.string().min(2, 'Contact person name is required'),
  email: z.string().email('Invalid email'),
  phone: z.string().min(10, 'Phone is required'),
  quantity: z.string().min(1, 'Quantity is required').refine(
    (val) => parseInt(val) >= 100,
    'Minimum order quantity is 100 units'
  ),
  requirements: z.string().min(20, 'Please describe your requirements'),
})

type FormValues = z.infer<typeof schema>

export default function BulkOrderPage() {
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(_values: FormValues) {
    try {
      toast.success('Bulk order inquiry submitted! Our team will contact you soon.')
      reset()
    } catch (error) {
      toast.error('Failed to submit inquiry')
    }
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Bulk Orders</h1>
        <p className="mt-2 text-muted-foreground">Special pricing for schools, institutions, and businesses</p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card className="p-4">
          <Truck className="size-8 text-primary" />
          <h3 className="mt-3 font-semibold text-foreground">Fast Delivery</h3>
          <p className="mt-1 text-sm text-muted-foreground">Quick turnaround on bulk orders</p>
        </Card>
        <Card className="p-4">
          <FileText className="size-8 text-primary" />
          <h3 className="mt-3 font-semibold text-foreground">Custom Orders</h3>
          <p className="mt-1 text-sm text-muted-foreground">Customization options available</p>
        </Card>
        <Card className="p-4">
          <div className="text-3xl">💰</div>
          <h3 className="mt-3 font-semibold text-foreground">Best Prices</h3>
          <p className="mt-1 text-sm text-muted-foreground">Volume discounts up to 30%</p>
        </Card>
      </div>

      <Card className="p-4 md:p-6">
        <h2 className="text-2xl font-bold text-foreground mb-6">Bulk Order Inquiry</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Organization Name"
              placeholder="School / Business name"
              error={errors.organizationName?.message}
              {...register('organizationName')}
            />
            <Input
              label="Contact Person"
              placeholder="Your full name"
              error={errors.contactPerson?.message}
              {...register('contactPerson')}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Email"
              type="email"
              placeholder="your@email.com"
              error={errors.email?.message}
              {...register('email')}
            />
            <PhoneInput
              label="Phone"
              placeholder="10-digit phone"
              error={errors.phone?.message}
              {...register('phone')}
            />
          </div>

          <Input
            label="Quantity Needed (Minimum 100 units)"
            digitsOnly
            placeholder="1000"
            error={errors.quantity?.message}
            {...register('quantity')}
          />

          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Your Requirements
            </label>
            <textarea
              placeholder="What specific products are you looking for? Any customization needs?"
              className="w-full min-h-[120px] resize-y px-3 py-2 border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              {...register('requirements')}
            />
            {errors.requirements && (
              <p className="mt-1 text-sm text-destructive">{errors.requirements.message}</p>
            )}
          </div>

          <Button type="submit" size="lg" className="w-full sm:w-auto" loading={isSubmitting}>
            Submit Inquiry
          </Button>
        </form>
      </Card>

      <Card className="p-4 md:p-6 bg-primary/5">
        <h3 className="font-semibold text-foreground">Why Choose PPD for Bulk Orders?</h3>
        <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
          <li>✓ 95+ years of educational expertise</li>
          <li>✓ Reliable quality and timely delivery</li>
          <li>✓ Flexible payment terms for institutions</li>
          <li>✓ Dedicated account manager</li>
          <li>✓ Bulk customization options</li>
          <li>✓ Competitive pricing and volume discounts</li>
        </ul>
      </Card>

      <Card className="p-4 md:p-6">
        <h3 className="font-semibold text-foreground">Contact Our Bulk Sales Team</h3>
        <div className="mt-4 space-y-2 text-sm break-words">
          <p><span className="text-muted-foreground">Email:</span> <a href="mailto:bulk@ppdstore.com" className="text-primary hover:underline">bulk@ppdstore.com</a></p>
          <p><span className="text-muted-foreground">Phone:</span> <a href="tel:1800555000" className="text-primary hover:underline">1800-555-000</a></p>
          <p><span className="text-muted-foreground">Hours:</span> Mon-Fri, 9 AM - 6 PM IST</p>
        </div>
      </Card>
    </div>
  )
}
