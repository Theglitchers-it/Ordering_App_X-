import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

const TableSelector = ({ tables, onSelectTable, onClose, merchantName }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Seleziona il Tuo Tavolo</h2>
            <p className="text-sm text-gray-600 mt-1">{merchantName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Tables Grid */}
        <div className="p-6">
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {tables.map((table) => (
              <motion.button
                key={table.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onSelectTable(table.tableNumber)}
                disabled={table.status === 'occupied'}
                className={`
                  aspect-square rounded-xl flex flex-col items-center justify-center
                  font-semibold text-lg transition-all duration-200
                  ${table.status === 'available'
                    ? 'bg-green-50 text-green-700 hover:bg-green-100 border-2 border-green-200'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed border-2 border-gray-200'
                  }
                `}
              >
                <span className="text-2xl font-bold">{table.tableNumber}</span>
                <span className="text-xs mt-1">
                  {table.status === 'available' ? 'Disponibile' : 'Occupato'}
                </span>
              </motion.button>
            ))}
          </div>

          {/* Info */}
          <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
            <p className="text-sm text-blue-800">
              💡 <strong>Suggerimento:</strong> Trova il numero del tuo tavolo e selezionalo per iniziare a ordinare.
              Se hai scansionato un QR code, il tavolo è già selezionato automaticamente.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default TableSelector;
