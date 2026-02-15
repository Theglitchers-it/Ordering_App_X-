import { useEffect, useRef, useState, useCallback } from 'react'
import {
  initializeSocket,
  disconnectSocket,
  isSocketConnected,
  joinRoom,
  leaveRoom,
  onNewOrder,
  onOrderStatusUpdate,
  onOrderCancelled,
  onPaymentConfirmed,
  onTableStatusUpdate,
  removeAllListeners
} from '../api/socketClient'

const ENABLE_WEBSOCKET = import.meta.env.VITE_ENABLE_WEBSOCKET === 'true'

// Audio notification for new orders (Web Audio API - no file needed)
function playNotificationSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)

    // Two-tone notification
    osc.frequency.setValueAtTime(880, ctx.currentTime) // A5
    osc.frequency.setValueAtTime(1100, ctx.currentTime + 0.15) // ~C#6
    gain.gain.setValueAtTime(0.3, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4)

    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.4)
  } catch {
    // Audio not available - fail silently
  }
}

/**
 * Hook for Socket.io real-time features.
 * Automatically connects/disconnects based on auth state.
 * Falls back gracefully when WebSocket is disabled or unavailable.
 */
export function useSocket(options = {}) {
  const { merchantId, autoConnect = true, soundEnabled = true } = options
  const [connected, setConnected] = useState(false)
  const [lastEvent, setLastEvent] = useState(null)
  const callbacksRef = useRef({})

  // Store callbacks in ref so listeners always get the latest version
  const setCallback = useCallback((event, fn) => {
    callbacksRef.current[event] = fn
  }, [])

  useEffect(() => {
    if (!ENABLE_WEBSOCKET || !autoConnect) return

    const token = localStorage.getItem('accessToken')
    if (!token) return

    const socket = initializeSocket()
    if (!socket) return

    // Track connection state
    const onConnect = () => setConnected(true)
    const onDisconnect = () => setConnected(false)
    socket.on('connect', onConnect)
    socket.on('disconnect', onDisconnect)

    // Join merchant room if specified
    if (merchantId) {
      joinRoom(`merchant:${merchantId}`)
    }

    // Set up event listeners that delegate to callbacks
    onNewOrder((data) => {
      setLastEvent({ type: 'new-order', data, at: Date.now() })
      if (soundEnabled) playNotificationSound()
      callbacksRef.current.onNewOrder?.(data)
    })

    onOrderStatusUpdate((data) => {
      setLastEvent({ type: 'order-status', data, at: Date.now() })
      callbacksRef.current.onOrderStatusUpdate?.(data)
    })

    onOrderCancelled((data) => {
      setLastEvent({ type: 'order-cancelled', data, at: Date.now() })
      callbacksRef.current.onOrderCancelled?.(data)
    })

    onPaymentConfirmed((data) => {
      setLastEvent({ type: 'payment-confirmed', data, at: Date.now() })
      callbacksRef.current.onPaymentConfirmed?.(data)
    })

    onTableStatusUpdate((data) => {
      setLastEvent({ type: 'table-status', data, at: Date.now() })
      callbacksRef.current.onTableStatusUpdate?.(data)
    })

    setConnected(isSocketConnected())

    return () => {
      if (merchantId) {
        leaveRoom(`merchant:${merchantId}`)
      }
      removeAllListeners()
      socket.off('connect', onConnect)
      socket.off('disconnect', onDisconnect)
      disconnectSocket()
      setConnected(false)
    }
  }, [merchantId, autoConnect])

  return {
    connected,
    enabled: ENABLE_WEBSOCKET,
    lastEvent,
    setCallback
  }
}
