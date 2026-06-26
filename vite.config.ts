import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // `essentio/` holds the original Envato template kept purely as a design
  // reference. Stop Vite from scanning its minified app.js as a second entry
  // (it isn't valid ESM and crashes dep optimization).
  optimizeDeps: {
    entries: ['index.html'],
  },
  build: {
    rollupOptions: {
      output: {
        // Split the big, rarely-changing vendors into their own long-cached
        // chunks so an app-code change doesn't bust the whole vendor bundle.
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          firebase: ['firebase/app', 'firebase/auth', 'firebase/database'],
          motion: ['framer-motion'],
        },
      },
    },
  },
})
