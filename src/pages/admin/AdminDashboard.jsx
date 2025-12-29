import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft, ShoppingBag, DollarSign, TrendingUp, Clock
} from 'lucide-react'
import { useOrders } from '../../context/OrdersContext'

function AdminDashboard() {
  const navigate = useNavigate()
  const { orders } = useOrders()

  useEffect(() => {
    const auth = localStorage.getItem('adminAuth')
    if (!auth) navigate('/login')
  }, [navigate])

  // Calcola statistiche
  const totalOrders = orders.length
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0)
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0
  const todayOrders = orders.filter(order => {
    const orderDate = new Date(order.createdAt)
    const today = new Date()
    return orderDate.toDateString() === today.toDateString()
  }).length

  const stats = [
    {
      label: 'Ordini Totali',
      value: totalOrders,
      icon: ShoppingBag,
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      label: 'Fatturato',
      value: `€${totalRevenue.toFixed(0)}`,
      icon: DollarSign,
      bgColor: 'bg-green-50',
      textColor: 'text-green-600'
    },
    {
      label: 'Valore Medio',
      value: `€${averageOrderValue.toFixed(0)}`,
      icon: TrendingUp,
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600'
    },
    {
      label: 'Ordini Oggi',
      value: todayOrders,
      icon: Clock,
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
          </div>
          <p className="text-sm text-gray-500">
            {new Date().toLocaleDateString('it-IT', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>
      </header>

      <div className="p-6">
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
              <div className={`inline-flex p-3 rounded-xl ${stat.bgColor} mb-4`}>
                <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</h3>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200"
        >
          <h3 className="text-xl font-bold text-gray-900 mb-6">Ordini Recenti</h3>
          {orders.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Nessun ordine presente</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Ordine #</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Cliente</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Totale</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Stato</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.slice(0, 5).map((order) => (
                    <tr
                      key={order.orderNumber}
                      onClick={() => navigate(`/admin/orders`)}
                      className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                    >
                      <td className="py-3 px-4 font-mono text-sm">#{order.orderNumber}</td>
                      <td className="py-3 px-4">{order.customerName}</td>
                      <td className="py-3 px-4 font-semibold">€{order.total.toFixed(2)}</td>
                      <td className="py-3 px-4">
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                          Completato
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString('it-IT')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}

export default AdminDashboard
