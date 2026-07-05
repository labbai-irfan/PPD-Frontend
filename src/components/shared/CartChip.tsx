import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { ROUTES } from '@/lib/constants'
import { useCartCount } from '@/store/cart.store'
import { Icon } from '@/components/ui/Icon'

interface CartChipProps {
  /** 'light' = white pill w/ gold bag (most headers); 'solid' = gold pill w/ white bag (cart/orders) */
  tone?: 'light' | 'solid'
  className?: string
}

/** The cart count pill shown in the top-right of every designed screen. */
export function CartChip({ tone = 'light', className }: CartChipProps) {
  const navigate = useNavigate()
  const count = useCartCount()

  return (
    <button
      type="button"
      aria-label={`Cart, ${count} items`}
      onClick={() => navigate(ROUTES.cart)}
      className={cn(
        'flex items-center gap-1.5 rounded-full transition-transform hover:scale-105 active:scale-95 cursor-pointer',
        tone === 'light' ? 'bg-card px-3.5 py-[7px] shadow-pill' : 'bg-accent px-4 py-[9px] shadow-glow',
        className,
      )}
    >
      <Icon name="shopping_bag" size={21} fill className={tone === 'light' ? 'text-accent' : 'text-white'} />
      <span className={cn('text-sm font-bold', tone === 'light' ? 'text-foreground' : 'text-white')}>{count}</span>
    </button>
  )
}
