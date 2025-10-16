import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  base: '/multi-agent-story/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: '../../public/multi-agent-story',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'ui-vendor': ['lucide-react'],
        },
      },
    },
    chunkSizeWarningLimit: 500,
    target: 'es2022',
    minify: 'terser',
    sourcemap: process.env.NODE_ENV === 'development',
  },
  server: {
    port: 5181,
    host: true,
    strictPort: true,
  },
});
