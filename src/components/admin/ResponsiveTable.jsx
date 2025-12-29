import React from 'react'
import { motion } from 'framer-motion'

/**
 * ResponsiveTable - Componente tabella mobile-first
 *
 * Mobile: Mostra cards verticali
 * Desktop: Mostra tabella classica
 *
 * Props:
 * - columns: array di { key, label, render }
 * - data: array di oggetti
 * - onRowClick: funzione callback per click su riga
 * - mobileCardRender: (optional) custom render per mobile card
 */

const ResponsiveTable = ({ columns, data, onRowClick, mobileCardRender }) => {
  return (
    <>
      {/* Mobile View - Cards */}
      <div className="block lg:hidden space-y-3">
        {data.map((row, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => onRowClick && onRowClick(row)}
            className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          >
            {mobileCardRender ? (
              mobileCardRender(row)
            ) : (
              <div className="space-y-2">
                {columns.map((col) => (
                  <div key={col.key} className="flex justify-between items-center">
                    <span className="text-xs font-medium text-gray-500 uppercase">{col.label}</span>
                    <span className="text-sm text-gray-900">
                      {col.render ? col.render(row) : row[col.key]}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Desktop View - Table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((row, index) => (
              <motion.tr
                key={index}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.03 }}
                onClick={() => onRowClick && onRowClick(row)}
                className="hover:bg-gray-50 cursor-pointer transition-colors"
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-6 py-4 text-sm text-gray-900">
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {data.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">Nessun dato disponibile</p>
        </div>
      )}
    </>
  )
}

export default ResponsiveTable
