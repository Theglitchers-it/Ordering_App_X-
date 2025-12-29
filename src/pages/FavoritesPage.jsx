import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Heart, Trash2 } from 'lucide-react'
import { useFavorites } from '../context/FavoritesContext'
import FoodCard from '../components/FoodCard'
import Header from '../components/Header'
import { staggeredEntrance, cardEntrance } from '../utils/animations'

function FavoritesPage() {
  const navigate = useNavigate()
  const { favorites, getFavoriteItems, clearFavorites } = useFavorites()

  const favoriteItems = getFavoriteItems()

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Indietro</span>
        </motion.button>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <motion.div {...cardEntrance}>
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-red-500 to-pink-600 p-3 rounded-2xl">
                <Heart className="w-8 h-8 text-white fill-current" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">I Miei Preferiti</h1>
                <p className="text-gray-500 text-sm">
                  {favoriteItems.length} {favoriteItems.length === 1 ? 'piatto' : 'piatti'} salvati
                </p>
              </div>
            </div>
          </motion.div>

          {favoriteItems.length > 0 && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={clearFavorites}
              className="flex items-center space-x-2 px-4 py-2 bg-red-50 text-red-600 rounded-full font-semibold hover:bg-red-100 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Svuota</span>
            </motion.button>
          )}
        </div>

        {/* Favorites Grid */}
        {favoriteItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-12 text-center shadow-lg"
          >
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-12 h-12 text-gray-300" />
            </div>
            <h2 className="text-2xl font-bold text-gray-700 mb-2">
              Non ancora preferiti
            </h2>
            <p className="text-gray-500 mb-6">
              Aggiungi i piatti che ami ❤️
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/')}
              className="bg-gradient-to-r from-primary to-secondary text-white px-8 py-3 rounded-full font-bold hover:shadow-lg transition-shadow"
            >
              Esplora il Menu
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            variants={staggeredEntrance.container}
            initial="initial"
            animate="animate"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {favoriteItems.map((food, index) => (
              <FoodCard key={food.id} food={food} index={index} />
            ))}
          </motion.div>
        )}
      </main>
    </div>
  )
}

export default FavoritesPage
