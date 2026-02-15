import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Tag, Copy, CheckCircle, Sparkles } from 'lucide-react'
import { useCoupons } from '../context/CouponsContext'
import { useLoyalty } from '../context/LoyaltyContext'
import { useTenant } from '../context/TenantContext'
import { useState, useEffect } from 'react'

function CouponsPage() {
  const navigate = useNavigate()
  const { getAvailableCoupons } = useCoupons()
  const { tier } = useLoyalty()
  const { currentMerchant } = useTenant()
  const [copiedCode, setCopiedCode] = useState(null)
  const [coupons, setCoupons] = useState([])

  useEffect(() => {
    const load = async () => {
      const result = await getAvailableCoupons(tier, currentMerchant?.id || null)
      setCoupons(result || [])
    }
    load()
  }, [tier, currentMerchant, getAvailableCoupons])

  const copyCode = (code) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const getCouponGradient = (index) => {
    const gradients = [
      'from-purple-500 to-pink-500',
      'from-blue-500 to-cyan-500',
      'from-orange-500 to-red-500',
      'from-green-500 to-emerald-500',
    ]
    return gradients[index % gradients.length]
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Premium */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="max-w-2xl mx-auto px-3 sm:px-6">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={() => navigate(-1)}
              className="p-1.5 sm:p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </motion.button>

            <motion.h1
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-base sm:text-lg font-semibold"
            >
              Offerte Speciali
            </motion.h1>

            <div className="w-7 sm:w-9" />
          </div>

          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="pb-6 sm:pb-8 pt-3 sm:pt-4"
          >
            <div className="flex items-center space-x-2 mb-2">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
              <span className="text-xs sm:text-sm font-medium text-yellow-400">
                {coupons.length} offerte disponibili
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">
              Risparmia sui tuoi ordini
            </h2>
            <p className="text-gray-300 text-xs sm:text-sm">
              Approfitta delle nostre offerte esclusive
            </p>
          </motion.div>
        </div>
      </div>

      {/* Coupon List */}
      <main className="max-w-2xl mx-auto px-3 sm:px-6 py-4 sm:py-6">
        {coupons.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100"
          >
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Tag className="w-8 h-8 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Nessun coupon disponibile
            </h2>
            <p className="text-gray-500 text-sm">
              Controlla più tardi per nuove offerte
            </p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {coupons.map((coupon, index) => (
                <motion.div
                  key={coupon.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                  className="group"
                >
                  <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-all">
                    {/* Header con gradiente */}
                    <div className={`bg-gradient-to-r ${getCouponGradient(index)} p-6 relative overflow-hidden`}>
                      <div className="absolute inset-0 opacity-10">
                        <div className="absolute inset-0" style={{
                          backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                          backgroundSize: '20px 20px'
                        }} />
                      </div>

                      <div className="relative z-10">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-xl font-bold text-white mb-1">
                              {coupon.title}
                            </h3>
                            <p className="text-white/90 text-sm">
                              {coupon.description}
                            </p>
                          </div>
                          <Tag className="w-6 h-6 text-white/80" />
                        </div>

                        {/* Codice Coupon */}
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => copyCode(coupon.code)}
                          className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm border-2 border-white/30 text-white px-4 py-2 rounded-xl font-mono font-bold text-sm hover:bg-white/30 transition-all"
                        >
                          <span>{coupon.code}</span>
                          {copiedCode === coupon.code ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </motion.button>
                      </div>
                    </div>

                    {/* Dettagli */}
                    <div className="p-4 bg-gray-50">
                      <div className="flex items-center justify-between text-xs text-gray-600">
                        <span>
                          Ordine minimo: <span className="font-semibold text-gray-900">€{coupon.min_order_amount || coupon.minOrder || 0}</span>
                        </span>
                        <span>
                          Scade: <span className="font-semibold text-gray-900">
                            {new Date(coupon.valid_until || coupon.expiresAt).toLocaleDateString('it-IT')}
                          </span>
                        </span>
                      </div>

                      {coupon.requiresTier && (
                        <div className="mt-2 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Richiesto: {coupon.requiresTier}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Nota */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8 bg-blue-50 border border-blue-100 rounded-xl p-4"
        >
          <p className="text-sm text-blue-900">
            <span className="font-semibold">Suggerimento:</span> Raggiungi tier superiori
            con il programma fedeltà per sbloccare coupon esclusivi!
          </p>
        </motion.div>
      </main>
    </div>
  )
}

export default CouponsPage
