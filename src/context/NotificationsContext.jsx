import React, { createContext, useContext, useState, useEffect } from 'react'

const NotificationsContext = createContext()

export const useNotifications = () => {
  const context = useContext(NotificationsContext)
  if (!context) {
    throw new Error('useNotifications must be used within NotificationsProvider')
  }
  return context
}

export const NotificationsProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)

  // Load notifications from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('adminNotifications')
    if (saved) {
      const parsed = JSON.parse(saved)
      setNotifications(parsed)
      updateUnreadCount(parsed)
    } else {
      // Demo notifications
      const demoNotifications = [
        {
          id: 1,
          type: 'order',
          title: 'Nuovo Ordine #1234',
          message: 'Ordine da €45.50 ricevuto da Mario Rossi',
          timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
          read: false,
          link: '/admin/orders'
        },
        {
          id: 2,
          type: 'alert',
          title: 'Alert: Ordine in Ritardo',
          message: 'Ordine #1220 supera il tempo stimato di consegna',
          timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
          read: false,
          link: '/admin/orders'
        },
        {
          id: 3,
          type: 'user',
          title: 'Nuovo Utente Registrato',
          message: 'Lucia Verdi si è registrata',
          timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
          read: false,
          link: '/admin/users'
        },
        {
          id: 4,
          type: 'success',
          title: 'Target Mensile Raggiunto',
          message: 'Hai superato il target di €50.000 questo mese!',
          timestamp: new Date(Date.now() - 60 * 60000).toISOString(),
          read: true,
          link: '/admin/dashboard'
        },
        {
          id: 5,
          type: 'merchant',
          title: 'Nuovo Ristorante',
          message: 'Pizzeria Da Gino ha richiesto di unirsi alla piattaforma',
          timestamp: new Date(Date.now() - 120 * 60000).toISOString(),
          read: true,
          link: '/admin/merchants'
        }
      ]
      setNotifications(demoNotifications)
      updateUnreadCount(demoNotifications)
      localStorage.setItem('adminNotifications', JSON.stringify(demoNotifications))
    }
  }, [])

  const updateUnreadCount = (notifs) => {
    const count = notifs.filter(n => !n.read).length
    setUnreadCount(count)
  }

  const saveNotifications = (notifs) => {
    setNotifications(notifs)
    updateUnreadCount(notifs)
    localStorage.setItem('adminNotifications', JSON.stringify(notifs))
  }

  const addNotification = (notification) => {
    const newNotification = {
      id: Math.max(0, ...notifications.map(n => n.id)) + 1,
      ...notification,
      timestamp: new Date().toISOString(),
      read: false
    }
    const updated = [newNotification, ...notifications]
    saveNotifications(updated)
  }

  const markAsRead = (notificationId) => {
    const updated = notifications.map(n =>
      n.id === notificationId ? { ...n, read: true } : n
    )
    saveNotifications(updated)
  }

  const markAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }))
    saveNotifications(updated)
  }

  const deleteNotification = (notificationId) => {
    const updated = notifications.filter(n => n.id !== notificationId)
    saveNotifications(updated)
  }

  const clearAll = () => {
    saveNotifications([])
  }

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAll
      }}
    >
      {children}
    </NotificationsContext.Provider>
  )
}
