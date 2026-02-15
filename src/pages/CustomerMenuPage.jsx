import { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Header from '../components/common/Header'
import SearchBar from '../components/common/SearchBar'
import CategoriesBar from '../components/common/CategoriesBar'
import FoodCard from '../components/common/FoodCard'
import TableSelector from '../components/customer/TableSelector'
import { useProducts } from '../hooks/useProducts'
import { useUser } from '../context/UserContext'
import { useTenant } from '../context/TenantContext'
import { getTablesByMerchant } from '../data/tables'
import { staggeredEntrance, listSwap, cardEntrance } from '../utils/animations'

function HomePage() {
  const [searchParams] = useSearchParams()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [showTableSelector, setShowTableSelector] = useState(false)
  const { user } = useUser()
  const { currentMerchant, tableNumber, setTableNumber } = useTenant()
  const userName = user?.name || user?.first_name || 'Ospite'

  // Load products from API or static data via useProducts hook
  const { products, categories, loading: productsLoading } = useProducts(currentMerchant?.id || null)

  // Rileva table number da URL
  useEffect(() => {
    const tableFromUrl = searchParams.get('table')
    if (tableFromUrl && !tableNumber) {
      setTableNumber(parseInt(tableFromUrl))
      localStorage.setItem('currentTableNumber', tableFromUrl)
    }
  }, [searchParams, tableNumber, setTableNumber])

  const allFoods = products

  // Get tables for current merchant
  const merchantTables = useMemo(() => {
    if (currentMerchant) {
      return getTablesByMerchant(currentMerchant.id)
    }
    return []
  }, [currentMerchant])

  const handleSelectTable = (selectedTableNumber) => {
    setTableNumber(selectedTableNumber)
    localStorage.setItem('currentTableNumber', selectedTableNumber.toString())
    setShowTableSelector(false)
  }

  const filteredFoods = useMemo(() => {
    return allFoods.filter((food) => {
      const matchesCategory = selectedCategory === 'all' || food.category === selectedCategory
      const matchesSearch = food.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        food.description.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesCategory && matchesSearch
    })
  }, [selectedCategory, searchQuery, allFoods])

  return (
    <div className="min-h-screen bg-cream-50 relative overflow-hidden">
      {/* Quarter Circle Blob - Top Left (1/4 di cerchio) */}
      <div className="absolute -top-[400px] -left-[400px] w-[800px] h-[800px] bg-cream-100 rounded-full -z-0"></div>

      {/* Header */}
      <div className="relative z-10">
        <Header />
      </div>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24">
        <div className="space-y-6">
          {/* Welcome Section with new design system */}
          <motion.div
            {...cardEntrance}
            className="space-y-1"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg text-gray-600">Ciao, {userName}</p>
                <h1 className="text-4xl sm:text-5xl font-bold text-strongBlack">Hai fame oggi?</h1>
              </div>

              {/* Table Badge */}
              {tableNumber ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex flex-col items-center bg-primary text-white px-6 py-3 rounded-2xl shadow-lg"
                >
                  <span className="text-sm font-medium">Tavolo</span>
                  <span className="text-3xl font-bold">#{tableNumber}</span>
                </motion.div>
              ) : (
                currentMerchant && merchantTables.length > 0 && (
                  <button
                    onClick={() => setShowTableSelector(true)}
                    className="px-6 py-3 bg-primary hover:bg-opacity-90 text-white rounded-xl font-semibold transition-all duration-200 transform hover:scale-105"
                  >
                    Seleziona Tavolo
                  </button>
                )
              )}
            </div>

            {/* Merchant Name */}
            {currentMerchant && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-lg text-gray-600 mt-2"
              >
                📍 {currentMerchant.name}
              </motion.p>
            )}
          </motion.div>

          {/* Search Bar */}
          <SearchBar value={searchQuery} onChange={setSearchQuery} />

          {/* Categories */}
          <div>
            <motion.h3
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-xl font-bold text-strongBlack mb-4"
            >
              Categorie
            </motion.h3>
            <CategoriesBar
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />
          </div>

          {/* Food Grid */}
          <div>
            <motion.h3
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-xl font-bold text-strongBlack mb-4"
            >
              Popolari Oggi
            </motion.h3>

            <AnimatePresence mode="wait">
              <motion.div
                key={selectedCategory}
                variants={staggeredEntrance.container}
                initial="initial"
                animate="animate"
                exit={listSwap.exit}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {filteredFoods.map((food, index) => (
                  <FoodCard key={food.id} food={food} index={index} />
                ))}
              </motion.div>
            </AnimatePresence>

            {productsLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-3"></div>
                <p className="text-gray-500 text-lg">Caricamento menu...</p>
              </motion.div>
            )}

            {!productsLoading && filteredFoods.length === 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12"
              >
                <p className="text-gray-500 text-lg">Nessun piatto trovato</p>
              </motion.div>
            )}
          </div>
        </div>
      </main>

      {/* Table Selector Modal */}
      {showTableSelector && (
        <TableSelector
          tables={merchantTables}
          onSelectTable={handleSelectTable}
          onClose={() => setShowTableSelector(false)}
          merchantName={currentMerchant?.name || 'Ristorante'}
        />
      )}
    </div>
  )
}

export default HomePage
