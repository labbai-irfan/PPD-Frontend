import { useEffect, useState } from 'react'
import { Bell, Trash2, Check } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { apiClient } from '@/services/api/client'

interface ApiNotification {
  id: string
  title: string
  message: string
  kind: 'order' | 'promo' | 'system'
  read: boolean
  href?: string
  createdAt: string
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<ApiNotification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    void apiClient
      .get<{ items: ApiNotification[]; unreadCount: number }>('/notifications', { params: { pageSize: 50 } })
      .then((r) => {
        setNotifications(r.data.items)
        setUnreadCount(r.data.unreadCount)
      })
      .catch((e: Error) => toast.error(e.message))
      .finally(() => setLoading(false))
  }, [])

  async function handleMarkAsRead(id: string) {
    await apiClient.post(`/notifications/${id}/read`).catch(() => {})
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
    setUnreadCount((c) => Math.max(0, c - 1))
  }

  async function handleDelete(id: string) {
    await apiClient.delete(`/notifications/${id}`).catch(() => {})
    setNotifications((prev) => {
      const target = prev.find((n) => n.id === id)
      if (target && !target.read) setUnreadCount((c) => Math.max(0, c - 1))
      return prev.filter((n) => n.id !== id)
    })
    toast.success('Notification deleted')
  }

  async function handleMarkAllRead() {
    await apiClient.post('/notifications/read-all').catch(() => {})
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    setUnreadCount(0)
    toast.success('All marked as read')
  }

  const kindStyle: Record<string, string> = {
    order: 'bg-primary/10 text-primary',
    promo: 'bg-warning/10 text-warning',
    system: 'bg-muted text-muted-foreground',
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {loading ? 'Loading…' : `${unreadCount} unread`}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" className="w-full sm:w-auto" onClick={() => void handleMarkAllRead()}>
            Mark all read
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {notifications.map((n) => (
          <Card key={n.id} className={`p-4 ${n.read ? '' : 'border-primary/40 bg-primary/3'}`}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex gap-3 min-w-0 flex-1">
                <div className={`p-2 rounded-lg shrink-0 ${kindStyle[n.kind] ?? kindStyle.system}`}>
                  <Bell className="size-4" />
                </div>
                <div className="min-w-0">
                  <p className={`text-sm break-words ${n.read ? 'font-medium' : 'font-bold'} text-foreground`}>{n.title}</p>
                  <p className="text-sm text-muted-foreground mt-0.5 break-words">{n.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(n.createdAt).toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
              <div className="flex gap-1 shrink-0">
                {!n.read && (
                  <button onClick={() => void handleMarkAsRead(n.id)} className="p-3 hover:bg-success/10 rounded-lg text-success" title="Mark read">
                    <Check className="size-5" />
                  </button>
                )}
                <button onClick={() => void handleDelete(n.id)} className="p-3 hover:bg-destructive/10 rounded-lg text-destructive">
                  <Trash2 className="size-5" />
                </button>
              </div>
            </div>
          </Card>
        ))}
        {!loading && notifications.length === 0 && (
          <Card className="p-8 text-center text-muted-foreground">
            <Bell className="size-10 mx-auto mb-2 opacity-40" />
            No notifications yet
          </Card>
        )}
      </div>
    </div>
  )
}
