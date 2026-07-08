import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { ROUTES } from '@/lib/constants'
import { useCartCount } from '@/store/cart.store'

interface CartChipProps {
  /** 'light' = white pill w/ gold bag (most headers); 'solid' = gold pill w/ white bag (cart/orders) */
  tone?: 'light' | 'solid'
  className?: string
}

export function CartChip({ tone: _tone, className }: CartChipProps) {
  const navigate = useNavigate()
  const count = useCartCount()

  return (
    <button
      type="button"
      aria-label={`Cart, ${count} items`}
      onClick={() => navigate(ROUTES.cart)}
      className={cn(
        'flex items-center gap-1.5 rounded-full transition-transform hover:scale-105 active:scale-95 cursor-pointer',
        'bg-card px-3.5 py-[7px] shadow-pill',
        className,
      )}
    >
      <img 
        src="/icons/bag.svg" 
        alt="Bag" 
        className="h-[21px] w-[21px] object-contain" 
      />
      <span className="text-sm font-bold text-foreground">{count}</span>
    </button>
  )
}
