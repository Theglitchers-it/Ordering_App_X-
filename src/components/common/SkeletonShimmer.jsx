import { motion } from 'framer-motion'

function SkeletonShimmer({ className = '', variant = 'card' }) {
  const shimmerVariants = {
    card: 'h-64 rounded-2xl',
    text: 'h-4 rounded-lg w-full',
    title: 'h-8 rounded-lg w-3/4',
    circle: 'w-12 h-12 rounded-full',
    button: 'h-12 rounded-full w-full'
  }

  return (
    <div className={`relative overflow-hidden bg-gray-200 ${shimmerVariants[variant]} ${className}`}>
      <motion.div
        className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/60 to-transparent"
        animate={{
          translateX: ['100%', '200%']
        }}
        transition={{
          duration: 1.4,
          ease: 'linear',
          repeat: Infinity,
          repeatType: 'loop'
        }}
      />
    </div>
  )
}

// Preset skeleton layouts
export function CardSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-lg">
      <SkeletonShimmer variant="card" className="mb-4" />
      <SkeletonShimmer variant="title" className="mb-2" />
      <SkeletonShimmer variant="text" className="mb-2" />
      <SkeletonShimmer variant="text" className="w-1/2 mb-4" />
      <SkeletonShimmer variant="button" />
    </div>
  )
}

export function ListSkeleton({ count = 3 }) {
  return (
    <>
      {[...Array(count)].map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </>
  )
}

export default SkeletonShimmer
