import { createContext, useContext, useState } from 'react'

const CouponsContext = createContext()

// Coupon disponibili (ora con merchantId per multi-tenancy)
const availableCoupons = [
  {
    id: 'WELCOME20',
    code: 'WELCOME20',
    title: 'Benvenuto',
    description: '20% di sconto sul primo ordine',
    discount: 20,
    type: 'percentage',
    minOrder: 15,
    maxDiscount: 10,
    expiresAt: new Date('2025-12-31'),
    isActive: true,
    merchantId: null // null = valido per tutti i merchant
  },
  {
    id: 'PIZZA10',
    code: 'PIZZA10',
    title: 'Pizza Lovers',
    description: '€10 di sconto su ordini sopra €30',
    discount: 10,
    type: 'fixed',
    minOrder: 30,
    expiresAt: new Date('2025-12-31'),
    isActive: true,
    merchantId: 'merchant_1' // Solo per Pizzeria Rossi
  },
  {
    id: 'LOYAL50',
    code: 'LOYAL50',
    title: 'Cliente Fedele',
    description: '50% di sconto - Solo per clienti Gold',
    discount: 50,
    type: 'percentage',
    minOrder: 25,
    maxDiscount: 20,
    requiresTier: 'Gold',
    expiresAt: new Date('2025-12-31'),
    isActive: true,
    merchantId: null
  },
  {
    id: 'FREE5',
    code: 'FREE5',
    title: 'Spedizione Gratis',
    description: 'Sconto €5 su ordini sopra €20',
    discount: 5,
    type: 'fixed',
    minOrder: 20,
    expiresAt: new Date('2025-12-31'),
    isActive: true,
    merchantId: 'merchant_2' // Solo per Bar Centrale
  }
]

export function CouponsProvider({ children }) {
  const [appliedCoupon, setAppliedCoupon] = useState(null)
  const [userCoupons, setUserCoupons] = useState(availableCoupons)

  const applyCoupon = (code, total, tier = 'Bronze') => {
    const coupon = userCoupons.find(
      c => c.code === code.toUpperCase() && c.isActive
    )

    if (!coupon) {
      return { success: false, message: 'Codice coupon non valido' }
    }

    if (coupon.expiresAt < new Date()) {
      return { success: false, message: 'Coupon scaduto' }
    }

    if (total < coupon.minOrder) {
      return {
        success: false,
        message: `Ordine minimo: €${coupon.minOrder}`
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

    setAppliedCoupon(coupon)
    return { success: true, message: 'Coupon applicato!', coupon }
  }

  const removeCoupon = () => {
    setAppliedCoupon(null)
  }

  const calculateDiscount = (total) => {
    if (!appliedCoupon) return 0

    if (appliedCoupon.type === 'fixed') {
      return Math.min(appliedCoupon.discount, total)
    } else {
      const discount = (total * appliedCoupon.discount) / 100
      return appliedCoupon.maxDiscount
        ? Math.min(discount, appliedCoupon.maxDiscount)
        : discount
    }
  }

  const getAvailableCoupons = (tier = 'Bronze', merchantId = null) => {
    const tiers = ['Bronze', 'Silver', 'Gold', 'Platinum']
    const userTierIndex = tiers.indexOf(tier)

    return userCoupons.filter(coupon => {
      if (!coupon.isActive || coupon.expiresAt < new Date()) {
        return false
      }

      // Filter by merchantId (null = available for all merchants)
      if (merchantId && coupon.merchantId && coupon.merchantId !== merchantId) {
        return false
      }

      if (coupon.requiresTier) {
        const requiredTierIndex = tiers.indexOf(coupon.requiresTier)
        return userTierIndex >= requiredTierIndex
      }

      return true
    })
  }

  const getCouponsByMerchant = (merchantId) => {
    return userCoupons.filter(coupon =>
      coupon.isActive &&
      coupon.expiresAt >= new Date() &&
      (coupon.merchantId === merchantId || coupon.merchantId === null)
    )
  }

  return (
    <CouponsContext.Provider
      value={{
        appliedCoupon,
        userCoupons,
        coupons: userCoupons, // Alias for admin compatibility
        applyCoupon,
        removeCoupon,
        calculateDiscount,
        getAvailableCoupons,
        getCouponsByMerchant
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
