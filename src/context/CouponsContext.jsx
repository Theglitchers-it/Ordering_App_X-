import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import * as couponService from '../api/couponService'

const CouponsContext = createContext()

// Check if we should use API or localStorage (fallback for demo/offline)
const USE_API = import.meta.env.VITE_API_URL && import.meta.env.VITE_API_URL !== 'undefined'

// Fallback demo coupons for offline/demo mode
const demoCoupons = [
  {
    id: 1,
    code: 'WELCOME20',
    title: 'Benvenuto',
    description: '20% di sconto sul primo ordine',
    discount_type: 'percentage',
    discount_value: 20,
    min_order_amount: 15,
    max_discount_amount: 10,
    valid_until: new Date('2025-12-31'),
    is_active: true,
    merchant_id: null,
    times_used: 45,
    max_uses: 100
  },
  {
    id: 2,
    code: 'PIZZA10',
    title: 'Pizza Lovers',
    description: '€10 di sconto su ordini sopra €30',
    discount_type: 'fixed_amount',
    discount_value: 10,
    min_order_amount: 30,
    valid_until: new Date('2025-12-31'),
    is_active: true,
    merchant_id: 1,
    times_used: 235,
    max_uses: 500
  },
  {
    id: 3,
    code: 'LOYAL50',
    title: 'Cliente Fedele',
    description: '50% di sconto - Solo per clienti Gold',
    discount_type: 'percentage',
    discount_value: 50,
    min_order_amount: 25,
    max_discount_amount: 20,
    requiresTier: 'Gold',
    valid_until: new Date('2025-12-31'),
    is_active: true,
    merchant_id: null,
    times_used: 12,
    max_uses: 50
  },
  {
    id: 4,
    code: 'FREE5',
    title: 'Spedizione Gratis',
    description: 'Sconto €5 su ordini sopra €20',
    discount_type: 'fixed_amount',
    discount_value: 5,
    min_order_amount: 20,
    valid_until: new Date('2025-12-31'),
    is_active: true,
    merchant_id: 2,
    times_used: 89,
    max_uses: 200
  }
]

