import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Star, Plus, Minus, Heart } from 'lucide-react'
import { useState } from 'react'
import { useCart } from '../context/CartContext'
import { useFavorites } from '../context/FavoritesContext'
import { useProductById } from '../hooks/useProducts'

function FoodDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToCart, getCartCount } = useCart()
  const { toggleFavorite, isFavorite } = useFavorites()
  const [quantity, setQuantity] = useState(1)
  const { product: food, loading } = useProductById(id)

  const isInFavorites = isFavorite(parseInt(id))
  const cartCount = getCartCount()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-gray-900 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  if (!food) {
    return <div>Piatto non trovato</div>
  }

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart(food)
    }
  }

  const handleViewCart = () => {
    navigate('/cart')
  }

  const buttonText = cartCount > 0 ? 'Visualizza Carrello' : 'Aggiungi al Carrello'
  const buttonAction = cartCount > 0 ? handleViewCart : handleAddToCart

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </motion.button>

            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => toggleFavorite(parseInt(id))}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <Heart
                className={`w-6 h-6 ${
                  isInFavorites ? 'fill-red-500 text-red-500' : 'text-gray-700'
                }`}
              />
            </motion.button>
          </div>
        </div>
      </div>

      <main className="pt-16 min-h-screen pb-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 bg-white rounded-2xl lg:rounded-3xl overflow-hidden shadow-xl">
            {/* Sezione Sinistra - Info */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="p-4 sm:p-6 lg:p-8 order-2 lg:order-1 flex flex-col"
            >
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-1">
                {food.name || food.title}
              </h1>
              {food.chef && <p className="text-sm sm:text-base text-gray-500 mb-4">di {food.chef}</p>}

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 mb-1">Valutazione</p>
                  <div className="flex items-center space-x-1">
                    <span className="text-xl sm:text-2xl font-bold text-gray-900">
                      {food.rating}
                    </span>
                    <Star className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 fill-current" />
                  </div>
                </div>

                <div>
                  <p className="text-xs sm:text-sm text-gray-600 mb-1">Consegna in</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">
                    {food.deliveryTime} min
                  </p>
                </div>
              </div>

              <p className="text-gray-600 text-sm sm:text-base mb-4 leading-relaxed line-clamp-3 lg:line-clamp-4">
                {food.longDescription || food.description}
              </p>

              <div className="border-t pt-4 mt-auto">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
                    €{(food.price * quantity).toFixed(2)}
                  </span>

                  <div className="flex items-center space-x-2 sm:space-x-3 bg-gray-100 rounded-full p-1">
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-2 sm:p-3 bg-white rounded-full hover:bg-gray-200 transition-colors"
                    >
                      <Minus className="w-4 h-4 sm:w-5 sm:h-5" />
                    </motion.button>
                    <span className="text-lg sm:text-xl font-bold w-8 sm:w-10 text-center">
                      {quantity}
                    </span>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-2 sm:p-3 bg-white rounded-full hover:bg-gray-200 transition-colors"
                    >
                      <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                    </motion.button>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={buttonAction}
                  className="w-full bg-gray-900 text-white py-3 sm:py-4 rounded-full font-bold text-base sm:text-lg hover:bg-gray-800 transition-colors shadow-lg"
                >
                  {buttonText}
                </motion.button>
              </div>
            </motion.div>

            {/* Sezione Destra - Immagine */}
            <motion.div
              layoutId={`food-image-${food.id}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="relative h-64 sm:h-80 lg:h-auto order-1 lg:order-2"
            >
              <img
                src={food.image}
                alt={food.name}
                className="w-full h-full object-cover"
              />
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default FoodDetailPage
