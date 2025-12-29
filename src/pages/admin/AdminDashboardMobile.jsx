import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ShoppingBag, DollarSign, TrendingUp, Users, Package, AlertCircle,
  CheckCircle, Clock, Eye, ChevronRight
} from 'lucide-react'
import { useOrders } from '../../context/OrdersContext'
import { useRBAC, PERMISSIONS } from '../../context/RBACContext'
import AdminLayoutNew from '../../components/admin/AdminLayoutNew'
import MobileOptimizedPage from '../../components/admin/MobileOptimizedPage'
import MobileStatsCard from '../../components/admin/MobileStatsCard'

function AdminDashboardMobile() {
  const navigate = useNavigate()
  const { orders } = useOrders()
  const { hasPermission } = useRBAC()
  const [timeRange, setTimeRange] = useState('today')

  useEffect(() => {
    const auth = localStorage.getItem('adminAuth')
    if (!auth) navigate('/login')
  }, [navigate])

  // Calculate KPIs
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
  const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)

  const filterOrdersByDate = (startDate) => {
    return orders.filter(order => new Date(order.createdAt) >= startDate)
  }

  const todayOrders = filterOrdersByDate(today)
  const weekOrders = filterOrdersByDate(weekAgo)
  const monthOrders = filterOrdersByDate(monthAgo)

  const currentOrders = timeRange === 'today' ? todayOrders : timeRange === 'week' ? weekOrders : monthOrders

  const totalOrders = currentOrders.length
  const totalRevenue = currentOrders.reduce((sum, order) => sum + order.total, 0)
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0
  const uniqueCustomers = new Set(currentOrders.map(o => o.customerName)).size

  // Order statuses
  const pendingOrders = orders.filter(o => o.status === 'pending').length
  const preparingOrders = orders.filter(o => o.status === 'preparing').length
  const readyOrders = orders.filter(o => o.status === 'ready').length
  const deliveredOrders = orders.filter(o => o.status === 'delivered').length

  // Top products
  const productStats = currentOrders.reduce((acc, order) => {
    order.items?.forEach(item => {
      const key = item.name || item.title
      if (!acc[key]) {
        acc[key] = { name: key, quantity: 0, revenue: 0 }
      }
      acc[key].quantity += item.quantity
      acc[key].revenue += item.price * item.quantity
    })
    return acc
  }, {})

  const topProducts = Object.values(productStats)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)

  // Recent orders (last 5)
  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5)

  // Calculate trends (mock data)
  const revenueTrend = 12.5
  const ordersTrend = 8.2
  const aovTrend = 5.1
  const customersTrend = 15.3

  return (
    <AdminLayoutNew>
      <MobileOptimizedPage
        title="Dashboard"
        subtitle="Panoramica delle performance in tempo reale"
        filters={
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="flex-1 sm:flex-none px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
          >
            <option value="today">Oggi</option>
            <option value="week">Ultima Settimana</option>
            <option value="month">Ultimo Mese</option>
          </select>
        }
      >
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-6">
          <MobileStatsCard
            label="Fatturato Totale"
            value={totalRevenue.toFixed(0)}
            prefix="€"
            icon={DollarSign}
            trend={revenueTrend}
            color="green"
            delay={0}
          />
          <MobileStatsCard
            label="Ordini Totali"
            value={totalOrders}
            icon={ShoppingBag}
            trend={ordersTrend}
            color="blue"
            delay={0.1}
          />
          <MobileStatsCard
            label="Valore Medio Ordine"
            value={averageOrderValue.toFixed(2)}
            prefix="€"
            icon={TrendingUp}
            trend={aovTrend}
            color="orange"
            delay={0.2}
          />
          <MobileStatsCard
            label="Clienti Unici"
            value={uniqueCustomers}
            icon={Users}
            trend={customersTrend}
            color="purple"
            delay={0.3}
          />
        </div>

        {/* Order Status Widgets - Mobile Optimized */}
        <div className="mb-6">
          <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-3 md:mb-4">Stato Ordini</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {[
              { label: 'In Attesa', count: pendingOrders, icon: Clock, color: 'bg-yellow-100 text-yellow-700', iconColor: 'text-yellow-600' },
              { label: 'In Preparazione', count: preparingOrders, icon: Package, color: 'bg-blue-100 text-blue-700', iconColor: 'text-blue-600' },
              { label: 'Pronti', count: readyOrders, icon: CheckCircle, color: 'bg-green-100 text-green-700', iconColor: 'text-green-600' },
              { label: 'Consegnati', count: deliveredOrders, icon: CheckCircle, color: 'bg-gray-100 text-gray-700', iconColor: 'text-gray-600' }
            ].map((status, index) => {
              const Icon = status.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className={`${status.color} rounded-lg p-3 md:p-4`}
                >
                  <Icon className={`w-5 h-5 md:w-6 md:h-6 ${status.iconColor} mb-2`} />
                  <p className="text-xl md:text-2xl font-bold">{status.count}</p>
                  <p className="text-xs md:text-sm font-medium">{status.label}</p>
                </motion.div>
              )
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* Recent Orders - Mobile Cards */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-4 md:p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg md:text-xl font-bold text-gray-900">Ordini Recenti</h2>
              <button
                onClick={() => navigate('/admin/orders')}
                className="text-orange-600 hover:text-orange-700 flex items-center gap-1 text-sm font-medium"
              >
                Vedi tutti
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="divide-y divide-gray-100">
              {recentOrders.length === 0 ? (
                <div className="p-8 text-center">
                  <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">Nessun ordine recente</p>
                </div>
              ) : (
                recentOrders.map((order, index) => (
                  <motion.div
                    key={order.orderNumber}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + index * 0.1 }}
                    onClick={() => navigate('/admin/orders')}
                    className="p-3 md:p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    {/* Mobile layout */}
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 text-sm md:text-base">#{order.orderNumber}</p>
                        <p className="text-xs md:text-sm text-gray-600">{order.customerName}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900 text-sm md:text-base">€{order.total.toFixed(2)}</p>
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                          order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                          order.status === 'preparing' ? 'bg-blue-100 text-blue-700' :
                          order.status === 'ready' ? 'bg-green-100 text-green-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {order.status === 'delivered' ? 'Consegnato' :
                           order.status === 'preparing' ? 'In Preparazione' :
                           order.status === 'ready' ? 'Pronto' : 'In Attesa'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{new Date(order.createdAt).toLocaleString('it-IT', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}</span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        Dettagli
                      </span>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>

          {/* Top Products - Mobile Cards */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-4 md:p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg md:text-xl font-bold text-gray-900">Top Prodotti</h2>
              <button
                onClick={() => navigate('/admin/products')}
                className="text-orange-600 hover:text-orange-700 flex items-center gap-1 text-sm font-medium"
              >
                Vedi tutti
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="divide-y divide-gray-100">
              {topProducts.length === 0 ? (
                <div className="p-8 text-center">
                  <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">Nessun prodotto venduto</p>
                </div>
              ) : (
                topProducts.map((product, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + index * 0.1 }}
                    className="p-3 md:p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div className="w-6 h-6 md:w-8 md:h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-bold text-xs md:text-sm">#{index + 1}</span>
                        </div>
                        <p className="font-semibold text-gray-900 truncate text-sm md:text-base">{product.name}</p>
                      </div>
                      <p className="font-bold text-green-600 text-sm md:text-base ml-2">€{product.revenue.toFixed(0)}</p>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-600 ml-8 md:ml-10">
                      <span>{product.quantity} venduti</span>
                      <div className="flex-1 mx-3">
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div
                            className="bg-gradient-to-r from-orange-500 to-orange-600 h-1.5 rounded-full"
                            style={{ width: `${(product.revenue / topProducts[0].revenue) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Alert Section - Mobile Optimized */}
        {pendingOrders > 5 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="mt-6 bg-yellow-50 border-l-4 border-yellow-500 p-3 md:p-4 rounded-lg"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <h3 className="text-sm md:text-base font-semibold text-yellow-900">Attenzione</h3>
                <p className="text-xs md:text-sm text-yellow-800 mt-1">
                  Ci sono {pendingOrders} ordini in attesa. Controlla e processa gli ordini più vecchi.
                </p>
                <button
                  onClick={() => navigate('/admin/orders')}
                  className="mt-2 text-xs md:text-sm font-medium text-yellow-900 underline"
                >
                  Vai agli ordini →
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </MobileOptimizedPage>
    </AdminLayoutNew>
  )
}

export default AdminDashboardMobile
