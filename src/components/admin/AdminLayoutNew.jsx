import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, ShoppingBag, Package, Users, Store, Ticket,
  DollarSign, BarChart3, Settings, LogOut, Menu, X, ChevronDown,
  Shield, Bell, Search, User, Crown, Briefcase, Headphones, TrendingUp
} from 'lucide-react'
import { useRBAC, PERMISSIONS } from '../../context/RBACContext'
import { useNotifications } from '../../context/NotificationsContext'
import NotificationsPanel from './NotificationsPanel'

function AdminLayoutNew({ children }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { currentUser, hasPermission, logout, ROLES } = useRBAC()
  const { unreadCount } = useNotifications()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)

  // Configurazione menu con permessi
  const menuItems = [
    {
      name: 'Dashboard',
      icon: LayoutDashboard,
      path: '/admin/dashboard',
      permission: PERMISSIONS.VIEW_DASHBOARD
    },
    {
      name: 'CEO Dashboard',
      icon: Crown,
      path: '/admin/ceo',
      permission: PERMISSIONS.VIEW_DASHBOARD
    },
    {
      name: 'Google & SEO',
      icon: TrendingUp,
      path: '/admin/google-seo',
      permission: PERMISSIONS.VIEW_DASHBOARD
    },
    {
      name: 'Ordini',
      icon: ShoppingBag,
      path: '/admin/orders',
      permission: PERMISSIONS.VIEW_ORDERS
    },
    {
      name: 'Prodotti',
      icon: Package,
      path: '/admin/products',
      permission: PERMISSIONS.VIEW_PRODUCTS
    },
    {
      name: 'Ristoranti',
      icon: Store,
      path: '/admin/merchants',
      permission: PERMISSIONS.VIEW_MERCHANTS
    },
    {
      name: 'Utenti',
      icon: Users,
      path: '/admin/users',
      permission: PERMISSIONS.VIEW_USERS
    },
    {
      name: 'Coupon & Loyalty',
      icon: Ticket,
      path: '/admin/coupons',
      permission: PERMISSIONS.VIEW_COUPONS
    },
    {
      name: 'Finanza',
      icon: DollarSign,
      path: '/admin/finance',
      permission: PERMISSIONS.VIEW_FINANCE
    },
    {
      name: 'Report',
      icon: BarChart3,
      path: '/admin/reports',
      permission: PERMISSIONS.VIEW_REPORTS
    },
    {
      name: 'Impostazioni',
      icon: Settings,
      path: '/admin/settings',
      permission: PERMISSIONS.VIEW_SETTINGS
    }
  ]

  // Filtra menu items in base ai permessi
  const visibleMenuItems = menuItems.filter(item =>
    !item.permission || hasPermission(item.permission)
  )

  const getRoleInfo = (role) => {
    const roleConfig = {
      [ROLES.SUPER_ADMIN]: { label: 'Super Admin', icon: Crown, color: 'text-purple-600 bg-purple-100' },
      [ROLES.ADMIN]: { label: 'Admin', icon: Shield, color: 'text-blue-600 bg-blue-100' },
      [ROLES.MERCHANT_ADMIN]: { label: 'Merchant Admin', icon: Store, color: 'text-orange-600 bg-orange-100' },
      [ROLES.SUPPORT_AGENT]: { label: 'Support', icon: Headphones, color: 'text-green-600 bg-green-100' },
      [ROLES.FINANCE]: { label: 'Finance', icon: DollarSign, color: 'text-emerald-600 bg-emerald-100' },
      [ROLES.LOGISTICS]: { label: 'Logistics', icon: TrendingUp, color: 'text-indigo-600 bg-indigo-100' }
    }
    return roleConfig[role] || roleConfig[ROLES.ADMIN]
  }

  const roleInfo = getRoleInfo(currentUser?.role)
  const RoleIcon = roleInfo.icon

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <header className="bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-30 h-16">
        <div className="h-full px-4 flex items-center justify-between">
          {/* Left: Logo + Menu Toggle */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg lg:hidden"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900 hidden sm:block">Admin Panel</h1>
            </div>
          </div>

          {/* Center: Search (desktop) */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Cerca ordini, prodotti, utenti..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Right: Notifications + User Menu */}
          <div className="flex items-center space-x-2">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2 hover:bg-gray-100 rounded-lg"
              >
                <Bell className="w-6 h-6 text-gray-600" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-semibold">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Panel */}
              {notificationsOpen && (
                <NotificationsPanel onClose={() => setNotificationsOpen(false)} />
              )}
            </div>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-lg"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-semibold text-gray-900">{currentUser?.name}</p>
                  <p className="text-xs text-gray-500">{roleInfo.label}</p>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-600 hidden sm:block" />
              </button>

              {/* User Dropdown */}
              <AnimatePresence>
                {userMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setUserMenuOpen(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
                    >
                      <div className="px-4 py-3 border-b border-gray-200">
                        <p className="text-sm font-semibold text-gray-900">{currentUser?.name}</p>
                        <p className="text-xs text-gray-500">{currentUser?.email}</p>
                        <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-semibold mt-2 ${roleInfo.color}`}>
                          <RoleIcon className="w-3 h-3" />
                          <span>{roleInfo.label}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => navigate('/admin/profile')}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                      >
                        <User className="w-4 h-4" />
                        <span>Il mio Profilo</span>
                      </button>
                      <button
                        onClick={() => navigate('/admin/settings')}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                      >
                        <Settings className="w-4 h-4" />
                        <span>Impostazioni</span>
                      </button>
                      <div className="border-t border-gray-200 my-2"></div>
                      <button
                        onClick={logout}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside className={`fixed top-16 left-0 bottom-0 w-64 bg-white border-r border-gray-200 z-20 transition-transform duration-300 lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <nav className="p-4 space-y-1 overflow-y-auto h-full">
          {visibleMenuItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-orange-50 text-orange-600 font-semibold'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-10 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="lg:pl-64 pt-16">
        <div className="p-3 sm:p-4 md:p-6">
          {children}
        </div>
      </main>
    </div>
  )
}

export default AdminLayoutNew
