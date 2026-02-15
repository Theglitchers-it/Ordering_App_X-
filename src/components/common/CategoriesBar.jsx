import { motion, AnimatePresence } from 'framer-motion'
import { categoryChip } from '../../utils/animations'

function CategoriesBar({ categories, selectedCategory, onSelectCategory }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="w-full"
    >
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4">
        {categories.map((category, index) => {
          const isSelected = selectedCategory === category.id

          return (
            <motion.button
              key={category.id}
              onClick={() => onSelectCategory(category.id)}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05, type: "spring", stiffness: 200 }}
              whileHover={{ scale: 1.05, y: -4 }}
              whileTap={{ scale: 0.95 }}
              className={`relative flex flex-col items-center justify-center aspect-square rounded-2xl sm:rounded-3xl overflow-hidden ${
                isSelected
                  ? 'text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-50 shadow-md'
              }`}
            >
              {/* Animated Background */}
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

              {/* Content */}
              <span className="relative z-10 text-3xl sm:text-4xl mb-1 sm:mb-2">
                {category.icon || category.emoji}
              </span>
              <span className="relative z-10 text-[10px] sm:text-xs font-semibold px-1 text-center leading-tight">
                {category.label || category.name}
              </span>
            </motion.button>
          )
        })}
      </div>
    </motion.div>
  )
}

export default CategoriesBar
