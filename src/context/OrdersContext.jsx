import { createContext, useContext, useState, useEffect } from 'react'
import * as orderService from '../api/orderService'

const USE_API = import.meta.env.VITE_API_URL && import.meta.env.VITE_API_URL !== 'undefined'

const OrdersContext = createContext()

// Normalize API order (snake_case) to frontend format (camelCase)
const normalizeOrder = (apiOrder) => ({
  id: apiOrder.id,
  orderNumber: apiOrder.order_number || apiOrder.orderNumber,
  status: apiOrder.order_status || apiOrder.status,
  customerName: apiOrder.customer_name || `${apiOrder.customer?.first_name || ''} ${apiOrder.customer?.last_name || ''}`.trim() || apiOrder.customerName,
  customerEmail: apiOrder.customer_email || apiOrder.customer?.email || apiOrder.customerEmail,
  total: parseFloat(apiOrder.total || apiOrder.total_amount || 0),
  subtotal: parseFloat(apiOrder.subtotal || 0),
  items: apiOrder.items || [],
  createdAt: apiOrder.created_at || apiOrder.createdAt,
  timestamp: apiOrder.created_at || apiOrder.timestamp,
  merchantId: apiOrder.merchant_id || apiOrder.merchantId,
  merchantName: apiOrder.merchant?.business_name || apiOrder.merchantName,
  tableNumber: apiOrder.table_number || apiOrder.table?.table_number || apiOrder.tableNumber,
  orderType: apiOrder.order_type || apiOrder.orderType,
  paymentMethod: apiOrder.payment_method || apiOrder.paymentMethod,
  isPaid: apiOrder.payment_status === 'paid' || apiOrder.isPaid || false,
  notificationRead: apiOrder.notificationRead || false,
  loyaltyDiscount: apiOrder.loyaltyDiscount || 0,
  couponDiscount: apiOrder.discount_amount || apiOrder.couponDiscount || 0,
  appliedCoupon: apiOrder.appliedCoupon || null
})

export function OrdersProvider({ children }) {
  const [orders, setOrders] = useState(() => {
    if (USE_API) return []
    const saved = localStorage.getItem('orders')
    return saved ? JSON.parse(saved) : []
  })

  const [loading, setLoading] = useState(false)
  const [notifications, setNotifications] = useState([])

  // API mode: load orders on mount when authenticated
  useEffect(() => {
    if (!USE_API) return
    const token = localStorage.getItem('accessToken')
    if (!token) return
    loadOrdersFromAPI()
  }, [])

  const loadOrdersFromAPI = async () => {
    setLoading(true)
    try {
      const result = await orderService.getMyOrders({ page: 1, limit: 50 })
      if (result.success) {
        setOrders((result.orders || []).map(normalizeOrder))
      }
    } catch (err) {
      console.error('[OrdersContext] Failed to load orders:', err)
    }
    setLoading(false)
  }

  // Demo mode: persist to localStorage and generate notifications
  useEffect(() => {
    if (USE_API) return
    localStorage.setItem('orders', JSON.stringify(orders))

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

  // API mode: generate notifications from orders
  useEffect(() => {
    if (!USE_API) return
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
      completed: 'Ordine Completato',
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
      completed: `Ordine #${order.orderNumber} completato`,
      cancelled: `Ordine #${order.orderNumber} è stato annullato`
    }
    return messages[order.status] || `Aggiornamento per ordine #${order.orderNumber}`
  }

  const createOrder = async (orderData) => {
    if (USE_API) {
      setLoading(true)
      try {
        const apiOrderData = {
          merchant_id: orderData.merchantId ? parseInt(orderData.merchantId) : undefined,
          table_number: orderData.tableNumber || undefined,
          order_type: orderData.tableNumber ? 'dine_in' : 'takeaway',
          customer_name: orderData.customerName || 'Ospite',
          payment_method: 'card',
          customer_notes: orderData.notes || undefined,
          items: (orderData.items || []).map(item => ({
            product_id: item.id,
            quantity: item.quantity,
            special_instructions: item.notes || undefined
          }))
        }
        const result = await orderService.createOrder(apiOrderData)
        setLoading(false)
        if (result.success) {
          const normalized = normalizeOrder(result.order)
          setOrders(prev => [normalized, ...prev])
          return normalized
        }
        return null
      } catch (err) {
        console.error('[OrdersContext] Failed to create order:', err)
        setLoading(false)
        return null
      }
    } else {
      // Demo mode - existing behavior
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
      simulateOrderProgress(newOrder.orderNumber)
      return newOrder
    }
  }

  const simulateOrderProgress = (orderNumber) => {
    setTimeout(() => {
      updateOrderStatus(orderNumber, 'preparing')
    }, 30000)
    setTimeout(() => {
      updateOrderStatus(orderNumber, 'ready')
    }, 120000)
  }

  const updateOrderStatus = async (orderNumber, newStatus) => {
    if (USE_API) {
      const order = orders.find(o => o.orderNumber === orderNumber || o.id === orderNumber)
      if (order && order.id) {
        const result = await orderService.updateOrderStatus(order.id, newStatus)
        if (result.success) {
          setOrders(prev =>
            prev.map(o =>
              (o.orderNumber === orderNumber || o.id === orderNumber)
                ? { ...o, status: newStatus, notificationRead: false }
                : o
            )
          )
        }
        return result
      }
    }
    setOrders(prev =>
      prev.map(order =>
        order.orderNumber === orderNumber
          ? { ...order, status: newStatus, notificationRead: false }
          : order
      )
    )
  }

  const deleteOrder = async (orderNumber) => {
    if (USE_API) {
      const order = orders.find(o => o.orderNumber === orderNumber || o.id === orderNumber)
      if (order && order.id) {
        await orderService.cancelOrder(order.id, 'Cancelled by admin')
      }
    }
    setOrders(prev => prev.filter(o => o.orderNumber !== orderNumber && o.id !== orderNumber))
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
        loading,
        createOrder,
        updateOrderStatus,
        deleteOrder,
        markNotificationAsRead,
        getUnreadNotificationsCount,
        clearAllNotifications,
        getOrdersByMerchant,
        getOrdersByTable,
        refreshOrders: loadOrdersFromAPI
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
