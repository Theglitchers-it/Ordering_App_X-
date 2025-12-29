import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

/**
 * MobileModal - Modale ottimizzato per mobile
 *
 * Mobile: Full screen con slide from bottom
 * Desktop: Centered modal con backdrop
 *
 * Props:
 * - isOpen: boolean
 * - onClose: function
 * - title: string
 * - children: content
 * - footer: optional footer content
 * - size: 'sm' | 'md' | 'lg' | 'xl' | 'full'
 */

const MobileModal = ({ isOpen, onClose, title, children, footer, size = 'md' }) => {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const sizeClasses = {
    sm: 'lg:max-w-md',
    md: 'lg:max-w-lg',
    lg: 'lg:max-w-2xl',
    xl: 'lg:max-w-4xl',
    full: 'lg:max-w-full lg:mx-4'
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center p-0 lg:p-4">
            <motion.div
              initial={{
                y: '100%',
                opacity: 0
              }}
              animate={{
                y: 0,
                opacity: 1
              }}
              exit={{
                y: '100%',
                opacity: 0
              }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className={`
                bg-white w-full rounded-t-2xl lg:rounded-2xl shadow-2xl
                max-h-[95vh] lg:max-h-[90vh] flex flex-col
                ${sizeClasses[size]}
              `}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-200 flex-shrink-0">
                <h2 className="text-lg md:text-xl font-bold text-gray-900">{title}</h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 md:w-6 md:h-6 text-gray-600" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-4 md:p-6">
                {children}
              </div>

              {/* Footer */}
              {footer && (
                <div className="flex-shrink-0 p-4 md:p-6 border-t border-gray-200 bg-gray-50">
                  {footer}
                </div>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}

export default MobileModal
