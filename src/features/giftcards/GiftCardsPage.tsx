import { useState } from 'react'
import { Gift, Send } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'

const denominations = [250, 500, 1000, 2500, 5000]

interface OwnedCard {
  id: string
  amount: number
  balance: number
  expiryDate: Date
  purchaseDate: Date
}

const mockOwnedCards: OwnedCard[] = [
  {
    id: 'gc1',
    amount: 1000,
    balance: 450,
    purchaseDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
    expiryDate: new Date(Date.now() + 300 * 24 * 60 * 60 * 1000),
  },
]

export default function GiftCardsPage() {
  const [selectedAmount, setSelectedAmount] = useState(1000)
  const [recipientEmail, setRecipientEmail] = useState('')
  const [message, setMessage] = useState('')
  const [ownedCards] = useState<OwnedCard[]>(mockOwnedCards)

  const handlePurchase = async () => {
    if (!recipientEmail) {
      toast.error('Please enter recipient email')
      return
    }
    toast.success(`Gift card of ₹${selectedAmount} sent to ${recipientEmail}!`)
    setRecipientEmail('')
    setMessage('')
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Gift Cards</h1>
        <p className="mt-2 text-muted-foreground">Give the gift of choice with PPD Store gift cards</p>
      </div>

      {/* Featured Benefits */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4">
          <Gift className="size-8 text-primary" />
          <h3 className="mt-3 font-semibold text-foreground">Perfect Gift</h3>
          <p className="mt-1 text-sm text-muted-foreground">No expiry, no hassle</p>
        </Card>
        <Card className="p-4">
          <Send className="size-8 text-primary" />
          <h3 className="mt-3 font-semibold text-foreground">Digital Delivery</h3>
          <p className="mt-1 text-sm text-muted-foreground">Instant email delivery</p>
        </Card>
        <Card className="p-4">
          <div className="text-3xl">🛍️</div>
          <h3 className="mt-3 font-semibold text-foreground">Wide Selection</h3>
          <p className="mt-1 text-sm text-muted-foreground">Use on all products</p>
        </Card>
      </div>

      {/* Purchase Card */}
      <Card className="p-4 md:p-6">
        <h2 className="text-xl font-bold text-foreground mb-4">Send a Gift Card</h2>

        {/* Amount Selection */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-foreground mb-3">Select Amount</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
            {denominations.map((amount) => (
              <button
                key={amount}
                onClick={() => setSelectedAmount(amount)}
                className={`p-3 rounded-lg border-2 transition-all ${
                  selectedAmount === amount
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary'
                }`}
              >
                <p className="font-semibold text-foreground">₹{amount}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Amount */}
        <div className="mb-6">
          <Input
            label="Custom Amount"
            type="number"
            placeholder="Enter custom amount (₹250 - ₹50,000)"
            value={selectedAmount === denominations[0] ? '' : selectedAmount}
            onChange={(e) => {
              const val = parseInt(e.target.value)
              if (val >= 250 && val <= 50000) setSelectedAmount(val)
            }}
          />
        </div>

        {/* Recipient Details */}
        <div className="space-y-4 mb-6">
          <Input
            label="Recipient's Email"
            type="email"
            placeholder="recipient@example.com"
            value={recipientEmail}
            onChange={(e) => setRecipientEmail(e.target.value)}
          />

          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Personal Message (Optional)
            </label>
            <textarea
              placeholder="Add a personal message..."
              className="w-full min-h-[80px] px-3 py-2 border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
        </div>

        {/* Total */}
        <div className="p-4 bg-muted rounded-lg mb-6">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Total</span>
            <p className="text-2xl font-bold text-foreground">₹{selectedAmount}</p>
          </div>
        </div>

        <Button onClick={handlePurchase} size="lg" className="w-full">
          Send Gift Card
        </Button>
      </Card>

      {/* My Gift Cards */}
      {ownedCards.length > 0 && (
        <Card className="p-4 md:p-6">
          <h2 className="text-xl font-bold text-foreground mb-4">My Gift Cards</h2>
          <div className="space-y-3">
            {ownedCards.map((card) => (
              <div key={card.id} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground">
                      Gift Card - ₹{card.amount}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Available Balance: <span className="font-semibold">₹{card.balance}</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Expires: {card.expiryDate.toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="w-16 h-16 shrink-0 bg-gradient-to-br from-primary to-primary/50 rounded-lg flex items-center justify-center text-white text-2xl">
                      🎁
                    </div>
                  </div>
                </div>
                <div className="mt-3 w-full bg-muted rounded-lg overflow-hidden h-2">
                  <div
                    className="bg-primary h-full"
                    style={{ width: `${(card.balance / card.amount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* T&C */}
      <Card className="p-4 md:p-6 bg-muted">
        <h3 className="font-semibold text-foreground">Terms & Conditions</h3>
        <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
          <li>• Gift cards are valid for 1 year from purchase date</li>
          <li>• Cannot be converted to cash or refunded</li>
          <li>• Can be used on all products at PPD Store</li>
          <li>• Balance can be checked anytime</li>
          <li>• Can be transferred to another email if unused</li>
        </ul>
      </Card>
    </div>
  )
}
