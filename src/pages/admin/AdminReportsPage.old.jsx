import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft, TrendingUp, TrendingDown, DollarSign, ShoppingBag,
  Users, Calendar, Download, BarChart3, PieChart, Activity
} from 'lucide-react'
import { useOrders } from '../../context/OrdersContext'

function AdminReportsPage() {
  const navigate = useNavigate()
  const { orders } = useOrders()
  const [timeRange, setTimeRange] = useState('week')
  const [reportType, setReportType] = useState('sales')

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
      label: 'Fatturato Totale',
      value: `€${totalRevenue.toFixed(2)}`,
      change: '+12.5%',
      isPositive: true,
      icon: DollarSign,
      color: 'from-green-500 to-green-600'
    },
    {
      label: 'Ordini Totali',
      value: totalOrders,
      change: '+8.2%',
      isPositive: true,
      icon: ShoppingBag,
      color: 'from-blue-500 to-blue-600'
    },
    {
      label: 'Valore Medio Ordine',
      value: `€${averageOrderValue.toFixed(2)}`,
      change: '+5.1%',
      isPositive: true,
      icon: TrendingUp,
      color: 'from-purple-500 to-purple-600'
    },
    {
      label: 'Clienti Totali',
      value: new Set(orders.map(o => o.customerName)).size,
      change: '+15.3%',
      isPositive: true,
      icon: Users,
      color: 'from-orange-500 to-orange-600'
    }
  ]

  const revenueByPeriod = [
    { period: 'Oggi', value: todayRevenue, icon: Calendar },
    { period: 'Questa Settimana', value: weekRevenue, icon: Calendar },
    { period: 'Questo Mese', value: monthRevenue, icon: Calendar }
  ]

  // Get top products from orders
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button onClick={() => navigate('/admin/dashboard')} className="p-2 hover:bg-gray-100 rounded-lg">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-bold text-gray-900">Report & Analytics</h2>
          </div>
          <button className="flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all">
            <Download className="w-5 h-5" />
            <span>Esporta Report</span>
          </button>
        </div>
      </header>

      <div className="p-6">
        {/* Time Range Selector */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 mb-6">
          <div className="flex items-center space-x-4">
            <Calendar className="w-5 h-5 text-gray-500" />
            <div className="flex space-x-2">
              {['day', 'week', 'month', 'year'].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                    timeRange === range
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {range === 'day' ? 'Giorno' : range === 'week' ? 'Settimana' : range === 'month' ? 'Mese' : 'Anno'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200"
            >
              <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${stat.color} mb-4`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
              <p className="text-sm text-gray-500 mb-2">{stat.label}</p>
              <div className="flex items-center space-x-1">
                {stat.isPositive ? (
                  <TrendingUp className="w-4 h-4 text-green-600" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-600" />
                )}
                <span className={`text-sm font-semibold ${stat.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.change}
                </span>
                <span className="text-sm text-gray-500">vs periodo precedente</span>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Revenue by Period */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Fatturato per Periodo</h3>
              <BarChart3 className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              {revenueByPeriod.map((item, index) => (
                <div key={item.period} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-white rounded-lg">
                      <item.icon className="w-5 h-5 text-orange-600" />
                    </div>
                    <span className="font-semibold text-gray-900">{item.period}</span>
                  </div>
                  <span className="text-xl font-bold text-gray-900">€{item.value.toFixed(2)}</span>
                </div>
              ))}
            </div>
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
              <PieChart className="w-5 h-5 text-gray-400" />
            </div>
            {topProducts.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Nessun dato disponibile</p>
            ) : (
              <div className="space-y-3">
                {topProducts.map((product, index) => (
                  <div key={product.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{product.name}</p>
                        <p className="text-xs text-gray-500">{product.quantity} venduti</p>
                      </div>
                    </div>
                    <span className="font-bold text-gray-900">€{product.revenue.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* Sales Chart Placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Andamento Vendite</h3>
            <Activity className="w-5 h-5 text-gray-400" />
          </div>
          <div className="h-64 flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl">
            <div className="text-center">
              <BarChart3 className="w-16 h-16 text-orange-300 mx-auto mb-4" />
              <p className="text-gray-600 font-semibold">Grafico delle vendite</p>
              <p className="text-sm text-gray-500">Integrare libreria di grafici (es. Chart.js, Recharts)</p>
            </div>
          </div>
        </motion.div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white"
          >
            <ShoppingBag className="w-12 h-12 mb-4 opacity-80" />
            <h3 className="text-3xl font-bold mb-2">{totalOrders}</h3>
            <p className="text-blue-100">Ordini Totali</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white"
          >
            <DollarSign className="w-12 h-12 mb-4 opacity-80" />
            <h3 className="text-3xl font-bold mb-2">€{totalRevenue.toFixed(2)}</h3>
            <p className="text-green-100">Fatturato Totale</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white"
          >
            <Users className="w-12 h-12 mb-4 opacity-80" />
            <h3 className="text-3xl font-bold mb-2">{new Set(orders.map(o => o.customerName)).size}</h3>
            <p className="text-purple-100">Clienti Unici</p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default AdminReportsPage
