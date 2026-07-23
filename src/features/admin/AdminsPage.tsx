import { useEffect, useState } from 'react'
import { Plus, Trash2, Shield, User } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { apiClient } from '@/services/api/client'

interface Admin {
  id: string
  name: string
  email: string
  role: 'super_admin' | 'admin' | 'moderator'
  isProtected: boolean
  createdAt: string
}

const emptyForm = { name: '', email: '', role: 'moderator', password: '' }

export default function AdminsPage() {
  const [admins, setAdmins] = useState<Admin[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)

  const load = () =>
    apiClient
      .get<Admin[]>('/admin/admins')
      .then((r) => setAdmins(r.data))
      .catch((e: Error) => toast.error(e.message))

  useEffect(() => {
    void load()
  }, [])

  const handleAdd = async () => {
    if (!form.name || !form.email || !form.password) {
      toast.error('Name, email and a temporary password are required')
      return
    }
    try {
      await apiClient.post('/admin/admins', form)
      toast.success('Admin added — invite email sent')
      setForm(emptyForm)
      setShowForm(false)
      void load()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Create failed')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await apiClient.delete(`/admin/admins/${id}`)
      setAdmins((prev) => prev.filter((a) => a.id !== id))
      toast.success('Admin removed (account demoted to customer)')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Remove failed')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Admin Management</h1>
          <p className="text-sm text-muted-foreground mt-1">{admins.length} administrators</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2 w-full sm:w-auto">
          <Plus className="size-4" />
          Add Admin
        </Button>
      </div>

      {showForm && (
        <Card className="p-3 md:p-4">
          <div className="space-y-3">
            <Input label="Name" placeholder="Admin name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Input label="Email" type="email" placeholder="admin@ppdstore.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <Input
              label="Temporary Password"
              type="text"
              placeholder="min 8 characters — share securely"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Role</label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              >
                <option value="moderator">Moderator (read + review moderation)</option>
                <option value="admin">Admin (full management)</option>
                <option value="super_admin">Super Admin (everything)</option>
              </select>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button onClick={() => void handleAdd()} className="flex-1">Add Admin</Button>
              <Button variant="outline" className="flex-1" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </div>
        </Card>
      )}

      <div className="space-y-3">
        {admins.map((admin) => (
          <Card key={admin.id} className="p-3 md:p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <User className="size-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-foreground">{admin.name}</p>
                <p className="text-sm text-muted-foreground">{admin.email}</p>
                <div className="flex gap-2 mt-1">
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                    {admin.role.replace('_', ' ')}
                  </span>
                  {admin.isProtected && (
                    <span className="text-xs bg-warning/10 text-warning px-2 py-1 rounded">protected</span>
                  )}
                  <span className="text-xs text-muted-foreground">
                    since {new Date(admin.createdAt).toLocaleDateString('en-IN')}
                  </span>
                </div>
              </div>
            </div>
            {!admin.isProtected && (
              <button
                onClick={() => void handleDelete(admin.id)}
                className="p-2.5 hover:bg-destructive/10 rounded-lg text-destructive touch-target shrink-0"
              >
                <Trash2 className="size-4" />
              </button>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}
