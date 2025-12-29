import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Check, X, Trash2, Download, Edit, Send, Archive,
  AlertCircle, CheckCircle
} from 'lucide-react'

/**
 * Componente per azioni bulk su selezioni multiple
 */
function BulkActions({ selectedItems, onAction, actions, onClearSelection }) {
  const [showConfirm, setShowConfirm] = useState(false)
  const [confirmAction, setConfirmAction] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState(null)

  const defaultActions = [
    {
      id: 'export',
      label: 'Esporta',
      icon: Download,
      color: 'blue',
      requiresConfirm: false
    },
    {
      id: 'delete',
      label: 'Elimina',
      icon: Trash2,
      color: 'red',
      requiresConfirm: true,
      confirmMessage: 'Sei sicuro di voler eliminare gli elementi selezionati?'
    },
    {
      id: 'archive',
      label: 'Archivia',
      icon: Archive,
      color: 'gray',
      requiresConfirm: false
    }
  ]

  const availableActions = actions || defaultActions

  const handleAction = async (action) => {
    if (action.requiresConfirm) {
      setConfirmAction(action)
      setShowConfirm(true)
    } else {
      await executeAction(action)
    }
  }

  const executeAction = async (action) => {
    setIsProcessing(true)
    setResult(null)

    try {
      await onAction(action.id, selectedItems)
      setResult({
        type: 'success',
        message: `${action.label} completato con successo (${selectedItems.length} elementi)`
      })
      setTimeout(() => {
        setResult(null)
        onClearSelection()
      }, 3000)
    } catch (error) {
      setResult({
        type: 'error',
        message: error.message || 'Errore durante l\'esecuzione'
      })
    } finally {
      setIsProcessing(false)
      setShowConfirm(false)
      setConfirmAction(null)
    }
  }

  const getActionColor = (color) => {
    const colors = {
      blue: 'bg-blue-500 hover:bg-blue-600',
      red: 'bg-red-500 hover:bg-red-600',
      green: 'bg-green-500 hover:bg-green-600',
      gray: 'bg-gray-500 hover:bg-gray-600',
      orange: 'bg-orange-500 hover:bg-orange-600'
    }
    return colors[color] || colors.blue
  }

  if (selectedItems.length === 0) return null

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="bg-white border-2 border-orange-500 rounded-2xl p-4 shadow-lg mb-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-orange-100 p-2 rounded-lg">
              <Check className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">
                {selectedItems.length} elemento{selectedItems.length !== 1 ? 'i' : ''} selezionat{selectedItems.length !== 1 ? 'i' : 'o'}
              </p>
              <p className="text-sm text-gray-500">Scegli un'azione da applicare</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {availableActions.map((action) => (
              <button
                key={action.id}
                onClick={() => handleAction(action)}
                disabled={isProcessing}
                className={`flex items-center space-x-2 ${getActionColor(action.color)} text-white px-4 py-2 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <action.icon className="w-4 h-4" />
                <span>{action.label}</span>
              </button>
            ))}

            <button
              onClick={onClearSelection}
              disabled={isProcessing}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Result Message */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4"
            >
              <div className={`flex items-center space-x-2 p-3 rounded-xl ${
                result.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
              }`}>
                {result.type === 'success' ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600" />
                )}
                <p className={`text-sm font-semibold ${
                  result.type === 'success' ? 'text-green-700' : 'text-red-700'
                }`}>
                  {result.message}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Confirm Modal */}
      <AnimatePresence>
        {showConfirm && confirmAction && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full"
            >
              <div className="flex items-center justify-center mb-4">
                <div className="bg-orange-100 p-3 rounded-full">
                  <AlertCircle className="w-8 h-8 text-orange-600" />
                </div>
              </div>

              <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
                Conferma Azione
              </h3>

              <p className="text-gray-600 text-center mb-6">
                {confirmAction.confirmMessage}
              </p>

              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowConfirm(false)
                    setConfirmAction(null)
                  }}
                  disabled={isProcessing}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Annulla
                </button>
                <button
                  onClick={() => executeAction(confirmAction)}
                  disabled={isProcessing}
                  className={`flex-1 px-4 py-3 ${getActionColor(confirmAction.color)} text-white rounded-xl font-bold transition-all disabled:opacity-50`}
                >
                  {isProcessing ? 'Elaborazione...' : 'Conferma'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}

export default BulkActions
