import { createContext, useContext, useState, useEffect } from 'react'
import { ROLES, hasPermission, canAccessAdmin, logAction } from '../utils/rbac'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [adminAuth, setAdminAuth] = useState(() => {
    const saved = localStorage.getItem('adminAuth')
    return saved ? JSON.parse(saved) : null
  })

  const [userAuth, setUserAuth] = useState(() => {
    const saved = localStorage.getItem('user')
    return saved ? JSON.parse(saved) : null
  })

  // Determina il ruolo corrente
  const getCurrentRole = () => {
    if (adminAuth) {
      return adminAuth.role || ROLES.SUPER_ADMIN
    }
    if (userAuth) {
      return ROLES.USER
    }
    return null
  }

  const currentRole = getCurrentRole()
  const isAuthenticated = !!(adminAuth || userAuth)
  const isAdmin = canAccessAdmin(currentRole)

  // Login admin
  const loginAdmin = (credentials) => {
    const { email, password, role = ROLES.SUPER_ADMIN } = credentials

    // Validazione credenziali (in produzione fare chiamata API)
    const validCredentials = {
      'admin': { password: 'admin123', role: ROLES.SUPER_ADMIN },
      'admin@app.com': { password: 'admin123', role: ROLES.SUPER_ADMIN },
      'ops@app.com': { password: 'ops123', role: ROLES.ADMIN_OPS },
      'merchant@app.com': { password: 'merchant123', role: ROLES.MERCHANT_ADMIN },
      'support@app.com': { password: 'support123', role: ROLES.SUPPORT_AGENT },
      'finance@app.com': { password: 'finance123', role: ROLES.FINANCE },
      'logistics@app.com': { password: 'logistics123', role: ROLES.LOGISTICS }
    }

    const user = validCredentials[email]
    if (!user || user.password !== password) {
      return { success: false, message: 'Credenziali non valide' }
    }

    const authData = {
      email,
      role: user.role,
      name: getRoleName(user.role),
      loginTime: new Date().toISOString()
    }

    localStorage.setItem('adminAuth', JSON.stringify(authData))
    setAdminAuth(authData)

    logAction(email, user.role, 'login', 'auth', { success: true })

    return { success: true, role: user.role }
  }

  // Logout admin
  const logoutAdmin = () => {
    if (adminAuth) {
      logAction(adminAuth.email, adminAuth.role, 'logout', 'auth')
    }
    localStorage.removeItem('adminAuth')
    setAdminAuth(null)
  }

  // Login user
  const loginUser = (userData) => {
    const userWithRole = { ...userData, role: ROLES.USER }
    localStorage.setItem('user', JSON.stringify(userWithRole))
    setUserAuth(userWithRole)
    logAction(userData.email, ROLES.USER, 'login', 'auth', { success: true })
  }

  // Logout user
  const logoutUser = () => {
    if (userAuth) {
      logAction(userAuth.email, ROLES.USER, 'logout', 'auth')
    }
    localStorage.removeItem('user')
    localStorage.removeItem('cart')
    localStorage.removeItem('favorites')
    setUserAuth(null)
  }

  // Verifica permesso
  const checkPermission = (resource, action) => {
    if (!currentRole) return false
    return hasPermission(currentRole, resource, action)
  }

  // Impersonate user (solo per debug/support)
  const impersonateUser = (userId) => {
    if (!checkPermission('users', 'read')) {
      return { success: false, message: 'Permesso negato' }
    }

    logAction(adminAuth?.email || 'unknown', currentRole, 'impersonate', 'users', { targetUserId: userId })

    // In produzione, caricare dati utente da API
    return { success: true, message: 'Impersonating user (feature demo)' }
  }

  return (
    <AuthContext.Provider
      value={{
        // Auth state
        adminAuth,
        userAuth,
        currentRole,
        isAuthenticated,
        isAdmin,

        // Auth methods
        loginAdmin,
        logoutAdmin,
        loginUser,
        logoutUser,

        // Permission methods
        checkPermission,
        hasPermission: (resource, action) => hasPermission(currentRole, resource, action),

        // Advanced features
        impersonateUser
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

// Helper per ottenere nome ruolo in italiano
function getRoleName(role) {
  const names = {
    [ROLES.SUPER_ADMIN]: 'Super Amministratore',
    [ROLES.ADMIN_OPS]: 'Admin Operations',
    [ROLES.MERCHANT_ADMIN]: 'Admin Ristorante',
    [ROLES.SUPPORT_AGENT]: 'Supporto Clienti',
    [ROLES.FINANCE]: 'Finance',
    [ROLES.LOGISTICS]: 'Logistica',
    [ROLES.USER]: 'Utente'
  }
  return names[role] || 'Sconosciuto'
}
