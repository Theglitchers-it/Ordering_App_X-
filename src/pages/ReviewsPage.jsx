import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Star, MessageSquare, User, Calendar, Send, X, Loader2, ThumbsUp } from 'lucide-react'
import { useReviewsContext } from '../context/ReviewsContext'
import { useTenant } from '../context/TenantContext'
import Header from '../components/common/Header'

function StarRating({ rating, onRate, interactive = false, size = 'md' }) {
  const [hoverRating, setHoverRating] = useState(0)
  const sizeClasses = { sm: 'w-4 h-4', md: 'w-5 h-5', lg: 'w-7 h-7' }

  return (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => interactive && onRate?.(star)}
          onMouseEnter={() => interactive && setHoverRating(star)}
          onMouseLeave={() => interactive && setHoverRating(0)}
          className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
        >
          <Star
            className={`${sizeClasses[size]} ${
              (hoverRating || rating) >= star
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        </button>
      ))}
    </div>
  )
}

function ReviewsPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { reviews, loading, getReviewsByMerchant, addReview, getStats } = useReviewsContext()
  const { currentMerchant } = useTenant()

  // Check if coming from order confirmation to write a review
  const orderData = location.state || {}
  const showWriteForm = !!orderData.orderId

  const [merchantReviews, setMerchantReviews] = useState([])
  const [stats, setStats] = useState(null)
  const [showForm, setShowForm] = useState(showWriteForm)
  const [rating, setRating] = useState(0)
  const [title, setTitle] = useState('')
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [successMsg, setSuccessMsg] = useState(null)
  const [sortBy, setSortBy] = useState('newest')

  const merchantId = currentMerchant?.id || orderData.merchantId || 1

  useEffect(() => {
    const load = async () => {
      const result = await getReviewsByMerchant(merchantId)
      setMerchantReviews(result)
      setStats(getStats(merchantId))
    }
    load()
  }, [merchantId, getReviewsByMerchant, getStats])

  // Update local reviews when context reviews change
  useEffect(() => {
    const filtered = reviews.filter(r => r.merchant_id === merchantId)
    if (filtered.length > 0) {
      setMerchantReviews(filtered)
      setStats(getStats(merchantId))
    }
  }, [reviews, merchantId, getStats])

  const sortedReviews = [...merchantReviews].sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.created_at) - new Date(a.created_at)
    if (sortBy === 'oldest') return new Date(a.created_at) - new Date(b.created_at)
    if (sortBy === 'highest') return b.rating - a.rating
    if (sortBy === 'lowest') return a.rating - b.rating
    return 0
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (rating === 0) return

    setSubmitting(true)
    const result = await addReview({
      merchant_id: merchantId,
      order_id: orderData.orderId || null,
      rating,
      title: title.trim() || null,
      comment: comment.trim() || null
    })
    setSubmitting(false)

    if (result.success) {
      setSuccessMsg('Grazie per la tua recensione!')
      setRating(0)
      setTitle('')
      setComment('')
      setShowForm(false)
      setTimeout(() => setSuccessMsg(null), 4000)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Indietro</span>
        </motion.button>

        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-gray-900 mb-2"
        >
          Recensioni
        </motion.h1>
        {currentMerchant && (
          <p className="text-gray-500 mb-8">{currentMerchant.name || currentMerchant.business_name}</p>
        )}

        {/* Stats */}
        {stats && stats.total_reviews > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-6 shadow-lg mb-6"
          >
            <div className="flex items-center space-x-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-900">{stats.average_rating}</div>
                <StarRating rating={parseFloat(stats.average_rating)} size="sm" />
                <p className="text-sm text-gray-500 mt-1">{stats.total_reviews} recensioni</p>
              </div>
              <div className="flex-1 space-y-1">
                {[5, 4, 3, 2, 1].map((r) => {
                  const count = stats.rating_distribution[r] || 0
                  const pct = stats.total_reviews > 0 ? (count / stats.total_reviews) * 100 : 0
                  return (
                    <div key={r} className="flex items-center space-x-2 text-sm">
                      <span className="w-3 text-gray-600">{r}</span>
                      <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="w-6 text-gray-500 text-right">{count}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* Success Message */}
        <AnimatePresence>
          {successMsg && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 text-green-800 font-medium text-center"
            >
              {successMsg}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Write Review Button / Form */}
        {!showForm ? (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowForm(true)}
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-4 rounded-2xl font-bold text-lg hover:shadow-lg mb-6 flex items-center justify-center space-x-2"
          >
            <Star className="w-5 h-5" />
            <span>Scrivi una recensione</span>
          </motion.button>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-6 shadow-lg mb-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">La tua recensione</h3>
              <button onClick={() => setShowForm(false)} className="p-1 hover:bg-gray-100 rounded-full">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Come valuteresti la tua esperienza?</p>
                <div className="flex justify-center">
                  <StarRating rating={rating} onRate={setRating} interactive size="lg" />
                </div>
                {rating > 0 && (
                  <p className="text-sm text-gray-500 mt-1">
                    {['', 'Pessimo', 'Scarso', 'Nella media', 'Buono', 'Eccellente'][rating]}
                  </p>
                )}
              </div>

              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Titolo (opzionale)"
                maxLength={100}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none"
              />

              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Racconta la tua esperienza..."
                rows={4}
                maxLength={1000}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none resize-none"
              />

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl hover:bg-gray-50 font-medium"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  disabled={submitting || rating === 0}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-medium disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  {submitting ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /><span>Invio...</span></>
                  ) : (
                    <><Send className="w-4 h-4" /><span>Invia</span></>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Sort + Reviews List */}
        {sortedReviews.length > 0 && (
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">
              Tutte le recensioni ({sortedReviews.length})
            </h3>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-orange-500"
            >
              <option value="newest">Più recenti</option>
              <option value="oldest">Meno recenti</option>
              <option value="highest">Voto più alto</option>
              <option value="lowest">Voto più basso</option>
            </select>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
          </div>
        ) : sortedReviews.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-2xl p-12 text-center shadow-lg"
          >
            <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-700 mb-2">Nessuna recensione</h2>
            <p className="text-gray-500">Sii il primo a lasciare una recensione!</p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {sortedReviews.map((review) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {review.author?.first_name} {review.author?.last_name?.charAt(0)}.
                        </p>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(review.created_at).toLocaleDateString('it-IT')}</span>
                          {review.is_verified && (
                            <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-medium">
                              Verificato
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <StarRating rating={review.rating} size="sm" />
                  </div>

                  {review.title && <h4 className="font-semibold text-gray-900 mb-1">{review.title}</h4>}
                  {review.comment && <p className="text-gray-600 text-sm mb-3">{review.comment}</p>}

                  {review.merchant_response && (
                    <div className="bg-orange-50 border border-orange-100 rounded-xl p-3 mt-3">
                      <div className="flex items-center space-x-2 text-sm text-orange-700 mb-1">
                        <MessageSquare className="w-3 h-3" />
                        <span className="font-semibold">Risposta del ristorante</span>
                      </div>
                      <p className="text-gray-700 text-sm">{review.merchant_response}</p>
                    </div>
                  )}

                  <div className="flex items-center mt-3 pt-3 border-t border-gray-100">
                    <button className="flex items-center space-x-1 text-gray-500 hover:text-gray-700 text-sm">
                      <ThumbsUp className="w-4 h-4" />
                      <span>Utile</span>
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  )
}

export default ReviewsPage
