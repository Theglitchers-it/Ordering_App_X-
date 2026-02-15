import { createContext, useContext, useState, useCallback } from 'react'
import * as reviewService from '../api/reviewService'

const ReviewsContext = createContext()

const USE_API = import.meta.env.VITE_API_URL && import.meta.env.VITE_API_URL !== 'undefined'

// Demo reviews for offline/demo mode
const demoReviews = [
  {
    id: 1,
    merchant_id: 1,
    product_id: 1,
    order_id: 1001,
    rating: 5,
    title: 'Pizza fantastica!',
    comment: 'La migliore margherita che abbia mai mangiato. Impasto perfetto e mozzarella di bufala eccezionale.',
    author: { first_name: 'Marco', last_name: 'Rossi' },
    is_verified: true,
    merchant_response: 'Grazie Marco! Ti aspettiamo presto!',
    created_at: '2026-02-10T18:30:00Z'
  },
  {
    id: 2,
    merchant_id: 1,
    product_id: 4,
    order_id: 1002,
    rating: 4,
    title: 'Carbonara ottima',
    comment: 'Guanciale croccante e cremosità perfetta. Un pelo di pecorino in più non guasterebbe.',
    author: { first_name: 'Lucia', last_name: 'Bianchi' },
    is_verified: true,
    merchant_response: null,
    created_at: '2026-02-08T12:15:00Z'
  },
  {
    id: 3,
    merchant_id: 2,
    product_id: 6,
    order_id: 1003,
    rating: 5,
    title: 'Spritz perfetto',
    comment: 'Ambiente stupendo e cocktail preparati con cura. Lo spritz è il migliore di Milano!',
    author: { first_name: 'Alessandro', last_name: 'Verdi' },
    is_verified: true,
    merchant_response: 'Grazie Alessandro! Il nostro barman sarà felicissimo!',
    created_at: '2026-02-12T20:00:00Z'
  },
  {
    id: 4,
    merchant_id: 3,
    product_id: 10,
    order_id: 1004,
    rating: 5,
    title: 'Bistecca da sogno',
    comment: 'La Fiorentina è spettacolare. Cottura perfetta e carne di altissima qualità. Vale ogni centesimo.',
    author: { first_name: 'Giovanni', last_name: 'Neri' },
    is_verified: true,
    merchant_response: null,
    created_at: '2026-02-14T21:30:00Z'
  },
  {
    id: 5,
    merchant_id: 1,
    product_id: 3,
    order_id: 1005,
    rating: 3,
    title: 'Buona ma niente di speciale',
    comment: 'La Quattro Formaggi era buona ma mi aspettavo qualcosa di più. Servizio comunque veloce.',
    author: { first_name: 'Sara', last_name: 'Colombo' },
    is_verified: false,
    merchant_response: null,
    created_at: '2026-02-06T19:45:00Z'
  }
]

export function ReviewsProvider({ children }) {
  const [reviews, setReviews] = useState(USE_API ? [] : demoReviews)
  const [loading, setLoading] = useState(false)

  const getReviewsByMerchant = useCallback(async (merchantId) => {
    if (USE_API) {
      setLoading(true)
      try {
        const result = await reviewService.getReviewsByMerchant(merchantId)
        if (result.success) {
          setReviews(result.reviews || [])
          return result.reviews || []
        }
      } catch (err) {
        console.error('[ReviewsContext] API error:', err)
      } finally {
        setLoading(false)
      }
      return []
    }
    return reviews.filter(r => r.merchant_id === merchantId)
  }, [reviews])

  const getReviewsByProduct = useCallback(async (productId) => {
    if (USE_API) {
      setLoading(true)
      try {
        const result = await reviewService.getReviewsByProduct(productId)
        if (result.success) return result.reviews || []
      } catch (err) {
        console.error('[ReviewsContext] API error:', err)
      } finally {
        setLoading(false)
      }
      return []
    }
    return reviews.filter(r => r.product_id === productId)
  }, [reviews])

  const addReview = useCallback(async (reviewData) => {
    if (USE_API) {
      setLoading(true)
      try {
        const result = await reviewService.createReview(reviewData)
        if (result.success) {
          setReviews(prev => [result.review, ...prev])
          return result
        }
        return result
      } catch (err) {
        return { success: false, message: err.message }
      } finally {
        setLoading(false)
      }
    }

    // Demo mode
    const newReview = {
      id: Math.max(0, ...reviews.map(r => r.id)) + 1,
      ...reviewData,
      author: { first_name: 'Tu', last_name: '' },
      is_verified: true,
      merchant_response: null,
      created_at: new Date().toISOString()
    }
    setReviews(prev => [newReview, ...prev])
    return { success: true, review: newReview, message: 'Recensione inviata!' }
  }, [reviews])

  const respondToReview = useCallback(async (reviewId, responseText) => {
    if (USE_API) {
      try {
        const result = await reviewService.respondToReview(reviewId, responseText)
        if (result.success) {
          setReviews(prev =>
            prev.map(r => r.id === reviewId ? { ...r, merchant_response: responseText } : r)
          )
        }
        return result
      } catch (err) {
        return { success: false, message: err.message }
      }
    }

    setReviews(prev =>
      prev.map(r => r.id === reviewId ? { ...r, merchant_response: responseText } : r)
    )
    return { success: true, message: 'Risposta inviata!' }
  }, [])

  const deleteReview = useCallback(async (reviewId) => {
    if (USE_API) {
      try {
        const result = await reviewService.deleteReview(reviewId)
        if (result.success) {
          setReviews(prev => prev.filter(r => r.id !== reviewId))
        }
        return result
      } catch (err) {
        return { success: false, message: err.message }
      }
    }

    setReviews(prev => prev.filter(r => r.id !== reviewId))
    return { success: true }
  }, [])

  const getStats = useCallback((merchantId) => {
    const merchantReviews = reviews.filter(r => r.merchant_id === merchantId)
    const total = merchantReviews.length
    if (total === 0) return { average_rating: '0.0', total_reviews: 0, rating_distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } }

    const sum = merchantReviews.reduce((acc, r) => acc + r.rating, 0)
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    merchantReviews.forEach(r => { distribution[r.rating] = (distribution[r.rating] || 0) + 1 })

    return {
      average_rating: (sum / total).toFixed(1),
      total_reviews: total,
      rating_distribution: distribution
    }
  }, [reviews])

  return (
    <ReviewsContext.Provider
      value={{
        reviews,
        loading,
        getReviewsByMerchant,
        getReviewsByProduct,
        addReview,
        respondToReview,
        deleteReview,
        getStats,
        isUsingAPI: USE_API
      }}
    >
      {children}
    </ReviewsContext.Provider>
  )
}

export function useReviewsContext() {
  const context = useContext(ReviewsContext)
  if (!context) {
    throw new Error('useReviewsContext must be used within ReviewsProvider')
  }
  return context
}
