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
  // 局域网正式访问（npm run preview = build + preview）：
  // 打包版静态服务，首载走少量大文件 + 长缓存，跨设备比 dev 模式快一个数量级；
  // /api 照常转发后端（编辑/保存照常可用）。改了前端代码需重跑 npm run preview。
  preview: {
    host: '0.0.0.0',
    port: 4291,
    strictPort: true,
    proxy: {
      '/api': 'http://127.0.0.1:3000',
    },
  },
})
