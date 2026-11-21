import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  }
  // 修复（2026-11-21）：原 build.rollupOptions.output.manualChunks 引用了 frontend 未安装的
  // @ffmpeg/ffmpeg，导致 `vite build` 直接失败（"Could not resolve entry module"）。
  // frontend 源码不 import ffmpeg，删除该配置；未来真加 ffmpeg.wasm 时再按需加回。
})
