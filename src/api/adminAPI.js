import { checkRateLimit, logAction } from '../utils/rbac'

/**
 * API Client per operazioni admin
 * In produzione, sostituire con chiamate fetch/axios a backend reale
 */

const API_BASE = '/api/admin' // In produzione: https://api.yourdomain.com/admin

// Helper per simulare delay di rete
const simulateNetwork = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms))

// Helper per verificare rate limit
const checkLimit = (endpoint, userRole) => {
  const key = `${userRole}:${endpoint}`
  const limit = checkRateLimit(key, 100, 60000) // 100 req/min
  if (!limit.allowed) {
    throw new Error(limit.message)
  }
}

/**
 * ORDERS API
 */

// GET /admin/orders?status=preparing&page=1&limit=20
export const getOrders = async ({ status, page = 1, limit = 20, search }, userRole, userId) => {
  checkLimit('GET /orders', userRole)
  await simulateNetwork()

  logAction(userId, userRole, 'read', 'orders', { status, page, limit, search })

  // Mock data - in produzione fare fetch al backend
  const allOrders = JSON.parse(localStorage.getItem('orders') || '[]')

  let filtered = allOrders

  if (status) {
    filtered = filtered.filter(o => o.status === status)
  }

  if (search) {
    const searchLower = search.toLowerCase()
    filtered = filtered.filter(o =>
      o.orderNumber.toString().includes(searchLower) ||
      o.customerName.toLowerCase().includes(searchLower) ||
      o.customerEmail?.toLowerCase().includes(searchLower)
    )
  }

  const start = (page - 1) * limit
  const end = start + limit
  const paginated = filtered.slice(start, end)

  return {
    data: paginated,
    pagination: {
      page,
      limit,
      total: filtered.length,
      totalPages: Math.ceil(filtered.length / limit)
    }
  }
}

// GET /admin/orders/:id
export const getOrderById = async (orderId, userRole, userId) => {
  checkLimit('GET /orders/:id', userRole)
  await simulateNetwork()

  logAction(userId, userRole, 'read', 'orders', { orderId })

  const orders = JSON.parse(localStorage.getItem('orders') || '[]')
  const order = orders.find(o => o.orderNumber.toString() === orderId.toString())

  if (!order) {
    throw new Error('Order not found')
  }

  return { data: order }
}

// POST /admin/orders/:id/status
export const updateOrderStatus = async (orderId, newStatus, userRole, userId) => {
  checkLimit('POST /orders/:id/status', userRole)
  await simulateNetwork()

  const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled']

  if (!validStatuses.includes(newStatus)) {
    throw new Error('Invalid status')
  }

  logAction(userId, userRole, 'update', 'orders', { orderId, newStatus })

  const orders = JSON.parse(localStorage.getItem('orders') || '[]')
  const orderIndex = orders.findIndex(o => o.orderNumber.toString() === orderId.toString())

  if (orderIndex === -1) {
    throw new Error('Order not found')
  }

  orders[orderIndex].status = newStatus
  orders[orderIndex].updatedAt = new Date().toISOString()
  orders[orderIndex].updatedBy = userId

  localStorage.setItem('orders', JSON.stringify(orders))

  return { data: orders[orderIndex], message: 'Status updated successfully' }
}

/**
 * PRODUCTS API
 */

// PATCH /admin/products/:id
export const updateProduct = async (productId, updates, userRole, userId) => {
  checkLimit('PATCH /products/:id', userRole)
  await simulateNetwork()

  logAction(userId, userRole, 'update', 'products', { productId, updates })

  // Mock implementation
  return {
    data: { id: productId, ...updates, updatedAt: new Date().toISOString() },
    message: 'Product updated successfully'
  }
}

// POST /admin/products/import (CSV)
export const importProducts = async (csvData, userRole, userId) => {
  checkLimit('POST /products/import', userRole)
  await simulateNetwork(1000) // Import takes longer

  logAction(userId, userRole, 'import', 'products', { rowCount: csvData.length })

  // Parse CSV and validate
  const imported = []
  const errors = []

  csvData.forEach((row, index) => {
    try {
      // Validate row
      if (!row.name || !row.price) {
        errors.push({ row: index + 1, error: 'Missing required fields' })
        return
      }

      imported.push({
        id: `prod_${Date.now()}_${index}`,
        ...row,
        createdAt: new Date().toISOString(),
        createdBy: userId
      })
    } catch (err) {
      errors.push({ row: index + 1, error: err.message })
    }
  })

  return {
    data: {
      imported: imported.length,
      errors: errors.length,
      details: errors
    },
    message: `Imported ${imported.length} products, ${errors.length} errors`
  }
}

/**
 * COUPONS API
 */

// POST /admin/coupons
export const createCoupon = async (couponData, userRole, userId) => {
  checkLimit('POST /coupons', userRole)
  await simulateNetwork()

  logAction(userId, userRole, 'create', 'coupons', couponData)

  const newCoupon = {
    id: `coupon_${Date.now()}`,
    ...couponData,
    createdAt: new Date().toISOString(),
    createdBy: userId,
    isActive: true
  }

  // Save to localStorage (in produzione salvare su database)
  const coupons = JSON.parse(localStorage.getItem('coupons') || '[]')
  coupons.push(newCoupon)
  localStorage.setItem('coupons', JSON.stringify(coupons))

  return { data: newCoupon, message: 'Coupon created successfully' }
}

