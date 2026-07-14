import { Gift, Zap, Star, Award } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

interface Reward {
  id: string
  title: string
  description: string
  pointsRequired: number
  image: string
  discount?: number
}

const rewards: Reward[] = [
  {
    id: 'r1',
    title: '₹100 Voucher',
    description: 'Redeem for ₹100 discount on any purchase',
    pointsRequired: 500,
    image: '🎟️',
    discount: 100,
  },
  {
    id: 'r2',
    title: '₹500 Voucher',
    description: 'Redeem for ₹500 discount on any purchase',
    pointsRequired: 2000,
    image: '🎟️',
    discount: 500,
  },
  {
    id: 'r3',
    title: 'Free Shipping',
    description: 'Free shipping on your next 5 orders',
    pointsRequired: 1000,
    image: '🚚',
  },
  {
    id: 'r4',
    title: 'Exclusive Access',
    description: 'Early access to flash sales and new launches',
    pointsRequired: 3000,
    image: '⭐',
  },
]

export default function RewardsPage() {
  const currentPoints = 1250

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Rewards & Loyalty</h1>
        <p className="mt-2 text-muted-foreground">Earn points on every purchase and redeem amazing rewards</p>
      </div>

      {/* Points Card */}
      <Card className="p-4 md:p-6 bg-gradient-to-r from-primary to-primary/80 text-white">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-primary-foreground/80">Your Loyalty Points</p>
            <p className="text-4xl font-bold mt-2">{currentPoints}</p>
            <p className="text-sm mt-2 text-primary-foreground/80">
              Earn 1 point per rupee spent
            </p>
          </div>
          <Award className="size-12 shrink-0 opacity-50 sm:size-20" />
        </div>
      </Card>

      {/* Points Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Zap className="size-5 text-warning" />
            <div>
              <p className="text-sm text-muted-foreground">Points Earned</p>
              <p className="font-semibold text-foreground">+2,500</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Gift className="size-5 text-success" />
            <div>
              <p className="text-sm text-muted-foreground">Redeemed</p>
              <p className="font-semibold text-foreground">-1,250</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Star className="size-5 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Tier Level</p>
              <p className="font-semibold text-foreground">Gold</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Membership Tiers */}
      <Card className="p-4 md:p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Membership Tiers</h2>
        <div className="space-y-2">
          {[
            { tier: 'Bronze', min: 0, max: 1000, benefits: 'Base rewards' },
            { tier: 'Silver', min: 1001, max: 5000, benefits: '5% bonus points' },
            { tier: 'Gold', min: 5001, max: 10000, benefits: '10% bonus points + exclusive deals', current: true },
            { tier: 'Platinum', min: 10001, max: Infinity, benefits: '15% bonus + VIP support' },
          ].map((t) => (
            <div
              key={t.tier}
              className={`p-3 rounded-lg border transition-all ${
                t.current
                  ? 'border-primary bg-primary/5'
                  : 'border-border'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-foreground flex items-center gap-2">
                    {t.tier}
                    {t.current && <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">CURRENT</span>}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t.min.toLocaleString()} - {t.max === Infinity ? '∞' : t.max.toLocaleString()} points
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{t.benefits}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Available Rewards */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">Available Rewards</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {rewards.map((reward) => (
            <Card key={reward.id} className="p-4 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div className="text-3xl">{reward.image}</div>
                <Button
                  size="sm"
                  disabled={currentPoints < reward.pointsRequired}
                  variant={currentPoints < reward.pointsRequired ? 'outline' : undefined}
                >
                  Redeem
                </Button>
              </div>
              <h3 className="font-semibold text-foreground mt-3">{reward.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{reward.description}</p>
              <div className="mt-3 flex items-center justify-between">
                <span className={`text-sm font-semibold ${
                  currentPoints >= reward.pointsRequired
                    ? 'text-success'
                    : 'text-destructive'
                }`}>
                  {reward.pointsRequired} points
                </span>
                {currentPoints < reward.pointsRequired && (
                  <span className="text-xs text-muted-foreground">
                    {reward.pointsRequired - currentPoints} more needed
                  </span>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Transaction History */}
      <Card className="p-4 md:p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Points History</h2>
        <div className="space-y-3">
          {[
            { date: 'Today', description: 'Purchase: Product XYZ', points: '+150', type: 'earn' },
            { date: 'Yesterday', description: 'Redeemed ₹100 voucher', points: '-500', type: 'redeem' },
            { date: '2 days ago', description: 'Purchase: Bulk Order', points: '+800', type: 'earn' },
          ].map((trans, i) => (
            <div key={i} className="flex items-center justify-between gap-3 p-3 border rounded-lg">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">{trans.date}</p>
                <p className="text-sm truncate text-muted-foreground">{trans.description}</p>
              </div>
              <p className={`font-semibold shrink-0 ${trans.type === 'earn' ? 'text-success' : 'text-destructive'}`}>
                {trans.points}
              </p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
