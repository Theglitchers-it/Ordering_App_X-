import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Star, Clock, ShoppingCart, Plus, Minus,
  Share2, Check
} from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useFavorites } from '../context/FavoritesContext'
import { useProductById } from '../hooks/useProducts'
import AnimatedHeart from '../components/common/AnimatedHeart'
import Header from '../components/common/Header'

const swipeConfidenceThreshold = 10000
const swipePower = (offset, velocity) => {
  return Math.abs(offset) * velocity
}

function ProductDetailPageV2() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { product: fetchedProduct, loading } = useProductById(id)
  const product = fetchedProduct || location.state?.product
  const { addToCart } = useCart()
  const { isFavorite, toggleFavorite } = useFavorites()

  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedVariant, setSelectedVariant] = useState(null)
  const [selectedAddOns, setSelectedAddOns] = useState([])
  const [customNotes, setCustomNotes] = useState('')
  const [showShareMenu, setShowShareMenu] = useState(false)
  const [showAddedFeedback, setShowAddedFeedback] = useState(false)

  // Scroll to top when product page opens
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [id])

  // Set default variant when product loads
  useEffect(() => {
    if (product?.variants?.[1]?.id) {
      setSelectedVariant(product.variants[1].id)
    }
  }, [product])

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-gray-900 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  if (!product) {
    navigate(-1)
    return null
  }

  const calculateTotalPrice = useCallback(() => {
    const variantPrice = product.variants?.find(v => v.id === selectedVariant)?.price || product.price
    const addOnsPrice = selectedAddOns.reduce((sum, addonId) => {
      const addon = product.addOns?.find(a => a.id === addonId)
      return sum + (addon?.price || 0)
    }, 0)
    return (variantPrice + addOnsPrice) * quantity
  }, [product, selectedVariant, selectedAddOns, quantity])

  const totalPrice = calculateTotalPrice()

  const toggleAddOn = useCallback((addonId) => {
    setSelectedAddOns(prev =>
      prev.includes(addonId) ? prev.filter(id => id !== addonId) : [...prev, addonId]
    )
  }, [])

  const handleAddToCart = useCallback(() => {
    const customProduct = {
      ...product,
      selectedVariant,
      selectedAddOns,
      customNotes,
      price: totalPrice / quantity
    }
    for (let i = 0; i < quantity; i++) {
      addToCart(customProduct)
    }

    // Show feedback
    setShowAddedFeedback(true)
    setTimeout(() => setShowAddedFeedback(false), 2000)
  }, [product, selectedVariant, selectedAddOns, customNotes, quantity, totalPrice, addToCart])

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.title,
          text: `Guarda ${product.title}!`,
          url: window.location.href
        })
      } catch (err) {
        console.log('Share cancelled')
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
      setShowShareMenu(true)
      setTimeout(() => setShowShareMenu(false), 2000)
    }
  }

  const nextImage = () => setSelectedImage(prev => (prev + 1) % (product.images?.length || 1))
  const prevImage = () => setSelectedImage(prev => prev === 0 ? (product.images?.length || 1) - 1 : prev - 1)

  return (
    <div className="min-h-screen bg-white">
      {/* Header principale */}
      <Header />

      {/* Back e Favorite buttons - sotto l'header */}
      <div className="sticky top-16 z-40 bg-white/80 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 py-3 flex justify-between items-center">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors active:scale-95"
          >
            <ArrowLeft className="w-6 h-6 text-gray-900" />
          </button>

          <AnimatedHeart
            isFavorite={isFavorite(product.id)}
            onClick={() => toggleFavorite(product)}
            size="lg"
          />
        </div>
      </div>

      {/* Content con max-width per desktop */}
      <div className="max-w-5xl mx-auto px-4 pt-6 pb-32">
        {/* Title Section */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-1.5 sm:mb-2">{product.title}</h1>
          <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">by {product.author || product.chef}</p>

          {/* Rating & Delivery - Ottimizzato per mobile */}
          <div className="flex items-center gap-6 sm:gap-8 mb-4">
            <div>
              <p className="text-xs text-gray-500 mb-1">Rating</p>
              <div className="flex items-center gap-1">
                <span className="text-xl sm:text-2xl font-bold text-gray-900">{product.rating}</span>
                <Star className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 fill-current" />
              </div>
            </div>

            {/* Delivery Time */}
            <div>
              <p className="text-xs text-gray-500 mb-1">Delivery In</p>
              <p className="text-xl sm:text-xl font-bold text-gray-900">{product.deliveryTime || product.prepTime} mins</p>
            </div>
          </div>
        </div>

        {/* Main Content - Description Left, Image Right (Desktop) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-8">
          {/* Left (Desktop): Description | Mobile: viene dopo l'immagine */}
          <div className="order-2 lg:order-1 flex items-center">
            <p className="text-gray-600 text-base leading-relaxed">{product.description}</p>
          </div>

          {/* Right (Desktop): Image | Mobile: viene prima */}
          <div className="order-1 lg:order-2 relative flex items-center justify-center min-h-[280px] sm:min-h-[350px] lg:min-h-[400px]">
            <AnimatePresence mode="wait" custom={selectedImage}>
              <motion.img
                key={selectedImage}
                src={product.images?.[selectedImage] || product.image}
                alt={product.title}
                drag={product.images && product.images.length > 1 ? "x" : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragEnd={(e, { offset, velocity }) => {
                  const swipe = swipePower(offset.x, velocity.x)
                  if (swipe < -swipeConfidenceThreshold) {
                    nextImage()
                  } else if (swipe > swipeConfidenceThreshold) {
                    prevImage()
                  }
                }}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="w-full max-w-md h-auto object-contain cursor-grab active:cursor-grabbing"
              />
            </AnimatePresence>
          </div>
        </div>

        {/* Quantity Selector */}
        <div className="mb-6">
          <h3 className="font-bold text-lg text-gray-900 mb-3">Quantità</h3>
          <div className="flex items-center bg-white rounded-2xl shadow-lg p-2 border border-gray-200 w-fit">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
              className="w-12 h-12 flex items-center justify-center rounded-xl bg-gray-100 disabled:opacity-50 active:scale-95 transition-transform"
            >
              <Minus className="w-5 h-5" />
            </button>
            <span className="w-16 text-center font-bold text-2xl">{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="w-12 h-12 flex items-center justify-center rounded-xl bg-black text-white active:scale-95 transition-transform"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Variants - Se ci sono */}
        {product.variants && product.variants.length > 0 && (
          <div className="mb-6">
            <h3 className="font-bold text-lg text-gray-900 mb-3">Dimensione</h3>
            <div className="grid grid-cols-3 gap-3">
              {product.variants.map((variant) => (
                <button
                  key={variant.id}
                  onClick={() => setSelectedVariant(variant.id)}
                  className={`p-3 rounded-2xl text-sm font-medium transition-all ${
                    selectedVariant === variant.id
                      ? 'bg-gray-900 text-white shadow-lg scale-105'
                      : 'bg-gray-100 border-2 border-gray-200 hover:border-gray-400'
                  }`}
                >
                  <div className="text-xs opacity-80 mb-1">{variant.label}</div>
                  <div className="font-bold text-base">€{variant.price.toFixed(2)}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Add-ons - Se ci sono */}
        {product.addOns && product.addOns.length > 0 && (
          <div className="mb-6">
            <h3 className="font-bold text-lg text-gray-900 mb-3">Extra</h3>
            <div className="space-y-2">
              {product.addOns.map((addon) => (
                <button
                  key={addon.id}
                  onClick={() => toggleAddOn(addon.id)}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl text-sm transition-all ${
                    selectedAddOns.includes(addon.id)
                      ? 'bg-gray-900 text-white shadow-lg'
                      : 'bg-gray-50 border-2 border-gray-200 hover:border-gray-400'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      selectedAddOns.includes(addon.id) ? 'border-white bg-white' : 'border-gray-400'
                    }`}>
                      {selectedAddOns.includes(addon.id) && <Check className="w-3 h-3 text-gray-900" />}
                    </div>
                    <span className="font-medium">{addon.label}</span>
                  </div>
                  <span className={`font-bold ${selectedAddOns.includes(addon.id) ? 'text-white' : 'text-gray-900'}`}>
                    +€{addon.price.toFixed(2)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Upsell Bevande - Se non ci sono bevande nel carrello */}
        {product.category !== 'Bevande' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-6 bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-100 rounded-2xl p-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="text-3xl">🥤</div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">Aggiungi una bevanda?</p>
                  <p className="text-xs text-gray-600">Solo +€2</p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/?category=Bevande')}
                className="bg-blue-500 text-white px-4 py-2 rounded-full text-xs font-bold hover:bg-blue-600 transition-colors"
              >
                Aggiungi
              </motion.button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Fixed Bottom Bar - Mobile Optimized */}
      <div className="fixed bottom-0 left-0 right-0 bg-white shadow-2xl z-40 border-t border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 sm:py-6 flex items-center justify-between gap-3">
          {/* Prezzo Grande - Sinistra */}
          <div>
            <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900">
              €{totalPrice.toFixed(0)}
            </div>
          </div>

          {/* Add to Cart Button - Destra */}
          <button
            onClick={handleAddToCart}
            className="bg-gray-900 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-2xl font-semibold text-sm sm:text-base hover:bg-gray-800 active:scale-95 transition-all shadow-lg whitespace-nowrap relative overflow-hidden"
          >
            <AnimatePresence mode="wait">
              {showAddedFeedback ? (
                <motion.span
                  key="added"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  className="flex items-center gap-2"
                >
                  <Check className="w-5 h-5" />
                  <span>Aggiunto! ({quantity})</span>
                </motion.span>
              ) : (
                <motion.span
                  key="add"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                >
                  <span className="hidden sm:inline">Aggiungi al Carrello</span>
                  <span className="sm:hidden">Aggiungi</span>
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProductDetailPageV2
