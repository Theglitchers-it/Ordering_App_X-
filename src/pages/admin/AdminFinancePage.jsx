import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  DollarSign, TrendingUp, TrendingDown, CreditCard, Download,
  RefreshCw, CheckCircle, XCircle, Clock, Filter, Calendar
} from 'lucide-react'
import { useOrders } from '../../context/OrdersContext'
import { useRBAC, PERMISSIONS } from '../../context/RBACContext'
import AdminLayoutNew from '../../components/admin/AdminLayoutNew'

function AdminFinancePage() {
  const navigate = useNavigate()
  const { orders } = useOrders()
  const { hasPermission } = useRBAC()
  const [timeRange, setTimeRange] = useState('month')
  const [transactions, setTransactions] = useState([])

  useEffect(() => {
    const auth = localStorage.getItem('adminAuth')
    if (!auth) navigate('/login')

    if (!hasPermission(PERMISSIONS.VIEW_FINANCE)) {
      navigate('/admin/dashboard')
    }

    loadTransactions()
  }, [navigate, hasPermission])

  const loadTransactions = () => {
    const saved = localStorage.getItem('transactions')
    if (saved) {
      setTransactions(JSON.parse(saved))
    } else {
      // Demo transactions
      const demoTransactions = [
        {
          id: 1,
          type: 'sale',
          amount: 45.50,
          status: 'completed',
          orderNumber: 1001,
          customer: 'Mario Rossi',
          merchant: 'Pizzeria Da Mario',
          commission: 6.83,
          netAmount: 38.67,
          paymentMethod: 'card',
          date: new Date('2024-03-20T14:30:00').toISOString()
        },
        {
          id: 2,
          type: 'refund',
          amount: -25.00,
          status: 'completed',
          orderNumber: 998,
          customer: 'Luigi Bianchi',
          merchant: 'Sushi Express',
          commission: 0,
          netAmount: -25.00,
          paymentMethod: 'card',
          date: new Date('2024-03-19T16:45:00').toISOString()
        },
        {
          id: 3,
          type: 'payout',
          amount: -1250.00,
          status: 'pending',
          merchant: 'Pizzeria Da Mario',
          commission: 0,
          netAmount: -1250.00,
          paymentMethod: 'bank_transfer',
          date: new Date('2024-03-18T10:00:00').toISOString()
        },
        {
          id: 4,
          type: 'sale',
          amount: 78.90,
          status: 'completed',
          orderNumber: 1002,
          customer: 'Anna Verdi',
          merchant: 'Burger House',
          commission: 9.47,
          netAmount: 69.43,
          paymentMethod: 'paypal',
          date: new Date('2024-03-20T19:20:00').toISOString()
        }
      ]
      setTransactions(demoTransactions)
      localStorage.setItem('transactions', JSON.stringify(demoTransactions))
    }
  }

  // Calculate financial KPIs
  const now = new Date()
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  const filterTransactionsByDate = (startDate) => {
    return transactions.filter(t => new Date(t.date) >= startDate)
  }

  const currentTransactions = timeRange === 'week' ? filterTransactionsByDate(weekAgo) : filterTransactionsByDate(monthAgo)

  const totalRevenue = currentTransactions
    .filter(t => t.type === 'sale' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0)

  const totalRefunds = Math.abs(currentTransactions
    .filter(t => t.type === 'refund' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0))

  const totalCommissions = currentTransactions
    .filter(t => t.type === 'sale' && t.status === 'completed')
    .reduce((sum, t) => sum + t.commission, 0)

  const totalPayouts = Math.abs(currentTransactions
    .filter(t => t.type === 'payout' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0))

  const pendingPayouts = Math.abs(transactions
    .filter(t => t.type === 'payout' && t.status === 'pending')
    .reduce((sum, t) => sum + t.amount, 0))

  const netProfit = totalRevenue - totalRefunds - totalPayouts

  // KPI Cards
  const kpis = [
    {
      label: 'Fatturato Lordo',
      value: `€${totalRevenue.toFixed(2)}`,
      change: 12.5,
      isPositive: true,
      icon: DollarSign,
      color: 'from-green-500 to-green-600'
    },
    {
      label: 'Commissioni',
      value: `€${totalCommissions.toFixed(2)}`,
      change: 8.3,
      isPositive: true,
      icon: TrendingUp,
      color: 'from-blue-500 to-blue-600'
    },
    {
      label: 'Rimborsi',
      value: `€${totalRefunds.toFixed(2)}`,
      change: -5.2,
      isPositive: false,
      icon: RefreshCw,
      color: 'from-red-500 to-red-600'
    },
    {
      label: 'Payout Pendenti',
      value: `€${pendingPayouts.toFixed(2)}`,
      change: 0,
      isPositive: true,
      icon: Clock,
      color: 'from-yellow-500 to-yellow-600'
    }
  ]

  const getTransactionIcon = (type) => {
    switch(type) {
      case 'sale': return DollarSign
      case 'refund': return RefreshCw
      case 'payout': return Download
      default: return CreditCard
    }
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'completed': return 'bg-green-100 text-green-700'
      case 'pending': return 'bg-yellow-100 text-yellow-700'
      case 'failed': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getTypeLabel = (type) => {
    const labels = {
      sale: 'Vendita',
      refund: 'Rimborso',
      payout: 'Payout'
    }
    return labels[type] || type
  }

  const getStatusLabel = (status) => {
    const labels = {
      completed: 'Completato',
      pending: 'In attesa',
      failed: 'Fallito'
    }
    return labels[status] || status
  }

  const handleProcessPayout = (id) => {
    if (!hasPermission(PERMISSIONS.MANAGE_PAYOUTS)) {
      alert('Non hai il permesso di processare i payout')
      return
    }

    const updated = transactions.map(t =>
      t.id === id && t.status === 'pending' ? { ...t, status: 'completed' } : t
    )
    setTransactions(updated)
    localStorage.setItem('transactions', JSON.stringify(updated))
  }

  const handleExport = () => {
    if (!hasPermission(PERMISSIONS.EXPORT_REPORTS)) {
      alert('Non hai il permesso di esportare i report')
      return
    }
    alert('Funzionalità di export CSV in arrivo!')
  }

  return (
    <AdminLayoutNew>
      {/* Page Header */}
      <div className="mb-4 md:mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Finanza & Pagamenti</h1>
            <p className="text-sm md:text-base text-gray-500 mt-1">Gestisci transazioni, payout e report finanziari</p>
          </div>
          {hasPermission(PERMISSIONS.EXPORT_REPORTS) && (
            <button
              onClick={handleExport}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-3 md:px-4 py-2 rounded-lg hover:shadow-lg transition-all text-sm md:text-base w-full sm:w-auto"
            >
              <Download className="w-4 h-4 md:w-5 md:h-5" />
              <span>Esporta CSV</span>
            </button>
          )}
        </div>
      </div>

      {/* Time Range Selector */}
      <div className="bg-white rounded-xl md:rounded-2xl p-3 md:p-4 shadow-sm border border-gray-200 mb-4 md:mb-6">
        <div className="grid grid-cols-3 gap-2">
          {[
            { value: 'week', label: 'Ultimi 7 giorni', shortLabel: '7 giorni' },
            { value: 'month', label: 'Ultimi 30 giorni', shortLabel: '30 giorni' },
            { value: 'year', label: 'Anno corrente', shortLabel: 'Anno' }
          ].map((range) => (
            <button
              key={range.value}
              onClick={() => setTimeRange(range.value)}
              className={`px-2 md:px-4 py-2 rounded-lg font-semibold transition-colors text-xs md:text-sm ${
                timeRange === range.value
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span className="hidden sm:inline">{range.label}</span>
              <span className="inline sm:hidden">{range.shortLabel}</span>
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-4 md:mb-6">
        {kpis.map((kpi, index) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-sm border border-gray-200"
          >
            <div className={`inline-flex p-2 md:p-3 rounded-lg md:rounded-xl bg-gradient-to-br ${kpi.color} mb-3 md:mb-4`}>
              <kpi.icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">{kpi.value}</h3>
            <p className="text-xs md:text-sm text-gray-500 mb-2">{kpi.label}</p>
            {kpi.change !== 0 && (
              <div className="flex items-center gap-1">
                {kpi.isPositive ? (
                  <TrendingUp className="w-3 h-3 md:w-4 md:h-4 text-green-600" />
                ) : (
                  <TrendingDown className="w-3 h-3 md:w-4 md:h-4 text-red-600" />
                )}
                <span className={`text-xs md:text-sm font-semibold ${kpi.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  {kpi.change > 0 ? '+' : ''}{kpi.change}%
                </span>
                <span className="text-xs md:text-sm text-gray-500 hidden sm:inline">vs periodo prec.</span>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Net Profit Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl md:rounded-2xl p-4 md:p-6 shadow-lg mb-4 md:mb-6 text-white"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm md:text-base text-purple-100 mb-1">Profitto Netto</p>
            <h2 className="text-3xl md:text-4xl font-bold">€{netProfit.toFixed(2)}</h2>
          </div>
          <TrendingUp className="w-12 h-12 md:w-16 md:h-16 text-purple-200 opacity-50" />
        </div>
      </motion.div>

      {/* Transactions Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-sm border border-gray-200 mb-3 lg:mb-0">
          <h3 className="text-lg md:text-xl font-bold text-gray-900">Transazioni Recenti</h3>
        </div>

        {/* Mobile Cards */}
        <div className="block lg:hidden space-y-3 mt-3">
          {transactions.map((transaction) => {
            const TypeIcon = getTransactionIcon(transaction.type)
            return (
              <div key={transaction.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Card Header */}
                <div className="p-3 bg-gray-50 border-b flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TypeIcon className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-bold text-gray-900">#{transaction.id}</span>
                    <span className="text-xs font-medium text-gray-600">{getTypeLabel(transaction.type)}</span>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(transaction.status)}`}>
                    {getStatusLabel(transaction.status)}
                  </span>
                </div>

                {/* Card Body */}
                <div className="p-3 space-y-2">
                  {transaction.orderNumber && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-500 uppercase">Ordine</span>
                      <span className="text-sm font-semibold text-gray-900">#{transaction.orderNumber}</span>
                    </div>
                  )}

                  {transaction.customer && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-500 uppercase">Cliente</span>
                      <span className="text-sm text-gray-900">{transaction.customer}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-500 uppercase">Merchant</span>
                    <span className="text-sm text-gray-900">{transaction.merchant}</span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="text-xs font-medium text-gray-500 uppercase">Importo</span>
                    <span className={`text-lg font-bold ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      €{Math.abs(transaction.amount).toFixed(2)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-gray-500">Commissione</p>
                      <p className="font-semibold text-gray-900">€{transaction.commission.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Netto</p>
                      <p className="font-semibold text-gray-900">€{Math.abs(transaction.netAmount).toFixed(2)}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t text-xs text-gray-500">
                    <span>{new Date(transaction.date).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
                    <span>{new Date(transaction.date).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>

                  {transaction.type === 'payout' && transaction.status === 'pending' && hasPermission(PERMISSIONS.MANAGE_PAYOUTS) && (
                    <button
                      onClick={() => handleProcessPayout(transaction.id)}
                      className="w-full mt-2 px-3 py-2 bg-green-50 text-green-700 rounded-lg text-sm font-semibold hover:bg-green-100"
                    >
                      Processa Payout
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Desktop Table */}
        <div className="hidden lg:block bg-white rounded-xl md:rounded-2xl shadow-sm border border-gray-200 overflow-hidden mt-3">
          <div className="overflow-x-auto">
            <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">ID</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Tipo</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Dettagli</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Importo</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Commissione</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Netto</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Stato</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Data</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Azioni</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => {
                const TypeIcon = getTransactionIcon(transaction.type)
                return (
                  <tr key={transaction.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-6 font-mono text-sm text-gray-600">#{transaction.id}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <TypeIcon className="w-4 h-4 text-gray-600" />
                        <span className="text-sm font-medium">{getTypeLabel(transaction.type)}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div>
                        {transaction.orderNumber && (
                          <p className="text-sm font-medium text-gray-900">Ordine #{transaction.orderNumber}</p>
                        )}
                        {transaction.customer && (
                          <p className="text-xs text-gray-500">{transaction.customer}</p>
                        )}
                        <p className="text-xs text-gray-500">{transaction.merchant}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`font-bold ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        €{Math.abs(transaction.amount).toFixed(2)}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600">
                      €{transaction.commission.toFixed(2)}
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-semibold text-gray-900">
                        €{Math.abs(transaction.netAmount).toFixed(2)}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(transaction.status)}`}>
                        {getStatusLabel(transaction.status)}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600">
                      {new Date(transaction.date).toLocaleDateString('it-IT', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="py-4 px-6">
                      {transaction.type === 'payout' && transaction.status === 'pending' && hasPermission(PERMISSIONS.MANAGE_PAYOUTS) && (
                        <button
                          onClick={() => handleProcessPayout(transaction.id)}
                          className="text-sm text-green-600 hover:text-green-700 font-semibold"
                        >
                          Processa
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          </div>
        </div>
      </motion.div>
    </AdminLayoutNew>
  )
}

export default AdminFinancePage
