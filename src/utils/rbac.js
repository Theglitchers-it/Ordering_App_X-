// RBAC (Role-Based Access Control) System
// Definizione ruoli e permessi granulari

export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN_OPS: 'admin_ops',
  MERCHANT_ADMIN: 'merchant_admin',
  SUPPORT_AGENT: 'support_agent',
  FINANCE: 'finance',
  LOGISTICS: 'logistics',
  USER: 'user'
}

export const RESOURCES = {
  ORDERS: 'orders',
  PRODUCTS: 'products',
  USERS: 'users',
  COUPONS: 'coupons',
  REPORTS: 'reports',
  SETTINGS: 'settings',
  PAYOUTS: 'payouts',
  TRANSACTIONS: 'transactions',
  REFUNDS: 'refunds',
  DRIVERS: 'drivers',
  ROUTING: 'routing',
  TICKETS: 'tickets',
  AUDIT_LOGS: 'audit_logs'
}

export const ACTIONS = {
  CREATE: 'create',
  READ: 'read',
  UPDATE: 'update',
  DELETE: 'delete',
  EXPORT: 'export',
  IMPORT: 'import',
  APPROVE: 'approve',
  REJECT: 'reject'
}

// Matrice permessi per ruolo
export const PERMISSIONS = {
  [ROLES.SUPER_ADMIN]: {
    // Admin ha accesso completo a tutto
    [RESOURCES.ORDERS]: [ACTIONS.CREATE, ACTIONS.READ, ACTIONS.UPDATE, ACTIONS.DELETE, ACTIONS.EXPORT],
    [RESOURCES.PRODUCTS]: [ACTIONS.CREATE, ACTIONS.READ, ACTIONS.UPDATE, ACTIONS.DELETE, ACTIONS.IMPORT, ACTIONS.EXPORT],
    [RESOURCES.USERS]: [ACTIONS.CREATE, ACTIONS.READ, ACTIONS.UPDATE, ACTIONS.DELETE, ACTIONS.EXPORT],
    [RESOURCES.COUPONS]: [ACTIONS.CREATE, ACTIONS.READ, ACTIONS.UPDATE, ACTIONS.DELETE],
    [RESOURCES.REPORTS]: [ACTIONS.READ, ACTIONS.EXPORT],
    [RESOURCES.SETTINGS]: [ACTIONS.READ, ACTIONS.UPDATE],
    [RESOURCES.PAYOUTS]: [ACTIONS.CREATE, ACTIONS.READ, ACTIONS.UPDATE, ACTIONS.APPROVE],
    [RESOURCES.TRANSACTIONS]: [ACTIONS.READ, ACTIONS.EXPORT],
    [RESOURCES.REFUNDS]: [ACTIONS.CREATE, ACTIONS.READ, ACTIONS.APPROVE],
    [RESOURCES.DRIVERS]: [ACTIONS.CREATE, ACTIONS.READ, ACTIONS.UPDATE, ACTIONS.DELETE],
    [RESOURCES.ROUTING]: [ACTIONS.READ, ACTIONS.UPDATE],
    [RESOURCES.TICKETS]: [ACTIONS.READ, ACTIONS.UPDATE],
    [RESOURCES.AUDIT_LOGS]: [ACTIONS.READ, ACTIONS.EXPORT]
  },

  [ROLES.ADMIN_OPS]: {
    // Admin/Ops: ordini, utenti, reports, coupons (no payout sensitive)
    [RESOURCES.ORDERS]: [ACTIONS.READ, ACTIONS.UPDATE, ACTIONS.EXPORT],
    [RESOURCES.USERS]: [ACTIONS.READ, ACTIONS.UPDATE, ACTIONS.EXPORT],
    [RESOURCES.COUPONS]: [ACTIONS.CREATE, ACTIONS.READ, ACTIONS.UPDATE],
    [RESOURCES.REPORTS]: [ACTIONS.READ, ACTIONS.EXPORT],
    [RESOURCES.TICKETS]: [ACTIONS.READ, ACTIONS.UPDATE],
    [RESOURCES.AUDIT_LOGS]: [ACTIONS.READ]
  },

  [ROLES.MERCHANT_ADMIN]: {
    // Merchant: prodotti, menu, ordini del proprio ristorante
    [RESOURCES.PRODUCTS]: [ACTIONS.CREATE, ACTIONS.READ, ACTIONS.UPDATE, ACTIONS.DELETE, ACTIONS.IMPORT],
    [RESOURCES.ORDERS]: [ACTIONS.READ, ACTIONS.UPDATE], // Solo ordini del proprio merchant
    [RESOURCES.REPORTS]: [ACTIONS.READ], // Solo report del proprio merchant
  },

  [ROLES.SUPPORT_AGENT]: {
    // Support: tickets, ordini (view + limited actions)
    [RESOURCES.TICKETS]: [ACTIONS.CREATE, ACTIONS.READ, ACTIONS.UPDATE],
    [RESOURCES.ORDERS]: [ACTIONS.READ, ACTIONS.UPDATE], // Solo aggiornamenti limitati
    [RESOURCES.USERS]: [ACTIONS.READ],
    [RESOURCES.REFUNDS]: [ACTIONS.CREATE, ACTIONS.READ]
  },

  [ROLES.FINANCE]: {
    // Finance: payouts, transactions, refunds
    [RESOURCES.PAYOUTS]: [ACTIONS.CREATE, ACTIONS.READ, ACTIONS.UPDATE, ACTIONS.APPROVE, ACTIONS.EXPORT],
    [RESOURCES.TRANSACTIONS]: [ACTIONS.READ, ACTIONS.EXPORT],
    [RESOURCES.REFUNDS]: [ACTIONS.CREATE, ACTIONS.READ, ACTIONS.APPROVE, ACTIONS.EXPORT],
    [RESOURCES.REPORTS]: [ACTIONS.READ, ACTIONS.EXPORT],
    [RESOURCES.AUDIT_LOGS]: [ACTIONS.READ]
  },

  [ROLES.LOGISTICS]: {
    // Logistics: driver assign, routing, ETA
    [RESOURCES.DRIVERS]: [ACTIONS.READ, ACTIONS.UPDATE],
    [RESOURCES.ROUTING]: [ACTIONS.READ, ACTIONS.UPDATE],
    [RESOURCES.ORDERS]: [ACTIONS.READ, ACTIONS.UPDATE], // Solo per assegnazione driver
    [RESOURCES.REPORTS]: [ACTIONS.READ]
  },

  [ROLES.USER]: {
    // User normale: nessun accesso admin
  }
}

