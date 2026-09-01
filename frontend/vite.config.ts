import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@pvzwiki': fileURLToPath(new URL('./src/features/armarium/projects/pvzwiki', import.meta.url)),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 4290,
    strictPort: true,
    proxy: {
      '/api': 'http://127.0.0.1:3000',
    },
  },
})
