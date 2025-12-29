import { Link } from 'react-router-dom'
import { ShoppingCart, Bell, Award, Tag } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useOrders } from '../context/OrdersContext'
import { useLoyalty } from '../context/LoyaltyContext'
import { useUser } from '../context/UserContext'
import { motion, AnimatePresence } from 'framer-motion'
import { cartFly } from '../utils/animations'

function Header({ showActions = true }) {
  const { getCartCount } = useCart()
  const { getUnreadNotificationsCount } = useOrders()
  const { tier } = useLoyalty()
  const { user } = useUser()

  const cartCount = getCartCount()
  const notificationCount = getUnreadNotificationsCount()

  const getTierColor = () => {
    const colors = {
      Bronze: 'from-amber-600 to-amber-800',
      Silver: 'from-gray-400 to-gray-600',
      Gold: 'from-yellow-400 to-yellow-600',
      Platinum: 'from-purple-500 to-indigo-600'
    }
    return colors[tier] || colors.Bronze
  }

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-white shadow-md sticky top-0 z-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/profile" className="flex items-center space-x-3">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center shadow-md"
            >
              <span className="text-white font-bold text-lg">{user?.name?.[0]?.toUpperCase() || 'U'}</span>
            </motion.div>
          </Link>

          {showActions && (
            <div className="flex items-center space-x-1 sm:space-x-2">
              {/* Loyalty Badge - Visibile su tutti i dispositivi */}
              <Link to="/loyalty">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex items-center space-x-1.5 sm:space-x-2 bg-gradient-to-r ${getTierColor()} px-2 sm:px-3 py-1 sm:py-1.5 rounded-full shadow-sm`}
                >
                  <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                  <span className="text-[10px] sm:text-xs font-bold text-white">{tier}</span>
                </motion.div>
              </Link>

              {/* Coupons */}
              <Link to="/coupons">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <Tag className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
                </motion.div>
              </Link>

              {/* Notifications */}
              <Link to="/notifications" className="relative">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
                  <AnimatePresence>
                    {notificationCount > 0 && (
                      <motion.span
                        key={notificationCount}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 bg-red-500 text-white text-[10px] sm:text-xs font-bold rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center shadow-sm"
                      >
                        {notificationCount}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.div>
              </Link>

              {/* Cart */}
              <Link to="/cart" className="relative" id="cart-icon">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
                  <AnimatePresence mode="wait">
                    {cartCount > 0 && (
                      <motion.span
                        key={cartCount}
                        initial={{ scale: 0 }}
                        animate={cartFly.badgeBounce}
                        exit={{ scale: 0 }}
                        className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 bg-primary text-white text-[10px] sm:text-xs font-bold rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center shadow-sm"
                      >
                        {cartCount}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.div>
              </Link>
            </div>
          )}
        </div>
      </div>
    </motion.header>
  )
}

export default Header
