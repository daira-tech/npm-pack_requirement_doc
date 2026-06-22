import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

// ライブラリビルド。vue / vue-router は利用側の依存を使うので external。
// Tailwind ユーティリティは利用側の Tailwind が生成するため、ここでは CSS を出さない。
export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
      formats: ['es'],
      fileName: () => 'index.js',
    },
    rollupOptions: {
      external: ['vue', 'vue-router'],
    },
  },
})
