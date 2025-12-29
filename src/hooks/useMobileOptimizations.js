import { useState, useEffect } from 'react'

/**
 * Custom hook for mobile-specific optimizations
 * Detects mobile device, reduces motion preference, and provides performance hints
 */
export function useMobileOptimizations() {
  const [isMobile, setIsMobile] = useState(false)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const [isLowEndDevice, setIsLowEndDevice] = useState(false)

  useEffect(() => {
    // Check if mobile device
    const checkMobile = () => {
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      ) || window.innerWidth < 768

      setIsMobile(isMobileDevice)
    }

    // Check motion preference
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(motionQuery.matches)

    const handleMotionChange = (e) => setPrefersReducedMotion(e.matches)
    motionQuery.addEventListener('change', handleMotionChange)

    // Detect low-end device (heuristic based on hardware concurrency and memory)
    const detectLowEndDevice = () => {
      const cores = navigator.hardwareConcurrency || 4
      const memory = navigator.deviceMemory || 4

      // Consider low-end if < 4 cores or < 4GB RAM
      setIsLowEndDevice(cores < 4 || memory < 4)
    }

    checkMobile()
    detectLowEndDevice()
    window.addEventListener('resize', checkMobile)

    return () => {
      window.removeEventListener('resize', checkMobile)
      motionQuery.removeEventListener('change', handleMotionChange)
    }
  }, [])

  // Get optimized animation duration based on device
  const getAnimationDuration = (baseMs) => {
    if (prefersReducedMotion) return 0
    if (isLowEndDevice) return baseMs * 0.7
    return baseMs
  }

  // Get optimized transition config
  const getTransitionConfig = (config) => {
    if (prefersReducedMotion) {
      return { duration: 0 }
    }
    if (isLowEndDevice) {
      return {
        ...config,
        duration: config.duration * 0.7
      }
    }
    return config
  }

  return {
    isMobile,
    prefersReducedMotion,
    isLowEndDevice,
    getAnimationDuration,
    getTransitionConfig,
    // Helper to conditionally apply animations
    shouldAnimate: !prefersReducedMotion,
    // Helper for touch feedback
    touchFeedback: isMobile ? 'scale-95' : 'scale-98'
  }
}

/**
 * Hook for optimized scroll detection
 * Uses requestAnimationFrame for better performance
 */
export function useOptimizedScroll(threshold = 0) {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    let ticking = false

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > threshold)
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [threshold])

  return isScrolled
}

/**
 * Hook for touch gestures detection
 */
export function useTouchGestures(ref) {
  const [gesture, setGesture] = useState(null)

  useEffect(() => {
    if (!ref.current) return

    let touchStartX = 0
    let touchStartY = 0
    let touchStartTime = 0

    const handleTouchStart = (e) => {
      touchStartX = e.touches[0].clientX
      touchStartY = e.touches[0].clientY
      touchStartTime = Date.now()
    }

    const handleTouchEnd = (e) => {
      const touchEndX = e.changedTouches[0].clientX
      const touchEndY = e.changedTouches[0].clientY
      const touchDuration = Date.now() - touchStartTime

      const deltaX = touchEndX - touchStartX
      const deltaY = touchEndY - touchStartY
      const absDeltaX = Math.abs(deltaX)
      const absDeltaY = Math.abs(deltaY)

      // Swipe detection (at least 50px movement, max 300ms duration)
      if (touchDuration < 300 && (absDeltaX > 50 || absDeltaY > 50)) {
        if (absDeltaX > absDeltaY) {
          setGesture(deltaX > 0 ? 'swipe-right' : 'swipe-left')
        } else {
          setGesture(deltaY > 0 ? 'swipe-down' : 'swipe-up')
        }

        // Reset gesture after a short delay
        setTimeout(() => setGesture(null), 100)
      }
    }

    const element = ref.current
    element.addEventListener('touchstart', handleTouchStart, { passive: true })
    element.addEventListener('touchend', handleTouchEnd, { passive: true })

    return () => {
      element.removeEventListener('touchstart', handleTouchStart)
      element.removeEventListener('touchend', handleTouchEnd)
    }
  }, [ref])

  return gesture
}

/**
 * Hook for viewport dimensions
 * Updates on resize with debouncing
 */
export function useViewport() {
  const [viewport, setViewport] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
    isMobile: window.innerWidth < 768,
    isTablet: window.innerWidth >= 768 && window.innerWidth < 1024,
    isDesktop: window.innerWidth >= 1024
  })

  useEffect(() => {
    let timeoutId

    const handleResize = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        const width = window.innerWidth
        const height = window.innerHeight

        setViewport({
          width,
          height,
          isMobile: width < 768,
          isTablet: width >= 768 && width < 1024,
          isDesktop: width >= 1024
        })
      }, 150)
    }

    window.addEventListener('resize', handleResize, { passive: true })
    return () => {
      window.removeEventListener('resize', handleResize)
      clearTimeout(timeoutId)
    }
  }, [])

  return viewport
}

/**
 * Hook for intersection observer
 * Optimized for lazy loading and scroll animations
 */
export function useInView(ref, options = {}) {
  const [isInView, setIsInView] = useState(false)
  const [hasBeenInView, setHasBeenInView] = useState(false)

  useEffect(() => {
    if (!ref.current) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting)
        if (entry.isIntersecting) {
          setHasBeenInView(true)
        }
      },
      {
        threshold: options.threshold || 0.1,
        rootMargin: options.rootMargin || '0px',
        ...options
      }
    )

    observer.observe(ref.current)

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current)
      }
    }
  }, [ref, options])

  return { isInView, hasBeenInView }
}

export default {
  useMobileOptimizations,
  useOptimizedScroll,
  useTouchGestures,
  useViewport,
  useInView
}
