import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, Phone, MapPin } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { PhoneInput } from '@/components/ui/PhoneInput'
import { CONTACT_INFO } from '@/lib/constants'

const schema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number is required'),
  subject: z.string().min(5, 'Subject is required'),
  message: z.string().min(20, 'Message must be at least 20 characters'),
})

type FormValues = z.infer<typeof schema>

export default function ContactUsPage() {
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(_values: FormValues) {
    try {
      toast.success('Message sent successfully! We\'ll get back to you soon.')
      reset()
    } catch (error) {
      toast.error('Failed to send message')
    }
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Contact Us</h1>
        <p className="mt-2 text-muted-foreground">We'd love to hear from you. Send us a message!</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-6">
        <div>
          <h3 className="font-semibold text-foreground mb-3 text-sm">{CONTACT_INFO.orders.title}</h3>
          <Card className="p-4 space-y-2">
            <div className="flex items-start gap-2">
              <Mail className="size-4 text-primary flex-shrink-0 mt-0.5" />
              <a href={`mailto:${CONTACT_INFO.orders.email}`} className="text-sm text-muted-foreground hover:text-foreground hover:underline break-all">
                {CONTACT_INFO.orders.email}
              </a>
            </div>
            <div className="flex items-start gap-2">
              <Phone className="size-4 text-primary flex-shrink-0 mt-0.5" />
              <a href={`tel:${CONTACT_INFO.orders.phone.replace(/\s/g, '')}`} className="text-sm text-muted-foreground hover:text-foreground hover:underline">
                {CONTACT_INFO.orders.phone}
              </a>
            </div>
          </Card>
        </div>

        <div>
          <h3 className="font-semibold text-foreground mb-3 text-sm">{CONTACT_INFO.corporate.title}</h3>
          <Card className="p-4 space-y-2">
            <div className="flex items-start gap-2">
              <Mail className="size-4 text-primary flex-shrink-0 mt-0.5" />
              <a href={`mailto:${CONTACT_INFO.corporate.email}`} className="text-sm text-muted-foreground hover:text-foreground hover:underline break-all">
                {CONTACT_INFO.corporate.email}
              </a>
            </div>
            <div className="flex items-start gap-2">
              <Phone className="size-4 text-primary flex-shrink-0 mt-0.5" />
              <a href={`tel:${CONTACT_INFO.corporate.phone.replace(/\s/g, '')}`} className="text-sm text-muted-foreground hover:text-foreground hover:underline">
                {CONTACT_INFO.corporate.phone}
              </a>
            </div>
          </Card>
        </div>

        <div>
          <h3 className="font-semibold text-foreground mb-3 text-sm">{CONTACT_INFO.general.title}</h3>
          <Card className="p-4 space-y-2">
            <div className="flex items-start gap-2">
              <Mail className="size-4 text-primary flex-shrink-0 mt-0.5" />
              <a href={`mailto:${CONTACT_INFO.general.email}`} className="text-sm text-muted-foreground hover:text-foreground hover:underline break-all">
                {CONTACT_INFO.general.email}
              </a>
            </div>
            <div className="flex items-start gap-2">
              <Phone className="size-4 text-primary flex-shrink-0 mt-0.5" />
              <a href={`tel:${CONTACT_INFO.general.phone.replace(/\s/g, '')}`} className="text-sm text-muted-foreground hover:text-foreground hover:underline">
                {CONTACT_INFO.general.phone}
              </a>
            </div>
          </Card>
        </div>
      </div>

      <Card className="p-4 md:p-8">
        <h2 className="text-2xl font-bold text-foreground mb-6">Send us a Message</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              placeholder="Your name"
              error={errors.name?.message}
              {...register('name')}
            />
            <Input
              label="Email"
              type="email"
              placeholder="your@email.com"
              error={errors.email?.message}
              {...register('email')}
            />
          </div>

          <PhoneInput
            label="Phone Number"
            placeholder="10-digit phone number"
            error={errors.phone?.message}
            {...register('phone')}
          />

          <Input
            label="Subject"
            placeholder="What is this about?"
            error={errors.subject?.message}
            {...register('subject')}
          />

          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">Message</label>
            <textarea
              placeholder="Tell us more about your concern..."
              className="w-full min-h-[150px] resize-y px-3 py-2 border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              {...register('message')}
            />
            {errors.message && (
              <p className="mt-1 text-sm text-destructive">{errors.message.message}</p>
            )}
          </div>

          <Button type="submit" size="lg" className="w-full sm:w-auto" loading={isSubmitting}>
            Send Message
          </Button>
        </form>
      </Card>

      <Card className="p-4 md:p-6 bg-primary/5">
        <h3 className="font-semibold text-foreground">Frequently Asked Questions</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Most questions can be answered quickly by visiting our <a href="/help" className="text-primary hover:underline">Help & FAQ page</a>
        </p>
      </Card>
    </div>
  )
}
