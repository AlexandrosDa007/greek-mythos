import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'roll-a-die': path.resolve(__dirname, './roll-a-die/roll-a-die.js')
    }
  },
  optimizeDeps: {
    include: [
      "roll-a-die",
    ]
  }
})
