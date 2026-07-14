import { useCallback, useEffect, useState } from 'react'
import { Search, Trash2, Ban, Mail } from 'lucide-react'
import { toast } from 'sonner'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Avatar } from '@/components/ui/Avatar'
import { apiClient } from '@/services/api/client'

interface AdminUser {
  id: string
  name: string
  email: string
  phone?: string
  avatar?: string
  createdAt: string
  status: 'active' | 'banned'
  orders: number
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')

  const load = useCallback(async (q: string) => {
    try {
      const { data } = await apiClient.get<{ items: AdminUser[]; total: number }>('/admin/users', {
        params: { ...(q ? { q } : {}), pageSize: 50 },
      })
      setUsers(data.items)
      setTotal(data.total)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to load users')
    }
  }, [])

  useEffect(() => {
    const t = setTimeout(() => void load(search), search ? 300 : 0)
    return () => clearTimeout(t)
  }, [search, load])

  const handleBan = async (user: AdminUser) => {
    try {
      const action = user.status === 'active' ? 'ban' : 'unban'
      const { data } = await apiClient.post<AdminUser>(`/admin/users/${user.id}/${action}`)
      setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, status: data.status } : u)))
      toast.success(`User ${data.status === 'banned' ? 'banned' : 'unbanned'}`)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Action failed')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await apiClient.delete(`/admin/users/${id}`)
      setUsers((prev) => prev.filter((u) => u.id !== id))
      toast.success('User deleted (orders kept, account anonymized)')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Delete failed')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Users</h1>
        <p className="text-sm text-muted-foreground mt-1">{total} customers</p>
      </div>

      <Card className="p-3 md:p-4">
        <Input
          placeholder="Search by name or email..."
          leftIcon={<Search className="size-4" />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </Card>

      {/* Desktop Table */}
      <Card className="hidden md:block p-4 md:p-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b">
            <tr>
              <th className="text-left py-3 font-semibold text-muted-foreground">Name</th>
              <th className="text-left py-3 font-semibold text-muted-foreground">Email</th>
              <th className="text-left py-3 font-semibold text-muted-foreground">Phone</th>
              <th className="text-left py-3 font-semibold text-muted-foreground">Orders</th>
              <th className="text-left py-3 font-semibold text-muted-foreground">Joined</th>
              <th className="text-left py-3 font-semibold text-muted-foreground">Status</th>
              <th className="text-left py-3 font-semibold text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b hover:bg-muted/50 transition-colors">
                <td className="py-3">
                  <div className="flex items-center gap-3">
                    <Avatar 
                      name={user.name} 
                      src={user.avatar ? `${import.meta.env.VITE_API_BASE_URL?.replace(/\/api(\/v\d+)?$/, '') || ''}${user.avatar}` : undefined} 
                      size={32} 
                    />
                    <span className="font-medium text-foreground">{user.name}</span>
                  </div>
                </td>
                <td className="py-3 text-muted-foreground flex items-center gap-2">
                  <Mail className="size-4 shrink-0" />{user.email}
                </td>
                <td className="py-3 text-muted-foreground">{user.phone ?? '—'}</td>
                <td className="py-3 font-semibold">{user.orders}</td>
                <td className="py-3 text-muted-foreground">{new Date(user.createdAt).toLocaleDateString('en-IN')}</td>
                <td className="py-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    user.status === 'active' ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
                  }`}>
                    {user.status}
                  </span>
                </td>
                <td className="py-3 flex gap-1.5">
                  <button
                    onClick={() => handleBan(user)}
                    className="p-2 hover:bg-warning/10 rounded-lg text-warning transition-colors"
                    title={user.status === 'active' ? 'Ban' : 'Unban'}
                  >
                    <Ban className="size-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(user.id)}
                    className="p-2 hover:bg-destructive/10 rounded-lg text-destructive transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {users.map((user) => (
          <Card key={user.id} className="p-4">
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Avatar 
                      name={user.name} 
                      src={user.avatar ? `${import.meta.env.VITE_API_BASE_URL?.replace(/\/api(\/v\d+)?$/, '') || ''}${user.avatar}` : undefined} 
                      size={28} 
                    />
                    <h3 className="font-semibold text-foreground truncate">{user.name}</h3>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1 truncate">
                    <Mail className="size-3 shrink-0" />
                    <span className="truncate">{user.email}</span>
                  </p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                  user.status === 'active' ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
                }`}>
                  {user.status}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <p className="text-muted-foreground">Phone</p>
                  <p className="font-semibold text-foreground mt-0.5 truncate">{user.phone ?? '—'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Orders</p>
                  <p className="font-semibold text-foreground mt-0.5">{user.orders}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Joined</p>
                  <p className="font-semibold text-foreground mt-0.5 text-[10px]">
                    {new Date(user.createdAt).toLocaleDateString('en-IN')}
                  </p>
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t">
                <button
                  onClick={() => handleBan(user)}
                  className="flex-1 p-2 text-xs font-medium text-warning hover:bg-warning/10 rounded-lg transition-colors"
                >
                  {user.status === 'active' ? 'Ban' : 'Unban'}
                </button>
                <button
                  onClick={() => handleDelete(user.id)}
                  className="flex-1 p-2 text-xs font-medium text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
