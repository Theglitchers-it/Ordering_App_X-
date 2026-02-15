import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

// Force demo mode
vi.stubEnv('VITE_API_URL', '')

import { ReviewsProvider, useReviewsContext } from '../context/ReviewsContext'

const wrapper = ({ children }) => <ReviewsProvider>{children}</ReviewsProvider>

describe('ReviewsContext (demo mode)', () => {
  it('loads demo reviews on init', () => {
    const { result } = renderHook(() => useReviewsContext(), { wrapper })
    expect(result.current.reviews.length).toBeGreaterThan(0)
    expect(result.current.loading).toBe(false)
  })

  it('filters reviews by merchant', async () => {
    const { result } = renderHook(() => useReviewsContext(), { wrapper })

    let merchantReviews
    await act(async () => {
      merchantReviews = await result.current.getReviewsByMerchant(1)
    })

    expect(merchantReviews.length).toBeGreaterThan(0)
    merchantReviews.forEach(r => expect(r.merchant_id).toBe(1))
  })

  it('filters reviews by product', async () => {
    const { result } = renderHook(() => useReviewsContext(), { wrapper })

    let productReviews
    await act(async () => {
      productReviews = await result.current.getReviewsByProduct(1)
    })

    productReviews.forEach(r => expect(r.product_id).toBe(1))
  })

  it('adds a new review in demo mode', async () => {
    const { result } = renderHook(() => useReviewsContext(), { wrapper })
    const initialCount = result.current.reviews.length

    let response
    await act(async () => {
      response = await result.current.addReview({
        merchant_id: 1,
        rating: 5,
        title: 'Test Review',
        comment: 'Great food!'
      })
    })

    expect(response.success).toBe(true)
    expect(result.current.reviews.length).toBe(initialCount + 1)
    expect(result.current.reviews[0].title).toBe('Test Review')
  })

  it('deletes a review in demo mode', async () => {
    const { result } = renderHook(() => useReviewsContext(), { wrapper })
    const firstId = result.current.reviews[0].id
    const initialCount = result.current.reviews.length

    let response
    await act(async () => {
      response = await result.current.deleteReview(firstId)
    })

    expect(response.success).toBe(true)
    expect(result.current.reviews.length).toBe(initialCount - 1)
  })

  it('computes stats correctly', () => {
    const { result } = renderHook(() => useReviewsContext(), { wrapper })
    const stats = result.current.getStats(1)

    expect(stats).toHaveProperty('average_rating')
    expect(stats).toHaveProperty('total_reviews')
    expect(stats).toHaveProperty('rating_distribution')
    expect(stats.total_reviews).toBeGreaterThan(0)
  })

  it('responds to a review in demo mode', async () => {
    const { result } = renderHook(() => useReviewsContext(), { wrapper })
    const reviewWithoutResponse = result.current.reviews.find(r => !r.merchant_response)

    if (reviewWithoutResponse) {
      await act(async () => {
        await result.current.respondToReview(reviewWithoutResponse.id, 'Grazie!')
      })

      const updated = result.current.reviews.find(r => r.id === reviewWithoutResponse.id)
      expect(updated.merchant_response).toBe('Grazie!')
    }
  })

  it('throws error when used outside provider', () => {
    expect(() => {
      renderHook(() => useReviewsContext())
    }).toThrow('useReviewsContext must be used within ReviewsProvider')
  })
})
