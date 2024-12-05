import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import commonjs from 'vite-plugin-commonjs'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

export default defineConfig({
  plugins: [react(), commonjs(), nodePolyfills()],
  define: {
    'process.env': {},
    'process.browser': true,
  },
  server: {
    cors: false,
    watch: {
      followSymlinks: false,
    },
  },
  build: {
    rollupOptions: {
      external: ['charting_library'],
    },
  },
  optimizeDeps: {
    exclude: [
      'chunk-NJXJQQVA',
      'chunk-23S2GYRN',
    ],
  },
})