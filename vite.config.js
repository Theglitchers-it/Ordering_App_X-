import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Vendor chunks
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'react-vendor'
            }
            if (id.includes('framer-motion')) {
              return 'animation-vendor'
            }
            if (id.includes('recharts')) {
              return 'chart-vendor'
            }
            // Other node_modules
            return 'vendor'
          }

          // Feature-based chunks
          if (id.includes('/pages/admin/') || id.includes('/components/admin/')) {
            return 'admin'
          }
          if (id.includes('/pages/merchant/') || id.includes('/components/merchant/')) {
            return 'merchant'
          }
          if (id.includes('MerchantOnboarding') || id.includes('BrandCustomizer') ||
              id.includes('LocationInfo') || id.includes('SubscriptionSelector') ||
              id.includes('MenuQuickStart')) {
            return 'merchant-onboarding'
          }
          if (id.includes('/pages/saas/') || id.includes('/components/saas/')) {
            return 'saas'
          }
        }
      }
    },
    chunkSizeWarningLimit: 600
  }
})
