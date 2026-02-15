import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock import.meta.env before importing the hook
vi.stubEnv('VITE_API_URL', '')
vi.stubEnv('VITE_STRIPE_PUBLISHABLE_KEY', '')

describe('usePayment (demo mode)', () => {
  let usePayment

  beforeEach(async () => {
    vi.resetModules()
    vi.stubEnv('VITE_API_URL', '')
    vi.stubEnv('VITE_STRIPE_PUBLISHABLE_KEY', '')
    const mod = await import('../hooks/usePayment')
    usePayment = mod.usePayment
  })

  it('returns initial state', () => {
    const { result } = renderHook(() => usePayment())

    expect(result.current.isStripeEnabled).toBeFalsy()
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBe(null)
    expect(result.current.clientSecret).toBe(null)
  })

  it('has stripe disabled in demo mode', () => {
    const { result } = renderHook(() => usePayment())
    expect(result.current.isStripeEnabled).toBeFalsy()
  })

  it('createIntent returns success in demo mode', async () => {
    const { result } = renderHook(() => usePayment())

    let response
    await act(async () => {
      response = await result.current.createIntent('order-123')
    })

    expect(response).toEqual({ success: true, demo: true })
  })

  it('confirmIntent returns success in demo mode', async () => {
    const { result } = renderHook(() => usePayment())

    let response
    await act(async () => {
      response = await result.current.confirmIntent('intent-123')
    })

    expect(response).toEqual({ success: true, demo: true })
  })

  it('reset clears all state', () => {
    const { result } = renderHook(() => usePayment())

    act(() => result.current.reset())

    expect(result.current.clientSecret).toBe(null)
    expect(result.current.paymentIntentId).toBe(null)
    expect(result.current.error).toBe(null)
    expect(result.current.loading).toBe(false)
  })
})
