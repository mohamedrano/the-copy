import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          agents: ['@/agents/core/index'],
          ui: ['lucide-react']
        }
      }
    },
    target: 'es2020',
    sourcemap: true
  },
  server: {
    host: 'localhost',
    port: 5173,
    hmr: {
      host: 'localhost',
      port: 5173
    },
    proxy: {
      // يمرر الطلبات إلى التطبيقات الفرعية بدل أن يبتلعها fallback
      '/basic-editor': {
        target: 'http://localhost:5178',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/basic-editor/, ''),
      },
      '/drama-analyst': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/drama-analyst/, ''),
      },
      '/multi-agent-story': {
        target: 'http://localhost:5181',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/multi-agent-story/, ''),
      },
      '/stations': {
        target: 'http://localhost:5002',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/stations/, ''),
      },
    }
  }
})
