import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';

type RemoteConfig = {
  name: string;
  envKey: string;
  devUrl: string;
  prodPath: string;
};

const remoteDefinitions: RemoteConfig[] = [
  { name: 'basicEditor', envKey: 'BASIC_EDITOR', devUrl: 'http://localhost:5178', prodPath: '/basic-editor' },
  { name: 'dramaAnalyst', envKey: 'DRAMA_ANALYST', devUrl: 'http://localhost:5179', prodPath: '/drama-analyst' },
  { name: 'multiAgentStory', envKey: 'MULTI_AGENT_STORY', devUrl: 'http://localhost:5181', prodPath: '/multi-agent-story' },
  { name: 'stations', envKey: 'STATIONS', devUrl: 'http://localhost:5182', prodPath: '/stations' },
];

const normaliseBase = (value: string): string => {
  if (!value) {
    return value;
  }

  if (value === '/' || value === './') {
    return value;
  }

  return value.endsWith('/') ? value.slice(0, -1) : value;
};

const resolveRemoteEntry = (env: Record<string, string>, config: RemoteConfig, mode: string): string => {
  const entryOverride = env[`VITE_${config.envKey}_REMOTE_ENTRY`];
  if (entryOverride?.trim()) {
    return entryOverride.trim();
  }

  const base = env[`VITE_${config.envKey}_REMOTE_URL`]?.trim();
  if (base && base.length > 0) {
    const normalisedCustomBase = normaliseBase(base);
    return `${normalisedCustomBase}/assets/remoteEntry.js`;
  }

  const fallbackBase = mode === 'development' ? config.devUrl : config.prodPath;
  const normalisedBase = normaliseBase(fallbackBase);
  return `${normalisedBase}/assets/remoteEntry.js`;
};

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const remotes = remoteDefinitions.reduce<Record<string, string>>((accumulator, config) => {
    accumulator[config.name] = resolveRemoteEntry(env, config, mode);
    return accumulator;
  }, {});

  return {
    plugins: [
      react(),
      federation({
        name: 'shell',
        remotes,
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
      host: 'localhost',
      port: 5173,
      hmr: {
        host: 'localhost',
        port: 5173,
      },
    },
  };
});
