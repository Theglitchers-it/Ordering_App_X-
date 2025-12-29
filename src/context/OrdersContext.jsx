import { createContext, useContext, useState, useEffect } from 'react'

const OrdersContext = createContext()

export function OrdersProvider({ children }) {
  const [orders, setOrders] = useState(() => {
    const saved = localStorage.getItem('orders')
    return saved ? JSON.parse(saved) : []
  })

  const [notifications, setNotifications] = useState([])

  useEffect(() => {
    localStorage.setItem('orders', JSON.stringify(orders))

    // Aggiorna notifiche basate sugli ordini
    const newNotifications = orders.map(order => ({
      id: order.orderNumber,
      orderId: order.orderNumber,
      title: getOrderStatusTitle(order.status),
      message: getOrderStatusMessage(order),
      status: order.status,
      timestamp: order.timestamp,
      read: order.notificationRead || false
    }))

    setNotifications(newNotifications)
  }, [orders])

  const getOrderStatusTitle = (status) => {
    const titles = {
      pending: 'Ordine Ricevuto',
      confirmed: 'Ordine Confermato',
      preparing: 'In Preparazione',
      ready: 'Ordine Pronto',
      delivered: 'Ordine Consegnato',
      cancelled: 'Ordine Annullato'
    }
    return titles[status] || 'Aggiornamento Ordine'
  }

  const getOrderStatusMessage = (order) => {
    const messages = {
      pending: `Ordine #${order.orderNumber} in attesa di conferma`,
      confirmed: `Ordine #${order.orderNumber} confermato. Pagamento: ${order.isPaid ? 'Completato' : 'In attesa'}`,
      preparing: `Il tuo ordine #${order.orderNumber} è in preparazione`,
      ready: `Ordine #${order.orderNumber} pronto per il ritiro!`,
      delivered: `Ordine #${order.orderNumber} consegnato con successo`,
      cancelled: `Ordine #${order.orderNumber} è stato annullato`
    }
    return messages[order.status] || `Aggiornamento per ordine #${order.orderNumber}`
  }

  const createOrder = (orderData) => {
    const newOrder = {
      ...orderData,
      orderNumber: orderData.orderNumber,
      status: 'confirmed',
      isPaid: orderData.paymentMethod !== 'Contanti',
      timestamp: new Date().toISOString(),
      notificationRead: false,
      merchantId: orderData.merchantId || null,
      tableNumber: orderData.tableNumber || null
    }

    setOrders(prev => [newOrder, ...prev])

    // Simula progressione ordine
    simulateOrderProgress(newOrder.orderNumber)

    return newOrder
  }

  const simulateOrderProgress = (orderNumber) => {
    // Simula il progresso dell'ordine
    setTimeout(() => {
      updateOrderStatus(orderNumber, 'preparing')
    }, 30000) // Dopo 30 secondi -> In preparazione

    setTimeout(() => {
      updateOrderStatus(orderNumber, 'ready')
    }, 120000) // Dopo 2 minuti -> Pronto
  }

  const updateOrderStatus = (orderNumber, newStatus) => {
    setOrders(prev =>
      prev.map(order =>
        order.orderNumber === orderNumber
          ? { ...order, status: newStatus, notificationRead: false }
          : order
      )
    )
  }

  const markNotificationAsRead = (orderId) => {
    setOrders(prev =>
      prev.map(order =>
        order.orderNumber === orderId
          ? { ...order, notificationRead: true }
          : order
      )
    )
  }

  const getUnreadNotificationsCount = () => {
    return notifications.filter(n => !n.read).length
  }

  const clearAllNotifications = () => {
    setOrders(prev =>
      prev.map(order => ({ ...order, notificationRead: true }))
    )
  }

  const getOrdersByMerchant = (merchantId) => {
    return orders.filter(order => order.merchantId === merchantId)
  }

  const getOrdersByTable = (merchantId, tableNumber) => {
    return orders.filter(order =>
      order.merchantId === merchantId && order.tableNumber === tableNumber
    )
  }

  return (
    <OrdersContext.Provider
      value={{
        orders,
        notifications,
        createOrder,
        updateOrderStatus,
        markNotificationAsRead,
        getUnreadNotificationsCount,
        clearAllNotifications,
        getOrdersByMerchant,
        getOrdersByTable
      }}
    >
      {children}
    </OrdersContext.Provider>
  )
}

export function useOrders() {
  const context = useContext(OrdersContext)
  if (!context) {
    throw new Error('useOrders must be used within OrdersProvider')
  }
  return context
}
