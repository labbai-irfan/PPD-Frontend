import { useEffect, useState } from 'react'
import { Star, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Card } from '@/components/ui/Card'
import { apiClient } from '@/services/api/client'

interface UserReview {
  id: string
  productId: string
  productName: string
  title: string
  body: string
  rating: number
  status: 'pending' | 'approved' | 'rejected'
  helpfulCount: number
  createdAt: string
}

export default function MyReviewsPage() {
  const [reviews, setReviews] = useState<UserReview[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    void apiClient
      .get<UserReview[]>('/reviews/mine')
      .then((r) => setReviews(r.data))
      .catch((e: Error) => toast.error(e.message))
      .finally(() => setLoading(false))
  }, [])

  const handleDelete = async (id: string) => {
    try {
      await apiClient.delete(`/reviews/${id}`)
      setReviews((prev) => prev.filter((r) => r.id !== id))
      toast.success('Review deleted')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Delete failed')
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Reviews</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {loading ? 'Loading…' : `Manage your product reviews (${reviews.length})`}
        </p>
      </div>

      <div className="space-y-3">
        {reviews.map((review) => (
          <Card key={review.id} className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold break-words text-foreground">{review.productName}</h3>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    review.status === 'approved'
                      ? 'bg-success/10 text-success'
                      : review.status === 'pending'
                        ? 'bg-warning/10 text-warning'
                        : 'bg-destructive/10 text-destructive'
                  }`}>
                    {review.status === 'pending' ? 'awaiting approval' : review.status}
                  </span>
                </div>
                <div className="flex items-center gap-0.5 mt-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`size-4 ${i < review.rating ? 'fill-rating text-rating' : 'text-muted-foreground'}`} />
                  ))}
                </div>
                <p className="mt-2 text-sm font-medium break-words text-foreground">{review.title}</p>
                <p className="mt-1 text-sm break-words text-muted-foreground">{review.body}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {new Date(review.createdAt).toLocaleDateString('en-IN')} · {review.helpfulCount} found helpful
                </p>
              </div>
              <button
                onClick={() => void handleDelete(review.id)}
                className="p-3 hover:bg-destructive/10 rounded-lg text-destructive shrink-0"
              >
                <Trash2 className="size-5" />
              </button>
            </div>
          </Card>
        ))}
        {!loading && reviews.length === 0 && (
          <Card className="p-8 text-center text-muted-foreground">
            You haven't written any reviews yet.
          </Card>
        )}
      </div>
    </div>
  )
}
