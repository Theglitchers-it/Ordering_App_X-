import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  Bell,
  X,
  CheckCheck,
  Trash2,
  ShoppingBag,
  AlertCircle,
  Users,
  CheckCircle,
  Store,
  Clock
} from 'lucide-react'
import { useNotifications } from '../../context/NotificationsContext'

const NotificationsPanel = ({ onClose }) => {
  const navigate = useNavigate()
  const { notifications, markAsRead, markAllAsRead, deleteNotification, clearAll } = useNotifications()

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'order':
        return { icon: ShoppingBag, color: 'text-blue-600 bg-blue-100' }
      case 'alert':
        return { icon: AlertCircle, color: 'text-red-600 bg-red-100' }
      case 'user':
        return { icon: Users, color: 'text-purple-600 bg-purple-100' }
      case 'success':
        return { icon: CheckCircle, color: 'text-green-600 bg-green-100' }
      case 'merchant':
        return { icon: Store, color: 'text-orange-600 bg-orange-100' }
      default:
        return { icon: Bell, color: 'text-gray-600 bg-gray-100' }
    }
  }

  const handleNotificationClick = (notification) => {
    markAsRead(notification.id)
    if (notification.link) {
      navigate(notification.link)
      onClose()
    }
  }

  const getTimeAgo = (timestamp) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffMs = now - time
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Adesso'
    if (diffMins < 60) return `${diffMins} min fa`
    if (diffHours < 24) return `${diffHours}h fa`
    return `${diffDays}g fa`
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
      />

      {/* Panel */}
      <motion.div
        initial={{ opacity: 0, y: -10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.95 }}
        className="absolute right-0 mt-2 w-96 max-w-[calc(100vw-2rem)] bg-white rounded-xl shadow-2xl border border-gray-200 z-50 max-h-[600px] flex flex-col"
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-orange-50 to-orange-100">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-orange-600" />
            <h3 className="font-semibold text-gray-900">Notifiche</h3>
            {notifications.filter(n => !n.read).length > 0 && (
              <span className="px-2 py-0.5 bg-orange-600 text-white text-xs rounded-full font-semibold">
                {notifications.filter(n => !n.read).length}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {notifications.length > 0 && (
              <>
                <button
                  onClick={markAllAsRead}
                  className="p-1.5 hover:bg-orange-200 rounded-lg transition-colors"
                  title="Segna tutte come lette"
                >
                  <CheckCheck className="w-4 h-4 text-orange-700" />
                </button>
                <button
                  onClick={clearAll}
                  className="p-1.5 hover:bg-orange-200 rounded-lg transition-colors"
                  title="Elimina tutte"
                >
                  <Trash2 className="w-4 h-4 text-orange-700" />
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-orange-200 rounded-lg transition-colors"
            >
              <X className="w-4 h-4 text-orange-700" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="overflow-y-auto flex-1">
          {notifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">Nessuna notifica</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              <AnimatePresence>
                {notifications.map((notification, index) => {
                  const { icon: Icon, color } = getNotificationIcon(notification.type)
                  return (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.05 }}
                      className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                        !notification.read ? 'bg-orange-50/50' : ''
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex gap-3">
                        {/* Icon */}
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${color}`}>
                          <Icon className="w-5 h-5" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h4 className={`text-sm font-semibold ${
                              !notification.read ? 'text-gray-900' : 'text-gray-700'
                            }`}>
                              {notification.title}
                            </h4>
                            {!notification.read && (
                              <span className="w-2 h-2 bg-orange-600 rounded-full flex-shrink-0 mt-1.5"></span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Clock className="w-3 h-3" />
                            {getTimeAgo(notification.timestamp)}
                          </div>
                        </div>

                        {/* Delete Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteNotification(notification.id)
                          }}
                          className="p-1 hover:bg-gray-200 rounded opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                        >
                          <X className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </motion.div>
    </>
  )
}

export default NotificationsPanel
