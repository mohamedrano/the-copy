import { defineConfig, loadEnv } from "vite";
import type { PluginOption } from "vite";
import react from "@vitejs/plugin-react";
import federation from "@originjs/vite-plugin-federation";
import * as path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

const ensureTrailingSlash = (value: string): string => {
  if (value === '/' || value === './') {
    return value;
  }

  return value.endsWith('/') ? value : `${value}/`;
};

const resolveBasePath = (mode: string, env: Record<string, string>): string => {
  const candidateKeyOrder = [
    'VITE_STATIONS_BASE_PATH',
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

  return ensureTrailingSlash('/stations');
};

export default defineConfig(async ({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const base = resolveBasePath(mode, env);

  const optionalPlugins: PluginOption[] = [];

  if (process.env.NODE_ENV !== "production" && process.env.REPL_ID !== undefined) {
    const [cartographer, devBanner] = await Promise.all([
      import("@replit/vite-plugin-cartographer").then((m) => m.cartographer()),
      import("@replit/vite-plugin-dev-banner").then((m) => m.devBanner()),
    ]);

    optionalPlugins.push(cartographer, devBanner);
  }

  return {
    base,
    plugins: [
      react(),
      federation({
        name: "stations",
        filename: "remoteEntry.js",
        exposes: {
          "./App": "./shared/src/App.tsx",
        },
        shared: {
          react: { singleton: true, requiredVersion: "19.2.0" },
          "react-dom": { singleton: true, requiredVersion: "19.2.0" },
          "react-router-dom": { singleton: true, requiredVersion: "^6.22.3" },
        },
      }),
      runtimeErrorOverlay(),
      ...optionalPlugins,
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "shared/src"),
        "@shared": path.resolve(__dirname, "shared"),
        "@assets": path.resolve(__dirname, "attached_assets"),
      },
    },
  root: path.resolve(__dirname),
  build: {
    outDir: path.resolve(__dirname, "dist"),
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          // فصل مكتبات React
          'react-vendor': ['react', 'react-dom'],
          // فصل مكتبات UI
          'ui-vendor': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-select',
            '@radix-ui/react-tabs',
            '@radix-ui/react-toast'
          ],
          // فصل مكتبات الرسم البياني
          'chart-vendor': ['recharts'],
          // فصل مكتبات AI
          'ai-vendor': ['@google/generative-ai'],
          // فصل مكتبات النماذج
          'form-vendor': ['react-hook-form', '@hookform/resolvers', 'zod'],
          // فصل مكتبات التصميم
          'design-vendor': ['tailwindcss', 'class-variance-authority', 'clsx', 'tailwind-merge']
        },
        // تحسين أسماء الملفات
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId
            ? chunkInfo.facadeModuleId.split('/').pop()?.replace('.tsx', '').replace('.ts', '')
            : 'chunk';
          return `assets/${facadeModuleId}-[hash].js`;
        },
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const extType = assetInfo.name?.split('.').pop();
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType || '')) {
            return `assets/images/[name]-[hash][extname]`;
          }
          if (/css/i.test(extType || '')) {
            return `assets/css/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        }
      }
    },
    // تحسينات الأداء
    minify: false,
    // تحسين حجم الحزمة
    chunkSizeWarningLimit: 1000,
    // تحسين التحميل
    target: 'esnext',
    cssCodeSplit: false,
    sourcemap: process.env.NODE_ENV === 'development'
  },
  server: {
    port: 5182,
    host: true,
    strictPort: true,
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
};
});
