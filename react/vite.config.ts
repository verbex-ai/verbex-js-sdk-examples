import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true
  },
  build: {
    // Increase chunk size warning limit for demo/example projects
    // The Verbex SDK + React dependencies result in a ~612KB bundle
    // This is acceptable for an example project demonstrating SDK integration
    chunkSizeWarningLimit: 1000 // increased from default 500kb to 1000kb
  }
})
