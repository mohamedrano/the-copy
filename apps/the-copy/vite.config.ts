import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';

type RemoteConfig = {
  name: string;
  envKey: string;
  devUrl: string;
};

const remoteDefinitions: RemoteConfig[] = [
  { name: 'basicEditor', envKey: 'BASIC_EDITOR', devUrl: 'http://localhost:5178' },
  { name: 'dramaAnalyst', envKey: 'DRAMA_ANALYST', devUrl: 'http://localhost:5179' },
  { name: 'multiAgentStory', envKey: 'MULTI_AGENT_STORY', devUrl: 'http://localhost:5181' },
  { name: 'stations', envKey: 'STATIONS', devUrl: 'http://localhost:5182' },
];

const normaliseBase = (value: string): string => {
  if (!value) {
    return value;
  }

  return value.endsWith('/') ? value.slice(0, -1) : value;
};

const resolveRemoteEntry = (env: Record<string, string>, config: RemoteConfig): string => {
  const entryOverride = env[`VITE_${config.envKey}_REMOTE_ENTRY`];
  if (entryOverride?.trim()) {
    return entryOverride.trim();
  }

  const base = env[`VITE_${config.envKey}_REMOTE_URL`]?.trim();
  const normalisedBase = normaliseBase(base && base.length > 0 ? base : config.devUrl);
  return `${normalisedBase}/assets/remoteEntry.js`;
};

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const remotes = remoteDefinitions.reduce<Record<string, string>>((accumulator, config) => {
    accumulator[config.name] = resolveRemoteEntry(env, config);
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
