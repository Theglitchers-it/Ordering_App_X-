import { motion } from 'framer-motion'

/**
 * ActionCircle - Circular action button with shadow
 * Specs: diameter 44px, shadow 0 6px 16px rgba(0,0,0,0.18)
 */
function ActionCircle({ icon: Icon, onClick, className = '', size = 'md', variant = 'primary' }) {
  const sizes = {
    sm: 'w-10 h-10',
    md: 'w-11 h-11', // 44px
    lg: 'w-14 h-14'
  }

  const variants = {
    primary: 'bg-gradient-to-br from-primary to-secondary text-white',
    white: 'bg-white text-gray-700',
    light: 'bg-white/90 backdrop-blur-sm text-gray-700'
  }

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className={`
        ${sizes[size]}
        ${variants[variant]}
        rounded-full
        flex items-center justify-center
        transition-colors
        ${className}
      `}
      style={{
        boxShadow: '0 6px 16px rgba(0, 0, 0, 0.18)'
      }}
    >
      <Icon className="w-5 h-5" />
    </motion.button>
  )
}

export default ActionCircle
