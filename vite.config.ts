import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  // N.B. this is needed if `npm link`ing matrix-encrypt-attachment
  // see https://stackoverflow.com/questions/67964556/cant-support-npm-link-added-local-package-in-vite-cli
  optimizeDeps: {
    // this is just for dev mode, not at build time
    include: ['matrix-encrypt-attachment'],
  },

  // this is just at build time, not in dev mode
  build: {
    rollupOptions: {
      external: ['matrix-encrypt-attachment']
    }
  },
})
