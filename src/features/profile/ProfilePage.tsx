import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { ROUTES } from '@/lib/constants'
import { useAuthStore } from '@/store/auth.store'
import { useOrdersStore } from '@/store/orders.store'
import { useUiStore, type Theme } from '@/store/ui.store'
import { statColors } from '@/theme/colors'
import { Icon } from '@/components/ui/Icon'
import { Avatar } from '@/components/ui/Avatar'
import { Modal } from '@/components/ui/Modal'
import { TopBar } from '@/components/shared/TopBar'

const themeOptions: Array<{ value: Theme; label: string; icon: string }> = [
  { value: 'light', label: 'Light', icon: 'light_mode' },
  { value: 'dark', label: 'Dark', icon: 'dark_mode' },
  { value: 'system', label: 'System', icon: 'desktop_windows' },
]

export default function ProfilePage() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const orders = useOrdersStore((s) => s.orders)
  const theme = useUiStore((s) => s.theme)
  const setTheme = useUiStore((s) => s.setTheme)
  const [preferencesOpen, setPreferencesOpen] = useState(false)

  if (!user) return null

  const stats = [
    { label: 'All Orders', num: orders.length, icon: 'assignment', ...statColors.all },
    {
      label: 'Processing',
      num: orders.filter((o) => o.status !== 'delivered' && o.status !== 'cancelled').length,
      icon: 'menu_book',
      ...statColors.processing,
    },
    { label: 'Delivered', num: orders.filter((o) => o.status === 'delivered').length, icon: 'local_shipping', ...statColors.delivered },
    { label: 'Cancelled', num: orders.filter((o) => o.status === 'cancelled').length, icon: 'cancel', ...statColors.cancelled },
  ]

  const menu: Array<{ label: string; icon: string; fill: boolean; onClick: () => void }> = [
    { label: 'My Wishlist', icon: 'favorite', fill: true, onClick: () => navigate(ROUTES.wishlist) },
    { label: 'Saved Address', icon: 'import_contacts', fill: false, onClick: () => toast('Saved addresses are coming soon') },
    { label: 'Preferences', icon: 'tune', fill: false, onClick: () => setPreferencesOpen(true) },
    { label: 'Password', icon: 'lock', fill: true, onClick: () => navigate(ROUTES.forgotPassword) },
    { label: 'Notification Settings', icon: 'notifications', fill: true, onClick: () => toast('Notification settings are coming soon') },
    { label: 'Help & Support', icon: 'support_agent', fill: false, onClick: () => navigate(ROUTES.support) },
    { label: 'About PPD', icon: 'info', fill: true, onClick: () => navigate(ROUTES.support) },
    {
      label: 'Log out',
      icon: 'logout',
      fill: false,
      onClick: () => {
        logout()
        toast('Signed out. See you soon!')
        navigate(ROUTES.home)
      },
    },
  ]

  return (
    <div className="md:mx-auto md:max-w-2xl">
      <TopBar leading="menu" cartTone="solid" />

      {/* Heading text as it appears in the imported design */}
      <div className="pb-2 pt-2.5 md:pt-0">
        <h1 className="text-xl font-bold text-foreground">Categories to Explore</h1>
        <p className="text-[12.5px] text-muted-foreground">Everything you need, in one smart kit</p>
      </div>

      {/* Profile card */}
      <div className="flex w-full gap-[31px] rounded-[20px] bg-white px-[15px] py-[20px] shadow-sm">
        <div className="flex shrink-0 items-center justify-center">
          <Avatar name={user.name} size={142} />
        </div>
        <div className="min-w-0 flex-1 flex flex-col justify-center">
          <div className="flex flex-col">
            <div className="flex items-start justify-between">
              <div>
                <span className="inline-block rounded-full bg-[#E5F1FF] px-3 py-[3px] text-[10.5px] font-semibold text-[#1B75FF]">
                  Student Profile
                </span>
                <h2 className="mt-[2px] text-[20px] font-medium text-[#111111]">{user.name}</h2>
              </div>
              <button
                type="button"
                aria-label="Edit profile"
                onClick={() => toast('Profile editing is coming soon')}
                className="mt-0.5 flex size-[30px] shrink-0 cursor-pointer items-center justify-center rounded-full bg-[#FFF0D4]"
              >
                <Icon name="edit" size={16} className="text-[#FBAA2E]" />
              </button>
            </div>
            <div className="mt-1.5 w-full border-b border-[#EAEAEA]"></div>
          </div>
          
          <div className="mt-2.5 space-y-[9px]">
            <p className="flex items-center gap-2.5 text-[13.5px] text-[#2a2723]">
              <span className="flex size-[26px] shrink-0 items-center justify-center rounded-full bg-[#FFF0D4]">
                <Icon name="mail" size={16} fill className="text-[#FBAA2E]" />
              </span>
              <span className="truncate">{user.email}</span>
            </p>
            <p className="flex items-center gap-2.5 text-[13.5px] text-[#2a2723]">
              <span className="flex size-[26px] shrink-0 items-center justify-center rounded-full bg-[#FFF0D4]">
                <Icon name="call" size={16} fill className="text-[#FBAA2E]" />
              </span>
              {user.phone ?? '+91 98765 43210'}
            </p>
            <p className="flex items-center gap-2.5 text-[13.5px] text-[#2a2723]">
              <span className="flex size-[26px] shrink-0 items-center justify-center rounded-full bg-[#FFF0D4]">
                <Icon name="school" size={16} fill className="text-[#FBAA2E]" />
              </span>
              Grade 5
            </p>
          </div>
        </div>
      </div>

      {/* Order stats */}
      <div className="mt-3.5 rounded-2xl bg-card p-4 shadow-card">
        <div className="mb-3.5 flex items-center justify-between">
          <h2 className="text-[15px] font-bold text-foreground">My Orders</h2>
          <Link to={ROUTES.orders} className="flex items-center gap-1 text-xs font-semibold text-link">
            View All
            <Icon name="arrow_forward" size={14} />
          </Link>
        </div>
        <div className="flex gap-2.5">
          {stats.map((stat) => (
            <Link
              key={stat.label}
              to={ROUTES.orders}
              className="flex-1 rounded-xl border border-border px-1.5 py-3 text-center transition-colors hover:bg-muted/50"
            >
              <span className="mx-auto flex size-[34px] items-center justify-center rounded-full" style={{ backgroundColor: stat.bg }}>
                <Icon name={stat.icon} size={19} fill style={{ color: stat.color }} />
              </span>
              <p className="mt-1.5 text-[10px] text-muted-foreground">{stat.label}</p>
              <p className="mt-0.5 text-[15px] font-bold text-foreground">{String(stat.num).padStart(2, '0')}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Menu */}
      <div className="mt-3.5 rounded-2xl bg-card px-4 py-1 shadow-card">
        {menu.map((item, i) => (
          <button
            key={item.label}
            type="button"
            onClick={item.onClick}
            className={cn(
              'flex w-full items-center justify-between py-[15px] text-left cursor-pointer',
              i < menu.length - 1 && 'border-b border-rule-soft dark:border-border',
            )}
          >
            <span className="flex items-center gap-3.5">
              <Icon name={item.icon} size={21} fill={item.fill} className="text-card-foreground" />
              <span className="text-sm font-medium text-card-foreground">{item.label}</span>
            </span>
            <Icon name="chevron_right" size={20} className="text-muted-foreground" />
          </button>
        ))}
      </div>

      {/* Preferences (theme) */}
      <Modal open={preferencesOpen} onClose={() => setPreferencesOpen(false)} title="Preferences">
        <p className="mb-3 text-sm font-semibold text-foreground">Appearance</p>
        <div className="grid grid-cols-3 gap-2">
          {themeOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setTheme(option.value)}
              className={cn(
                'flex flex-col items-center gap-1.5 rounded-2xl border py-3 text-xs font-semibold transition-colors cursor-pointer',
                theme === option.value
                  ? 'border-primary bg-primary-soft text-primary-soft-foreground'
                  : 'border-border text-muted-foreground hover:border-border-strong',
              )}
            >
              <Icon name={option.icon} size={20} />
              {option.label}
            </button>
          ))}
        </div>
      </Modal>
    </div>
  )
}
