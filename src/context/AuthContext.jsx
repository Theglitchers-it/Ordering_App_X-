import { createContext, useContext, useState, useEffect } from 'react'
import { ROLES, hasPermission, canAccessAdmin, logAction } from '../utils/rbac'
import * as authService from '../api/authService'
import { initializeSocket, disconnectSocket, reconnectWithToken } from '../api/socketClient'

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
  const loginAdmin = async (credentials) => {
    const { email, password } = credentials

    try {
      // Call real API
      const result = await authService.login(email, password)

      if (!result.success) {
        return { success: false, message: result.message || 'Credenziali non valide' }
      }

      const { user } = result

      // Check if user has admin role
      const isAdminRole = canAccessAdmin(user.role)
      if (!isAdminRole) {
        authService.clearTokens()
        return { success: false, message: 'Accesso negato: privilegi amministratore richiesti' }
      }

      const authData = {
        email: user.email,
        role: user.role,
        name: getRoleName(user.role),
        loginTime: new Date().toISOString(),
        userId: user.uuid
      }

      localStorage.setItem('adminAuth', JSON.stringify(authData))
      setAdminAuth(authData)

      // Initialize WebSocket connection
      reconnectWithToken()

      logAction(email, user.role, 'login', 'auth', { success: true })

      return { success: true, role: user.role }
    } catch (error) {
      console.error('[AuthContext] Login error:', error)
      return { success: false, message: 'Errore durante il login' }
    }
  }

  // Logout admin
  const logoutAdmin = async () => {
    if (adminAuth) {
      logAction(adminAuth.email, adminAuth.role, 'logout', 'auth')
    }

    // Call API logout
    await authService.logout()

    // Disconnect WebSocket
    disconnectSocket()

    localStorage.removeItem('adminAuth')
    setAdminAuth(null)
  }

  // Login user
  const loginUser = async (email, password) => {
    try {
      // Call real API
      const result = await authService.login(email, password)

      if (!result.success) {
        return { success: false, message: result.message || 'Credenziali non valide' }
      }

      const { user } = result

      const userWithRole = { ...user, role: user.role || ROLES.USER }
      localStorage.setItem('user', JSON.stringify(userWithRole))
      setUserAuth(userWithRole)

      // Initialize WebSocket connection
      reconnectWithToken()

      logAction(user.email, user.role, 'login', 'auth', { success: true })

      return { success: true, user: userWithRole }
    } catch (error) {
      console.error('[AuthContext] Login error:', error)
      return { success: false, message: 'Errore durante il login' }
    }
  }

  // Logout user
  const logoutUser = async () => {
    if (userAuth) {
      logAction(userAuth.email, userAuth.role, 'logout', 'auth')
    }

    // Call API logout
    await authService.logout()

    // Disconnect WebSocket
    disconnectSocket()

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
