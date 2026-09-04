import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true
  },
  // Tells the bundler to process code paths smoothly without throwing strict warnings
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' }
  }
})
