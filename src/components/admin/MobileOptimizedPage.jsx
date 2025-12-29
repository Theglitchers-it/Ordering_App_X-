import React from 'react'
import { motion } from 'framer-motion'

/**
 * MobileOptimizedPage - Wrapper per pagine admin mobile-first
 *
 * Props:
 * - title: titolo pagina
 * - subtitle: sottotitolo
 * - actions: array di action buttons {label, onClick, icon, variant}
 * - filters: elementi filtri (select, date pickers, etc)
 * - children: contenuto principale
 */

const MobileOptimizedPage = ({ title, subtitle, actions, filters, children }) => {
  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-3 md:space-y-0 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{title}</h1>
          {subtitle && (
            <p className="text-sm md:text-base text-gray-600 mt-1">{subtitle}</p>
          )}
        </div>

        {/* Actions */}
        {actions && actions.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-2">
            {actions.map((action, index) => {
              const Icon = action.icon
              return (
                <button
                  key={index}
                  onClick={action.onClick}
                  className={`px-4 py-2 rounded-lg flex items-center justify-center gap-2 font-medium transition-all shadow-sm ${
                    action.variant === 'primary'
                      ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700'
                      : action.variant === 'secondary'
                      ? 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                      : action.variant === 'danger'
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {Icon && <Icon className="w-4 h-4" />}
                  <span className="text-sm md:text-base">{action.label}</span>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Filters */}
      {filters && (
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 bg-white p-3 md:p-4 rounded-lg border border-gray-200">
          {filters}
        </div>
      )}

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.div>
    </div>
  )
}

export default MobileOptimizedPage
