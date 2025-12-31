import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5174,
    open: true
  },
  build: {
    // Increase chunk size warning limit for demo/example projects
    // The Verbex SDK + Vue dependencies result in a large bundle
    // This is acceptable for an example project demonstrating SDK integration
    chunkSizeWarningLimit: 1000 // increased from default 500kb to 1000kb
  }
})
