import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Star } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { apiClient } from '@/services/api/client'

const schema = z.object({
  rating: z.number().min(1, 'Please select a rating').max(5),
  title: z.string().min(5, 'Title must be at least 5 characters'),
  body: z.string().min(20, 'Review must be at least 20 characters'),
})

type FormValues = z.infer<typeof schema>

export default function ReviewProductPage() {
  const { productId } = useParams()
  const navigate = useNavigate()
  const [rating, setRating] = React.useState(0)

  const { register, handleSubmit, formState: { errors, isSubmitting }, setValue } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  React.useEffect(() => {
    if (rating > 0) setValue('rating', rating)
  }, [rating, setValue])

  async function onSubmit(values: FormValues) {
    try {
      await apiClient.post('/reviews', { productId, ...values })
      toast.success('Review submitted! It will appear after moderation.')
      navigate('/my-reviews')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to submit review')
    }
  }

  return (
    <Card className="max-w-2xl mx-auto p-4 md:p-6">
      <h1 className="text-2xl font-bold text-foreground">Write a Review</h1>
      <p className="mt-2 text-sm text-muted-foreground">Product ID: {productId}</p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-6" noValidate>
        {/* Rating */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">Rating</label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="p-1.5"
              >
                <Star
                  className={`size-8 transition-all ${
                    star <= rating
                      ? 'fill-rating text-rating'
                      : 'text-muted-foreground hover:text-rating'
                  }`}
                />
              </button>
            ))}
          </div>
          {errors.rating && (
            <p className="mt-1 text-sm text-destructive">{errors.rating.message}</p>
          )}
        </div>

        {/* Title */}
        <Input
          label="Review Title"
          placeholder="What's most important to know?"
          error={errors.title?.message}
          {...register('title')}
        />

        {/* Review */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">Your Review</label>
          <textarea
            placeholder="Share your experience with this product..."
            className="w-full min-h-[150px] px-3 py-2 border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            {...register('body')}
          />
          {errors.body && (
            <p className="mt-1 text-sm text-destructive">{errors.body.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button type="submit" size="lg" className="w-full sm:flex-1" loading={isSubmitting}>
            Submit Review
          </Button>
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="w-full sm:flex-1"
            onClick={() => navigate(-1)}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  )
}

import React from 'react'
