import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Search, Filter, Eye, X, CheckCircle, Clock, XCircle, Package
} from 'lucide-react'
import { useOrders } from '../../context/OrdersContext'

function AdminOrdersPage() {
  const navigate = useNavigate()
  const { orders } = useOrders()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedOrder, setSelectedOrder] = useState(null)

  useEffect(() => {
    const auth = localStorage.getItem('adminAuth')
    if (!auth) navigate('/login')
  }, [navigate])

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderNumber.toString().includes(searchTerm) ||
                         order.customerName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700'
      case 'preparing': return 'bg-blue-100 text-blue-700'
      case 'ready': return 'bg-green-100 text-green-700'
      case 'delivered': return 'bg-gray-100 text-gray-700'
      case 'cancelled': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusIcon = (status) => {
    switch(status) {
      case 'pending': return Clock
      case 'preparing': return Package
      case 'ready': return CheckCircle
      case 'delivered': return CheckCircle
      case 'cancelled': return XCircle
      default: return Clock
    }
  }

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'In attesa',
      preparing: 'In preparazione',
      ready: 'Pronto',
      delivered: 'Consegnato',
      cancelled: 'Annullato'
    }
    return labels[status] || 'In attesa'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button onClick={() => navigate('/admin/dashboard')} className="p-2 hover:bg-gray-100 rounded-lg">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-bold text-gray-900">Gestione Ordini</h2>
          </div>
          <p className="text-sm text-gray-500">
            {filteredOrders.length} {filteredOrders.length === 1 ? 'ordine trovato' : 'ordini trovati'}
          </p>
        </div>
      </header>

      <div className="p-6">
        {/* Filters */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cerca per numero ordine o cliente..."
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none appearance-none bg-white"
              >
                <option value="all">Tutti gli stati</option>
                <option value="pending">In attesa</option>
                <option value="preparing">In preparazione</option>
                <option value="ready">Pronto</option>
                <option value="delivered">Consegnato</option>
                <option value="cancelled">Annullato</option>
              </select>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-200">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Nessun ordine trovato</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Ordine #</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Cliente</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Articoli</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Totale</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Stato</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Data</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Azioni</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => {
                    const StatusIcon = getStatusIcon(order.status || 'pending')
                    return (
                      <tr key={order.orderNumber} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-6">
                          <span className="font-mono font-semibold text-blue-600">
                            #{order.orderNumber}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div>
                            <p className="font-medium text-gray-900">{order.customerName}</p>
                            <p className="text-sm text-gray-500">{order.orderType}</p>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-gray-700">{order.items?.length || 0} items</span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="font-bold text-lg text-gray-900">
                            €{order.total.toFixed(2)}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status || 'pending')}`}>
                            <StatusIcon className="w-3 h-3" />
                            <span>{getStatusLabel(order.status)}</span>
                          </span>
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString('it-IT', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                        <td className="py-4 px-6">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="p-2 hover:bg-blue-50 rounded-lg text-blue-600"
                            title="Visualizza dettagli"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-2xl font-bold">Ordine #{selectedOrder.orderNumber}</h3>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Customer Info */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Cliente</h4>
                  <p className="text-gray-700">{selectedOrder.customerName}</p>
                  <p className="text-sm text-gray-500 mt-1">{selectedOrder.orderType}</p>
                </div>

                {/* Items */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Articoli</h4>
                  <div className="space-y-2">
                    {selectedOrder.items?.map((item, index) => (
                      <div key={index} className="flex justify-between items-start py-2 border-b border-gray-100">
                        <div className="flex-1">
                          <p className="font-medium">{item.title || item.name}</p>
                          <p className="text-sm text-gray-500">Quantità: {item.quantity}</p>
                        </div>
                        <p className="font-semibold">€{(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Totals */}
                <div className="border-t pt-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotale</span>
                      <span className="font-semibold">€{selectedOrder.subtotal.toFixed(2)}</span>
                    </div>
                    {selectedOrder.loyaltyDiscount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Sconto Loyalty</span>
                        <span>-€{selectedOrder.loyaltyDiscount.toFixed(2)}</span>
                      </div>
                    )}
                    {selectedOrder.couponDiscount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Coupon</span>
                        <span>-€{selectedOrder.couponDiscount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-xl font-bold pt-2 border-t">
                      <span>Totale</span>
                      <span>€{selectedOrder.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default AdminOrdersPage
