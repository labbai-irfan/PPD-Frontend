import { Share2, Copy, Gift } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

export default function ReferralPage() {
  const referralCode = 'JOHN123456'
  const referralLink = `https://ppdstore.com?ref=${referralCode}`

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard!')
  }

  const stats = [
    { label: 'Total Referrals', value: '12', color: 'text-blue-600' },
    { label: 'Rewards Earned', value: '₹2,400', color: 'text-green-600' },
    { label: 'Active Referrals', value: '8', color: 'text-purple-600' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Share & Earn</h1>
        <p className="mt-2 text-muted-foreground">Invite friends and earn rewards on every purchase they make</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-4">
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className={`text-2xl font-bold mt-2 ${stat.color}`}>{stat.value}</p>
          </Card>
        ))}
      </div>

      {/* Referral Code + Link */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="p-4 md:p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Your Referral Code</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2 p-4 bg-muted rounded-lg">
              <code className="min-w-0 truncate text-lg font-mono font-semibold">{referralCode}</code>
              <button
                onClick={() => handleCopy(referralCode)}
                className="p-3 hover:bg-background rounded-lg text-muted-foreground hover:text-foreground shrink-0"
              >
                <Copy className="size-5" />
              </button>
            </div>
            <p className="text-sm text-muted-foreground">
              Share this code with friends. They get ₹200 off, and you earn ₹200 when they make their first purchase.
            </p>
          </div>
        </Card>

        <Card className="p-4 md:p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Your Referral Link</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2 p-4 bg-muted rounded-lg">
              <code className="min-w-0 text-sm font-mono truncate">{referralLink}</code>
              <button
                onClick={() => handleCopy(referralLink)}
                className="p-3 hover:bg-background rounded-lg text-muted-foreground hover:text-foreground shrink-0"
              >
                <Copy className="size-5" />
              </button>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button variant="outline" className="w-full sm:flex-1 gap-2">
                <Share2 className="size-4" />
                Share on WhatsApp
              </Button>
              <Button variant="outline" className="w-full sm:flex-1 gap-2">
                <Share2 className="size-4" />
                Share on Email
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* How it Works */}
      <Card className="p-4 md:p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Gift className="size-5 text-primary" />
          How it Works
        </h2>
        <div className="space-y-4">
          {[
            { step: 1, title: 'Share Your Code', desc: 'Share your referral code with friends and family' },
            { step: 2, title: 'They Save', desc: 'Friends get ₹200 discount on their first purchase' },
            { step: 3, title: 'You Earn', desc: 'You earn ₹200 for each successful referral' },
            { step: 4, title: 'Rewards Credited', desc: 'Rewards credited to your account automatically' },
          ].map((item) => (
            <div key={item.step} className="flex gap-4">
              <div className="flex items-center justify-center size-8 rounded-full bg-primary text-primary-foreground font-semibold shrink-0">
                {item.step}
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Rewards History */}
      <Card className="p-4 md:p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Recent Referrals</h2>
        <div className="space-y-3">
          {[
            { name: 'Priya Kumar', date: '2 days ago', amount: 200 },
            { name: 'Raj Singh', date: '1 week ago', amount: 200 },
            { name: 'Sarah Ahmed', date: '2 weeks ago', amount: 200 },
          ].map((ref) => (
            <div key={ref.name} className="flex items-center justify-between gap-3 p-3 border rounded-lg">
              <div className="min-w-0">
                <p className="font-semibold truncate text-foreground">{ref.name}</p>
                <p className="text-sm text-muted-foreground">{ref.date}</p>
              </div>
              <p className="font-semibold shrink-0 text-success">+₹{ref.amount}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
