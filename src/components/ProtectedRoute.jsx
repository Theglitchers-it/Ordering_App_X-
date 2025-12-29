import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { motion } from 'framer-motion'
import { ShieldAlert, Lock } from 'lucide-react'

/**
 * Componente per proteggere le route in base a ruoli e permessi
 */
function ProtectedRoute({
  children,
  requireAdmin = false,
  requiredRole = null,
  requiredPermission = null, // { resource: 'orders', action: 'read' }
  redirectTo = '/login'
}) {
  const { isAuthenticated, isAdmin, currentRole, checkPermission } = useAuth()

  // Verifica autenticazione
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />
  }

  // Verifica se richiede accesso admin
  if (requireAdmin && !isAdmin) {
    return <AccessDenied reason="Accesso riservato agli amministratori" />
  }

  // Verifica ruolo specifico
  if (requiredRole && currentRole !== requiredRole) {
    return <AccessDenied reason={`Ruolo richiesto: ${requiredRole}`} />
  }

  // Verifica permesso specifico
  if (requiredPermission) {
    const { resource, action } = requiredPermission
    if (!checkPermission(resource, action)) {
      return <AccessDenied reason={`Permesso mancante: ${action} su ${resource}`} />
    }
  }

  return children
}

// Componente Access Denied
function AccessDenied({ reason }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 text-center"
      >
        <div className="mb-6">
          <div className="inline-flex p-6 bg-red-100 rounded-full">
            <ShieldAlert className="w-16 h-16 text-red-600" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Accesso Negato
        </h1>

        <p className="text-gray-600 mb-2">
          Non hai i permessi necessari per accedere a questa pagina.
        </p>

        {reason && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-center space-x-2 text-red-700">
              <Lock className="w-4 h-4" />
              <p className="text-sm font-semibold">{reason}</p>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={() => window.history.back()}
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 rounded-xl font-bold hover:shadow-lg transition-all"
          >
            Torna Indietro
          </button>

          <button
            onClick={() => window.location.href = '/'}
            className="w-full border-2 border-gray-200 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-50 transition-colors"
          >
            Vai alla Home
          </button>
        </div>
      </motion.div>
    </div>
  )
}

export default ProtectedRoute
