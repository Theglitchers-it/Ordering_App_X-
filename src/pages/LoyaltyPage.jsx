import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Award, Star, Gift, TrendingUp, Crown } from 'lucide-react'
import { useLoyalty } from '../context/LoyaltyContext'

function LoyaltyPage() {
  const navigate = useNavigate()
  const { loyaltyPoints, tier, getDiscount } = useLoyalty()

  const tiers = [
    {
      name: 'Bronze',
      minPoints: 0,
      maxPoints: 199,
      discount: 0,
      color: 'from-amber-600 to-amber-800',
      icon: Award,
      benefits: ['Punti su ogni ordine', 'Offerte speciali']
    },
    {
      name: 'Silver',
      minPoints: 200,
      maxPoints: 499,
      discount: 5,
      color: 'from-gray-400 to-gray-600',
      icon: Star,
      benefits: ['5% di sconto', 'Coupon esclusivi', 'Priorità supporto']
    },
    {
      name: 'Gold',
      minPoints: 500,
      maxPoints: 999,
      discount: 10,
      color: 'from-yellow-400 to-yellow-600',
      icon: Gift,
      benefits: ['10% di sconto', 'Spedizione gratis', 'Anteprime menu']
    },
    {
      name: 'Platinum',
      minPoints: 1000,
      maxPoints: Infinity,
      discount: 15,
      color: 'from-purple-500 to-indigo-600',
      icon: Crown,
      benefits: ['15% di sconto', 'Regali esclusivi', 'Eventi VIP']
    }
  ]

  const currentTier = tiers.find(t => t.name === tier)
  const nextTier = tiers.find(t => t.minPoints > loyaltyPoints)
  const pointsToNext = nextTier ? nextTier.minPoints - loyaltyPoints : 0
  const progress = nextTier
    ? ((loyaltyPoints - currentTier.minPoints) / (nextTier.minPoints - currentTier.minPoints)) * 100
    : 100

  const TierIcon = currentTier?.icon || Award

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-3 sm:px-6">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={() => navigate(-1)}
              className="p-1.5 sm:p-2 hover:bg-gray-50 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </motion.button>

            <motion.h1
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-base sm:text-lg font-semibold text-gray-900"
            >
              Programma Fedeltà
            </motion.h1>

            <div className="w-7 sm:w-9" />
          </div>
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-3 sm:px-6 py-4 sm:py-6">
        {/* Card Tier Corrente */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 sm:mb-6"
        >
          <div className={`bg-gradient-to-br ${currentTier.color} rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-2xl text-white relative overflow-hidden`}>
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: 'radial-gradient(circle, white 2px, transparent 2px)',
                backgroundSize: '30px 30px'
              }} />
            </div>

            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4 sm:mb-6">
                <div>
                  <p className="text-white/80 text-xs sm:text-sm mb-1">Il tuo livello</p>
                  <h2 className="text-2xl sm:text-3xl font-bold mb-1">{tier}</h2>
                  <p className="text-white/90 text-xs sm:text-sm">
                    {getDiscount()}% di sconto su tutti gli ordini
                  </p>
                </div>
                <div className="bg-white/20 backdrop-blur-sm p-2 sm:p-3 rounded-xl sm:rounded-2xl">
                  <TierIcon className="w-6 h-6 sm:w-8 sm:h-8" />
                </div>
              </div>

              <div className="bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 mb-3 sm:mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs sm:text-sm text-white/90">Punti totali</span>
                  {nextTier && (
                    <span className="text-[10px] sm:text-xs text-white/70">
                      {pointsToNext} al prossimo livello
                    </span>
                  )}
                </div>
                <div className="flex items-end space-x-2 mb-2 sm:mb-3">
                  <span className="text-3xl sm:text-4xl font-bold">{loyaltyPoints}</span>
                  <span className="text-white/70 text-xs sm:text-sm mb-1 sm:mb-2">punti</span>
                </div>

                {nextTier && (
                  <div className="w-full bg-white/20 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 1, delay: 0.3 }}
                      className="bg-white rounded-full h-2"
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2 text-white/90 text-sm">
                <TrendingUp className="w-4 h-4" />
                <span>Guadagna 1 punto per ogni euro speso</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tutti i Tier */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <h3 className="text-lg font-bold text-gray-900 mb-4">Tutti i Livelli</h3>
          <div className="space-y-3">
            {tiers.map((tierInfo, index) => {
              const TierIconComp = tierInfo.icon
              const isCurrentTier = tierInfo.name === tier
              const isLocked = loyaltyPoints < tierInfo.minPoints

              return (
                <motion.div
                  key={tierInfo.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 + index * 0.05 }}
                  className={`bg-white rounded-2xl p-4 shadow-sm border-2 transition-all ${
                    isCurrentTier
                      ? 'border-gray-900 shadow-md'
                      : 'border-gray-100 hover:border-gray-200'
                  } ${isLocked ? 'opacity-60' : ''}`}
                >
                  <div className="flex items-start space-x-4">
                    <div className={`flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br ${tierInfo.color} flex items-center justify-center`}>
                      <TierIconComp className="w-6 h-6 text-white" />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-base font-bold text-gray-900">
                          {tierInfo.name}
                        </h4>
                        {isCurrentTier && (
                          <span className="bg-gray-900 text-white text-xs px-2.5 py-0.5 rounded-full font-medium">
                            Attuale
                          </span>
                        )}
                      </div>

                      <p className="text-sm text-gray-600 mb-2">
                        {tierInfo.minPoints} - {tierInfo.maxPoints === Infinity ? '∞' : tierInfo.maxPoints} punti
                      </p>

                      <div className="space-y-1">
                        {tierInfo.benefits.map((benefit, i) => (
                          <div key={i} className="flex items-center space-x-2 text-xs text-gray-600">
                            <div className="w-1 h-1 bg-gray-400 rounded-full" />
                            <span>{benefit}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* Come funziona */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-6"
        >
          <h3 className="text-base font-bold text-gray-900 mb-4">Come funziona</h3>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                1
              </div>
              <p className="text-sm text-gray-700">
                Guadagna <span className="font-semibold">1 punto per ogni euro</span> che spendi
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                2
              </div>
              <p className="text-sm text-gray-700">
                Accumula punti per <span className="font-semibold">salire di livello</span>
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                3
              </div>
              <p className="text-sm text-gray-700">
                Ottieni <span className="font-semibold">sconti automatici</span> e vantaggi esclusivi
              </p>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  )
}

export default LoyaltyPage
