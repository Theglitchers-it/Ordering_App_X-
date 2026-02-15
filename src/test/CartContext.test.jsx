import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import { CartProvider, useCart } from '../context/CartContext'

const wrapper = ({ children }) => <CartProvider>{children}</CartProvider>

const mockFood = { id: 1, name: 'Margherita', price: 8.50 }
const mockFood2 = { id: 2, name: 'Carbonara', price: 12.00 }

describe('CartContext', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('starts with an empty cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper })
    expect(result.current.cartItems).toEqual([])
    expect(result.current.getCartTotal()).toBe(0)
    expect(result.current.getCartCount()).toBe(0)
  })

  it('adds an item to the cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper })

    act(() => result.current.addToCart(mockFood))

    expect(result.current.cartItems).toHaveLength(1)
    expect(result.current.cartItems[0].name).toBe('Margherita')
    expect(result.current.cartItems[0].quantity).toBe(1)
  })

  it('increments quantity when adding the same item', () => {
    const { result } = renderHook(() => useCart(), { wrapper })

    act(() => result.current.addToCart(mockFood))
    act(() => result.current.addToCart(mockFood))

    expect(result.current.cartItems).toHaveLength(1)
    expect(result.current.cartItems[0].quantity).toBe(2)
  })

  it('calculates cart total correctly', () => {
    const { result } = renderHook(() => useCart(), { wrapper })

    act(() => result.current.addToCart(mockFood))   // 8.50
    act(() => result.current.addToCart(mockFood2))   // 12.00
    act(() => result.current.addToCart(mockFood))    // +8.50 (qty 2)

    expect(result.current.getCartTotal()).toBe(8.50 * 2 + 12.00) // 29.00
    expect(result.current.getCartCount()).toBe(3)
  })

  it('removes an item from the cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper })

    act(() => result.current.addToCart(mockFood))
    act(() => result.current.addToCart(mockFood2))
    act(() => result.current.removeFromCart(1))

    expect(result.current.cartItems).toHaveLength(1)
    expect(result.current.cartItems[0].id).toBe(2)
  })

  it('updates quantity and removes when set to 0', () => {
    const { result } = renderHook(() => useCart(), { wrapper })

    act(() => result.current.addToCart(mockFood))
    act(() => result.current.updateQuantity(1, 5))

    expect(result.current.cartItems[0].quantity).toBe(5)

    act(() => result.current.updateQuantity(1, 0))
    expect(result.current.cartItems).toHaveLength(0)
  })

  it('clears the entire cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper })

    act(() => result.current.addToCart(mockFood))
    act(() => result.current.addToCart(mockFood2))
    act(() => result.current.clearCart())

    expect(result.current.cartItems).toEqual([])
    expect(result.current.getCartTotal()).toBe(0)
  })

  it('throws error when used outside provider', () => {
    expect(() => {
      renderHook(() => useCart())
    }).toThrow('useCart must be used within CartProvider')
  })
})
