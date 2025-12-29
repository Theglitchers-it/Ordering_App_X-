import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Star, Clock, ShoppingCart, Heart, Plus, Minus,
  ChevronLeft, ChevronRight, Share2, Check, X
} from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useFavorites } from '../context/FavoritesContext'
import { getFoodById } from '../data/foodData'
import AnimatedHeart from '../components/AnimatedHeart'
import ActionCircle from '../components/ActionCircle'

// Mobile-optimized animations
const mobileAnimations = {
  pageEnter: {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.2 } }
  },
  slideUp: {
    initial: { y: 20, opacity: 0 },
    animate: { y: 0, opacity: 1, transition: { duration: 0.3 } }
  },
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.2 } }
  }
}

function ProductDetailPageOptimized() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()

  // Get product from new data model or fallback to location state
  const product = getFoodById(id) || location.state?.product

  const { addToCart } = useCart()
  const { isFavorite, toggleFavorite } = useFavorites()

  // State management
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedVariant, setSelectedVariant] = useState(product?.variants?.[1]?.id || null)
  const [selectedAddOns, setSelectedAddOns] = useState([])
  const [customNotes, setCustomNotes] = useState('')
  const [showShareMenu, setShowShareMenu] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  // Optimized scroll handler with throttle
  useEffect(() => {
    let ticking = false
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 150)
          ticking = false
        })
        ticking = true
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (!product) {
    navigate(-1)
    return null
  }

  // Calculate total price with variants and add-ons
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
      prev.includes(addonId)
        ? prev.filter(id => id !== addonId)
        : [...prev, addonId]
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

    // Visual feedback
    const button = document.getElementById('add-to-cart-btn')
    button?.classList.add('scale-95')
    setTimeout(() => button?.classList.remove('scale-95'), 200)
  }, [product, selectedVariant, selectedAddOns, customNotes, quantity, totalPrice, addToCart])

  const handleShare = async () => {
    const shareData = {
      title: product.title,
      text: `Guarda questo delizioso ${product.title}!`,
      url: window.location.href
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch (err) {
        console.log('Share cancelled')
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
      setShowShareMenu(true)
      setTimeout(() => setShowShareMenu(false), 2000)
    }
  }

  const nextImage = useCallback(() => {
    setSelectedImage(prev => (prev + 1) % (product.images?.length || 1))
  }, [product.images])

  const prevImage = useCallback(() => {
    setSelectedImage(prev => prev === 0 ? (product.images?.length || 1) - 1 : prev - 1)
  }, [product.images])

  return (
    <motion.div
      {...mobileAnimations.pageEnter}
      className="min-h-screen bg-cream-50"
    >
      {/* Fixed Collapsing Header - Mobile Optimized */}
      <AnimatePresence>
        {isScrolled && (
          <motion.header
            initial={{ y: -80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -80, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed top-0 left-0 right-0 bg-white shadow-lg z-50 safe-top"
          >
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <button
                  onClick={() => navigate(-1)}
                  className="p-2 -ml-2 active:bg-gray-100 rounded-full touch-manipulation"
                  aria-label="Torna indietro"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="flex-1 min-w-0">
                  <h2 className="font-bold text-sm text-gray-900 truncate">{product.title}</h2>
                  <p className="text-xs text-primary font-semibold">€{totalPrice.toFixed(2)}</p>
                </div>
              </div>
              <button
                onClick={handleAddToCart}
                className="bg-gradient-to-r from-primary to-secondary text-white px-4 py-2 rounded-full font-semibold text-sm shadow-action touch-manipulation active:scale-95 transition-transform"
                aria-label="Aggiungi al carrello"
              >
                <ShoppingCart className="w-4 h-4" />
              </button>
            </div>
          </motion.header>
        )}
      </AnimatePresence>

      <main className="pb-28">
        {/* Hero Image Gallery - Mobile Optimized */}
        <div className="relative bg-white">
          {/* Floating Action Buttons - Optimized for Touch */}
          <div className="absolute top-4 left-4 right-4 z-20 flex justify-between items-start">
            <button
              onClick={() => navigate(-1)}
              className="bg-white/95 backdrop-blur-sm p-3 rounded-full shadow-action active:scale-95 transition-transform touch-manipulation"
              aria-label="Torna indietro"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>

            <div className="flex space-x-2">
              <button
                onClick={handleShare}
                className="bg-white/95 backdrop-blur-sm p-3 rounded-full shadow-action active:scale-95 transition-transform touch-manipulation"
                aria-label="Condividi"
              >
                <Share2 className="w-5 h-5 text-gray-700" />
              </button>

              <AnimatedHeart
                isFavorite={isFavorite(product.id)}
                onClick={() => toggleFavorite(product)}
                size="md"
              />
            </div>
          </div>

          {/* Share Confirmation Toast */}
          <AnimatePresence>
            {showShareMenu && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute top-20 right-4 bg-green-500 text-white px-4 py-2.5 rounded-xl shadow-action z-30 flex items-center space-x-2"
              >
                <Check className="w-4 h-4" />
                <span className="text-sm font-medium">Link copiato!</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Image Carousel - Swipe Optimized */}
          <div className="relative h-80 overflow-hidden touch-pan-y">
            <AnimatePresence mode="wait">
              <motion.img
                key={selectedImage}
                src={product.images?.[selectedImage] || product.image}
                alt={product.title}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="w-full h-full object-cover"
                draggable={false}
              />
            </AnimatePresence>

            {/* Navigation Arrows - Only if multiple images */}
            {product.images && product.images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg active:scale-95 transition-transform touch-manipulation"
                  aria-label="Immagine precedente"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-700" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg active:scale-95 transition-transform touch-manipulation"
                  aria-label="Immagine successiva"
                >
                  <ChevronRight className="w-5 h-5 text-gray-700" />
                </button>

                {/* Indicators */}
                <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
                  {product.images.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`h-1.5 rounded-full transition-all touch-manipulation ${
                        idx === selectedImage
                          ? 'w-6 bg-white'
                          : 'w-1.5 bg-white/60'
                      }`}
                      aria-label={`Vai all'immagine ${idx + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Thumbnail Strip - Mobile Optimized */}
          {product.images && product.images.length > 1 && (
            <div className="flex space-x-2 px-4 py-3 overflow-x-auto scrollbar-hide snap-x snap-mandatory">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all snap-start touch-manipulation ${
                    idx === selectedImage
                      ? 'border-primary shadow-md scale-105'
                      : 'border-transparent opacity-60'
                  }`}
                >
                  <img src={img} alt={`${product.title} ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info - Mobile Optimized Layout */}
        <motion.div {...mobileAnimations.slideUp} className="px-4 py-5 space-y-6">
          {/* Title and Rating */}
          <div>
            <h1 className="text-2xl font-bold text-strongBlack mb-2">{product.title}</h1>
            <p className="text-sm text-gray-600 mb-3">by {product.author || product.chef}</p>

            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="font-semibold">{product.rating}</span>
                <span className="text-gray-500">({product.reviewsCount || 234})</span>
              </div>
              <div className="flex items-center space-x-1 text-gray-600">
                <Clock className="w-4 h-4" />
                <span>{product.deliveryTime || product.prepTime} min</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <p className="text-gray-700 leading-relaxed">{product.description}</p>
          </div>

          {/* Allergens Tags */}
          {product.allergens && product.allergens.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {product.allergens.map((allergen, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center px-3 py-1 rounded-full bg-orange-50 text-orange-700 text-xs font-medium border border-orange-200"
                >
                  {allergen}
                </span>
              ))}
            </div>
          )}

          {/* Variants/Sizes - Mobile Optimized */}
          {product.variants && product.variants.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-bold text-gray-900">Scegli la dimensione</h3>
              <div className="grid grid-cols-3 gap-2">
                {product.variants.map((variant) => (
                  <button
                    key={variant.id}
                    onClick={() => setSelectedVariant(variant.id)}
                    className={`p-3 rounded-xl font-medium text-sm transition-all touch-manipulation ${
                      selectedVariant === variant.id
                        ? 'bg-gradient-to-br from-primary to-secondary text-white shadow-action scale-105'
                        : 'bg-white text-gray-700 border-2 border-gray-200 active:scale-95'
                    }`}
                  >
                    <div className="text-xs opacity-90 mb-0.5">{variant.label}</div>
                    <div className="font-bold">€{variant.price.toFixed(2)}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Add-ons - Mobile Optimized */}
          {product.addOns && product.addOns.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-bold text-gray-900">Aggiungi extra</h3>
              <div className="space-y-2">
                {product.addOns.map((addon) => (
                  <button
                    key={addon.id}
                    onClick={() => toggleAddOn(addon.id)}
                    className={`w-full flex items-center justify-between p-4 rounded-xl transition-all touch-manipulation ${
                      selectedAddOns.includes(addon.id)
                        ? 'bg-primary/10 border-2 border-primary'
                        : 'bg-white border-2 border-gray-200 active:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                        selectedAddOns.includes(addon.id)
                          ? 'border-primary bg-primary'
                          : 'border-gray-300'
                      }`}>
                        {selectedAddOns.includes(addon.id) && (
                          <Check className="w-3 h-3 text-white" />
                        )}
                      </div>
                      <span className="font-medium text-gray-900">{addon.label}</span>
                    </div>
                    <span className="font-bold text-primary">+€{addon.price.toFixed(2)}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Custom Notes - Mobile Optimized */}
          <div className="space-y-3">
            <h3 className="font-bold text-gray-900">Note personalizzate</h3>
            <textarea
              value={customNotes}
              onChange={(e) => setCustomNotes(e.target.value.slice(0, 250))}
              placeholder="Aggiungi richieste speciali (max 250 caratteri)"
              maxLength={250}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none resize-none text-gray-900 placeholder-placeholder touch-manipulation"
              rows={3}
            />
            <p className="text-xs text-gray-500 text-right">{customNotes.length}/250</p>
          </div>

          {/* Nutritional Info - Collapsible */}
          {product.nutritionalInfo && (
            <div className="bg-white rounded-card-lg p-4 border-2 border-gray-100">
              <h3 className="font-bold text-gray-900 mb-3">Informazioni Nutrizionali</h3>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <div className="text-2xl font-bold text-primary">{product.nutritionalInfo.calories}</div>
                  <div className="text-xs text-gray-600">Calorie</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">{product.nutritionalInfo.protein}g</div>
                  <div className="text-xs text-gray-600">Proteine</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">{product.nutritionalInfo.carbs}g</div>
                  <div className="text-xs text-gray-600">Carboidrati</div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </main>

      {/* Fixed Bottom Bar - Mobile Optimized */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-100 shadow-2xl z-40 safe-bottom"
      >
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              {/* Quantity Selector - Larger Touch Targets */}
              <div className="flex items-center bg-gray-100 rounded-full p-1">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-white disabled:opacity-50 active:scale-95 transition-transform touch-manipulation"
                  aria-label="Diminuisci quantità"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-10 text-center font-bold text-lg">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-white active:scale-95 transition-transform touch-manipulation"
                  aria-label="Aumenta quantità"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Total Price */}
            <div className="text-right">
              <div className="text-xs text-gray-500">Totale</div>
              <div className="text-2xl font-bold text-primary">€{totalPrice.toFixed(2)}</div>
            </div>
          </div>

          {/* Add to Cart Button - Full Width */}
          <button
            id="add-to-cart-btn"
            onClick={handleAddToCart}
            className="w-full bg-gradient-to-r from-primary to-secondary text-white py-4 rounded-full font-bold text-lg shadow-action flex items-center justify-center space-x-2 active:scale-98 transition-transform touch-manipulation"
          >
            <ShoppingCart className="w-5 h-5" />
            <span>Aggiungi al Carrello</span>
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default ProductDetailPageOptimized
