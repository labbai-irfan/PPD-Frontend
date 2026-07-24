import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, MapPin, Trash2, Edit2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { useAddressStore } from '@/store/address.store'

export default function AddressesPage() {
  const navigate = useNavigate()
  const { addresses, loaded, fetchAddresses, remove, setDefault } = useAddressStore()

  useEffect(() => {
    void fetchAddresses().catch((e: Error) => toast.error(e.message))
  }, [fetchAddresses])

  function handleDelete(id: string) {
    void remove(id)
      .then(() => toast.success('Address deleted'))
      .catch((e: Error) => toast.error(e.message))
  }

  function handleSetDefault(id: string) {
    void setDefault(id)
      .then(() => toast.success('Default address updated'))
      .catch((e: Error) => toast.error(e.message))
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-foreground">My Addresses</h1>
        <Button onClick={() => navigate('/address/add')} className="gap-2 w-full sm:w-auto">
          <Plus className="size-4" />
          Add Address
        </Button>
      </div>

      {loaded && addresses.length === 0 && (
        <Card className="p-8 text-center">
          <MapPin className="size-10 mx-auto text-muted-foreground" />
          <p className="mt-3 text-foreground font-semibold">No addresses saved yet</p>
          <p className="text-sm text-muted-foreground mt-1">Add one to speed up checkout</p>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 items-start">
        {addresses.map((address) => (
          <Card key={address.id} className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex gap-3 min-w-0 flex-1">
                <MapPin className="size-5 text-primary shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-foreground truncate">{address.name}</p>
                    <span className="text-xs bg-muted px-2 py-0.5 rounded capitalize">{address.type}</span>
                    {address.isDefault && (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded font-semibold">Default</span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 break-words">
                    {address.line1}
                    {address.line2 ? `, ${address.line2}` : ''}, {address.city}, {address.state}, {address.country} — {address.pincode}
                  </p>
                  <p className="text-sm text-muted-foreground">Phone: +91 {address.phone}</p>
                  {!address.isDefault && (
                    <button
                      onClick={() => handleSetDefault(address.id)}
                      className="mt-2 inline-flex min-h-11 items-center py-2 -my-2 text-xs font-semibold text-primary hover:text-primary/80"
                    >
                      Set as default
                    </button>
                  )}
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => navigate(`/address/${address.id}/edit`)}
                  className="p-3 hover:bg-primary/10 rounded-lg text-primary"
                >
                  <Edit2 className="size-5" />
                </button>
                <button
                  onClick={() => handleDelete(address.id)}
                  className="p-3 hover:bg-destructive/10 rounded-lg text-destructive"
                >
                  <Trash2 className="size-5" />
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
