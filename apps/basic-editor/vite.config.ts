import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';
import { resolveFederatedBasePath } from '../vite-base-path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const base = resolveFederatedBasePath(mode, env, {
    explicitEnvKeys: [
      'VITE_BASIC_EDITOR_BASE_PATH',
      'VITE_REMOTE_BASE_PATH',
      'VITE_BASE_PATH',
    ],
    productionFallback: '/basic-editor',
  });

  return {
    base,
    plugins: [
      react(),
      federation({
        name: 'basicEditor',
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
      target: 'esnext',
      cssCodeSplit: false,
      minify: false,
    },
    server: {
      port: 5178,
      host: true,
      cors: true,
      strictPort: true,
    },
  };
});