/**
 * Verifica se un ruolo ha il permesso per eseguire un'azione su una risorsa
 * @param {string} role - Ruolo utente
 * @param {string} resource - Risorsa (es. 'orders')
 * @param {string} action - Azione (es. 'read')
 * @returns {boolean}
 */
export const hasPermission = (role, resource, action) => {
  if (!role || !resource || !action) return false

  // Super admin ha sempre accesso
  if (role === ROLES.SUPER_ADMIN) return true

  const rolePermissions = PERMISSIONS[role]
  if (!rolePermissions) return false

  const resourcePermissions = rolePermissions[resource]
  if (!resourcePermissions) return false

  return resourcePermissions.includes(action)
}

/**
 * Verifica se un ruolo ha almeno uno dei permessi specificati
 * @param {string} role - Ruolo utente
 * @param {string} resource - Risorsa
 * @param {string[]} actions - Array di azioni
 * @returns {boolean}
 */
export const hasAnyPermission = (role, resource, actions) => {
  return actions.some(action => hasPermission(role, resource, action))
}

/**
 * Verifica se un ruolo ha tutti i permessi specificati
 * @param {string} role - Ruolo utente
 * @param {string} resource - Risorsa
 * @param {string[]} actions - Array di azioni
 * @returns {boolean}
 */
export const hasAllPermissions = (role, resource, actions) => {
  return actions.every(action => hasPermission(role, resource, action))
}

/**
 * Ottiene tutti i permessi per un ruolo
 * @param {string} role - Ruolo utente
 * @returns {Object}
 */
export const getRolePermissions = (role) => {
  return PERMISSIONS[role] || {}
}

/**
 * Verifica se un ruolo può accedere a una route admin
 * @param {string} role - Ruolo utente
 * @returns {boolean}
 */
export const canAccessAdmin = (role) => {
  return role && role !== ROLES.USER
}

/**
 * Ottiene i ruoli disponibili in base al ruolo corrente
 * (un admin può assegnare solo ruoli uguali o inferiori al proprio)
 * @param {string} currentRole - Ruolo corrente
 * @returns {string[]}
 */
export const getAssignableRoles = (currentRole) => {
  const roleHierarchy = [
    ROLES.SUPER_ADMIN,
    ROLES.ADMIN_OPS,
    ROLES.FINANCE,
    ROLES.MERCHANT_ADMIN,
    ROLES.LOGISTICS,
    ROLES.SUPPORT_AGENT,
    ROLES.USER
  ]

  const currentIndex = roleHierarchy.indexOf(currentRole)
  if (currentIndex === -1) return [ROLES.USER]

  return roleHierarchy.slice(currentIndex)
}

// Audit logging helper
export const logAction = (userId, role, action, resource, details = {}) => {
  const auditLog = {
    userId,
    role,
    action,
    resource,
    details,
    timestamp: new Date().toISOString(),
    ip: 'IP_ADDRESS', // Da implementare con real IP
    userAgent: navigator.userAgent
  }

  // In produzione, inviare a backend
  console.log('[AUDIT LOG]', auditLog)

  // Salva in localStorage per demo (in produzione usare API)
  const logs = JSON.parse(localStorage.getItem('auditLogs') || '[]')
  logs.push(auditLog)
  // Mantieni solo gli ultimi 1000 log
  if (logs.length > 1000) logs.shift()
  localStorage.setItem('auditLogs', JSON.stringify(logs))

  return auditLog
}

// Rate limiting helper (client-side per demo, in produzione lato server)
const rateLimitStore = new Map()

export const checkRateLimit = (key, maxRequests = 100, windowMs = 60000) => {
  const now = Date.now()
  const record = rateLimitStore.get(key) || { count: 0, resetTime: now + windowMs }

  if (now > record.resetTime) {
    // Reset window
    record.count = 0
    record.resetTime = now + windowMs
  }

  record.count++
  rateLimitStore.set(key, record)

  if (record.count > maxRequests) {
    const retryAfter = Math.ceil((record.resetTime - now) / 1000)
    return {
      allowed: false,
      retryAfter,
      message: `Rate limit exceeded. Try again in ${retryAfter} seconds.`
    }
  }

  return { allowed: true }
}

export default {
  ROLES,
  RESOURCES,
  ACTIONS,
  PERMISSIONS,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  getRolePermissions,
  canAccessAdmin,
  getAssignableRoles,
  logAction,
  checkRateLimit
}
