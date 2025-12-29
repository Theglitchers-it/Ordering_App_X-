import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Users,
  Download,
  Calendar,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Store,
  Package,
  Filter
} from 'lucide-react'
import AdminLayoutNew from '../../components/admin/AdminLayoutNew'
import { useRBAC } from '../../context/RBACContext'
import { PERMISSIONS } from '../../context/RBACContext'
import { useOrders } from '../../context/OrdersContext'

const AdminReportsPageNew = () => {
  const { hasPermission } = useRBAC()
  const { orders } = useOrders()
  const [timeRange, setTimeRange] = useState('month') // today, week, month, year
  const [reportType, setReportType] = useState('overview') // overview, products, merchants, customers
  const [filteredOrders, setFilteredOrders] = useState([])

  // Check permission
  useEffect(() => {
    if (!hasPermission(PERMISSIONS.VIEW_REPORTS)) {
      alert('Non hai il permesso di visualizzare i report')
      window.location.href = '/admin/dashboard'
    }
  }, [hasPermission])

  // Filter orders based on time range
  useEffect(() => {
    const now = new Date()
    let startDate = new Date()

    switch (timeRange) {
      case 'today':
        startDate.setHours(0, 0, 0, 0)
        break
      case 'week':
        startDate.setDate(now.getDate() - 7)
        break
      case 'month':
        startDate.setMonth(now.getMonth() - 1)
        break
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1)
        break
      default:
        startDate.setMonth(now.getMonth() - 1)
    }

    const filtered = orders.filter(order => {
      const orderDate = new Date(order.timestamp)
      return orderDate >= startDate
    })

    setFilteredOrders(filtered)
  }, [timeRange, orders])

  // Calculate metrics
  const totalRevenue = filteredOrders.reduce((sum, order) => sum + order.total, 0)
  const totalOrders = filteredOrders.length
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0
  const totalCustomers = new Set(filteredOrders.map(o => o.userId)).size

  const completedOrders = filteredOrders.filter(o => o.status === 'delivered')
  const cancelledOrders = filteredOrders.filter(o => o.status === 'cancelled')
  const completionRate = totalOrders > 0 ? (completedOrders.length / totalOrders * 100) : 0
  const cancellationRate = totalOrders > 0 ? (cancelledOrders.length / totalOrders * 100) : 0

  // Revenue by day (last 7 days for chart placeholder)
  const getLast7Days = () => {
    const days = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      days.push({
        date: date.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' }),
        revenue: 0,
        orders: 0
      })
    }
    return days
  }

  const revenueByDay = getLast7Days()
  filteredOrders.forEach(order => {
    const orderDate = new Date(order.timestamp)
    const dateStr = orderDate.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' })
    const dayData = revenueByDay.find(d => d.date === dateStr)
    if (dayData) {
      dayData.revenue += order.total
      dayData.orders += 1
    }
  })

  // Top products
  const productSales = {}
  filteredOrders.forEach(order => {
    order.items.forEach(item => {
      if (!productSales[item.name]) {
        productSales[item.name] = {
          name: item.name,
          quantity: 0,
          revenue: 0
        }
      }
      productSales[item.name].quantity += item.quantity
      productSales[item.name].revenue += item.price * item.quantity
    })
  })

  const topProducts = Object.values(productSales)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10)

  // Revenue by merchant
  const merchantRevenue = {}
  filteredOrders.forEach(order => {
    const merchantName = order.restaurant || 'N/A'
    if (!merchantRevenue[merchantName]) {
      merchantRevenue[merchantName] = {
        name: merchantName,
        revenue: 0,
        orders: 0
      }
    }
    merchantRevenue[merchantName].revenue += order.total
    merchantRevenue[merchantName].orders += 1
  })

  const topMerchants = Object.values(merchantRevenue)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10)

  // Top customers
  const customerSpending = {}
  filteredOrders.forEach(order => {
    const customerName = order.userName || `User ${order.userId}`
    if (!customerSpending[customerName]) {
      customerSpending[customerName] = {
        name: customerName,
        spent: 0,
        orders: 0
      }
    }
    customerSpending[customerName].spent += order.total
    customerSpending[customerName].orders += 1
  })

  const topCustomers = Object.values(customerSpending)
    .sort((a, b) => b.spent - a.spent)
    .slice(0, 10)

  // Export to CSV
  const exportToCSV = () => {
    if (!hasPermission(PERMISSIONS.EXPORT_REPORTS)) {
      alert('Non hai il permesso di esportare report')
      return
    }

    let csvContent = ''
    let filename = ''

    if (reportType === 'overview') {
      csvContent = 'Metric,Value\n'
      csvContent += `Total Revenue,€${totalRevenue.toFixed(2)}\n`
      csvContent += `Total Orders,${totalOrders}\n`
      csvContent += `Avg Order Value,€${avgOrderValue.toFixed(2)}\n`
      csvContent += `Total Customers,${totalCustomers}\n`
      csvContent += `Completion Rate,${completionRate.toFixed(2)}%\n`
      csvContent += `Cancellation Rate,${cancellationRate.toFixed(2)}%\n`
      filename = 'overview_report.csv'
    } else if (reportType === 'products') {
      csvContent = 'Product,Quantity,Revenue\n'
      topProducts.forEach(p => {
        csvContent += `${p.name},${p.quantity},€${p.revenue.toFixed(2)}\n`
      })
      filename = 'products_report.csv'
    } else if (reportType === 'merchants') {
      csvContent = 'Merchant,Orders,Revenue\n'
      topMerchants.forEach(m => {
        csvContent += `${m.name},${m.orders},€${m.revenue.toFixed(2)}\n`
      })
      filename = 'merchants_report.csv'
    } else if (reportType === 'customers') {
      csvContent = 'Customer,Orders,Spent\n'
      topCustomers.forEach(c => {
        csvContent += `${c.name},${c.orders},€${c.spent.toFixed(2)}\n`
      })
      filename = 'customers_report.csv'
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = filename
    link.click()
  }

  return (
    <AdminLayoutNew>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Report & Analytics</h1>
            <p className="text-gray-600 mt-1">Analizza le performance del tuo business</p>
          </div>

          <div className="flex flex-wrap gap-3">
            {/* Time Range Selector */}
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="today">Oggi</option>
              <option value="week">Ultimi 7 giorni</option>
              <option value="month">Ultimo mese</option>
              <option value="year">Ultimo anno</option>
            </select>

            {/* Report Type Selector */}
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="overview">Panoramica</option>
              <option value="products">Prodotti</option>
              <option value="merchants">Ristoranti</option>
              <option value="customers">Clienti</option>
            </select>

            {/* Export Button */}
            {hasPermission(PERMISSIONS.EXPORT_REPORTS) && (
              <button
                onClick={exportToCSV}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 transition-colors"
              >
                <Download className="w-4 h-4" />
                Esporta CSV
              </button>
            )}
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Fatturato Totale</p>
                <h3 className="text-3xl font-bold mt-2">€{totalRevenue.toFixed(2)}</h3>
              </div>
              <DollarSign className="w-12 h-12 text-blue-200" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Ordini Totali</p>
                <h3 className="text-3xl font-bold mt-2">{totalOrders}</h3>
              </div>
              <ShoppingBag className="w-12 h-12 text-green-200" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Valore Medio Ordine</p>
                <h3 className="text-3xl font-bold mt-2">€{avgOrderValue.toFixed(2)}</h3>
              </div>
              <TrendingUp className="w-12 h-12 text-orange-200" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Clienti Unici</p>
                <h3 className="text-3xl font-bold mt-2">{totalCustomers}</h3>
              </div>
              <Users className="w-12 h-12 text-purple-200" />
            </div>
          </motion.div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-md p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <BarChart3 className="w-6 h-6 text-orange-600" />
              <h3 className="text-lg font-semibold text-gray-900">Tasso di Completamento</h3>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Ordini Completati</span>
                  <span className="font-semibold text-green-600">{completionRate.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all"
                    style={{ width: `${completionRate}%` }}
                  />
                </div>
                <p className="text-sm text-gray-500 mt-1">{completedOrders.length} / {totalOrders} ordini</p>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Ordini Cancellati</span>
                  <span className="font-semibold text-red-600">{cancellationRate.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-red-500 to-red-600 h-3 rounded-full transition-all"
                    style={{ width: `${cancellationRate}%` }}
                  />
                </div>
                <p className="text-sm text-gray-500 mt-1">{cancelledOrders.length} / {totalOrders} ordini</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-xl shadow-md p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <PieChart className="w-6 h-6 text-orange-600" />
              <h3 className="text-lg font-semibold text-gray-900">Fatturato Ultimi 7 Giorni</h3>
            </div>
            <div className="space-y-2">
              {revenueByDay.map((day, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{day.date}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-orange-500 to-orange-600 h-2 rounded-full"
                        style={{
                          width: `${Math.min(100, (day.revenue / Math.max(...revenueByDay.map(d => d.revenue))) * 100)}%`
                        }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-gray-900 w-16 text-right">
                      €{day.revenue.toFixed(0)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Report Content Based on Type */}
        {reportType === 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-xl shadow-md p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Riepilogo Generale</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="border border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Fatturato Totale</p>
                <p className="text-2xl font-bold text-gray-900">€{totalRevenue.toFixed(2)}</p>
                <div className="flex items-center gap-1 mt-2 text-green-600 text-sm">
                  <ArrowUpRight className="w-4 h-4" />
                  <span>+12.5% vs periodo precedente</span>
                </div>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Ordini Completati</p>
                <p className="text-2xl font-bold text-gray-900">{completedOrders.length}</p>
                <div className="flex items-center gap-1 mt-2 text-green-600 text-sm">
                  <ArrowUpRight className="w-4 h-4" />
                  <span>+8.3% vs periodo precedente</span>
                </div>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Nuovi Clienti</p>
                <p className="text-2xl font-bold text-gray-900">{totalCustomers}</p>
                <div className="flex items-center gap-1 mt-2 text-red-600 text-sm">
                  <ArrowDownRight className="w-4 h-4" />
                  <span>-2.1% vs periodo precedente</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {reportType === 'products' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-xl shadow-md overflow-hidden"
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <Package className="w-6 h-6 text-orange-600" />
                <h3 className="text-lg font-semibold text-gray-900">Top 10 Prodotti per Fatturato</h3>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prodotto</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantità</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fatturato</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {topProducts.map((product, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">{index + 1}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{product.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{product.quantity}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-green-600">€{product.revenue.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {reportType === 'merchants' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-xl shadow-md overflow-hidden"
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <Store className="w-6 h-6 text-orange-600" />
                <h3 className="text-lg font-semibold text-gray-900">Top 10 Ristoranti per Fatturato</h3>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ristorante</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ordini</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fatturato</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {topMerchants.map((merchant, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">{index + 1}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{merchant.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{merchant.orders}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-green-600">€{merchant.revenue.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {reportType === 'customers' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-xl shadow-md overflow-hidden"
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <Users className="w-6 h-6 text-orange-600" />
                <h3 className="text-lg font-semibold text-gray-900">Top 10 Clienti per Spesa</h3>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ordini</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Spesa Totale</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {topCustomers.map((customer, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">{index + 1}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{customer.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{customer.orders}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-green-600">€{customer.spent.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </div>
    </AdminLayoutNew>
  )
}

export default AdminReportsPageNew
