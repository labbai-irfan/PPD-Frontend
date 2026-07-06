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
      <img 
        src="/icons/bag.svg" 
        alt="Bag" 
        className={cn("h-[21px] w-[21px] object-contain", tone === 'solid' && "brightness-0 invert")} 
      />
      <span className={cn('text-sm font-bold', tone === 'light' ? 'text-foreground' : 'text-white')}>{count}</span>
    </button>
  )
}
