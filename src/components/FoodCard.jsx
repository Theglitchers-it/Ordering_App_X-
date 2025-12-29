import { Link } from 'react-router-dom'
import { Star, Plus, Clock } from 'lucide-react'
import { motion } from 'framer-motion'
import { useCart } from '../context/CartContext'
import { useFavorites } from '../context/FavoritesContext'
import { staggeredEntrance, hoverLift } from '../utils/animations'
import AnimatedHeart from './AnimatedHeart'

function FoodCard({ food, index }) {
  const { addToCart } = useCart()
  const { isFavorite, toggleFavorite } = useFavorites()

  const handleAddToCart = (e) => {
    e.preventDefault()
    e.stopPropagation()
    addToCart(food)

    // Visual feedback
    const button = e.currentTarget
    button.classList.add('scale-95')
    setTimeout(() => button.classList.remove('scale-95'), 150)
  }

  const handleToggleFavorite = (e) => {
    e.preventDefault()
    e.stopPropagation()
    toggleFavorite(food)
  }

  return (
    <motion.div
      variants={staggeredEntrance.child}
      {...hoverLift}
      whileTap={{ scale: 0.97 }}
      className="will-change-transform touch-manipulation"
    >
      <Link to={`/product/${food.id}`} state={{ product: food }} className="block no-underline">
        <div className="bg-white rounded-card-lg overflow-hidden shadow-card active:shadow-action transition-all duration-200">
          {/* Image with favorite button */}
          <div className="relative h-44 sm:h-48 overflow-hidden">
            <img
              src={food.image}
              alt={food.name}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover transition-transform duration-300"
            />

            {/* Favorite Heart - Top Right */}
            <div className="absolute top-2 right-2 z-10">
              <AnimatedHeart
                isFavorite={isFavorite(food.id)}
                onClick={handleToggleFavorite}
                size="sm"
              />
            </div>

            {/* Delivery Time Badge - Bottom Left */}
            {food.deliveryTime && (
              <div className="absolute bottom-2 left-2 bg-white/95 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center space-x-1 shadow-sm">
                <Clock className="w-3 h-3 text-gray-600" />
                <span className="text-xs font-medium text-gray-700">{food.deliveryTime} min</span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-3 sm:p-4">
            <h3 className="text-base sm:text-lg font-bold text-strongBlack mb-1 line-clamp-1">
              {food.name}
            </h3>
            <p className="text-xs text-gray-500 mb-2 line-clamp-1">
              by {food.chef || food.author || 'Chef'}
            </p>

            {/* Rating and Price */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 text-yellow-400 fill-current flex-shrink-0" />
                <span className="text-sm font-semibold text-gray-700">
                  {food.rating}
                </span>
                <span className="text-xs text-gray-500">
                  ({food.reviewsCount || 234})
                </span>
              </div>
              <span className="text-lg sm:text-xl font-bold text-primary">
                €{food.price.toFixed(2)}
              </span>
            </div>

            {/* Add to Cart Button - Mobile Optimized */}
            <button
              onClick={handleAddToCart}
              className="w-full bg-gradient-to-r from-gray-900 to-gray-800 text-white py-2.5 sm:py-3 rounded-full font-semibold text-sm sm:text-base hover:from-gray-800 hover:to-gray-700 active:scale-95 transition-all touch-manipulation flex items-center justify-center space-x-2 shadow-sm"
              aria-label={`Aggiungi ${food.name} al carrello`}
            >
              <Plus className="w-4 h-4 flex-shrink-0" />
              <span>Aggiungi</span>
            </button>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

export default FoodCard
