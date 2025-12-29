import { createContext, useContext, useState, useEffect } from 'react'

const LoyaltyContext = createContext()

export function LoyaltyProvider({ children }) {
  const [loyaltyPoints, setLoyaltyPoints] = useState(() => {
    const saved = localStorage.getItem('loyaltyPoints')
    return saved ? parseInt(saved) : 0
  })

  const [tier, setTier] = useState('Bronze')

  const tiers = [
    { name: 'Bronze', minPoints: 0, maxPoints: 199, discount: 0 },
    { name: 'Silver', minPoints: 200, maxPoints: 499, discount: 5 },
    { name: 'Gold', minPoints: 500, maxPoints: 999, discount: 10 },
    { name: 'Platinum', minPoints: 1000, maxPoints: null, discount: 15 }
  ]

  const currentTier = tiers.find(t => t.name === tier)
  const nextTier = tiers.find(t => t.minPoints > loyaltyPoints)

  useEffect(() => {
    localStorage.setItem('loyaltyPoints', loyaltyPoints.toString())

    // Calcola tier in base ai punti
    if (loyaltyPoints >= 1000) {
      setTier('Platinum')
    } else if (loyaltyPoints >= 500) {
      setTier('Gold')
    } else if (loyaltyPoints >= 200) {
      setTier('Silver')
    } else {
      setTier('Bronze')
    }
  }, [loyaltyPoints])

  const addPoints = (orderTotal) => {
    // 1 punto ogni euro speso
    const points = Math.floor(orderTotal)
    setLoyaltyPoints(prev => prev + points)
    return points
  }

  const redeemPoints = (points) => {
    if (points <= loyaltyPoints) {
      setLoyaltyPoints(prev => prev - points)
      return true
    }
    return false
  }

  const getDiscount = () => {
    // Sconto in base al tier
    const discounts = {
      Bronze: 0,
      Silver: 5,
      Gold: 10,
      Platinum: 15
    }
    return discounts[tier]
  }

  return (
    <LoyaltyContext.Provider
      value={{
        loyaltyPoints,
        tier,
        tiers,
        currentTier,
        nextTier,
        addPoints,
        redeemPoints,
        getDiscount,
      }}
    >
      {children}
    </LoyaltyContext.Provider>
  )
}

export function useLoyalty() {
  const context = useContext(LoyaltyContext)
  if (!context) {
    throw new Error('useLoyalty must be used within LoyaltyProvider')
  }
  return context
}
