// Animation configurations with exact parameters

// Easing functions
export const easings = {
  softEaseOut: [0.22, 1, 0.36, 1],
  sharpEaseOut: [0.2, 0.8, 0.2, 1],
  easeOut: 'easeOut'
}

// 1) Staggered Entrance (stagger / cascade)
export const staggeredEntrance = {
  container: {
    initial: {},
    animate: {
      transition: {
        staggerChildren: 0.08
      }
    }
  },
  child: {
    initial: { opacity: 0, y: 12, scale: 0.98 },
    animate: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.36,
        ease: easings.softEaseOut
      }
    }
  }
}

// 2) Card entrance (Fade + Scale)
export const cardEntrance = {
  initial: { opacity: 0, scale: 0.96 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.36,
      ease: easings.softEaseOut
    }
  }
}

// 3) Search bar (Slide-down + Fade)
export const searchBarSlide = {
  initial: { y: -18, opacity: 0 },
  animate: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.34,
      ease: easings.easeOut
    }
  }
}

// 4) Category chip select (background fade + underline slide)
export const categoryChip = {
  background: {
    transition: { duration: 0.18 }
  },
  underline: {
    transition: {
      duration: 0.28,
      ease: easings.easeOut
    }
  }
}

// 5) List swap (filter change — exit/enter)
export const listSwap = {
  exit: {
    opacity: 0,
    y: 8,
    transition: { duration: 0.24 }
  },
  enter: {
    initial: { opacity: 0, y: 8 },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.32,
        staggerChildren: 0.06
      }
    }
  }
}

// 6) Shared element / Hero image (Matched Geometry)
export const heroTransition = {
  duration: 0.50,
  ease: easings.sharpEaseOut
}

// 7) Add-to-cart fly + cart badge bounce
export const cartFly = {
  fly: {
    duration: 0.45,
    ease: easings.softEaseOut
  },
  badgeBounce: {
    scale: [1, 1.18, 0.98, 1],
    transition: {
      duration: 0.36,
      times: [0, 0.33, 0.66, 1]
    }
  }
}

// 8) Favorite heart (fill + pop)
export const heartPop = {
  initial: { scale: 1 },
  animate: {
    scale: [1, 1.2, 1],
    transition: {
      duration: 0.28,
      times: [0, 0.5, 1],
      ease: easings.easeOut
    }
  }
}

// 9) Bottom sheet open (slide-up spring)
export const bottomSheet = {
  spring: {
    type: 'spring',
    damping: 14,
    stiffness: 140
  },
  alternative: {
    duration: 0.38,
    ease: easings.easeOut
  },
  initial: { y: 32, opacity: 0 },
  animate: { y: 0, opacity: 1 }
}

// 10) Hover lift (desktop)
export const hoverLift = {
  whileHover: {
    y: -6,
    scale: 1.01,
    transition: { duration: 0.18 }
  }
}

// 11) Skeleton Shimmer
export const skeletonShimmer = {
  duration: 1.4,
  ease: 'linear',
  repeat: Infinity,
  repeatType: 'loop'
}

// Helper: Create curved path for fly animation
export const createFlyPath = (startX, startY, endX, endY) => {
  const controlX = startX + (endX - startX) * 0.3
  const controlY = startY - 100 // Curve upward

  return {
    x: [startX, controlX, endX],
    y: [startY, controlY, endY]
  }
}

// Advanced Framer Motion Patterns (from snippet guide)

// Container with stagger - for grids and lists
export const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08
    }
  }
}

// Item for staggered containers
export const item = {
  hidden: { opacity: 0, y: 12, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.36,
      ease: [0.22, 1, 0.36, 1]
    }
  },
  exit: {
    opacity: 0,
    y: 8,
    transition: { duration: 0.24 }
  }
}

// Flying cart item animation helper
export const flyToCartAnimation = (startRect, endRect) => {
  const dx = endRect.left - startRect.left
  const dy = endRect.top - startRect.top

  return {
    initial: {
      x: 0,
      y: 0,
      scale: 1,
      opacity: 1
    },
    animate: {
      x: dx,
      y: dy,
      scale: [1, 0.8, 0.3],
      opacity: [1, 1, 0],
      transition: {
        duration: 0.45,
        ease: [0.22, 1, 0.36, 1],
        times: [0, 0.5, 1]
      }
    }
  }
}

// Page transition variants
export const pageTransition = {
  initial: { opacity: 0, x: 20 },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.3,
      ease: easings.easeOut
    }
  },
  exit: {
    opacity: 0,
    x: -20,
    transition: {
      duration: 0.2
    }
  }
}

// Slide in from bottom (for modals)
export const slideUpModal = {
  initial: { y: '100%', opacity: 0 },
  animate: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      damping: 25,
      stiffness: 300
    }
  },
  exit: {
    y: '100%',
    opacity: 0,
    transition: {
      duration: 0.2
    }
  }
}

// Backdrop fade
export const backdrop = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: 0.2 }
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.2 }
  }
}

// Scale pop (for success animations)
export const scalePop = {
  initial: { scale: 0, opacity: 0 },
  animate: {
    scale: [0, 1.1, 1],
    opacity: 1,
    transition: {
      duration: 0.4,
      times: [0, 0.6, 1],
      ease: easings.easeOut
    }
  }
}

// Rotate and scale (for loading spinners)
export const rotateScale = {
  animate: {
    rotate: 360,
    scale: [1, 1.1, 1],
    transition: {
      rotate: {
        duration: 1,
        repeat: Infinity,
        ease: 'linear'
      },
      scale: {
        duration: 0.5,
        repeat: Infinity,
        repeatType: 'reverse'
      }
    }
  }
}
