import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Trash2, Plus, Minus, ShoppingBag, Tag, X, CheckCircle, Award, Loader2, CreditCard, Banknote } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useCoupons } from '../context/CouponsContext'
import { useLoyalty } from '../context/LoyaltyContext'
import { useOrders } from '../context/OrdersContext'
import { useUser } from '../context/UserContext'
import { useTenant } from '../context/TenantContext'
import { usePayment } from '../hooks/usePayment'
import { useState, lazy, Suspense } from 'react'
import Header from '../components/common/Header'

const StripeCheckout = lazy(() => import('../components/payment/StripeCheckout'))

function CartPage() {
  const navigate = useNavigate()
  const { cartItems, updateQuantity, removeFromCart, getCartTotal, clearCart } = useCart()
  const { appliedCoupon, applyCoupon, removeCoupon, calculateDiscount } = useCoupons()
  const { tier, getDiscount, addPoints } = useLoyalty()
  const { createOrder } = useOrders()
  const { user } = useUser()
  const { currentMerchant, tableNumber } = useTenant()
  const { isStripeEnabled, createIntent, clientSecret, stripeKey, reset: resetPayment } = usePayment()

  const [couponCode, setCouponCode] = useState('')
  const [couponMessage, setCouponMessage] = useState(null)
  const [applying, setApplying] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('card') // 'card' or 'cash'
  const [showStripeForm, setShowStripeForm] = useState(false)
  const [pendingOrder, setPendingOrder] = useState(null)

  const subtotal = getCartTotal()
  const loyaltyDiscount = (subtotal * getDiscount()) / 100
  const couponDiscount = calculateDiscount(subtotal)
  const total = subtotal - loyaltyDiscount - couponDiscount

  const handleApplyCoupon = async () => {
    setApplying(true)
    // Pass merchantId and userId for proper validation
    const result = await applyCoupon(
      couponCode,
      subtotal,
      tier,
      currentMerchant?.id || null,
      user?.id || null
    )
    setApplying(false)
    setCouponMessage(result)
    if (result.success) {
      setCouponCode('')
      setTimeout(() => setCouponMessage(null), 3000)
    }
  }

  const handleRemoveCoupon = () => {
    removeCoupon()
    setCouponMessage(null)
  }

  const [checkoutLoading, setCheckoutLoading] = useState(false)

  const buildOrderData = () => {
    const orderNumber = Math.floor(100000 + Math.random() * 900000)
    return {
      orderNumber,
      customerName: user?.name || user?.first_name || 'Ospite',
      orderType: tableNumber ? `Tavolo #${tableNumber}` : 'Asporto',
      paymentMethod: paymentMethod === 'cash' ? 'Contanti' : 'Carta di Credito',
      subtotal,
      loyaltyDiscount,
      couponDiscount,
      total,
      items: cartItems,
      appliedCoupon: appliedCoupon?.code,
      merchantId: currentMerchant?.id || null,
      merchantName: currentMerchant?.name || currentMerchant?.business_name || null,
      tableNumber: tableNumber || null
    }
  }

  const handleCheckout = async () => {
    setCheckoutLoading(true)
    const orderData = buildOrderData()
    const earnedPoints = addPoints(total)
    const order = await createOrder(orderData)

    setCheckoutLoading(false)
    if (!order) return

    // If Stripe is enabled and user chose card, show Stripe form
    if (isStripeEnabled && paymentMethod === 'card') {
      setPendingOrder({ ...order, earnedPoints })
      setShowStripeForm(true)
      return
    }

    // Cash or demo mode: complete immediately
    clearCart()
    removeCoupon()
    navigate('/order-confirmation', { state: { ...(order || orderData), earnedPoints } })
  }

  const handleStripeSuccess = () => {
    clearCart()
    removeCoupon()
    resetPayment()
    setShowStripeForm(false)
    navigate('/order-confirmation', { state: pendingOrder })
  }

  const handleStripeError = (error) => {
    console.error('[CartPage] Stripe payment error:', error)
  }

  const handleCancelStripe = () => {
    setShowStripeForm(false)
    setPendingOrder(null)
    resetPayment()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Continua lo shopping</span>
        </motion.button>

        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-gray-900 mb-8"
        >
          Il tuo Carrello
        </motion.h1>

        {cartItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-12 text-center shadow-lg"
          >
            <ShoppingBag className="w-24 h-24 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-700 mb-2">
              Il carrello è vuoto
            </h2>
            <p className="text-gray-500 mb-6">
              Aggiungi qualche piatto delizioso!
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/')}
              className="bg-primary text-white px-8 py-3 rounded-full font-bold hover:bg-secondary transition-colors"
            >
              Esplora il Menu
            </motion.button>
          </motion.div>
        ) : (
          <div className="space-y-6">
            <AnimatePresence>
              {cartItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-2xl p-6 shadow-lg"
                >
                  <div className="flex items-center space-x-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-24 h-24 object-cover rounded-xl"
                    />

                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900">
                        {item.title || item.name}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        €{item.price.toFixed(2)} cad.
                      </p>
                    </div>

                    <div className="flex items-center space-x-3 bg-gray-100 rounded-full p-2">
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() =>
                          updateQuantity(item.id, item.quantity - 1)
                        }
                        className="p-1 bg-white rounded-full hover:bg-gray-200 transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </motion.button>
                      <span className="text-lg font-bold w-8 text-center">
                        {item.quantity}
                      </span>
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                        className="p-1 bg-white rounded-full hover:bg-gray-200 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </motion.button>
                    </div>

                    <span className="text-xl font-bold text-primary w-24 text-right">
                      €{(item.price * item.quantity).toFixed(2)}
                    </span>

                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => removeFromCart(item.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Loyalty Badge */}
            {getDiscount() > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-r from-yellow-50 to-yellow-100 border border-yellow-200 rounded-2xl p-4"
              >
                <div className="flex items-center space-x-3">
                  <div className="bg-yellow-400 p-2 rounded-xl">
                    <Award className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-yellow-900">
                      Sconto {tier} attivo
                    </p>
                    <p className="text-xs text-yellow-700">
                      {getDiscount()}% di sconto su questo ordine
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Coupon Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="bg-white rounded-2xl p-6 shadow-lg"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Codice Sconto</h3>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/coupons')}
                  className="text-sm text-primary font-medium hover:text-secondary"
                >
                  Vedi tutti
                </motion.button>
              </div>

              {appliedCoupon ? (
                <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 mb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className="bg-green-400 p-2 rounded-lg">
                        <Tag className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-green-900 text-sm">
                          {appliedCoupon.code}
                        </p>
                        <p className="text-xs text-green-700">
                          {appliedCoupon.description}
                        </p>
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={handleRemoveCoupon}
                      className="p-1 hover:bg-green-100 rounded-full"
                    >
                      <X className="w-4 h-4 text-green-700" />
                    </motion.button>
                  </div>
                </div>
              ) : (
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Inserisci codice"
                    className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-gray-900 focus:outline-none text-sm font-medium"
                    onKeyPress={(e) => e.key === 'Enter' && handleApplyCoupon()}
                  />
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleApplyCoupon}
                    disabled={!couponCode || applying}
                    className="px-6 py-3 bg-gray-900 text-white rounded-xl font-medium text-sm hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {applying ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Verifica...</span>
                      </>
                    ) : (
                      <span>Applica</span>
                    )}
                  </motion.button>
                </div>
              )}

              {couponMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mt-3 p-3 rounded-lg flex items-center space-x-2 ${
                    couponMessage.success
                      ? 'bg-green-50 text-green-800'
                      : 'bg-red-50 text-red-800'
                  }`}
                >
                  {couponMessage.success && <CheckCircle className="w-4 h-4" />}
                  <p className="text-sm font-medium">{couponMessage.message}</p>
                </motion.div>
              )}
            </motion.div>

            {/* Riepilogo Totale */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl p-6 shadow-lg"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-4">Riepilogo</h3>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotale</span>
                  <span className="font-medium text-gray-900">€{subtotal.toFixed(2)}</span>
                </div>

                {loyaltyDiscount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600 flex items-center space-x-1">
                      <Award className="w-4 h-4" />
                      <span>Sconto {tier}</span>
                    </span>
                    <span className="font-medium text-green-600">
                      -€{loyaltyDiscount.toFixed(2)}
                    </span>
                  </div>
                )}

                {couponDiscount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600 flex items-center space-x-1">
                      <Tag className="w-4 h-4" />
                      <span>Coupon {appliedCoupon?.code}</span>
                    </span>
                    <span className="font-medium text-green-600">
                      -€{couponDiscount.toFixed(2)}
                    </span>
                  </div>
                )}

                <div className="border-t pt-3 flex justify-between">
                  <span className="text-lg font-bold text-gray-900">Totale</span>
                  <span className="text-2xl font-bold text-primary">
                    €{total.toFixed(2)}
                  </span>
                </div>

                {total > 0 && (
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100 rounded-lg p-3">
                    <p className="text-xs text-purple-900 font-semibold">
                      ⭐ Guadagnerai <span className="font-bold">{Math.floor(total)} punti</span> con questo ordine!
                    </p>
                  </div>
                )}
              </div>

              {/* Payment Method Selection */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Metodo di pagamento</h4>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setPaymentMethod('card')}
                    className={`flex items-center justify-center space-x-2 p-3 rounded-xl border-2 transition-all ${
                      paymentMethod === 'card'
                        ? 'border-primary bg-orange-50 text-primary'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <CreditCard className="w-5 h-5" />
                    <span className="font-medium text-sm">Carta</span>
                  </button>
                  <button
                    onClick={() => setPaymentMethod('cash')}
                    className={`flex items-center justify-center space-x-2 p-3 rounded-xl border-2 transition-all ${
                      paymentMethod === 'cash'
                        ? 'border-primary bg-orange-50 text-primary'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <Banknote className="w-5 h-5" />
                    <span className="font-medium text-sm">Contanti</span>
                  </button>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCheckout}
                disabled={checkoutLoading}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-4 rounded-full font-bold text-lg hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {checkoutLoading ? (
                  <span className="flex items-center justify-center space-x-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Invio ordine...</span>
                  </span>
                ) : paymentMethod === 'cash' ? (
                  'Ordina - Paga in cassa'
                ) : (
                  'Procedi al pagamento'
                )}
              </motion.button>
            </motion.div>
          </div>
        )}
        {/* Stripe Checkout Overlay */}
        <AnimatePresence>
          {showStripeForm && pendingOrder && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl"
              >
                <div className="flex items-center justify-between p-6 border-b">
                  <h2 className="text-xl font-bold text-gray-900">Pagamento Sicuro</h2>
                  <button
                    onClick={handleCancelStripe}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
                <div className="p-6">
                  <Suspense
                    fallback={
                      <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                      </div>
                    }
                  >
                    <StripeCheckout
                      orderId={pendingOrder.id || pendingOrder.orderNumber}
                      onSuccess={handleStripeSuccess}
                      onError={handleStripeError}
                    />
                  </Suspense>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}

export default CartPage
