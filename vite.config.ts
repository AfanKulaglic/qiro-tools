import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // The jSquash AVIF codec lazily imports a multi-threaded variant that ships a
  // web worker. Rollup can't bundle that worker under the default `iife` format
  // once code-splitting (manualChunks) is on, so emit workers as ES modules.
  worker: { format: 'es' },
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
    // ffmpeg.wasm ships its own web worker and loads the core at runtime; and
    // imgly background-removal + onnxruntime-web load their model/wasm at runtime.
    // Leave them un-prebundled so workers/assets resolve correctly in dev.
    exclude: ['@ffmpeg/ffmpeg', '@ffmpeg/util', '@imgly/background-removal', 'onnxruntime-web', '@jsquash/avif', '@jsquash/jxl'],
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
