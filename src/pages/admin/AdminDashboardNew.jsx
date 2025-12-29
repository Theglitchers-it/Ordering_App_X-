import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ShoppingBag, DollarSign, TrendingUp, TrendingDown, Clock, Users,
  Package, AlertCircle, CheckCircle, XCircle, Truck, MapPin, Star
} from 'lucide-react'
import { useOrders } from '../../context/OrdersContext'
import { useRBAC, PERMISSIONS } from '../../context/RBACContext'
import AdminLayoutNew from '../../components/admin/AdminLayoutNew'

function AdminDashboardNew() {
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

  // Calculate trends (mock data - in real app compare with previous period)
  const revenueTrend = 12.5
  const ordersTrend = 8.2
  const aovTrend = 5.1
  const customersTrend = 15.3

  // Main KPI Cards
  const kpis = [
    {
      label: 'Ordini Totali',
      value: totalOrders,
      change: ordersTrend,
      isPositive: ordersTrend > 0,
      icon: ShoppingBag,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      label: 'Fatturato',
      value: `€${totalRevenue.toFixed(2)}`,
      change: revenueTrend,
      isPositive: revenueTrend > 0,
      icon: DollarSign,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600'
    },
    {
      label: 'Valore Medio Ordine',
      value: `€${averageOrderValue.toFixed(2)}`,
      change: aovTrend,
      isPositive: aovTrend > 0,
      icon: TrendingUp,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600'
    },
    {
      label: 'Clienti Unici',
      value: uniqueCustomers,
      change: customersTrend,
      isPositive: customersTrend > 0,
      icon: Users,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600'
    }
  ]

  // Order status widgets
  const statusWidgets = [
    {
      label: 'In Attesa',
      value: pendingOrders,
      icon: Clock,
      color: 'bg-yellow-100 text-yellow-700',
      iconColor: 'text-yellow-600'
    },
    {
      label: 'In Preparazione',
      value: preparingOrders,
      icon: Package,
      color: 'bg-blue-100 text-blue-700',
      iconColor: 'text-blue-600'
    },
    {
      label: 'Pronti',
      value: readyOrders,
      icon: CheckCircle,
      color: 'bg-green-100 text-green-700',
      iconColor: 'text-green-600'
    },
    {
      label: 'Consegnati',
      value: deliveredOrders,
      icon: Truck,
      color: 'bg-gray-100 text-gray-700',
      iconColor: 'text-gray-600'
    }
  ]

  // Recent orders (last 5)
  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5)

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-700',
      preparing: 'bg-blue-100 text-blue-700',
      ready: 'bg-green-100 text-green-700',
      delivered: 'bg-gray-100 text-gray-700',
      cancelled: 'bg-red-100 text-red-700'
    }
    return colors[status] || colors.pending
  }

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'In attesa',
      preparing: 'In prep.',
      ready: 'Pronto',
      delivered: 'Consegnato',
      cancelled: 'Annullato'
    }
    return labels[status] || 'In attesa'
  }

  return (
    <AdminLayoutNew>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">
          {new Date().toLocaleDateString('it-IT', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </p>
      </div>

      {/* Time Range Selector */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 mb-6">
        <div className="flex items-center space-x-2">
          {[
            { value: 'today', label: 'Oggi' },
            { value: 'week', label: 'Ultimi 7 giorni' },
            { value: 'month', label: 'Ultimi 30 giorni' }
          ].map((range) => (
            <button
              key={range.value}
              onClick={() => setTimeRange(range.value)}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                timeRange === range.value
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {kpis.map((kpi, index) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${kpi.color} mb-4`}>
              <kpi.icon className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">{kpi.value}</h3>
            <p className="text-sm text-gray-500 mb-2">{kpi.label}</p>
            <div className="flex items-center space-x-1">
              {kpi.isPositive ? (
                <TrendingUp className="w-4 h-4 text-green-600" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-600" />
              )}
              <span className={`text-sm font-semibold ${kpi.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {kpi.change > 0 ? '+' : ''}{kpi.change}%
              </span>
              <span className="text-sm text-gray-500">vs periodo prec.</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Order Status Widgets */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statusWidgets.map((widget, index) => (
          <motion.div
            key={widget.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 + index * 0.05 }}
            className={`${widget.color} rounded-2xl p-4 shadow-sm`}
          >
            <div className="flex items-center justify-between mb-2">
              <widget.icon className={`w-5 h-5 ${widget.iconColor}`} />
              <span className="text-2xl font-bold">{widget.value}</span>
            </div>
            <p className="text-sm font-semibold">{widget.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Ordini Recenti</h3>
            <button
              onClick={() => navigate('/admin/orders')}
              className="text-sm text-orange-600 hover:text-orange-700 font-semibold"
            >
              Vedi tutti →
            </button>
          </div>

          {recentOrders.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Nessun ordine presente</p>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div
                  key={order.orderNumber}
                  onClick={() => navigate('/admin/orders')}
                  className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-sm font-bold text-blue-600">
                      #{order.orderNumber}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status || 'pending')}`}>
                      {getStatusLabel(order.status)}
                    </span>
                  </div>
                  <p className="font-semibold text-gray-900 mb-1">{order.customerName}</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">
                      {new Date(order.createdAt).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="font-bold text-gray-900">€{order.total.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Top Products */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Top 5 Prodotti</h3>
            <button
              onClick={() => navigate('/admin/reports')}
              className="text-sm text-orange-600 hover:text-orange-700 font-semibold"
            >
              Report →
            </button>
          </div>

          {topProducts.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Nessun dato disponibile</p>
          ) : (
            <div className="space-y-3">
              {topProducts.map((product, index) => (
                <div key={product.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm ${
                      index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-500' :
                      index === 1 ? 'bg-gradient-to-br from-gray-400 to-gray-500' :
                      index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-500' :
                      'bg-gradient-to-br from-blue-400 to-blue-500'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{product.name}</p>
                      <p className="text-xs text-gray-500">{product.quantity} venduti</p>
                    </div>
                  </div>
                  <span className="font-bold text-gray-900 ml-2">€{product.revenue.toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Alerts Section (if any stuck orders) */}
      {pendingOrders > 5 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-6 bg-yellow-50 border border-yellow-200 rounded-2xl p-4"
        >
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-yellow-900">Attenzione: Ordini in Attesa</h4>
              <p className="text-sm text-yellow-800 mt-1">
                Ci sono {pendingOrders} ordini in attesa di essere processati. Controlla la sezione ordini.
              </p>
              <button
                onClick={() => navigate('/admin/orders')}
                className="mt-2 text-sm text-yellow-900 font-semibold hover:underline"
              >
                Vai agli ordini →
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AdminLayoutNew>
  )
}

export default AdminDashboardNew
