import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import {
  ArrowLeft, Star, Clock, ShoppingCart, Heart, Plus, Minus,
  ChevronLeft, ChevronRight, Wheat, Flame, Check, Share2,
  MessageSquare, ThumbsUp, Filter, Bell, ChevronDown, X
} from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useFavorites } from '../context/FavoritesContext'
import FoodCard from '../components/FoodCard'
import AnimatedHeart from '../components/AnimatedHeart'
import { foods } from '../data/mockData'

function ProductDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const product = location.state?.product
  const scrollRef = useRef(null)

  const { addToCart, getCartCount } = useCart()
  const { isFavorite, toggleFavorite } = useFavorites()

  // State management
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const [showIngredients, setShowIngredients] = useState(false)
  const [showNutrition, setShowNutrition] = useState(false)
  const [addedToCart, setAddedToCart] = useState(false)
  const [selectedSize, setSelectedSize] = useState('M')
  const [selectedExtras, setSelectedExtras] = useState([])
  const [customNotes, setCustomNotes] = useState('')
  const [reviewFilter, setReviewFilter] = useState('top')
  const [showShareMenu, setShowShareMenu] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [showNotifyModal, setShowNotifyModal] = useState(false)
  const cartBadgeRef = useRef(null)

  // Scroll tracking for collapsing header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 200)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (!product) {
    navigate(-1)
    return null
  }

  // Extended product data
  const productDetails = {
    ...product,
    author: 'Chef Inquisitive',
    rating: 4.8,
    reviewsCount: 234,
    deliveryTime: '40 mins',
    isAvailable: true,
    description: 'Una deliziosa esperienza culinaria che combina ingredienti freschi e di alta qualità con tecniche di preparazione tradizionali. Ogni boccone è un viaggio di sapori autentici e raffinati, preparato con passione dai nostri chef esperti.',

    images: [
      product.image,
      product.image,
      product.image
    ],

    sizes: [
      { id: 'S', name: 'Small', price: product.price - 2 },
      { id: 'M', name: 'Medium', price: product.price },
      { id: 'L', name: 'Large', price: product.price + 3 }
    ],

    extras: [
      { id: 'cheese', name: 'Extra Formaggio', price: 1.5 },
      { id: 'bacon', name: 'Bacon Croccante', price: 2.0 },
      { id: 'sauce', name: 'Salsa Piccante', price: 0.5 },
      { id: 'veggies', name: 'Verdure Extra', price: 1.0 }
    ],

    ingredients: [
      { name: 'Pomodoro San Marzano', allergen: false },
      { name: 'Mozzarella di Bufala DOP', allergen: true, type: 'Lattosio' },
      { name: 'Basilico Fresco', allergen: false },
      { name: 'Olio Extra Vergine d\'Oliva', allergen: false },
      { name: 'Farina 00', allergen: true, type: 'Glutine' },
      { name: 'Sale Marino', allergen: false }
    ],

    nutrition: {
      calories: 850,
      protein: 35,
      carbs: 95,
      fats: 32,
      fiber: 6,
      sodium: 1200
    },

    allergens: ['Glutine', 'Lattosio'],

    reviews: [
      { id: 1, user: 'Marco R.', rating: 5, date: '2 giorni fa', text: 'Incredibile! La migliore pizza che abbia mai mangiato. Ingredienti freschi e di qualità.', helpful: 24 },
      { id: 2, user: 'Sofia B.', rating: 5, date: '1 settimana fa', text: 'Servizio eccellente e consegna veloce. La pizza era ancora calda e croccante.', helpful: 18 },
      { id: 3, user: 'Luca M.', rating: 4, date: '2 settimane fa', text: 'Molto buona, porzioni generose. Unico appunto: vorrei più opzioni di salse.', helpful: 12 },
      { id: 4, user: 'Giulia T.', rating: 5, date: '3 settimane fa', text: 'Semplicemente perfetta. La mozzarella di bufala fa la differenza!', helpful: 15 }
    ]
  }

  // Suggested items (upsell)
  const suggestedItems = foods.filter(f => f.id !== product.id && f.category === product.category).slice(0, 4)

  // Calculate total price with size and extras
  const calculateTotalPrice = () => {
    const sizePrice = productDetails.sizes.find(s => s.id === selectedSize)?.price || product.price
    const extrasPrice = selectedExtras.reduce((sum, extraId) => {
      const extra = productDetails.extras.find(e => e.id === extraId)
      return sum + (extra?.price || 0)
    }, 0)
    return (sizePrice + extrasPrice) * quantity
  }

  const totalPrice = calculateTotalPrice()

  const toggleExtra = (extraId) => {
    setSelectedExtras(prev =>
      prev.includes(extraId)
        ? prev.filter(id => id !== extraId)
        : [...prev, extraId]
    )
  }

  const handleAddToCart = () => {
    const customProduct = {
      ...product,
      customSize: selectedSize,
      customExtras: selectedExtras,
      customNotes: customNotes,
      price: totalPrice / quantity
    }

    for (let i = 0; i < quantity; i++) {
      addToCart(customProduct)
    }

    // Fly to cart animation
    setAddedToCart(true)

    // Bounce cart badge
    if (cartBadgeRef.current) {
      cartBadgeRef.current.classList.add('animate-bounce')
      setTimeout(() => {
        cartBadgeRef.current?.classList.remove('animate-bounce')
      }, 1000)
    }

    setTimeout(() => setAddedToCart(false), 2000)
  }

  const handleShare = async () => {
    const shareData = {
      title: product.name,
      text: `Guarda questo delizioso ${product.name}!`,
      url: window.location.href
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch (err) {
        console.log('Share cancelled')
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
      setShowShareMenu(true)
      setTimeout(() => setShowShareMenu(false), 2000)
    }
  }

  const handleNotifyWhenAvailable = () => {
    setShowNotifyModal(true)
  }

  const nextImage = () => {
    setSelectedImage((prev) => (prev + 1) % productDetails.images.length)
  }

  const prevImage = () => {
    setSelectedImage((prev) =>
      prev === 0 ? productDetails.images.length - 1 : prev - 1
    )
  }

  const filteredReviews = reviewFilter === 'top'
    ? [...productDetails.reviews].sort((a, b) => b.helpful - a.helpful)
    : productDetails.reviews

  return (
    <div className="min-h-screen bg-gray-50" ref={scrollRef}>
      {/* Collapsing Header */}
      <AnimatePresence>
        {isScrolled && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="fixed top-0 left-0 right-0 bg-white shadow-lg z-50 px-4 py-3"
          >
            <div className="max-w-4xl mx-auto flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => navigate(-1)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <ArrowLeft className="w-5 h-5" />
                </motion.button>
                <div>
                  <h2 className="font-bold text-gray-900 line-clamp-1">{product.name}</h2>
                  <p className="text-xs text-gray-500">€{totalPrice.toFixed(2)}</p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleAddToCart}
                className="bg-gray-900 text-white px-6 py-2 rounded-full font-semibold text-sm flex items-center space-x-2"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Aggiungi</span>
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="max-w-4xl mx-auto pb-32">
        {/* Hero Image Gallery */}
        <div className="relative bg-white">
          {/* Back and Share buttons */}
          <div className="absolute top-4 left-0 right-0 px-4 z-20 flex justify-between">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate(-1)}
              className="bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-lg hover:bg-white"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </motion.button>

            <div className="flex space-x-2">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleShare}
                className="bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-lg hover:bg-white"
              >
                <Share2 className="w-5 h-5 text-gray-700" />
              </motion.button>

              <AnimatedHeart
                isFavorite={isFavorite(product.id)}
                onClick={() => toggleFavorite(product)}
              />
            </div>
          </div>

          {/* Share Confirmation */}
          <AnimatePresence>
            {showShareMenu && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="absolute top-20 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-30 flex items-center space-x-2"
              >
                <Check className="w-4 h-4" />
                <span className="text-sm font-medium">Link copiato!</span>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative h-80 sm:h-96 overflow-hidden"
          >
            <AnimatePresence mode="wait">
              <motion.img
                key={selectedImage}
                src={productDetails.images[selectedImage]}
                alt={product.name}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.3 }}
                className="w-full h-full object-cover"
              />
            </AnimatePresence>

            {/* Image Navigation */}
            {productDetails.images.length > 1 && (
              <>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-white"
                >
                  <ChevronLeft className="w-6 h-6 text-gray-700" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-white"
                >
                  <ChevronRight className="w-6 h-6 text-gray-700" />
                </motion.button>
              </>
            )}

            {/* Image Indicators */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
              {productDetails.images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`h-2 rounded-full transition-all ${
                    index === selectedImage
                      ? 'bg-white w-6'
                      : 'bg-white/50 w-2'
                  }`}
                />
              ))}
            </div>
          </motion.div>

          {/* Thumbnail Gallery */}
          {productDetails.images.length > 1 && (
            <div className="flex space-x-2 p-4 overflow-x-auto">
              {productDetails.images.map((image, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedImage(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                    index === selectedImage
                      ? 'border-primary shadow-lg'
                      : 'border-gray-200'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </motion.button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          {/* Title and Rating */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
              {product.name}
            </h1>
            <p className="text-gray-500 text-sm mb-4">by {productDetails.author}</p>

            <div className="flex items-center space-x-4 mb-4 flex-wrap gap-2">
              {/* Rating */}
              <div className="flex items-center space-x-1 bg-yellow-50 px-3 py-1.5 rounded-full">
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                <span className="font-bold text-gray-900">
                  {productDetails.rating}
                </span>
                <span className="text-sm text-gray-500">
                  ({productDetails.reviewsCount})
                </span>
              </div>

              {/* Delivery Time */}
              <div className="flex items-center space-x-2 bg-blue-50 px-3 py-1.5 rounded-full">
                <Clock className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-semibold text-gray-900">
                  {productDetails.deliveryTime}
                </span>
              </div>

              {/* Availability */}
              {!productDetails.isAvailable && (
                <div className="bg-red-50 px-3 py-1.5 rounded-full">
                  <span className="text-sm font-semibold text-red-700">
                    Esaurito
                  </span>
                </div>
              )}
            </div>

            {/* Allergen Badges */}
            {productDetails.allergens.length > 0 && (
              <div className="flex items-center space-x-2 flex-wrap gap-2">
                <Wheat className="w-4 h-4 text-orange-600" />
                {productDetails.allergens.map((allergen) => (
                  <span
                    key={allergen}
                    className="text-xs font-medium bg-orange-50 text-orange-700 px-3 py-1 rounded-full border border-orange-200"
                  >
                    {allergen}
                  </span>
                ))}
              </div>
            )}
          </motion.div>

          {/* Description */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl p-6 shadow-lg"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-3">Descrizione</h2>
            <p className="text-gray-600 leading-relaxed">
              {productDetails.description}
            </p>
          </motion.div>

          {/* Size Selection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="bg-white rounded-2xl p-6 shadow-lg"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4">Dimensione</h2>
            <div className="grid grid-cols-3 gap-3">
              {productDetails.sizes.map((size) => (
                <motion.button
                  key={size.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedSize(size.id)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    selectedSize === size.id
                      ? 'border-primary bg-primary/5 shadow-lg'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <p className="font-bold text-gray-900 text-lg">{size.id}</p>
                  <p className="text-xs text-gray-500">{size.name}</p>
                  <p className="text-sm font-semibold text-primary mt-1">
                    €{size.price.toFixed(2)}
                  </p>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Extras */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl p-6 shadow-lg"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4">Aggiunte Extra</h2>
            <div className="space-y-3">
              {productDetails.extras.map((extra) => (
                <motion.button
                  key={extra.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => toggleExtra(extra.id)}
                  className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                    selectedExtras.includes(extra.id)
                      ? 'border-primary bg-primary/5 shadow-md'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        selectedExtras.includes(extra.id)
                          ? 'border-primary bg-primary'
                          : 'border-gray-300'
                      }`}
                    >
                      {selectedExtras.includes(extra.id) && (
                        <Check className="w-3 h-3 text-white" />
                      )}
                    </div>
                    <span className="font-semibold text-gray-900">{extra.name}</span>
                  </div>
                  <span className="text-sm font-bold text-primary">
                    +€{extra.price.toFixed(2)}
                  </span>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Custom Notes */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="bg-white rounded-2xl p-6 shadow-lg"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4">Note Personalizzate</h2>
            <textarea
              value={customNotes}
              onChange={(e) => setCustomNotes(e.target.value.slice(0, 250))}
              placeholder="Es. Senza cipolla, extra salsa..."
              maxLength={250}
              rows={3}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none resize-none"
            />
            <p className="text-xs text-gray-500 mt-2 text-right">
              {customNotes.length}/250 caratteri
            </p>
          </motion.div>

          {/* Ingredients */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-2xl shadow-lg overflow-hidden"
          >
            <button
              onClick={() => setShowIngredients(!showIngredients)}
              className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="bg-green-50 p-2 rounded-xl">
                  <Wheat className="w-5 h-5 text-green-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">
                  Ingredienti & Allergeni
                </h2>
              </div>
              <motion.div
                animate={{ rotate: showIngredients ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <ChevronDown className="w-6 h-6 text-gray-400" />
              </motion.div>
            </button>

            <AnimatePresence>
              {showIngredients && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="border-t border-gray-100"
                >
                  <div className="p-6 space-y-3">
                    {productDetails.ingredients.map((ingredient, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                      >
                        <span className="text-gray-700 font-medium">
                          {ingredient.name}
                        </span>
                        {ingredient.allergen ? (
                          <span className="text-xs font-bold bg-orange-100 text-orange-700 px-3 py-1 rounded-full">
                            {ingredient.type}
                          </span>
                        ) : (
                          <Check className="w-5 h-5 text-green-500" />
                        )}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Nutritional Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            className="bg-white rounded-2xl shadow-lg overflow-hidden"
          >
            <button
              onClick={() => setShowNutrition(!showNutrition)}
              className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="bg-purple-50 p-2 rounded-xl">
                  <Flame className="w-5 h-5 text-purple-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">
                  Informazioni Nutrizionali
                </h2>
              </div>
              <motion.div
                animate={{ rotate: showNutrition ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <ChevronDown className="w-6 h-6 text-gray-400" />
              </motion.div>
            </button>

            <AnimatePresence>
              {showNutrition && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="border-t border-gray-100"
                >
                  <div className="p-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gradient-to-br from-red-50 to-orange-50 p-4 rounded-xl">
                        <Flame className="w-5 h-5 text-orange-600 mb-2" />
                        <p className="text-2xl font-bold text-gray-900">
                          {productDetails.nutrition.calories}
                        </p>
                        <p className="text-xs text-gray-600 font-medium">Calorie</p>
                      </div>

                      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-xl">
                        <p className="text-2xl font-bold text-gray-900">
                          {productDetails.nutrition.protein}g
                        </p>
                        <p className="text-xs text-gray-600 font-medium">Proteine</p>
                      </div>

                      <div className="bg-gradient-to-br from-yellow-50 to-amber-50 p-4 rounded-xl">
                        <p className="text-2xl font-bold text-gray-900">
                          {productDetails.nutrition.carbs}g
                        </p>
                        <p className="text-xs text-gray-600 font-medium">Carboidrati</p>
                      </div>

                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl">
                        <p className="text-2xl font-bold text-gray-900">
                          {productDetails.nutrition.fats}g
                        </p>
                        <p className="text-xs text-gray-600 font-medium">Grassi</p>
                      </div>

                      <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-4 rounded-xl">
                        <p className="text-2xl font-bold text-gray-900">
                          {productDetails.nutrition.fiber}g
                        </p>
                        <p className="text-xs text-gray-600 font-medium">Fibre</p>
                      </div>

                      <div className="bg-gradient-to-br from-pink-50 to-rose-50 p-4 rounded-xl">
                        <p className="text-2xl font-bold text-gray-900">
                          {productDetails.nutrition.sodium}mg
                        </p>
                        <p className="text-xs text-gray-600 font-medium">Sodio</p>
                      </div>
                    </div>

                    <p className="text-xs text-gray-500 mt-4 text-center">
                      Valori nutrizionali per porzione
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Reviews Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-2xl p-6 shadow-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Recensioni</h2>
              <div className="flex items-center space-x-2 bg-gray-100 rounded-full p-1">
                <button
                  onClick={() => setReviewFilter('top')}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                    reviewFilter === 'top'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500'
                  }`}
                >
                  Top
                </button>
                <button
                  onClick={() => setReviewFilter('recent')}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                    reviewFilter === 'recent'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500'
                  }`}
                >
                  Recenti
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {filteredReviews.map((review) => (
                <div key={review.id} className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm">
                          {review.user[0]}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">
                          {review.user}
                        </p>
                        <p className="text-xs text-gray-500">{review.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star
                          key={i}
                          className="w-4 h-4 fill-yellow-400 text-yellow-400"
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-700 text-sm mb-2">{review.text}</p>
                  <button className="flex items-center space-x-1 text-gray-500 hover:text-primary transition-colors">
                    <ThumbsUp className="w-4 h-4" />
                    <span className="text-xs font-medium">
                      Utile ({review.helpful})
                    </span>
                  </button>
                </div>
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full mt-4 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
            >
              <MessageSquare className="w-5 h-5" />
              <span>Lascia una recensione</span>
            </motion.button>
          </motion.div>

          {/* Upsell / Suggested Items */}
          {suggestedItems.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65 }}
              className="bg-white rounded-2xl p-6 shadow-lg"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Ti potrebbe piacere anche
              </h2>
              <div className="overflow-x-auto -mx-6 px-6">
                <div className="flex space-x-4 pb-4">
                  {suggestedItems.map((item, index) => (
                    <div key={item.id} className="flex-shrink-0 w-64">
                      <FoodCard food={item} index={index} />
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Notify When Available Modal */}
        <AnimatePresence>
          {showNotifyModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowNotifyModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Bell className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    Notifica Disponibilità
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Ti invieremo una notifica quando questo prodotto sarà di nuovo disponibile.
                  </p>
                  <div className="space-y-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowNotifyModal(false)}
                      className="w-full bg-primary text-white py-3 rounded-full font-bold hover:bg-secondary transition-colors"
                    >
                      Attiva Notifica
                    </motion.button>
                    <button
                      onClick={() => setShowNotifyModal(false)}
                      className="w-full text-gray-600 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors"
                    >
                      Annulla
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Fixed Bottom Bar - Add to Cart */}
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-2xl z-40"
        >
          <div className="max-w-4xl mx-auto flex items-center justify-between space-x-4">
            {/* Quantity Selector */}
            <div className="flex items-center space-x-3 bg-gray-100 rounded-full p-2">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-2 bg-white rounded-full hover:bg-gray-50 shadow-sm"
                disabled={quantity <= 1}
              >
                <Minus className="w-4 h-4 text-gray-700" />
              </motion.button>
              <span className="text-lg font-bold w-8 text-center">
                {quantity}
              </span>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setQuantity(quantity + 1)}
                className="p-2 bg-white rounded-full hover:bg-gray-50 shadow-sm"
              >
                <Plus className="w-4 h-4 text-gray-700" />
              </motion.button>
            </div>

            {/* Total Price */}
            <div className="flex-1 text-center">
              <p className="text-sm text-gray-500 font-medium">Totale</p>
              <motion.p
                key={totalPrice}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                className="text-2xl font-bold text-primary"
              >
                €{totalPrice.toFixed(2)}
              </motion.p>
            </div>

            {/* Add to Cart Button */}
            {productDetails.isAvailable ? (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAddToCart}
                className={`flex-1 flex items-center justify-center space-x-2 py-4 rounded-full font-bold text-lg shadow-lg transition-all ${
                  addedToCart
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-900 text-white hover:bg-gray-800'
                }`}
              >
                {addedToCart ? (
                  <>
                    <Check className="w-5 h-5" />
                    <span>Aggiunto!</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5" />
                    <span>Aggiungi al Carrello</span>
                  </>
                )}
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleNotifyWhenAvailable}
                className="flex-1 flex items-center justify-center space-x-2 py-4 rounded-full font-bold text-lg shadow-lg bg-blue-500 text-white hover:bg-blue-600 transition-all"
              >
                <Bell className="w-5 h-5" />
                <span>Notificami</span>
              </motion.button>
            )}
          </div>
        </motion.div>
      </main>
    </div>
  )
}

export default ProductDetailPage
