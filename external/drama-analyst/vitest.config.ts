import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'src/test/']
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
      '@core': path.resolve(__dirname, 'core'),
      '@agents': path.resolve(__dirname, 'agents'),
      '@orchestration': path.resolve(__dirname, 'orchestration'),
      '@ui': path.resolve(__dirname, 'ui'),
      '@services': path.resolve(__dirname, 'services'),
    }
  }
});
