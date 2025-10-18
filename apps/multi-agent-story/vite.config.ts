import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';

export default defineConfig(({ mode }) => ({
  base: '/multi-agent-story/',
  plugins: [
    react(),
    federation({
      name: 'multiAgentStory',
      filename: 'remoteEntry.js',
      exposes: {
        './App': './src/App.tsx',
      },
      shared: {
        react: { singleton: true, requiredVersion: '19.2.0' },
        'react-dom': { singleton: true, requiredVersion: '19.2.0' },
        'react-router-dom': { singleton: true, requiredVersion: '^6.22.3' },
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: path.resolve(__dirname, '../../public/multi-agent-story'),
    target: 'esnext',
    cssCodeSplit: false,
    minify: false,
    chunkSizeWarningLimit: 500,
    sourcemap: mode === 'development',
    emptyOutDir: true,
  },
  server: {
    port: 5181,
    host: true,
    strictPort: true,
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(mode),
  },
}));
