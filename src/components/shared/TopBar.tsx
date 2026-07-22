import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { CircleIconButton } from '@/components/ui/CircleIconButton'
import { CartChip } from '@/components/shared/CartChip'
import { useUiStore } from '@/store/ui.store'

interface TopBarProps {
  /** 'back' shows the back circle, 'menu' the menu circle (design home/orders/profile) */
  leading?: 'back' | 'menu'
  /** optional title next to the leading button (e.g. "My Cart") */
  title?: string
  cartTone?: 'light' | 'solid'
  className?: string
}

/** The designed screen top row: circle button left, cart chip right. Mobile only. */
export function TopBar({ leading = 'back', title, cartTone = 'light', className }: TopBarProps) {
  const navigate = useNavigate()
  return (
    <div className={cn('flex items-center justify-between md:hidden', className)}>
      <div className="flex items-center gap-3.5">
        {leading === 'back' ? (
          <CircleIconButton icon="arrow_back_ios_new" label="Go back" onClick={() => navigate(-1)} />
        ) : (
          <CircleIconButton icon="/icons/hamburger.svg" iconSize={24} label="Menu" onClick={() => useUiStore.getState().setMobileMenuOpen(true)} />
        )}
        {title && <h1 className="text-[22px] font-bold text-foreground">{title}</h1>}
      </div>
      <CartChip tone={cartTone} />
    </div>
  )
}
