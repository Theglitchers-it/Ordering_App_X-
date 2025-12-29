import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, ShoppingBag, Users, Package, Gift,
  LogOut, Menu, X, Settings, BarChart3, Search, Bell
} from 'lucide-react'

/**
 * Layout responsive mobile-first per admin panel
 */
function AdminLayout({ children }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [adminAuth, setAdminAuth] = useState(null)

  useEffect(() => {
    const auth = localStorage.getItem('adminAuth')
    if (!auth) {
      navigate('/login')
    } else {
      setAdminAuth(JSON.parse(auth))
    }
  }, [navigate])

  // Chiudi sidebar su mobile quando si cambia pagina
  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname])

  const handleLogout = () => {
    localStorage.removeItem('adminAuth')
    navigate('/login')
  }

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
    { icon: ShoppingBag, label: 'Ordini', path: '/admin/orders' },
    { icon: Package, label: 'Prodotti', path: '/admin/products' },
    { icon: Users, label: 'Utenti', path: '/admin/users' },
    { icon: Gift, label: 'Coupon', path: '/admin/coupons' },
    { icon: BarChart3, label: 'Report', path: '/admin/reports' },
    { icon: Settings, label: 'Impostazioni', path: '/admin/settings' }
  ]

  const currentPage = menuItems.find(item => item.path === location.pathname)

  if (!adminAuth) return null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <header className="lg:hidden sticky top-0 z-40 bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Menu className="w-6 h-6 text-gray-700" />
          </button>

          <h1 className="text-lg font-bold text-gray-900">
            {currentPage?.label || 'Admin'}
          </h1>

          <div className="flex items-center space-x-2">
            <button className="p-2 hover:bg-gray-100 rounded-lg relative">
              <Bell className="w-5 h-5 text-gray-700" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
          </div>
        </div>
      </header>

      {/* Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ x: sidebarOpen ? 0 : '-100%' }}
        transition={{ type: 'tween', duration: 0.3 }}
        className="fixed left-0 top-0 h-full w-64 bg-gray-900 text-white z-50 lg:translate-x-0 lg:static flex flex-col"
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold">Admin Panel</h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Admin Info */}
          <div className="bg-gray-800 rounded-lg p-3">
            <p className="text-xs text-gray-400 mb-1">Loggato come</p>
            <p className="font-semibold text-sm truncate">{adminAuth?.name}</p>
            <p className="text-xs text-gray-400 truncate">{adminAuth?.email}</p>
          </div>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-1">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path
              const Icon = item.icon

              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? 'bg-orange-500 text-white shadow-lg'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className="font-medium">{item.label}</span>
                </button>
              )
            })}
          </div>
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-red-600 hover:bg-red-700 rounded-lg transition-colors font-medium"
          >
            <LogOut className="w-5 h-5" />
            <span>Esci</span>
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="lg:ml-64 flex-1">
        <main className="min-h-screen">
          {children}
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
