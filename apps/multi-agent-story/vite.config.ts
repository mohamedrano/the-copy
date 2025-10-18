import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';

const ensureTrailingSlash = (value: string): string => {
  if (value === '/' || value === './') {
    return value;
  }

  return value.endsWith('/') ? value : `${value}/`;
};

const resolveBasePath = (mode: string, env: Record<string, string>): string => {
  const candidateKeyOrder = [
    'VITE_MULTI_AGENT_STORY_BASE_PATH',
    'VITE_STORY_BASE_PATH',
    'VITE_REMOTE_BASE_PATH',
    'VITE_BASE_PATH',
  ];

  const explicitBase = candidateKeyOrder
    .map((key) => env[key])
    .find((value) => value && value.trim().length > 0);

  if (explicitBase) {
    return ensureTrailingSlash(explicitBase.trim());
  }

  if (mode === 'development') {
    return '/';
  }

  return ensureTrailingSlash('/multi-agent-story');
};

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const base = resolveBasePath(mode, env);

  return {
    base,
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
      target: 'esnext',
      cssCodeSplit: false,
      minify: false,
      chunkSizeWarningLimit: 500,
      sourcemap: mode === 'development',
    },
    server: {
      port: 5181,
      host: true,
      strictPort: true,
    },
    define: {
      'process.env.NODE_ENV': JSON.stringify(mode),
    },
  };
});
