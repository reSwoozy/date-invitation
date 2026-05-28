import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/date-invitation/',
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/firebase')) return 'firebase'
          if (id.includes('node_modules/framer-motion')) return 'motion'
          if (
            id.includes('react-day-picker') ||
            id.includes('node_modules/date-fns')
          ) {
            return 'calendar'
          }
          if (id.includes('canvas-confetti')) return 'confetti'
        },
      },
    },
  },
})
