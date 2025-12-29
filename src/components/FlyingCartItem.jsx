import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingCart } from 'lucide-react'
import { createFlyPath, cartFly } from '../utils/animations'

function FlyingCartItem({ isVisible, startPosition, onComplete }) {
  if (!isVisible) return null

  // Get cart icon position (top-right of screen)
  const cartPosition = {
    x: window.innerWidth - 100,
    y: 60
  }

  const flyPath = createFlyPath(
    startPosition.x,
    startPosition.y,
    cartPosition.x,
    cartPosition.y
  )

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed pointer-events-none z-[100]"
          initial={{
            x: startPosition.x,
            y: startPosition.y,
            scale: 1,
            opacity: 1
          }}
          animate={{
            x: flyPath.x,
            y: flyPath.y,
            scale: [1, 0.8, 0.3],
            opacity: [1, 1, 0]
          }}
          exit={{ opacity: 0 }}
          transition={cartFly.fly}
          onAnimationComplete={onComplete}
        >
          <div className="bg-primary text-white p-3 rounded-full shadow-2xl">
            <ShoppingCart className="w-6 h-6" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default FlyingCartItem
