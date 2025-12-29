import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, ArrowRight, ChefHat } from 'lucide-react'
import { useUser } from '../context/UserContext'

function LoginPage() {
  const navigate = useNavigate()
  const { login } = useUser()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    // Simulazione login (sostituire con API reale)
    setTimeout(() => {
      if (email && password) {
        // Check if admin credentials
        if (email === 'admin' || (email === 'admin@app.com' && password === 'admin123')) {
          localStorage.setItem('adminAuth', JSON.stringify({
            email: email === 'admin' ? 'admin@app.com' : email,
            role: 'admin',
            name: 'Amministratore',
            loginTime: new Date().toISOString()
          }))
          navigate('/admin/dashboard')
        } else {
          // Login cliente
          const userData = {
            name: email.split('@')[0],
            email: email,
            phone: '+39 333 1234567',
            address: 'Via Roma 123, Milano',
            joinedDate: new Date().toISOString(),
            profileImage: null
          }

          login(userData)
          navigate('/demo')
        }
      } else {
        setError('Email e password sono obbligatori')
      }
      setIsLoading(false)
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center px-4 py-12">
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
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl mb-4 shadow-xl"
          >
            <ChefHat className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Bentornato!
          </h1>
          <p className="text-gray-600">
            Accedi al tuo account per continuare
          </p>
        </div>

        {/* Login Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl shadow-2xl p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tua@email.com"
                  className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors font-medium"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-3.5 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors font-medium"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
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
                className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm"
              >
                {error}
              </motion.div>
            )}

            {/* Forgot Password */}
            <div className="text-right">
              <button
                type="button"
                className="text-sm text-orange-600 hover:text-orange-700 font-semibold"
              >
                Password dimenticata?
              </button>
            </div>

            {/* Login Button */}
            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Accedi</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </motion.button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500 font-medium">oppure</span>
            </div>
          </div>

          {/* Register Link */}
          <div className="text-center">
            <p className="text-gray-600 mb-3">
              Non hai un account?
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/register')}
              className="w-full border-2 border-gray-200 text-gray-700 py-3.5 rounded-xl font-bold hover:border-orange-500 hover:text-orange-600 transition-colors"
            >
              Registrati ora
            </motion.button>
          </div>
        </motion.div>

        {/* Demo Credentials */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-6 space-y-3"
        >
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
            <p className="text-xs text-blue-900 font-semibold mb-2">
              👤 Accesso Cliente
            </p>
            <p className="text-xs text-blue-700">
              Usa qualsiasi email e password per provare
            </p>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
            <p className="text-xs text-red-900 font-semibold mb-2">
              🔐 Accesso Admin
            </p>
            <p className="text-xs text-red-700">
              Email: <span className="font-mono font-bold">admin</span> o <span className="font-mono font-bold">admin@app.com</span>
            </p>
            <p className="text-xs text-red-700">
              Password: <span className="font-mono font-bold">admin123</span>
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default LoginPage
