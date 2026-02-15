import { motion } from 'framer-motion'
import { Heart } from 'lucide-react'
import { heartPop } from '../../utils/animations'

function AnimatedHeart({ isFavorite, onClick, className = '', size = 'md' }) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className={`bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-lg hover:bg-white transition-colors ${className}`}
      type="button"
    >
      <motion.div
        key={isFavorite ? 'filled' : 'empty'}
        initial={{ scale: 1 }}
        animate={isFavorite ? heartPop.animate : { scale: 1 }}
      >
        <Heart
          className={`${sizes[size]} transition-all duration-200 ${
            isFavorite
              ? 'fill-red-500 text-red-500'
              : 'text-gray-700 hover:text-red-400'
          }`}
        />
      </motion.div>
    </motion.button>
  )
}

export default AnimatedHeart
