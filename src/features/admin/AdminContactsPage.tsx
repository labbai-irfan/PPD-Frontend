import { useEffect, useState } from 'react'
import { Search, Mail, Phone, Calendar, User, MessageSquare } from 'lucide-react'
import { toast } from 'sonner'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { apiClient } from '@/services/api/client'

interface ContactInquiry {
  _id: string
  name: string
  email: string
  phone: string
  subject: string
  message: string
  createdAt: string
}

export default function AdminContactsPage() {
  const [inquiries, setInquiries] = useState<ContactInquiry[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadInquiries() {
      try {
        setLoading(true)
        const { data } = await apiClient.get<ContactInquiry[]>('/admin/contacts')
        setInquiries(data)
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Failed to load inquiries')
      } finally {
        setLoading(false)
      }
    }
    void loadInquiries()
  }, [])

  // Client-side search filtering
  const filteredInquiries = inquiries.filter((inquiry) => {
    const term = search.toLowerCase()
    return (
      inquiry.name.toLowerCase().includes(term) ||
      inquiry.email.toLowerCase().includes(term) ||
      inquiry.phone.toLowerCase().includes(term) ||
      inquiry.subject.toLowerCase().includes(term) ||
      inquiry.message.toLowerCase().includes(term)
    )
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Contact Inquiries</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {inquiries.length} total messages received from users
        </p>
      </div>

      <Card className="p-4">
        <Input
          placeholder="Search by name, email, phone, subject, or message..."
          leftIcon={<Search className="size-4" />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </Card>

      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading inquiries...</div>
        ) : filteredInquiries.map((inquiry) => (
          <Card key={inquiry._id} className="p-5 md:p-6 hover:shadow-md transition-shadow">
            <div className="flex flex-col gap-4">
              {/* Header with Name, Subject and Date */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-2 border-b pb-3 border-border/60">
                <div>
                  <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                    <User className="size-4 text-primary" /> {inquiry.name}
                  </h2>
                  <p className="text-sm font-semibold text-primary mt-1">
                    Subject: {inquiry.subject}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground sm:self-center bg-muted px-2.5 py-1 rounded-full">
                  <Calendar className="size-3.5" />
                  {new Date(inquiry.createdAt).toLocaleString('en-IN', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </div>
              </div>

              {/* Contact Information Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="size-4 text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground">Email:</span>
                  <a href={`mailto:${inquiry.email}`} className="text-foreground hover:underline break-all font-medium">
                    {inquiry.email}
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="size-4 text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground">Phone:</span>
                  <a href={`tel:${inquiry.phone}`} className="text-foreground hover:underline font-medium">
                    {inquiry.phone}
                  </a>
                </div>
              </div>

              {/* Message Details */}
              <div className="mt-2 bg-muted/40 p-4 rounded-lg border border-border/40">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground mb-2">
                  <MessageSquare className="size-3.5" /> MESSAGE
                </div>
                <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                  {inquiry.message}
                </p>
              </div>
            </div>
          </Card>
        ))}

        {!loading && filteredInquiries.length === 0 && (
          <div className="text-center text-muted-foreground py-12 bg-card rounded-lg border border-dashed">
            No contact inquiries found.
          </div>
        )}
      </div>
    </div>
  )
}
