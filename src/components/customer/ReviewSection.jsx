import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, MessageSquare, ThumbsUp, User, Calendar, Send, X, Loader2 } from 'lucide-react'
import { useReviews, useReviewStats, useCreateReview } from '../../hooks/api/useReviews'

/**
 * Star Rating Component
 */
function StarRating({ rating, onRate, interactive = false, size = 'md' }) {
  const [hoverRating, setHoverRating] = useState(0)

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }

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

/**
 * Rating Stats Bar
 */
function RatingBar({ rating, count, total }) {
  const percentage = total > 0 ? (count / total) * 100 : 0

  return (
    <div className="flex items-center space-x-2 text-sm">
      <span className="w-3 text-gray-600">{rating}</span>
      <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-yellow-400 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="w-8 text-gray-500 text-right">{count}</span>
    </div>
  )
}

/**
 * Review Card Component
 */
function ReviewCard({ review, onRespond }) {
  const [showResponse, setShowResponse] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
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

      {/* Title */}
      {review.title && (
        <h4 className="font-semibold text-gray-900 mb-2">{review.title}</h4>
      )}

      {/* Comment */}
      {review.comment && (
        <p className="text-gray-600 mb-4">{review.comment}</p>
      )}

      {/* Product */}
      {review.product && (
        <div className="flex items-center space-x-2 mb-4">
          <img
            src={review.product.image_url}
            alt={review.product.name}
            className="w-12 h-12 rounded-lg object-cover"
          />
          <span className="text-sm text-gray-600">{review.product.name}</span>
        </div>
      )}

      {/* Merchant Response */}
      {review.merchant_response && (
        <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 mt-4">
          <div className="flex items-center space-x-2 text-sm text-orange-700 mb-2">
            <MessageSquare className="w-4 h-4" />
            <span className="font-semibold">Risposta del ristorante</span>
          </div>
          <p className="text-gray-700 text-sm">{review.merchant_response}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
        <button className="flex items-center space-x-1 text-gray-500 hover:text-gray-700 text-sm">
          <ThumbsUp className="w-4 h-4" />
          <span>Utile</span>
        </button>
        {onRespond && !review.merchant_response && (
          <button
            onClick={() => setShowResponse(!showResponse)}
            className="text-sm text-orange-600 hover:text-orange-700 font-medium"
          >
            Rispondi
          </button>
        )}
      </div>
    </motion.div>
  )
}

/**
 * Create Review Modal
 */
function CreateReviewModal({ isOpen, onClose, orderId, merchantId, productId, onSuccess }) {
  const { submitReview, submitting, error } = useCreateReview()
  const [rating, setRating] = useState(0)
  const [title, setTitle] = useState('')
  const [comment, setComment] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (rating === 0) {
      alert('Seleziona un voto')
      return
    }

    const result = await submitReview({
      order_id: orderId,
      merchant_id: merchantId,
      product_id: productId,
      rating,
      title: title.trim() || null,
      comment: comment.trim() || null
    })

    if (result.success) {
      onSuccess?.(result.review)
      onClose()
      setRating(0)
      setTitle('')
      setComment('')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl max-w-lg w-full p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Lascia una recensione</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Rating */}
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

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Titolo (opzionale)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Riassumi la tua esperienza"
              maxLength={100}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none"
            />
          </div>

          {/* Comment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              La tua recensione (opzionale)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Racconta la tua esperienza..."
              rows={4}
              maxLength={1000}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none resize-none"
            />
            <p className="text-xs text-gray-400 mt-1 text-right">{comment.length}/1000</p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl hover:bg-gray-50 font-medium"
            >
              Annulla
            </button>
            <button
              type="submit"
              disabled={submitting || rating === 0}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-medium hover:shadow-lg disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Invio...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Invia</span>
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

/**
 * Main Review Section Component
 */
export default function ReviewSection({ merchantId, productId, showStats = true, showForm = false, orderId = null }) {
  const { reviews, loading, error, refresh, createReview } = useReviews({
    merchant_id: merchantId,
    product_id: productId,
    limit: 10
  })
  const { stats } = useReviewStats(
    productId ? 'product' : 'merchant',
    productId || merchantId
  )
  const [showModal, setShowModal] = useState(false)
  const [sortBy, setSortBy] = useState('newest')

  const handleReviewSuccess = (review) => {
    refresh()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Section */}
      {showStats && stats && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center md:space-x-8">
            {/* Average Rating */}
            <div className="text-center mb-4 md:mb-0">
              <div className="text-5xl font-bold text-gray-900">{stats.average_rating}</div>
              <StarRating rating={parseFloat(stats.average_rating)} size="md" />
              <p className="text-sm text-gray-500 mt-1">{stats.total_reviews} recensioni</p>
            </div>

            {/* Rating Distribution */}
            <div className="flex-1 space-y-1">
              {[5, 4, 3, 2, 1].map((rating) => (
                <RatingBar
                  key={rating}
                  rating={rating}
                  count={stats.rating_distribution[rating]}
                  total={stats.total_reviews}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Write Review Button */}
      {showForm && orderId && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowModal(true)}
          className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-4 rounded-2xl font-bold text-lg hover:shadow-lg flex items-center justify-center space-x-2"
        >
          <Star className="w-5 h-5" />
          <span>Scrivi una recensione</span>
        </motion.button>
      )}

      {/* Sort Options */}
      {reviews.length > 0 && (
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">
            Recensioni ({reviews.length})
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

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
          <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Nessuna recensione ancora</p>
          {showForm && orderId && (
            <p className="text-sm text-gray-400 mt-2">Sii il primo a lasciare una recensione!</p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Create Review Modal */}
      <AnimatePresence>
        {showModal && (
          <CreateReviewModal
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            orderId={orderId}
            merchantId={merchantId}
            productId={productId}
            onSuccess={handleReviewSuccess}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export { StarRating, ReviewCard, CreateReviewModal }
