import { createContext, useContext, useState, useEffect } from 'react'

const FavoritesContext = createContext()

export function FavoritesProvider({ children }) {
  // Initialize from localStorage
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('favorites')
    return saved ? JSON.parse(saved) : []
  })

  // Persist to localStorage whenever favorites change
  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites))
  }, [favorites])

  const toggleFavorite = (food, merchantId = null) => {
    // Accept either food object or food ID
    const foodId = typeof food === 'object' ? food.id : food

    setFavorites((prev) => {
      const isFav = prev.some(f => (typeof f === 'object' ? f.id : f) === foodId)

      if (isFav) {
        // Remove from favorites
        return prev.filter(f => (typeof f === 'object' ? f.id : f) !== foodId)
      } else {
        // Add to favorites with merchantId
        if (typeof food === 'object') {
          return [...prev, { ...food, merchantId: merchantId || food.merchantId }]
        }
        return [...prev, { id: foodId, merchantId }]
      }
    })
  }

  const isFavorite = (foodId) => {
    return favorites.some(f => (typeof f === 'object' ? f.id : f) === foodId)
  }

  const getFavoriteItems = () => {
    return favorites.filter(f => typeof f === 'object')
  }

  const getFavoritesByMerchant = (merchantId) => {
    return favorites.filter(f =>
      typeof f === 'object' && f.merchantId === merchantId
    )
  }

  const clearFavorites = () => {
    setFavorites([])
  }

  const clearMerchantFavorites = (merchantId) => {
    setFavorites(prev => prev.filter(f =>
      !(typeof f === 'object' && f.merchantId === merchantId)
    ))
  }

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        toggleFavorite,
        isFavorite,
        getFavoriteItems,
        getFavoritesByMerchant,
        clearFavorites,
        clearMerchantFavorites
      }}
    >
      {children}
    </FavoritesContext.Provider>
  )
}

export function useFavorites() {
  const context = useContext(FavoritesContext)
  if (!context) {
    throw new Error('useFavorites must be used within FavoritesProvider')
  }
  return context
}
