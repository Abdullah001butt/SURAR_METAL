import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (!id.includes('node_modules')) return undefined
          if (id.includes('react-router') || id.includes('/react/') || id.includes('/react-dom/')) return 'react-vendor'
          if (id.includes('framer-motion')) return 'motion-vendor'
          if (id.includes('@supabase')) return 'supabase-vendor'
          if (id.includes('react-hook-form') || id.includes('/zod/') || id.includes('@hookform')) return 'form-vendor'
          if (id.includes('i18next')) return 'i18n-vendor'
          return undefined
        },
      },
    },
  },
})
