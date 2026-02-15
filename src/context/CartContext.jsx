import { createContext, useContext, useState, useEffect } from 'react'

const CartContext = createContext()

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('cart')
      return saved ? JSON.parse(saved) : []
    } catch { return [] }
  })

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems))
  }, [cartItems])

  const addToCart = (food) => {
    setCartItems((prev) => {
      const existingItem = prev.find((item) => item.id === food.id)
      if (existingItem) {
        return prev.map((item) =>
          item.id === food.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...prev, { ...food, quantity: 1 }]
    })
  }

  const removeFromCart = (foodId) => {
    setCartItems((prev) => prev.filter((item) => item.id !== foodId))
  }

  const updateQuantity = (foodId, quantity) => {
    if (quantity === 0) {
      removeFromCart(foodId)
      return
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === foodId ? { ...item, quantity } : item
      )
    )
  }

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  const getCartCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0)
  }

  const clearCart = () => {
    setCartItems([])
    localStorage.removeItem('cart')
  }

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        getCartTotal,
        getCartCount,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within CartProvider')
  }
  return context
}
