import { createContext, useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const USE_API = import.meta.env.VITE_API_URL && import.meta.env.VITE_API_URL !== 'undefined'

const RBACContext = createContext()

// Definizione ruoli e permessi
export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  MERCHANT_ADMIN: 'merchant_admin',
  SUPPORT_AGENT: 'support_agent',
  FINANCE: 'finance',
  LOGISTICS: 'logistics'
}

export const PERMISSIONS = {
  // Dashboard
  VIEW_DASHBOARD: 'view_dashboard',

  // Orders
  VIEW_ORDERS: 'view_orders',
  CREATE_ORDERS: 'create_orders',
  UPDATE_ORDERS: 'update_orders',
  DELETE_ORDERS: 'delete_orders',
  REFUND_ORDERS: 'refund_orders',
  ASSIGN_DRIVER: 'assign_driver',

  // Products
  VIEW_PRODUCTS: 'view_products',
  CREATE_PRODUCTS: 'create_products',
  UPDATE_PRODUCTS: 'update_products',
  DELETE_PRODUCTS: 'delete_products',
  BULK_IMPORT_PRODUCTS: 'bulk_import_products',

  // Merchants/Restaurants
  VIEW_MERCHANTS: 'view_merchants',
  CREATE_MERCHANTS: 'create_merchants',
  UPDATE_MERCHANTS: 'update_merchants',
  DELETE_MERCHANTS: 'delete_merchants',

  // Users
  VIEW_USERS: 'view_users',
  CREATE_USERS: 'create_users',
  UPDATE_USERS: 'update_users',
  DELETE_USERS: 'delete_users',
  BAN_USERS: 'ban_users',
  IMPERSONATE_USERS: 'impersonate_users',

  // Coupons & Loyalty
  VIEW_COUPONS: 'view_coupons',
  CREATE_COUPONS: 'create_coupons',
  UPDATE_COUPONS: 'update_coupons',
  DELETE_COUPONS: 'delete_coupons',

  // Finance
  VIEW_FINANCE: 'view_finance',
  MANAGE_PAYOUTS: 'manage_payouts',
  MANAGE_REFUNDS: 'manage_refunds',
  VIEW_TRANSACTIONS: 'view_transactions',

  // Reports
  VIEW_REPORTS: 'view_reports',
  EXPORT_REPORTS: 'export_reports',

  // Settings
  VIEW_SETTINGS: 'view_settings',
  UPDATE_SETTINGS: 'update_settings',
  MANAGE_INTEGRATIONS: 'manage_integrations',

  // Audit & Security
  VIEW_AUDIT_LOGS: 'view_audit_logs',
  MANAGE_ROLES: 'manage_roles',
  MANAGE_2FA: 'manage_2fa',

  // Support
  VIEW_TICKETS: 'view_tickets',
  CREATE_TICKETS: 'create_tickets',
  UPDATE_TICKETS: 'update_tickets',
  ESCALATE_TICKETS: 'escalate_tickets'
}

// Mappa permessi per ruolo
const ROLE_PERMISSIONS = {
  [ROLES.SUPER_ADMIN]: Object.values(PERMISSIONS), // Tutti i permessi

  [ROLES.ADMIN]: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_ORDERS,
    PERMISSIONS.UPDATE_ORDERS,
    PERMISSIONS.REFUND_ORDERS,
    PERMISSIONS.VIEW_PRODUCTS,
    PERMISSIONS.CREATE_PRODUCTS,
    PERMISSIONS.UPDATE_PRODUCTS,
    PERMISSIONS.DELETE_PRODUCTS,
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.UPDATE_USERS,
    PERMISSIONS.BAN_USERS,
    PERMISSIONS.VIEW_COUPONS,
    PERMISSIONS.CREATE_COUPONS,
    PERMISSIONS.UPDATE_COUPONS,
    PERMISSIONS.DELETE_COUPONS,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.EXPORT_REPORTS,
    PERMISSIONS.VIEW_SETTINGS,
    PERMISSIONS.VIEW_MERCHANTS
  ],

  [ROLES.MERCHANT_ADMIN]: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_ORDERS,
    PERMISSIONS.UPDATE_ORDERS,
    PERMISSIONS.VIEW_PRODUCTS,
    PERMISSIONS.CREATE_PRODUCTS,
    PERMISSIONS.UPDATE_PRODUCTS,
    PERMISSIONS.DELETE_PRODUCTS,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.EXPORT_REPORTS
  ],

  [ROLES.SUPPORT_AGENT]: [
    PERMISSIONS.VIEW_ORDERS,
    PERMISSIONS.UPDATE_ORDERS,
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.VIEW_TICKETS,
    PERMISSIONS.CREATE_TICKETS,
    PERMISSIONS.UPDATE_TICKETS,
    PERMISSIONS.ESCALATE_TICKETS
  ],

  [ROLES.FINANCE]: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_FINANCE,
    PERMISSIONS.MANAGE_PAYOUTS,
    PERMISSIONS.MANAGE_REFUNDS,
    PERMISSIONS.VIEW_TRANSACTIONS,
    PERMISSIONS.VIEW_ORDERS,
    PERMISSIONS.REFUND_ORDERS,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.EXPORT_REPORTS
  ],

  [ROLES.LOGISTICS]: [
    PERMISSIONS.VIEW_ORDERS,
    PERMISSIONS.UPDATE_ORDERS,
    PERMISSIONS.ASSIGN_DRIVER,
    PERMISSIONS.VIEW_DASHBOARD
  ]
}

