import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import federation from "@originjs/vite-plugin-federation";
import * as path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

export default defineConfig({
  base: '/stations/',
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

    ...(process.env.NODE_ENV !== "production" &&
     
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer(),
          ),
          await import("@replit/vite-plugin-dev-banner").then((m) =>
            m.devBanner(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "attached_assets"),
    },
  },
  root: path.resolve(__dirname),
  build: {
    outDir: path.resolve(__dirname, "../../public/stations"),
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
});
