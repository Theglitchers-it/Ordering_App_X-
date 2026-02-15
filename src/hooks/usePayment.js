import { useState, useCallback } from 'react'
import * as paymentService from '../api/paymentService'

const USE_API = import.meta.env.VITE_API_URL && import.meta.env.VITE_API_URL !== 'undefined'
const STRIPE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY

/**
 * Hook for handling payments.
 * API mode: creates Stripe PaymentIntent and returns clientSecret.
 * Demo mode: simulates payment success instantly.
 */
export function usePayment() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [clientSecret, setClientSecret] = useState(null)
  const [paymentIntentId, setPaymentIntentId] = useState(null)

  const isStripeEnabled = USE_API && STRIPE_KEY && STRIPE_KEY !== 'undefined' && !STRIPE_KEY.includes('your_stripe')

  // Create a payment intent for the given order
  const createIntent = useCallback(async (orderId) => {
    if (!isStripeEnabled) {
      // Demo mode: simulate success
      return { success: true, demo: true }
    }

    setLoading(true)
    setError(null)
    try {
      const result = await paymentService.createPaymentIntent(orderId)
      if (result.success) {
        setClientSecret(result.clientSecret)
        setPaymentIntentId(result.paymentIntentId)
        return result
      }
      setError(result.message || 'Errore nella creazione del pagamento')
      return result
    } catch (err) {
      setError(err.message || 'Errore nel pagamento')
      return { success: false, message: err.message }
    } finally {
      setLoading(false)
    }
  }, [isStripeEnabled])

  // Confirm payment after Stripe Elements form submission
  const confirmIntent = useCallback(async (intentId) => {
    if (!isStripeEnabled) {
      return { success: true, demo: true }
    }

    setLoading(true)
    setError(null)
    try {
      const result = await paymentService.confirmPayment(intentId || paymentIntentId)
      return result
    } catch (err) {
      setError(err.message)
      return { success: false, message: err.message }
    } finally {
      setLoading(false)
    }
  }, [isStripeEnabled, paymentIntentId])

  const reset = useCallback(() => {
    setClientSecret(null)
    setPaymentIntentId(null)
    setError(null)
    setLoading(false)
  }, [])

  return {
    isStripeEnabled,
    stripeKey: STRIPE_KEY,
    loading,
    error,
    clientSecret,
    paymentIntentId,
    createIntent,
    confirmIntent,
    reset
  }
}
