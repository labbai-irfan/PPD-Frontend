import { useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Star,
  FolderTree,
  Ticket,
  UserCog,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Lock,
  Upload,
  Menu,
  X,
  Image,
} from 'lucide-react'
import { Logo } from '@/components/shared/Logo'
import { useAuthStore } from '@/store/auth.store'

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
  { icon: Package, label: 'Products', path: '/admin/products' },
  { icon: Upload, label: 'Bulk Import', path: '/admin/bulk-import' },
  { icon: ShoppingCart, label: 'Orders', path: '/admin/orders' },
  { icon: Users, label: 'Users', path: '/admin/users' },
  { icon: Star, label: 'Reviews', path: '/admin/reviews' },
  { icon: FolderTree, label: 'Categories', path: '/admin/categories' },
  { icon: Ticket, label: 'Coupons', path: '/admin/coupons' },
  { icon: Image, label: 'Banners', path: '/admin/banners' },
  { icon: UserCog, label: 'Admins', path: '/admin/admins' },
  { icon: Settings, label: 'Settings', path: '/admin/settings' },
  { icon: Lock, label: 'Security', path: '/admin/security' },
]

export default function AdminLayout() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()

  const closeSidebar = () => setMobileSidebarOpen(false)

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile Overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-30 md:hidden bg-black/50"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar — hidden on mobile, full-width drawer overlay on small screens */}
      <div
        className={`
          fixed md:relative top-0 left-0 h-screen z-40
          ${collapsed ? 'w-20' : 'w-64'} bg-card border-r transition-all duration-300 flex flex-col
          ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Logo */}
        <div className="h-16 border-b flex items-center justify-between px-4 md:px-6 shrink-0">
          <Link to="/admin/dashboard" className={`flex items-center gap-2 ${collapsed ? 'w-full justify-center' : ''}`}>
            <Logo size={32} />
            {!collapsed && <span className="font-bold text-foreground">PPD Admin</span>}
          </Link>
          <button
            onClick={closeSidebar}
            className="md:hidden p-1 text-muted-foreground hover:text-foreground"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Menu */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto no-scrollbar">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={closeSidebar}
              title={collapsed ? item.label : undefined}
              className={({ isActive }) =>
                `flex items-center ${collapsed ? 'justify-center px-0' : 'gap-3 px-3'} rounded-lg py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`
              }
            >
              <item.icon className="size-5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Actions (Collapse + Logout) */}
        <div className="p-3 border-t shrink-0 flex flex-col gap-2">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={`hidden md:flex items-center ${collapsed ? 'justify-center px-0' : 'gap-3 px-3'} py-2.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground w-full text-sm font-medium transition-colors`}
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {collapsed ? <ChevronRight className="size-5 shrink-0" /> : <ChevronLeft className="size-5 shrink-0" />}
            {!collapsed && <span>Collapse Sidebar</span>}
          </button>

          <button
            onClick={() => {
              useAuthStore.getState().logout()
              navigate('/admin')
            }}
            title={collapsed ? 'Logout' : undefined}
            className={`flex items-center ${collapsed ? 'justify-center px-0' : 'gap-3 px-3'} py-2.5 rounded-lg text-destructive hover:bg-destructive/10 w-full text-sm font-medium transition-colors`}
          >
            <LogOut className="size-5 shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="h-16 bg-card border-b px-4 md:px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              className="md:hidden p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
            >
              <Menu className="size-5" />
            </button>
            <h1 className="text-lg md:text-xl font-semibold text-foreground">Admin Panel</h1>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-auto">
          <div className="px-4 py-6 md:px-6 max-w-7xl mx-auto w-full">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  )
}