export function RBACProvider({ children }) {
  const navigate = useNavigate()
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Carica utente dal localStorage
    const loadUser = () => {
      try {
        const savedUser = localStorage.getItem('adminUser')
        const adminAuth = localStorage.getItem('adminAuth')

        if (savedUser && adminAuth) {
          const user = JSON.parse(savedUser)
          setCurrentUser(user)
        } else if (!USE_API) {
          // Demo mode only: auto-grant super_admin for testing
          const defaultUser = {
            id: 1,
            name: 'Admin',
            email: 'admin@example.com',
            role: ROLES.SUPER_ADMIN,
            merchantId: null,
            avatar: null,
            createdAt: new Date().toISOString()
          }
          localStorage.setItem('adminUser', JSON.stringify(defaultUser))
          setCurrentUser(defaultUser)
        } else {
          // API mode: no auto-grant, user must authenticate
          setCurrentUser(null)
        }
      } catch (error) {
        console.error('Error loading user:', error)
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [])

  // Verifica se l'utente ha un permesso specifico
  const hasPermission = (permission) => {
    if (!currentUser) return false
    const userPermissions = ROLE_PERMISSIONS[currentUser.role] || []
    return userPermissions.includes(permission)
  }

  // Verifica se l'utente ha uno dei permessi specificati
  const hasAnyPermission = (permissions) => {
    return permissions.some(permission => hasPermission(permission))
  }

  // Verifica se l'utente ha tutti i permessi specificati
  const hasAllPermissions = (permissions) => {
    return permissions.every(permission => hasPermission(permission))
  }

  // Verifica se l'utente ha un ruolo specifico
  const hasRole = (role) => {
    if (!currentUser) return false
    return currentUser.role === role
  }

  // Verifica se l'utente ha uno dei ruoli specificati
  const hasAnyRole = (roles) => {
    return roles.some(role => hasRole(role))
  }

  // Ottieni tutti i permessi dell'utente corrente
  const getUserPermissions = () => {
    if (!currentUser) return []
    return ROLE_PERMISSIONS[currentUser.role] || []
  }

  // Cambia ruolo utente (solo per testing/demo)
  const changeUserRole = (newRole) => {
    if (!currentUser) return
    const updatedUser = { ...currentUser, role: newRole }
    setCurrentUser(updatedUser)
    localStorage.setItem('adminUser', JSON.stringify(updatedUser))
  }

  // Aggiorna utente
  const updateUser = (updates) => {
    if (!currentUser) return
    const updatedUser = { ...currentUser, ...updates }
    setCurrentUser(updatedUser)
    localStorage.setItem('adminUser', JSON.stringify(updatedUser))
  }

  // Logout
  const logout = () => {
    setCurrentUser(null)
    localStorage.removeItem('adminUser')
    localStorage.removeItem('adminAuth')
    navigate('/login')
  }

  const value = {
    currentUser,
    loading,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    hasAnyRole,
    getUserPermissions,
    changeUserRole,
    updateUser,
    logout,
    ROLES,
    PERMISSIONS
  }

  return <RBACContext.Provider value={value}>{children}</RBACContext.Provider>
}

export function useRBAC() {
  const context = useContext(RBACContext)
  if (!context) {
    throw new Error('useRBAC must be used within RBACProvider')
  }
  return context
}

// HOC per proteggere componenti con permessi
export function withPermission(Component, requiredPermission) {
  return function ProtectedComponent(props) {
    const { hasPermission } = useRBAC()

    if (!hasPermission(requiredPermission)) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 shadow-lg text-center max-w-md">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Accesso Negato</h2>
            <p className="text-gray-600">Non hai i permessi necessari per accedere a questa risorsa.</p>
          </div>
        </div>
      )
    }

    return <Component {...props} />
  }
}
