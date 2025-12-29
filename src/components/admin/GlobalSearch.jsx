import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, ShoppingBag, User, Package, TrendingUp } from 'lucide-react'
import { globalSearch } from '../../api/adminAPI'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'

/**
 * Componente di ricerca globale con fuzzy search
 * Cerca in ordini, utenti, prodotti
 */
function GlobalSearch({ isOpen, onClose }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState(null)
  const [isSearching, setIsSearching] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef(null)
  const { currentRole, adminAuth } = useAuth()
  const navigate = useNavigate()

  // Focus input quando si apre
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  // Debounced search
  useEffect(() => {
    if (query.length < 2) {
      setResults(null)
      return
    }

    const timer = setTimeout(async () => {
      setIsSearching(true)
      try {
        const response = await globalSearch(query, currentRole, adminAuth?.email)
        setResults(response.data)
        setSelectedIndex(0)
      } catch (error) {
        console.error('Search error:', error)
      } finally {
        setIsSearching(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query, currentRole, adminAuth])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return

      if (e.key === 'Escape') {
        onClose()
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        const allResults = getAllResults()
        setSelectedIndex(prev => Math.min(prev + 1, allResults.length - 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex(prev => Math.max(prev - 1, 0))
      } else if (e.key === 'Enter') {
        e.preventDefault()
        const allResults = getAllResults()
        if (allResults[selectedIndex]) {
          handleResultClick(allResults[selectedIndex])
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, selectedIndex, results])

  const getAllResults = () => {
    if (!results) return []
    return [
      ...results.orders.map(o => ({ type: 'order', data: o })),
      ...results.users.map(u => ({ type: 'user', data: u })),
      ...results.products.map(p => ({ type: 'product', data: p }))
    ]
  }

  const handleResultClick = (result) => {
    switch (result.type) {
      case 'order':
        navigate(`/admin/orders/${result.data.orderNumber}`)
        break
      case 'user':
        navigate(`/admin/users/${result.data.id}`)
        break
      case 'product':
        navigate(`/admin/products/${result.data.id}`)
        break
    }
    onClose()
  }

  const getResultIcon = (type) => {
    switch (type) {
      case 'order':
        return ShoppingBag
      case 'user':
        return User
      case 'product':
        return Package
      default:
        return TrendingUp
    }
  }

  const getResultColor = (type) => {
    switch (type) {
      case 'order':
        return 'bg-blue-50 text-blue-600'
      case 'user':
        return 'bg-green-50 text-green-600'
      case 'product':
        return 'bg-purple-50 text-purple-600'
      default:
        return 'bg-gray-50 text-gray-600'
    }
  }

  const highlightMatch = (text, query) => {
    if (!query || !text) return text

    const parts = text.toString().split(new RegExp(`(${query})`, 'gi'))
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={i} className="bg-yellow-200 text-gray-900">{part}</mark>
      ) : part
    )
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-20 px-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Search Input */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cerca ordini, utenti, prodotti... (min 2 caratteri)"
              className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-xl focus:border-orange-500 focus:outline-none font-medium"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            )}
          </div>
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto">
          {isSearching && (
            <div className="p-8 text-center">
              <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-500">Ricerca in corso...</p>
            </div>
          )}

          {!isSearching && query.length < 2 && (
            <div className="p-8 text-center">
              <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Digita almeno 2 caratteri per cercare</p>
            </div>
          )}

          {!isSearching && query.length >= 2 && results && (
            <div className="p-4 space-y-4">
              {/* Orders */}
              {results.orders.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Ordini ({results.orders.length})</h3>
                  <div className="space-y-1">
                    {results.orders.map((order, index) => {
                      const Icon = getResultIcon('order')
                      const isSelected = getAllResults().findIndex(r => r.type === 'order' && r.data.orderNumber === order.orderNumber) === selectedIndex
                      return (
                        <button
                          key={order.orderNumber}
                          onClick={() => handleResultClick({ type: 'order', data: order })}
                          className={`w-full text-left p-3 rounded-xl transition-all ${
                            isSelected ? 'bg-orange-50 border-2 border-orange-500' : 'hover:bg-gray-50 border-2 border-transparent'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded-lg ${getResultColor('order')}`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900">
                                Ordine #{highlightMatch(order.orderNumber, query)}
                              </p>
                              <p className="text-sm text-gray-500">
                                {highlightMatch(order.customerName, query)} - €{order.total.toFixed(2)}
                              </p>
                            </div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* No results */}
              {results.orders.length === 0 && results.users.length === 0 && results.products.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">Nessun risultato trovato per "{query}"</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Keyboard shortcuts hint */}
        <div className="p-3 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-4">
              <span><kbd className="px-2 py-1 bg-white border border-gray-300 rounded">↑↓</kbd> Naviga</span>
              <span><kbd className="px-2 py-1 bg-white border border-gray-300 rounded">Enter</kbd> Seleziona</span>
            </div>
            <span><kbd className="px-2 py-1 bg-white border border-gray-300 rounded">Esc</kbd> Chiudi</span>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default GlobalSearch
