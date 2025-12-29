import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, Shield } from 'lucide-react'

function AdminLoginPage() {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    // Credenziali admin
    if (email === 'admin' && password === 'admin123') {
      localStorage.setItem('adminAuth', JSON.stringify({
        email: 'admin',
        role: 'admin',
        name: 'Amministratore',
        loginTime: new Date().toISOString()
      }))
      setTimeout(() => {
        navigate('/admin/dashboard')
      }, 500)
    } else {
      setError('Credenziali non valide')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-600 to-red-700 rounded-3xl mb-4 shadow-2xl"
          >
            <Shield className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Admin Panel
          </h1>
          <p className="text-gray-400">
            Accedi al pannello di amministrazione
          </p>
        </div>

        {/* Login Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-800 rounded-3xl shadow-2xl p-8 border border-gray-700"
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email/Username */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Email / Username
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin o admin@email.com"
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-700 border-2 border-gray-600 rounded-xl focus:border-red-500 focus:outline-none transition-colors font-medium text-white placeholder-gray-500"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="admin123"
                  className="w-full pl-12 pr-12 py-3.5 bg-gray-700 border-2 border-gray-600 rounded-xl focus:border-red-500 focus:outline-none transition-colors font-medium text-white placeholder-gray-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-xl text-sm"
              >
                {error}
              </motion.div>
            )}

            {/* Login Button */}
            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Shield className="w-5 h-5" />
                  <span>Accedi come Admin</span>
                </>
              )}
            </motion.button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6">
            <div className="bg-blue-900/30 border border-blue-700/50 rounded-2xl p-4">
              <p className="text-xs text-blue-300 font-semibold mb-2">
                🔐 Credenziali Admin
              </p>
              <p className="text-xs text-gray-400">
                Username: <span className="text-white font-mono">admin</span>
              </p>
              <p className="text-xs text-gray-400">
                Password: <span className="text-white font-mono">admin123</span>
              </p>
            </div>
          </div>

          {/* Back to Site */}
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/')}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              ← Torna al sito
            </button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default AdminLoginPage
