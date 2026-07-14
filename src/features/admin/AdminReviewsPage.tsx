import { useCallback, useEffect, useState } from 'react'
import { Search, ThumbsUp, ThumbsDown, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { apiClient } from '@/services/api/client'

interface AdminReview {
  id: string
  productName: string
  author: string
  rating: number
  title: string
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<AdminReview[]>([])
  const [pendingCount, setPendingCount] = useState(0)
  const [search, setSearch] = useState('')

  const load = useCallback(async (q: string) => {
    try {
      const { data } = await apiClient.get<{ items: AdminReview[]; pendingCount: number }>(
        '/admin/reviews',
        { params: { ...(q ? { q } : {}), pageSize: 50 } },
      )
      setReviews(data.items)
      setPendingCount(data.pendingCount)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to load reviews')
    }
  }, [])

  useEffect(() => {
    const t = setTimeout(() => void load(search), search ? 300 : 0)
    return () => clearTimeout(t)
  }, [search, load])

  const moderate = async (id: string, action: 'approve' | 'reject') => {
    try {
      const { data } = await apiClient.post<AdminReview>(`/admin/reviews/${id}/${action}`)
      setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, status: data.status } : r)))
      setPendingCount((n) => Math.max(0, n - 1))
      toast.success(`Review ${data.status} — product rating updated`)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Moderation failed')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await apiClient.delete(`/admin/reviews/${id}`)
      setReviews((prev) => prev.filter((r) => r.id !== id))
      toast.success('Review deleted')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Delete failed')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Reviews</h1>
        <p className="text-sm text-muted-foreground mt-1">{pendingCount} pending approvals</p>
      </div>

      <Card className="p-4">
        <Input
          placeholder="Search by product, author or title..."
          leftIcon={<Search className="size-4" />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </Card>

      <div className="space-y-3">
        {reviews.map((review) => (
          <Card key={review.id} className="p-3 md:p-4">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-foreground text-sm md:text-base">{review.productName}</h3>
                  <span className="text-xs text-muted-foreground">by {review.author}</span>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap ${
                    review.status === 'pending'
                      ? 'bg-warning/10 text-warning'
                      : review.status === 'approved'
                        ? 'bg-success/10 text-success'
                        : 'bg-destructive/10 text-destructive'
                  }`}>
                    {review.status}
                  </span>
                </div>
                <div className="mt-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} className={i < review.rating ? 'text-rating' : 'text-muted-foreground'}>★</span>
                  ))}
                </div>
                <p className="mt-2 text-sm font-medium text-foreground">{review.title}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(review.createdAt).toLocaleDateString('en-IN')}
                </p>
              </div>
              <div className="flex gap-2 shrink-0 sm:flex-col">
                {review.status === 'pending' && (
                  <>
                    <button onClick={() => void moderate(review.id, 'approve')} className="p-2.5 hover:bg-success/10 rounded-lg text-success touch-target" title="Approve">
                      <ThumbsUp className="size-4" />
                    </button>
                    <button onClick={() => void moderate(review.id, 'reject')} className="p-2.5 hover:bg-warning/10 rounded-lg text-warning touch-target" title="Reject">
                      <ThumbsDown className="size-4" />
                    </button>
                  </>
                )}
                <button onClick={() => void handleDelete(review.id)} className="p-2.5 hover:bg-destructive/10 rounded-lg text-destructive touch-target">
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>
          </Card>
        ))}
        {reviews.length === 0 && <p className="text-center text-muted-foreground py-8">No reviews found</p>}
      </div>
    </div>
  )
}
