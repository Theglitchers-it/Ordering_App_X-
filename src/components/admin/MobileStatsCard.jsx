import React from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown } from 'lucide-react'

/**
 * MobileStatsCard - Card KPI ottimizzata per mobile
 *
 * Props:
 * - label: string
 * - value: string | number
 * - icon: Lucide Icon
 * - trend: number (percentuale)
 * - color: gradient color ('blue', 'green', 'orange', 'purple', 'red')
 * - prefix: string (es. '€', '#')
 * - suffix: string (es. '%', 'k')
 */

const MobileStatsCard = ({
  label,
  value,
  icon: Icon,
  trend,
  color = 'orange',
  prefix = '',
  suffix = '',
  delay = 0
}) => {
  const colorVariants = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    orange: 'from-orange-500 to-orange-600',
    purple: 'from-purple-500 to-purple-600',
    red: 'from-red-500 to-red-600',
    indigo: 'from-indigo-500 to-indigo-600',
    emerald: 'from-emerald-500 to-emerald-600'
  }

  const isPositive = trend > 0

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.3 }}
      className="bg-white rounded-xl shadow-md p-4 md:p-6 border border-gray-100 hover:shadow-lg transition-shadow"
    >
      {/* Header con icona */}
      <div className="flex items-center justify-between mb-3 md:mb-4">
        <div className={`w-10 h-10 md:w-12 md:h-12 rounded-lg bg-gradient-to-br ${colorVariants[color]} flex items-center justify-center flex-shrink-0`}>
          {Icon && <Icon className="w-5 h-5 md:w-6 md:h-6 text-white" />}
        </div>

        {/* Trend badge */}
        {trend !== undefined && trend !== null && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
            isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {isPositive ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            <span>{Math.abs(trend)}%</span>
          </div>
        )}
      </div>

      {/* Value */}
      <div className="mb-1">
        <h3 className="text-2xl md:text-3xl font-bold text-gray-900">
          {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
        </h3>
      </div>

      {/* Label */}
      <p className="text-xs md:text-sm text-gray-600 font-medium">{label}</p>
    </motion.div>
  )
}

export default MobileStatsCard