export function CouponsProvider({ children }) {
  const [appliedCoupon, setAppliedCoupon] = useState(null)
  const [userCoupons, setUserCoupons] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Load coupons on mount
  useEffect(() => {
    if (USE_API) {
      // Will be loaded when needed via hooks
      setUserCoupons([])
    } else {
      // Use demo coupons from localStorage or defaults
      const saved = localStorage.getItem('coupons')
      if (saved) {
        try {
          setUserCoupons(JSON.parse(saved))
        } catch {
          setUserCoupons(demoCoupons)
        }
      } else {
        setUserCoupons(demoCoupons)
        localStorage.setItem('coupons', JSON.stringify(demoCoupons))
      }
    }
  }, [])

  const applyCoupon = useCallback(async (code, total, tier = 'Bronze', merchantId = null, userId = null) => {
    if (USE_API) {
      // Use API validation
      setLoading(true)
      setError(null)

      try {
        const result = await couponService.validateCoupon(code, total, merchantId, userId)

        if (result.success && result.valid) {
          setAppliedCoupon(result.coupon)
          return {
            success: true,
            message: 'Coupon applicato!',
            coupon: result.coupon,
            discount: result.discount_amount
          }
        } else {
          setError(result.message)
          return {
            success: false,
            message: result.message || 'Codice coupon non valido'
          }
        }
      } catch (err) {
        const message = err.message || 'Errore nella validazione del coupon'
        setError(message)
        return { success: false, message }
      } finally {
        setLoading(false)
      }
    } else {
      // Local validation (demo mode)
      const coupon = userCoupons.find(
        c => c.code === code.toUpperCase() && c.is_active
      )

      if (!coupon) {
        return { success: false, message: 'Codice coupon non valido' }
      }

      if (new Date(coupon.valid_until) < new Date()) {
        return { success: false, message: 'Coupon scaduto' }
      }

      if (total < (coupon.min_order_amount || 0)) {
        return {
          success: false,
          message: `Ordine minimo: €${coupon.min_order_amount}`
        }
      }

      if (coupon.requiresTier) {
        const tiers = ['Bronze', 'Silver', 'Gold', 'Platinum']
        const userTierIndex = tiers.indexOf(tier)
        const requiredTierIndex = tiers.indexOf(coupon.requiresTier)

        if (userTierIndex < requiredTierIndex) {
          return {
            success: false,
            message: `Richiesto tier ${coupon.requiresTier}`
          }
        }
      }

      // Check merchant restriction
      if (merchantId && coupon.merchant_id && coupon.merchant_id !== merchantId) {
        return {
          success: false,
          message: 'Questo coupon non è valido per questo ristorante'
        }
      }

      setAppliedCoupon(coupon)
      return { success: true, message: 'Coupon applicato!', coupon }
    }
  }, [userCoupons])

  const removeCoupon = useCallback(() => {
    setAppliedCoupon(null)
    setError(null)
  }, [])

  const calculateDiscount = useCallback((total) => {
    if (!appliedCoupon) return 0

    const discountType = appliedCoupon.discount_type || appliedCoupon.type
    const discountValue = parseFloat(appliedCoupon.discount_value || appliedCoupon.discount || 0)
    const maxDiscount = appliedCoupon.max_discount_amount || appliedCoupon.maxDiscount

    if (discountType === 'fixed_amount' || discountType === 'fixed') {
      return Math.min(discountValue, total)
    } else if (discountType === 'percentage' || discountType === 'percent') {
      const discount = (total * discountValue) / 100
      return maxDiscount ? Math.min(discount, parseFloat(maxDiscount)) : discount
    }

    return 0
  }, [appliedCoupon])

  const getAvailableCoupons = useCallback(async (tier = 'Bronze', merchantId = null) => {
    if (USE_API) {
      try {
        const result = await couponService.getAvailableCoupons(merchantId)
        if (result.success) {
          return result.coupons
        }
        return []
      } catch {
        return []
      }
    } else {
      const tiers = ['Bronze', 'Silver', 'Gold', 'Platinum']
      const userTierIndex = tiers.indexOf(tier)

      return userCoupons.filter(coupon => {
        if (!coupon.is_active || new Date(coupon.valid_until) < new Date()) {
          return false
        }

        // Filter by merchantId (null = available for all merchants)
        if (merchantId && coupon.merchant_id && coupon.merchant_id !== merchantId) {
          return false
        }

        if (coupon.requiresTier) {
          const requiredTierIndex = tiers.indexOf(coupon.requiresTier)
          return userTierIndex >= requiredTierIndex
        }

        return true
      })
    }
  }, [userCoupons])

  const getCouponsByMerchant = useCallback((merchantId) => {
    return userCoupons.filter(coupon =>
      coupon.is_active &&
      new Date(coupon.valid_until) >= new Date() &&
      (coupon.merchant_id === merchantId || coupon.merchant_id === null)
    )
  }, [userCoupons])

  // Admin functions for managing coupons
  const createCoupon = useCallback(async (couponData) => {
    if (USE_API) {
      const result = await couponService.createCoupon(couponData)
      if (result.success) {
        setUserCoupons(prev => [result.coupon, ...prev])
      }
      return result
    } else {
      const newCoupon = {
        ...couponData,
        id: Math.max(0, ...userCoupons.map(c => c.id)) + 1,
        code: couponData.code.toUpperCase(),
        times_used: 0,
        is_active: true
      }
      const updated = [newCoupon, ...userCoupons]
      setUserCoupons(updated)
      localStorage.setItem('coupons', JSON.stringify(updated))
      return { success: true, coupon: newCoupon }
    }
  }, [userCoupons])

  const updateCoupon = useCallback(async (couponId, updates) => {
    if (USE_API) {
      const result = await couponService.updateCoupon(couponId, updates)
      if (result.success) {
        setUserCoupons(prev =>
          prev.map(c => c.id === couponId ? result.coupon : c)
        )
      }
      return result
    } else {
      const updated = userCoupons.map(c =>
        c.id === couponId ? { ...c, ...updates } : c
      )
      setUserCoupons(updated)
      localStorage.setItem('coupons', JSON.stringify(updated))
      return { success: true, coupon: updated.find(c => c.id === couponId) }
    }
  }, [userCoupons])

  const deleteCoupon = useCallback(async (couponId) => {
    if (USE_API) {
      const result = await couponService.deleteCoupon(couponId)
      if (result.success) {
        if (result.deactivated) {
          setUserCoupons(prev =>
            prev.map(c => c.id === couponId ? { ...c, is_active: false } : c)
          )
        } else {
          setUserCoupons(prev => prev.filter(c => c.id !== couponId))
        }
      }
      return result
    } else {
      const updated = userCoupons.filter(c => c.id !== couponId)
      setUserCoupons(updated)
      localStorage.setItem('coupons', JSON.stringify(updated))
      return { success: true }
    }
  }, [userCoupons])

  const toggleCouponStatus = useCallback(async (couponId) => {
    if (USE_API) {
      const result = await couponService.toggleCouponStatus(couponId)
      if (result.success) {
        setUserCoupons(prev =>
          prev.map(c => c.id === couponId ? { ...c, is_active: result.coupon.is_active } : c)
        )
      }
      return result
    } else {
      const updated = userCoupons.map(c =>
        c.id === couponId ? { ...c, is_active: !c.is_active } : c
      )
      setUserCoupons(updated)
      localStorage.setItem('coupons', JSON.stringify(updated))
      return { success: true, coupon: updated.find(c => c.id === couponId) }
    }
  }, [userCoupons])

  // Apply coupon to order (record usage)
  const recordCouponUsage = useCallback(async (orderId, discountAmount) => {
    if (!appliedCoupon) return { success: false, message: 'No coupon applied' }

    if (USE_API) {
      const result = await couponService.applyCouponToOrder(
        appliedCoupon.id,
        orderId,
        discountAmount
      )
      if (result.success) {
        removeCoupon()
      }
      return result
    } else {
      // Update local usage count
      const updated = userCoupons.map(c =>
        c.id === appliedCoupon.id
          ? { ...c, times_used: (c.times_used || 0) + 1 }
          : c
      )
      setUserCoupons(updated)
      localStorage.setItem('coupons', JSON.stringify(updated))
      removeCoupon()
      return { success: true }
    }
  }, [appliedCoupon, userCoupons, removeCoupon])

  return (
    <CouponsContext.Provider
      value={{
        appliedCoupon,
        userCoupons,
        coupons: userCoupons, // Alias for admin compatibility
        loading,
        error,
        applyCoupon,
        removeCoupon,
        calculateDiscount,
        getAvailableCoupons,
        getCouponsByMerchant,
        // Admin functions
        createCoupon,
        updateCoupon,
        deleteCoupon,
        toggleCouponStatus,
        recordCouponUsage,
        // Utility
        isUsingAPI: USE_API
      }}
    >
      {children}
    </CouponsContext.Provider>
  )
}

export function useCoupons() {
  const context = useContext(CouponsContext)
  if (!context) {
    throw new Error('useCoupons must be used within CouponsProvider')
  }
  return context
}
