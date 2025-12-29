import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  TrendingUp, TrendingDown, DollarSign, ShoppingBag,
  Users, Calendar, Download, BarChart3, PieChart, Activity
} from 'lucide-react'
import { useOrders } from '../../context/OrdersContext'
import AdminLayout from '../../components/admin/AdminLayout'

function AdminReportsPage() {
  const navigate = useNavigate()
  const { orders } = useOrders()
  const [timeRange, setTimeRange] = useState('week')

  useEffect(() => {
    const auth = localStorage.getItem('adminAuth')
    if (!auth) navigate('/login')
  }, [navigate])

  // Calculate statistics
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0)
  const totalOrders = orders.length
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

  const todayRevenue = orders
    .filter(order => {
      const orderDate = new Date(order.createdAt)
      const today = new Date()
      return orderDate.toDateString() === today.toDateString()
    })
    .reduce((sum, order) => sum + order.total, 0)

  const weekRevenue = orders
    .filter(order => {
      const orderDate = new Date(order.createdAt)
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      return orderDate >= weekAgo
    })
    .reduce((sum, order) => sum + order.total, 0)

  const monthRevenue = orders
    .filter(order => {
      const orderDate = new Date(order.createdAt)
      const monthAgo = new Date()
      monthAgo.setMonth(monthAgo.getMonth() - 1)
      return orderDate >= monthAgo
    })
    .reduce((sum, order) => sum + order.total, 0)

  const stats = [
    {
      label: 'Fatturato',
      value: `€${totalRevenue.toFixed(0)}`,
      change: '+12.5%',
      isPositive: true,
      icon: DollarSign,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50'
    },
    {
      label: 'Ordini',
      value: totalOrders,
      change: '+8.2%',
      isPositive: true,
      icon: ShoppingBag,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      label: 'Valore Medio',
      value: `€${averageOrderValue.toFixed(0)}`,
      change: '+5.1%',
      isPositive: true,
      icon: TrendingUp,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      label: 'Clienti',
      value: new Set(orders.map(o => o.customerName)).size,
      change: '+15.3%',
      isPositive: true,
      icon: Users,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50'
    }
  ]

  const revenueByPeriod = [
    { period: 'Oggi', value: todayRevenue },
    { period: 'Settimana', value: weekRevenue },
    { period: 'Mese', value: monthRevenue }
  ]

  // Get top products
  const productStats = orders.reduce((acc, order) => {
    order.items.forEach(item => {
      if (!acc[item.name]) {
        acc[item.name] = { name: item.name, quantity: 0, revenue: 0 }
      }
      acc[item.name].quantity += item.quantity
      acc[item.name].revenue += item.price * item.quantity
    })
    return acc
  }, {})

  const topProducts = Object.values(productStats)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)

  return (
    <AdminLayout>
      <div className="p-4 sm:p-6 pb-24">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Report</h2>
            <p className="text-sm text-gray-500 mt-1">Analisi vendite</p>
          </div>
          <button className="flex items-center justify-center space-x-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-3 rounded-xl hover:shadow-lg transition-all font-semibold w-full sm:w-auto">
            <Download className="w-5 h-5" />
            <span>Esporta</span>
          </button>
        </div>

        {/* Time Range - Mobile Optimized */}
        <div className="bg-white rounded-2xl p-3 sm:p-4 shadow-sm border border-gray-200 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <Calendar className="w-5 h-5 text-gray-500 hidden sm:block" />
            <div className="grid grid-cols-4 gap-2 flex-1">
              {['day', 'week', 'month', 'year'].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3 py-2 sm:px-4 rounded-lg font-semibold text-xs sm:text-sm transition-all ${
                    timeRange === range
                      ? 'bg-orange-500 text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {range === 'day' ? 'Giorno' : range === 'week' ? 'Sett.' : range === 'month' ? 'Mese' : 'Anno'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Grid - Mobile Optimized */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-200"
            >
              <div className={`inline-flex p-2 sm:p-3 rounded-xl ${stat.bgColor} mb-3`}>
                <stat.icon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
              <p className="text-xs sm:text-sm text-gray-500 mb-2">{stat.label}</p>
              <div className="flex items-center space-x-1">
                {stat.isPositive ? (
                  <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                ) : (
                  <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4 text-red-600" />
                )}
                <span className={`text-xs sm:text-sm font-semibold ${stat.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.change}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Revenue by Period - Mobile Optimized */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-200 mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900">Fatturato per Periodo</h3>
            <BarChart3 className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {revenueByPeriod.map((item) => (
              <div key={item.period} className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-xl">
                <span className="font-semibold text-gray-900 text-sm sm:text-base">{item.period}</span>
                <span className="text-lg sm:text-xl font-bold text-gray-900">€{item.value.toFixed(0)}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Top Products - Mobile Optimized */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-200 mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900">Top 5 Prodotti</h3>
            <PieChart className="w-5 h-5 text-gray-400" />
          </div>
          {topProducts.length === 0 ? (
            <p className="text-gray-500 text-center py-8 text-sm">Nessun dato</p>
          ) : (
            <div className="space-y-2 sm:space-y-3">
              {topProducts.map((product, index) => (
                <div key={product.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center text-white font-bold text-xs sm:text-sm flex-shrink-0">
                      {index + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-gray-900 text-sm sm:text-base truncate">{product.name}</p>
                      <p className="text-xs text-gray-500">{product.quantity} venduti</p>
                    </div>
                  </div>
                  <span className="font-bold text-gray-900 text-sm sm:text-base ml-2">€{product.revenue.toFixed(0)}</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Chart Placeholder - Mobile Optimized */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-200 mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900">Andamento</h3>
            <Activity className="w-5 h-5 text-gray-400" />
          </div>
          <div className="h-48 sm:h-64 flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl">
            <div className="text-center px-4">
              <BarChart3 className="w-12 h-12 sm:w-16 sm:h-16 text-orange-300 mx-auto mb-3" />
              <p className="text-gray-600 font-semibold text-sm sm:text-base">Grafico delle vendite</p>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">Integrare Chart.js/Recharts</p>
            </div>
          </div>
        </motion.div>

        {/* Performance Cards - Mobile Optimized */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-5 sm:p-6 text-white"
          >
            <ShoppingBag className="w-10 h-10 sm:w-12 sm:h-12 mb-3 opacity-80" />
            <h3 className="text-2xl sm:text-3xl font-bold mb-1">{totalOrders}</h3>
            <p className="text-blue-100 text-sm">Ordini Totali</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-5 sm:p-6 text-white"
          >
            <DollarSign className="w-10 h-10 sm:w-12 sm:h-12 mb-3 opacity-80" />
            <h3 className="text-2xl sm:text-3xl font-bold mb-1">€{totalRevenue.toFixed(0)}</h3>
            <p className="text-green-100 text-sm">Fatturato</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-5 sm:p-6 text-white"
          >
            <Users className="w-10 h-10 sm:w-12 sm:h-12 mb-3 opacity-80" />
            <h3 className="text-2xl sm:text-3xl font-bold mb-1">{new Set(orders.map(o => o.customerName)).size}</h3>
            <p className="text-purple-100 text-sm">Clienti</p>
          </motion.div>
        </div>
      </div>
    </AdminLayout>
  )
}

export default AdminReportsPage
