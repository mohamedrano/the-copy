import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { sentryVitePlugin } from '@sentry/vite-plugin';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    const isProduction = mode === 'production';
    
    return {
      base: '/drama-analyst/',
        react(),
        // Sentry plugin for source maps and release tracking
        ...(isProduction && env.VITE_SENTRY_AUTH_TOKEN ? [
          sentryVitePlugin({
            org: 'drama-analyst-org',
            project: 'drama-analyst',
            authToken: env.VITE_SENTRY_AUTH_TOKEN,
            sourcemaps: {
              assets: './dist/**',
              ignore: ['node_modules/**']
            },
            release: {
              name: env.VITE_APP_VERSION || '1.0.0',
              deploy: {
                env: mode
              }
            }
          })
        ] : []),
        VitePWA({
          registerType: 'autoUpdate',
          includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
          manifest: {
            name: 'المحلل الدرامي والمبدع المحاكي',
            short_name: 'المحلل الدرامي',
            description: 'منصة ذكية لتحليل النصوص الدرامية وإنتاج محتوى إبداعي محاكي باستخدام الذكاء الاصطناعي',
            theme_color: '#1e293b',
            background_color: '#0f172a',
            display: 'standalone',
            orientation: 'portrait-primary',
            scope: '/',
            start_url: '/',
            icons: [
              {
                src: 'icon-192x192.png',
                sizes: '192x192',
                type: 'image/png'
              },
              {
                src: 'icon-512x512.png',
                sizes: '512x512',
                type: 'image/png'
              },
              {
                src: 'icon-512x512.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'any maskable'
              }
            ]
          },
          workbox: {
            globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
            runtimeCaching: [
              {
                urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
                handler: 'CacheFirst',
                options: {
                  cacheName: 'google-fonts-cache',
                  expiration: {
                    maxEntries: 10,
                    maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
                  },
                  cacheableResponse: {
                    statuses: [0, 200]
                  }
                }
              },
              {
                urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
                handler: 'CacheFirst',
                options: {
                  cacheName: 'gstatic-fonts-cache',
                  expiration: {
                    maxEntries: 10,
                    maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
                  },
                  cacheableResponse: {
                    statuses: [0, 200]
                  }
                }
              },
              {
                urlPattern: /^https:\/\/api\./i,
                handler: 'NetworkFirst',
                options: {
                  cacheName: 'api-cache',
                  expiration: {
                    maxEntries: 50,
                    maxAgeSeconds: 60 * 5 // 5 minutes
                  },
                  cacheableResponse: {
                    statuses: [0, 200]
                  }
                }
              }
            ]
          }
        })
      ],
      // Optimize dependencies
      optimizeDeps: {
        include: [
          'react',
          'react-dom',
          '@google/generative-ai',
          'mammoth',
          'react-dropzone'
        ],
        exclude: ['@sentry/react']
      },
      // لم يعد هناك حاجة لتعريف متغيرات Gemini هنا، يتم استخدام import.meta.env مباشرة في كائن api المركزي
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
          '@core': path.resolve(__dirname, 'core'),
          '@agents': path.resolve(__dirname, 'agents'),
          '@orchestration': path.resolve(__dirname, 'orchestration'),
          '@ui': path.resolve(__dirname, 'ui'),
          '@services': path.resolve(__dirname, 'services'),
        }
      },
      build: {
        rollupOptions: {
          output: {
            manualChunks: (id) => {
              // Vendor libraries - more granular splitting
              if (id.includes('node_modules')) {
                // React ecosystem
                if (id.includes('react') || id.includes('react-dom')) {
                  return 'vendor-react';
                }
                
                // AI/ML libraries
                if (id.includes('@google/generative-ai')) {
                  return 'vendor-ai';
                }
                
                // Document processing
                if (id.includes('mammoth')) {
                  return 'vendor-mammoth';
                }
                
                // UI libraries
                if (id.includes('react-dropzone')) {
                  return 'vendor-dropzone';
                }
                
                // Monitoring
                if (id.includes('@sentry')) {
                  return 'vendor-sentry';
                }
                
                // Utility libraries
                if (id.includes('dompurify') || id.includes('jsdom')) {
                  return 'vendor-utils';
                }
                
                // All other vendor libraries
                return 'vendor-misc';
              }
              
              // Application code - split by feature
              if (id.includes('/ui/components/')) {
                // Heavy UI components
                if (id.includes('ResultsDisplay') || id.includes('TaskSelector') || id.includes('FileUpload')) {
                  return 'ui-heavy';
                }
                return 'ui-components';
              }
              
              if (id.includes('/services/')) {
                // Core services
                if (id.includes('geminiService') || id.includes('apiService')) {
                  return 'services-core';
                }
                // Utility services
                if (id.includes('loggerService') || id.includes('sanitizationService')) {
                  return 'services-utils';
                }
                return 'services-misc';
              }
              
              if (id.includes('/orchestration/')) {
                return 'orchestration';
              }
              
              if (id.includes('/core/')) {
                return 'core';
              }
              
              if (id.includes('/agents/')) {
                // Split agents by category
                if (id.includes('/agents/analysis/') || id.includes('/agents/creative/') || id.includes('/agents/integrated/') || id.includes('/agents/completion/')) {
                  return 'agents-core';
                }
                if (id.includes('/agents/rhythmMapping/') || id.includes('/agents/characterNetwork/') || id.includes('/agents/dialogueForensics/')) {
                  return 'agents-analysis';
                }
                if (id.includes('/agents/sceneGenerator/') || id.includes('/agents/characterVoice/') || id.includes('/agents/worldBuilder/')) {
                  return 'agents-creative';
                }
                return 'agents-advanced';
              }
              
              // Main app code
              if (id.includes('App.tsx') || id.includes('main.tsx')) {
                return 'app-main';
              }
            }
          }
        },
        chunkSizeWarningLimit: 300,
        target: 'es2022',
        minify: 'terser',
        terserOptions: {
          compress: {
            drop_console: process.env.NODE_ENV === 'production',
            drop_debugger: process.env.NODE_ENV === 'production',
            pure_funcs: process.env.NODE_ENV === 'production' ? ['console.log', 'console.info', 'console.debug'] : [],
            passes: 2
          },
          mangle: {
            safari10: true
          },
          format: {
            comments: false
          }
        },
        // Enable source maps for production debugging (optional)
        sourcemap: mode === 'development',
        // Optimize CSS
        cssCodeSplit: true,
        // Enable asset inlining for small files
        assetsInlineLimit: 4096,
        // Report compressed sizes
        reportCompressedSize: isProduction,
        // Enable tree shaking for better optimization
        treeshake: {
          moduleSideEffects: false,
          propertyReadSideEffects: false,
          unknownGlobalSideEffects: false
        }
      }
    };
});
