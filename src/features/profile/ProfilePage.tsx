import { useEffect, useState } from 'react'
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
  const updateUser = useAuthStore((s) => s.updateUser)
  const orders = useOrdersStore((s) => s.orders)
  const fetchOrders = useOrdersStore((s) => s.fetchOrders)
  const loaded = useOrdersStore((s) => s.loaded)
  const theme = useUiStore((s) => s.theme)
  const setTheme = useUiStore((s) => s.setTheme)
  const [preferencesOpen, setPreferencesOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [editName, setEditName] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [editGrade, setEditGrade] = useState('')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleFileChange = (file: File | null) => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setAvatarFile(file)
    setPreviewUrl(file ? URL.createObjectURL(file) : null)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files?.[0]) {
      handleFileChange(e.dataTransfer.files[0])
    }
  }

  useEffect(() => {
    if (user) {
      setEditName(user.name || '')
      setEditPhone(user.phone || '')
      setEditGrade(user.grade || '')
    }
  }, [user])

  const handleUpdateProfile = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!user) return
    setIsUpdating(true)
    try {
      // Import apiClient here to avoid circular dependencies if any, or just import it at top
      const { apiClient } = await import('@/services/api/client')

      // Update avatar if selected
      if (avatarFile) {
        const formData = new FormData()
        formData.append('file', avatarFile)
        const { data: updatedUser } = await apiClient.post('/users/me/avatar', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        updateUser(updatedUser)
      }

      // Update name/phone
      if (editName !== user.name || editPhone !== user.phone || editGrade !== user.grade) {
        const { data: updatedUser } = await apiClient.patch('/users/me', {
          name: editName,
          phone: editPhone || undefined,
          ...(user.accountType === 'parent' && editGrade ? { grade: editGrade } : {}),
        })
        updateUser(updatedUser)
      }

      toast.success('Profile updated successfully!')
      setIsEditing(false)
      handleFileChange(null)
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to update profile')
    } finally {
      setIsUpdating(false)
    }
  }

  useEffect(() => {
    if (!loaded) void fetchOrders().catch(() => {})
  }, [loaded, fetchOrders])

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
    { label: 'Saved Address', icon: 'import_contacts', fill: false, onClick: () => navigate(ROUTES.addresses) },
    { label: 'Preferences', icon: 'tune', fill: false, onClick: () => setPreferencesOpen(true) },
    { label: 'Password', icon: 'lock', fill: true, onClick: () => navigate(ROUTES.accountSettings) },
    { label: 'Notification Settings', icon: 'notifications', fill: true, onClick: () => navigate(ROUTES.accountSettings) },
    { label: 'Help & Support', icon: 'support_agent', fill: false, onClick: () => navigate(ROUTES.support) },
    { label: 'About PPD', icon: 'info', fill: true, onClick: () => navigate(ROUTES.about) },
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
    <div className="md:mx-auto md:max-w-2xl lg:max-w-4xl">
      <TopBar leading="menu" cartTone="solid" />

      {/* Heading text as it appears in the imported design */}
      <div className="pb-2 pt-2.5 md:pt-0">
        <h1 className="text-xl font-bold text-foreground">Categories to Explore</h1>
        <p className="text-[12.5px] text-muted-foreground">Everything you need, in one smart kit</p>
      </div>

      {/* Profile card */}
      <div className={cn("flex w-full flex-col items-center gap-4 rounded-[20px] bg-white px-4 py-5 shadow-sm transition-all sm:flex-row sm:items-stretch sm:gap-8 sm:px-[15px]", isEditing && "ring-2 ring-primary/20 shadow-md")}>
        <div className="flex shrink-0 items-center justify-center">
          {isEditing ? (
            <div 
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={cn(
                "relative flex size-[142px] items-center justify-center overflow-hidden rounded-full shadow-sm transition-all cursor-pointer group ring-4 ring-offset-2 ring-transparent",
                isDragging ? "ring-primary scale-105" : "hover:ring-primary/20",
                !previewUrl && !user?.avatar ? "bg-primary-soft text-primary font-bold text-5xl" : "bg-muted/30"
              )}
            >
              <input 
                type="file" 
                accept="image/png, image/jpeg, image/webp"
                onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                className="absolute inset-0 cursor-pointer opacity-0 z-10"
              />
              
              {previewUrl ? (
                <img src={previewUrl} alt="New profile photo preview" className="size-full object-cover" />
              ) : user?.avatar ? (
                <img src={`${import.meta.env.VITE_API_BASE_URL?.replace(/\/api(\/v\d+)?$/, '') || ''}${user.avatar}`} alt={user?.name ? `${user.name}'s profile photo` : 'Profile photo'} className="size-full object-cover" />
              ) : (
                <span>{user?.name?.charAt(0)?.toUpperCase() || '?'}</span>
              )}
              
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <Icon name="photo_camera" size={32} className="text-white" />
              </div>
            </div>
          ) : (
            <Avatar 
              name={user.name} 
              src={user.avatar ? `${import.meta.env.VITE_API_BASE_URL?.replace(/\/api(\/v\d+)?$/, '') || ''}${user.avatar}` : undefined} 
              size={142} 
            />
          )}
        </div>
        <div className="min-w-0 w-full flex-1 flex flex-col justify-center">
          <div className="flex flex-col">
            <div className="flex items-start justify-between">
              <div className="w-full mr-4">
                <span className="inline-block rounded-full bg-[#E5F1FF] px-3 py-[3px] text-[10.5px] font-bold tracking-wide text-[#1B75FF] uppercase">
                  {user.accountType === 'student' ? 'Student Profile' : 'Parent Profile'}
                </span>
                {isEditing ? (
                  <input 
                    type="text" 
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Full Name"
                    className="mt-[2px] w-full bg-muted/40 px-2 py-1 text-[20px] font-medium text-[#111111] border-none rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                ) : (
                  <h2 className="mt-[2px] text-[20px] font-medium text-[#111111]">{user.name}</h2>
                )}
              </div>
              
              {isEditing ? (
                <div className="flex gap-2">
                  <button
                    type="button"
                    aria-label="Cancel edit"
                    disabled={isUpdating}
                    onClick={() => {
                      setIsEditing(false)
                      handleFileChange(null)
                      setEditName(user.name || '')
                      setEditPhone(user.phone || '')
                      setEditGrade(user.grade || '')
                    }}
                    className="mt-0.5 flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-muted/80 disabled:opacity-50"
                  >
                    <Icon name="close" size={16} />
                  </button>
                  <button
                    type="button"
                    aria-label="Save profile"
                    disabled={isUpdating}
                    onClick={() => void handleUpdateProfile()}
                    className="mt-0.5 flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full bg-[#FBAA2E] text-white hover:bg-[#f99200] disabled:opacity-50"
                  >
                    {isUpdating ? <Icon name="sync" size={16} className="animate-spin" /> : <Icon name="check" size={16} />}
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  aria-label="Edit profile"
                  onClick={() => setIsEditing(true)}
                  className="mt-0.5 flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full bg-[#FFF0D4]"
                >
                  <Icon name="edit" size={16} className="text-[#FBAA2E]" />
                </button>
              )}
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
            <div className="flex flex-wrap min-w-0 items-center gap-2.5 text-[13.5px] text-[#2a2723]">
              <span className="flex size-[26px] shrink-0 items-center justify-center rounded-full bg-[#FFF0D4]">
                <Icon name="call" size={16} fill className="text-[#FBAA2E]" />
              </span>
              {isEditing ? (
                <input 
                  type="tel" 
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="e.g. 9876543210"
                  className="flex-1 bg-muted/40 px-2 py-1 text-[13.5px] border-none rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              ) : (
                <span className="truncate">{user.phone ?? '+91 98765 43210'}</span>
              )}
              {isEditing ? (
                 <input
                   type="text"
                   value={editGrade}
                   onChange={(e) => setEditGrade(e.target.value)}
                   placeholder="Grade (e.g., 10)"
                   className="flex-1 bg-muted/40 px-2 py-1 text-[13.5px] border-none rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                 />
               ) : (
                 (user.accountType === 'parent' && user.grade) && (
                   <p className="flex items-center gap-2.5 text-[13.5px] text-[#2a2723]">
                     <span className="flex size-[26px] shrink-0 items-center justify-center rounded-full bg-[#FFF0D4]">
                       <Icon name="school" size={16} fill className="text-[#FBAA2E]" />
                     </span>
                     {user.grade}
                   </p>
                 )
               )}
            </div>
            {user.accountType === 'student' && user.grade && (
              <p className="flex items-center gap-2.5 text-[13.5px] text-[#2a2723]">
                <span className="flex size-[26px] shrink-0 items-center justify-center rounded-full bg-[#FFF0D4]">
                  <Icon name="school" size={16} fill className="text-[#FBAA2E]" />
                </span>
                {user.grade}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Order stats + menu (side by side on large desktops) */}
      <div className="mt-3.5 grid grid-cols-1 gap-3.5 lg:grid-cols-2 lg:items-start">
      {/* Order stats */}
      <div className="rounded-2xl bg-card p-4 shadow-card">
        <div className="mb-3.5 flex items-center justify-between">
          <h2 className="text-[15px] font-bold text-foreground">My Orders</h2>
          <Link to={ROUTES.orders} className="flex items-center gap-1 text-xs font-semibold text-link">
            View All
            <Icon name="arrow_forward" size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          {stats.map((stat) => (
            <Link
              key={stat.label}
              to={ROUTES.orders}
              className="rounded-xl border border-border px-1.5 py-3 text-center transition-colors hover:bg-muted/50"
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
      <div className="rounded-2xl bg-card px-4 py-1 shadow-card">
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
