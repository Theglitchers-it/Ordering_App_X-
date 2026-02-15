import { motion, AnimatePresence } from 'framer-motion'
import { categoryChip } from '../../utils/animations'

function EnhancedCategoryChip({ category, isSelected, onClick, index }) {
  return (
    <motion.button
      onClick={onClick}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05, type: "spring", stiffness: 200 }}
      whileHover={{ scale: 1.05, y: -4 }}
      whileTap={{ scale: 0.95 }}
      className={`relative flex flex-col items-center justify-center rounded-card-lg overflow-hidden transition-shadow ${
        isSelected
          ? 'text-white shadow-action'
          : 'bg-white text-gray-700 hover:bg-gray-50 shadow-card'
      }`}
      style={{
        width: '90px',
        height: '90px',
      }}
    >
      {/* Animated Background for selected state */}
      <AnimatePresence>
        {isSelected && (
          <motion.div
            layoutId="category-bg"
            className="absolute inset-0 bg-gradient-to-br from-primary to-secondary"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={categoryChip.background}
          />
        )}
      </AnimatePresence>

      {/* Icon - Emoji */}
      <motion.span
        className="relative z-10 text-4xl mb-1"
        animate={isSelected ? { scale: [1, 1.1, 1] } : {}}
        transition={{ duration: 0.3 }}
      >
        {category.icon}
      </motion.span>

      {/* Label */}
      <span className="relative z-10 text-[10px] font-semibold px-2 text-center leading-tight">
        {category.label}
      </span>

      {/* Underline indicator */}
      {isSelected && (
        <motion.div
          layoutId="category-underline"
          className="absolute bottom-2 left-1/2 w-6 h-0.5 bg-white rounded-full"
          style={{ x: '-50%' }}
          transition={categoryChip.underline}
        />
      )}
    </motion.button>
  )
}

export default EnhancedCategoryChip
