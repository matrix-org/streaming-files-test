import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  // N.B. this is needed if `npm link`ing matrix-encrypt-attachment
  // see https://stackoverflow.com/questions/67964556/cant-support-npm-link-added-local-package-in-vite-cli
  optimizeDeps: {
    include: ['matrix-encrypt-attachment'],
  },
  build: {
    rollupOptions: {
      external: ['matrix-encrypt-attachment']
    }
  },
})
