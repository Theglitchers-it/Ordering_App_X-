import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Filter, Eye, X, CheckCircle, Clock, XCircle, Package,
  Edit, Trash2, Download, RefreshCw, Truck, MapPin, Phone, Mail
} from 'lucide-react'
import { useOrders } from '../../context/OrdersContext'
import { useRBAC, PERMISSIONS } from '../../context/RBACContext'
import AdminLayoutNew from '../../components/admin/AdminLayoutNew'

function AdminOrdersPageNew() {
  const navigate = useNavigate()
  const { orders, updateOrderStatus, deleteOrder } = useOrders()
  const { hasPermission } = useRBAC()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedOrders, setSelectedOrders] = useState([])
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    const auth = localStorage.getItem('adminAuth')
    if (!auth) navigate('/login')

    if (!hasPermission(PERMISSIONS.VIEW_ORDERS)) {
      navigate('/admin/dashboard')
    }
  }, [navigate, hasPermission])

  const filteredOrders = orders.filter(order => {
    const matchesSearch =
      order.orderNumber.toString().includes(searchTerm) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

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

  const getStatusIcon = (status) => {
    switch(status) {
      case 'pending': return Clock
      case 'preparing': return Package
      case 'ready': return CheckCircle
      case 'delivered': return Truck
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

  const handleStatusChange = (orderId, newStatus) => {
    if (!hasPermission(PERMISSIONS.UPDATE_ORDERS)) {
      alert('Non hai il permesso di modificare gli ordini')
      return
    }

    if (updateOrderStatus) {
      updateOrderStatus(orderId, newStatus)
    } else {
      // Fallback se updateOrderStatus non esiste nel context
      const order = orders.find(o => o.orderNumber === orderId)
      if (order) {
        order.status = newStatus
        localStorage.setItem('orders', JSON.stringify(orders))
        window.location.reload()
      }
    }
  }

  const handleDelete = (orderId) => {
    if (!hasPermission(PERMISSIONS.DELETE_ORDERS)) {
      alert('Non hai il permesso di eliminare gli ordini')
      return
    }

    if (confirm('Sei sicuro di voler eliminare questo ordine?')) {
      if (deleteOrder) {
        deleteOrder(orderId)
      }
    }
  }

  const handleBulkStatusChange = (newStatus) => {
    if (!hasPermission(PERMISSIONS.UPDATE_ORDERS)) {
      alert('Non hai il permesso di modificare gli ordini')
      return
    }

    selectedOrders.forEach(orderId => {
      handleStatusChange(orderId, newStatus)
    })
    setSelectedOrders([])
  }

  const handleRefund = (order) => {
    if (!hasPermission(PERMISSIONS.REFUND_ORDERS)) {
      alert('Non hai il permesso di effettuare rimborsi')
      return
    }

    if (confirm(`Confermi il rimborso di €${order.total.toFixed(2)} per l'ordine #${order.orderNumber}?`)) {
      alert('Rimborso processato con successo!')
      handleStatusChange(order.orderNumber, 'cancelled')
    }
  }

  const toggleOrderSelection = (orderId) => {
    setSelectedOrders(prev =>
      prev.includes(orderId)
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    )
  }

  const handleExport = () => {
    alert('Export CSV in arrivo! Feature in sviluppo.')
  }

  return (
    <AdminLayoutNew>
      {/* Page Header - Mobile Optimized */}
      <div className="mb-4 md:mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Gestione Ordini</h1>
            <p className="text-sm md:text-base text-gray-500 mt-1">
              {filteredOrders.length} {filteredOrders.length === 1 ? 'ordine trovato' : 'ordini trovati'}
            </p>
          </div>
          <button
            onClick={handleExport}
            className="flex items-center justify-center space-x-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all w-full sm:w-auto"
          >
            <Download className="w-5 h-5" />
            <span>Esporta CSV</span>
          </button>
        </div>
      </div>

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
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none appearance-none bg-white"
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

      {/* Bulk Actions - Mobile Optimized */}
      {selectedOrders.length > 0 && hasPermission(PERMISSIONS.UPDATE_ORDERS) && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-orange-50 border border-orange-200 rounded-2xl p-4 mb-4 md:mb-6"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
            <p className="text-orange-900 font-semibold text-sm md:text-base">
              {selectedOrders.length} {selectedOrders.length === 1 ? 'ordine selezionato' : 'ordini selezionati'}
            </p>
            <div className="grid grid-cols-2 lg:flex lg:items-center gap-2">
              <button
                onClick={() => handleBulkStatusChange('preparing')}
                className="px-3 py-2 bg-blue-500 text-white rounded-lg text-xs md:text-sm hover:bg-blue-600 whitespace-nowrap"
              >
                In Prep.
              </button>
              <button
                onClick={() => handleBulkStatusChange('ready')}
                className="px-3 py-2 bg-green-500 text-white rounded-lg text-xs md:text-sm hover:bg-green-600 whitespace-nowrap"
              >
                Pronto
              </button>
              <button
                onClick={() => handleBulkStatusChange('delivered')}
                className="px-3 py-2 bg-gray-500 text-white rounded-lg text-xs md:text-sm hover:bg-gray-600 whitespace-nowrap"
              >
                Consegnato
              </button>
              <button
                onClick={() => setSelectedOrders([])}
                className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg text-xs md:text-sm hover:bg-gray-300 whitespace-nowrap"
              >
                Annulla
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Orders - Mobile Cards / Desktop Table */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-200">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Nessun ordine trovato</p>
        </div>
      ) : (
        <>
          {/* Mobile View - Cards */}
          <div className="block lg:hidden space-y-3">
            {filteredOrders.map((order, index) => {
              const StatusIcon = getStatusIcon(order.status)
              return (
                <motion.div
                  key={order.orderNumber}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                >
                  {/* Card Header */}
                  <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                    <div className="flex items-center gap-3">
                      {hasPermission(PERMISSIONS.UPDATE_ORDERS) && (
                        <input
                          type="checkbox"
                          checked={selectedOrders.includes(order.orderNumber)}
                          onChange={() => toggleOrderSelection(order.orderNumber)}
                          className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                        />
                      )}
                      <div>
                        <p className="font-bold text-gray-900">#{order.orderNumber}</p>
                        <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleString('it-IT')}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)} flex items-center gap-1`}>
                      <StatusIcon className="w-3 h-3" />
                      {getStatusLabel(order.status)}
                    </span>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 space-y-3">
                    {/* Customer */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-500 uppercase">Cliente</span>
                      <span className="text-sm font-semibold text-gray-900">{order.customerName}</span>
                    </div>

                    {/* Items */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-500 uppercase">Articoli</span>
                      <span className="text-sm text-gray-900">{order.items?.length || 0} items</span>
                    </div>

                    {/* Total */}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                      <span className="text-xs font-medium text-gray-500 uppercase">Totale</span>
                      <span className="text-lg font-bold text-orange-600">€{order.total.toFixed(2)}</span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-2">
                      <button
                        onClick={() => {
                          setSelectedOrder(order)
                          setShowModal(true)
                        }}
                        className="flex-1 px-3 py-2 bg-orange-50 text-orange-600 rounded-lg text-sm font-medium hover:bg-orange-100 flex items-center justify-center gap-1"
                      >
                        <Eye className="w-4 h-4" />
                        Dettagli
                      </button>

                      {hasPermission(PERMISSIONS.UPDATE_ORDERS) && (
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.orderNumber, e.target.value)}
                          className="flex-1 px-2 py-2 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        >
                          <option value="pending">In attesa</option>
                          <option value="preparing">In preparazione</option>
                          <option value="ready">Pronto</option>
                          <option value="delivered">Consegnato</option>
                          <option value="cancelled">Annullato</option>
                        </select>
                      )}
                    </div>

                    {/* Refund Button */}
                    {hasPermission(PERMISSIONS.REFUND_ORDERS) && order.status !== 'cancelled' && (
                      <button
                        onClick={() => handleRefund(order)}
                        className="w-full px-3 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 flex items-center justify-center gap-1"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Rimborsa Ordine
                      </button>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* Desktop View - Table */}
          <div className="hidden lg:block bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {hasPermission(PERMISSIONS.UPDATE_ORDERS) && (
                    <th className="py-4 px-6">
                      <input
                        type="checkbox"
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedOrders(filteredOrders.map(o => o.orderNumber))
                          } else {
                            setSelectedOrders([])
                          }
                        }}
                        className="w-4 h-4"
                      />
                    </th>
                  )}
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
                      {hasPermission(PERMISSIONS.UPDATE_ORDERS) && (
                        <td className="py-4 px-6">
                          <input
                            type="checkbox"
                            checked={selectedOrders.includes(order.orderNumber)}
                            onChange={() => toggleOrderSelection(order.orderNumber)}
                            className="w-4 h-4"
                          />
                        </td>
                      )}
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
                        {hasPermission(PERMISSIONS.UPDATE_ORDERS) ? (
                          <select
                            value={order.status || 'pending'}
                            onChange={(e) => handleStatusChange(order.orderNumber, e.target.value)}
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status || 'pending')} cursor-pointer`}
                          >
                            <option value="pending">In attesa</option>
                            <option value="preparing">In preparazione</option>
                            <option value="ready">Pronto</option>
                            <option value="delivered">Consegnato</option>
                            <option value="cancelled">Annullato</option>
                          </select>
                        ) : (
                          <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status || 'pending')}`}>
                            <StatusIcon className="w-3 h-3" />
                            <span>{getStatusLabel(order.status)}</span>
                          </span>
                        )}
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
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => {
                              setSelectedOrder(order)
                              setShowModal(true)
                            }}
                            className="p-2 hover:bg-blue-50 rounded-lg text-blue-600"
                            title="Visualizza"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {hasPermission(PERMISSIONS.REFUND_ORDERS) && order.status !== 'cancelled' && (
                            <button
                              onClick={() => handleRefund(order)}
                              className="p-2 hover:bg-orange-50 rounded-lg text-orange-600"
                              title="Rimborso"
                            >
                              <RefreshCw className="w-4 h-4" />
                            </button>
                          )}
                          {hasPermission(PERMISSIONS.DELETE_ORDERS) && (
                            <button
                              onClick={() => handleDelete(order.orderNumber)}
                              className="p-2 hover:bg-red-50 rounded-lg text-red-600"
                              title="Elimina"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          </div>
        </>
      )}

      {/* Order Detail Modal */}
      <AnimatePresence>
        {showModal && selectedOrder && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
                <h3 className="text-2xl font-bold">Ordine #{selectedOrder.orderNumber}</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Customer Info */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Informazioni Cliente</h4>
                  <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                    <p className="font-medium text-gray-900">{selectedOrder.customerName}</p>
                    <p className="text-sm text-gray-600">Tipo: {selectedOrder.orderType}</p>
                    {selectedOrder.deliveryAddress && (
                      <div className="flex items-start space-x-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span>{selectedOrder.deliveryAddress}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Items */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Articoli</h4>
                  <div className="space-y-2">
                    {selectedOrder.items?.map((item, index) => (
                      <div key={index} className="flex justify-between items-start py-3 px-4 bg-gray-50 rounded-xl">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{item.title || item.name}</p>
                          <p className="text-sm text-gray-500">Quantità: {item.quantity} × €{item.price.toFixed(2)}</p>
                        </div>
                        <p className="font-semibold text-gray-900">€{(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Totals */}
                <div className="border-t pt-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotale</span>
                      <span className="font-semibold">€{selectedOrder.subtotal.toFixed(2)}</span>
                    </div>
                    {selectedOrder.loyaltyDiscount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Sconto Loyalty</span>
                        <span className="font-semibold">-€{selectedOrder.loyaltyDiscount.toFixed(2)}</span>
                      </div>
                    )}
                    {selectedOrder.couponDiscount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Coupon ({selectedOrder.couponCode})</span>
                        <span className="font-semibold">-€{selectedOrder.couponDiscount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t">
                      <span>Totale</span>
                      <span>€{selectedOrder.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                {hasPermission(PERMISSIONS.REFUND_ORDERS) && selectedOrder.status !== 'cancelled' && (
                  <button
                    onClick={() => {
                      handleRefund(selectedOrder)
                      setShowModal(false)
                    }}
                    className="w-full flex items-center justify-center space-x-2 bg-red-500 text-white px-4 py-3 rounded-lg hover:bg-red-600 transition-colors"
                  >
                    <RefreshCw className="w-5 h-5" />
                    <span>Effettua Rimborso</span>
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AdminLayoutNew>
  )
}

export default AdminOrdersPageNew