/**
 * REPORTS API
 */

// GET /admin/reports/sales?from=yyyy-mm-dd&to=yyyy-mm-dd
export const getSalesReport = async ({ from, to }, userRole, userId) => {
  checkLimit('GET /reports/sales', userRole)
  await simulateNetwork(500)

  logAction(userId, userRole, 'read', 'reports', { from, to })

  const orders = JSON.parse(localStorage.getItem('orders') || '[]')

  const fromDate = new Date(from)
  const toDate = new Date(to)

  const filtered = orders.filter(order => {
    const orderDate = new Date(order.createdAt)
    return orderDate >= fromDate && orderDate <= toDate
  })

  const totalRevenue = filtered.reduce((sum, order) => sum + order.total, 0)
  const totalOrders = filtered.length
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

  // Group by day
  const dailyStats = {}
  filtered.forEach(order => {
    const day = new Date(order.createdAt).toISOString().split('T')[0]
    if (!dailyStats[day]) {
      dailyStats[day] = { revenue: 0, orders: 0 }
    }
    dailyStats[day].revenue += order.total
    dailyStats[day].orders += 1
  })

  return {
    data: {
      summary: {
        totalRevenue,
        totalOrders,
        averageOrderValue,
        period: { from, to }
      },
      daily: Object.entries(dailyStats).map(([date, stats]) => ({
        date,
        ...stats
      }))
    }
  }
}

/**
 * USERS API
 */

// POST /admin/users/:id/adjust-points
export const adjustUserPoints = async (userId, amount, reason, currentUserRole, currentUserId) => {
  checkLimit('POST /users/:id/adjust-points', currentUserRole)
  await simulateNetwork()

  logAction(currentUserId, currentUserRole, 'update', 'users', { userId, amount, reason })

  // Mock implementation
  return {
    data: {
      userId,
      previousPoints: 100,
      newPoints: 100 + amount,
      adjustment: amount,
      reason
    },
    message: `Adjusted ${amount} points for user ${userId}`
  }
}

/**
 * BULK OPERATIONS
 */

// POST /admin/orders/bulk-update
export const bulkUpdateOrders = async (orderIds, updates, userRole, userId) => {
  checkLimit('POST /orders/bulk-update', userRole)
  await simulateNetwork(500)

  logAction(userId, userRole, 'update', 'orders', { count: orderIds.length, updates })

  const orders = JSON.parse(localStorage.getItem('orders') || '[]')
  let updated = 0

  orderIds.forEach(orderId => {
    const index = orders.findIndex(o => o.orderNumber.toString() === orderId.toString())
    if (index !== -1) {
      orders[index] = { ...orders[index], ...updates, updatedAt: new Date().toISOString(), updatedBy: userId }
      updated++
    }
  })

  localStorage.setItem('orders', JSON.stringify(orders))

  return {
    data: { updated, total: orderIds.length },
    message: `Updated ${updated} orders`
  }
}

// POST /admin/orders/export
export const exportOrders = async (filters, format = 'csv', userRole, userId) => {
  checkLimit('POST /orders/export', userRole)
  await simulateNetwork(800)

  logAction(userId, userRole, 'export', 'orders', { filters, format })

  const { data } = await getOrders(filters, userRole, userId)

  if (format === 'csv') {
    const headers = ['Order Number', 'Customer', 'Total', 'Status', 'Date']
    const rows = data.map(o => [
      o.orderNumber,
      o.customerName,
      o.total,
      o.status,
      new Date(o.createdAt).toLocaleDateString()
    ])

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n')

    return { data: csv, filename: `orders_export_${Date.now()}.csv` }
  }

  return { data, filename: `orders_export_${Date.now()}.json` }
}

/**
 * GLOBAL SEARCH
 */

// GET /admin/search?q=query
export const globalSearch = async (query, userRole, userId) => {
  checkLimit('GET /search', userRole)
  await simulateNetwork()

  logAction(userId, userRole, 'read', 'search', { query })

  const results = {
    orders: [],
    users: [],
    products: []
  }

  const queryLower = query.toLowerCase()

  // Search orders
  const orders = JSON.parse(localStorage.getItem('orders') || '[]')
  results.orders = orders.filter(o =>
    o.orderNumber.toString().includes(queryLower) ||
    o.customerName.toLowerCase().includes(queryLower) ||
    o.customerEmail?.toLowerCase().includes(queryLower) ||
    o.customerPhone?.includes(query)
  ).slice(0, 5)

  // Search users (mock)
  // results.users = ...

  // Search products (mock)
  // results.products = ...

  return { data: results }
}

export default {
  getOrders,
  getOrderById,
  updateOrderStatus,
  updateProduct,
  importProducts,
  createCoupon,
  getSalesReport,
  adjustUserPoints,
  bulkUpdateOrders,
  exportOrders,
  globalSearch
}
