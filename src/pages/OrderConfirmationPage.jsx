import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle, Home, Award, Tag, Star } from 'lucide-react'
import { useEffect } from 'react'

function OrderConfirmationPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const orderData = location.state || {}

  useEffect(() => {
    if (!location.state) {
      navigate('/')
    }
  }, [location.state, navigate])

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-3xl shadow-2xl p-8 sm:p-12 max-w-md w-full"
      >
        {/* Logo/Brand */}
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-2xl">F</span>
          </div>
        </div>

        {/* Success Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="flex justify-center mb-6"
        >
          <CheckCircle className="w-24 h-24 text-green-500" strokeWidth={2} />
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-3xl font-bold text-center text-gray-900 mb-4"
        >
          ORDINE CONFERMATO
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center text-gray-600 mb-8"
        >
          Grazie, {orderData.customerName || 'Cliente'}!
          <br />
          L'email di conferma è stata inviata
        </motion.p>

        {/* Order Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-4 mb-8"
        >
          <div className="flex justify-between items-center py-3 border-b border-gray-200">
            <span className="text-gray-600 font-medium">Numero Ordine</span>
            <span className="text-gray-900 font-bold">{orderData.orderNumber}</span>
          </div>

          {orderData.merchantName && (
            <div className="flex justify-between items-center py-3 border-b border-gray-200">
              <span className="text-gray-600 font-medium">Ristorante</span>
              <span className="text-gray-900 font-semibold">
                📍 {orderData.merchantName}
              </span>
            </div>
          )}

          <div className="flex justify-between items-center py-3 border-b border-gray-200">
            <span className="text-gray-600 font-medium">
              {orderData.tableNumber ? 'Tavolo' : 'Tipo Ordine'}
            </span>
            <span className="text-gray-900 font-semibold">
              {orderData.tableNumber ? `Tavolo #${orderData.tableNumber}` : (orderData.orderType || 'Asporto')}
            </span>
          </div>

          <div className="flex justify-between items-center py-3 border-b border-gray-200">
            <span className="text-gray-600 font-medium">Metodo Pagamento</span>
            <span className="text-gray-900 font-semibold">
              {orderData.paymentMethod || 'Contanti'}
            </span>
          </div>

          {/* Sconti Applicati */}
          {(orderData.loyaltyDiscount > 0 || orderData.couponDiscount > 0) && (
            <div className="space-y-2 my-4">
              {orderData.loyaltyDiscount > 0 && (
                <div className="flex justify-between items-center py-2 px-4 bg-yellow-50 rounded-lg">
                  <span className="text-yellow-800 text-sm font-medium flex items-center space-x-2">
                    <Award className="w-4 h-4" />
                    <span>Sconto Fedeltà</span>
                  </span>
                  <span className="text-yellow-800 font-bold text-sm">
                    -€{orderData.loyaltyDiscount.toFixed(2)}
                  </span>
                </div>
              )}
              {orderData.couponDiscount > 0 && (
                <div className="flex justify-between items-center py-2 px-4 bg-green-50 rounded-lg">
                  <span className="text-green-800 text-sm font-medium flex items-center space-x-2">
                    <Tag className="w-4 h-4" />
                    <span>Coupon {orderData.appliedCoupon}</span>
                  </span>
                  <span className="text-green-800 font-bold text-sm">
                    -€{orderData.couponDiscount.toFixed(2)}
                  </span>
                </div>
              )}
            </div>
          )}

          {orderData.total && (
            <div className="flex justify-between items-center py-4 bg-gray-50 rounded-xl px-4 mt-4">
              <span className="text-gray-900 font-bold text-lg">Totale</span>
              <span className="text-primary font-bold text-2xl">
                €{orderData.total.toFixed(2)}
              </span>
            </div>
          )}
        </motion.div>

        {/* Punti Guadagnati */}
        {orderData.earnedPoints > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            className="bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-xl p-4 mb-4"
          >
            <div className="flex items-center justify-center space-x-2">
              <Award className="w-5 h-5 text-purple-600" />
              <p className="text-purple-900 text-sm font-bold">
                Hai guadagnato {orderData.earnedPoints} punti fedeltà!
              </p>
            </div>
          </motion.div>
        )}

        {/* Info Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-green-50 border-2 border-green-200 rounded-xl p-4 mb-8"
        >
          <p className="text-green-800 text-sm text-center font-medium">
            Il tuo ordine è stato confermato!
            <br />
            Riceverai una notifica quando sarà pronto
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="space-y-3"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/')}
            className="w-full bg-gray-900 text-white py-4 rounded-full font-bold text-lg hover:bg-gray-800 transition-colors shadow-lg flex items-center justify-center space-x-2"
          >
            <Home className="w-5 h-5" />
            <span>Torna alla Home</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/reviews', {
              state: {
                orderId: orderData.orderNumber || orderData.id,
                merchantId: orderData.merchantId
              }
            })}
            className="w-full bg-gradient-to-r from-yellow-400 to-orange-400 text-white py-3 rounded-full font-semibold hover:shadow-lg transition-all flex items-center justify-center space-x-2"
          >
            <Star className="w-5 h-5" />
            <span>Lascia una Recensione</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => window.print()}
            className="w-full bg-white border-2 border-gray-300 text-gray-700 py-3 rounded-full font-semibold hover:bg-gray-50 transition-colors"
          >
            Stampa Ricevuta
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default OrderConfirmationPage
