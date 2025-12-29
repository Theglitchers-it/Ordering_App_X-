import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, CheckCircle, Clock, Package, Truck, XCircle, CreditCard } from 'lucide-react'
import { useOrders } from '../context/OrdersContext'
import { useEffect } from 'react'

function NotificationsPage() {
  const navigate = useNavigate()
  const { notifications, markNotificationAsRead, clearAllNotifications } = useOrders()

  useEffect(() => {
    // Marca tutte come lette quando si apre la pagina
    return () => {
      clearAllNotifications()
    }
  }, [clearAllNotifications])

  const getStatusIcon = (status) => {
    const icons = {
      pending: Clock,
      confirmed: CheckCircle,
      preparing: Package,
      ready: CheckCircle,
      delivered: Truck,
      cancelled: XCircle
    }
    return icons[status] || Clock
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: 'text-yellow-500 bg-yellow-50',
      confirmed: 'text-green-500 bg-green-50',
      preparing: 'text-blue-500 bg-blue-50',
      ready: 'text-emerald-500 bg-emerald-50',
      delivered: 'text-gray-500 bg-gray-50',
      cancelled: 'text-red-500 bg-red-50'
    }
    return colors[status] || 'text-gray-500 bg-gray-50'
  }

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now - date
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Adesso'
    if (minutes < 60) return `${minutes}m fa`
    if (hours < 24) return `${hours}h fa`
    return `${days}g fa`
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Minimale */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-3 sm:px-6">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={() => navigate(-1)}
              className="p-1.5 sm:p-2 hover:bg-gray-50 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </motion.button>

            <motion.h1
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-base sm:text-lg font-semibold text-gray-900"
            >
              Notifiche
            </motion.h1>

            <div className="w-7 sm:w-9" />
          </div>
        </div>
      </div>

      {/* Contenuto */}
      <main className="max-w-2xl mx-auto px-3 sm:px-6 py-4 sm:py-6">
        {notifications.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100"
          >
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Nessuna notifica
            </h2>
            <p className="text-gray-500 text-sm mb-6">
              Le tue notifiche sugli ordini appariranno qui
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/')}
              className="bg-gray-900 text-white px-6 py-2.5 rounded-full font-medium text-sm hover:bg-gray-800 transition-colors"
            >
              Inizia a ordinare
            </motion.button>
          </motion.div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {notifications.map((notification, index) => {
                const StatusIcon = getStatusIcon(notification.status)
                const statusColor = getStatusColor(notification.status)

                return (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ delay: index * 0.05 }}
                    className={`bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all ${
                      !notification.read ? 'ring-2 ring-gray-900 ring-opacity-5' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-4">
                      {/* Icona Status */}
                      <div className={`flex-shrink-0 w-12 h-12 rounded-xl ${statusColor} flex items-center justify-center`}>
                        <StatusIcon className="w-6 h-6" />
                      </div>

                      {/* Contenuto */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1">
                          <h3 className="text-sm font-semibold text-gray-900">
                            {notification.title}
                          </h3>
                          <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                            {formatTime(notification.timestamp)}
                          </span>
                        </div>

                        <p className="text-sm text-gray-600 mb-3">
                          {notification.message}
                        </p>

                        {/* Info Pagamento */}
                        {notification.status === 'confirmed' && (
                          <div className="flex items-center space-x-2">
                            <CreditCard className="w-4 h-4 text-gray-400" />
                            <span className="text-xs text-gray-500">
                              {notifications.find(n => n.orderId === notification.orderId)?.isPaid !== false
                                ? 'Pagamento completato'
                                : 'Pagamento alla consegna'}
                            </span>
                          </div>
                        )}

                        {/* Badge Status */}
                        <div className="flex items-center space-x-2 mt-3">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            notification.status === 'ready'
                              ? 'bg-emerald-100 text-emerald-800'
                              : notification.status === 'confirmed'
                              ? 'bg-green-100 text-green-800'
                              : notification.status === 'preparing'
                              ? 'bg-blue-100 text-blue-800'
                              : notification.status === 'cancelled'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {notification.status === 'ready' && 'Pronto'}
                            {notification.status === 'confirmed' && 'Confermato'}
                            {notification.status === 'preparing' && 'In preparazione'}
                            {notification.status === 'pending' && 'In attesa'}
                            {notification.status === 'delivered' && 'Consegnato'}
                            {notification.status === 'cancelled' && 'Annullato'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  )
}

export default NotificationsPage
