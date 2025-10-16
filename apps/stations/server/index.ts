import express from "express";
import compression from "compression";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic } from "./vite";
import { environment } from "./config/environment";
import { applySecurityMiddleware } from "./middleware/security";
import { 
  errorHandler, 
  notFoundHandler, 
  gracefulShutdownHandler 
} from "./middleware/error-handler";
import { PerformanceMonitor } from "./middleware/performance";
import { AssetOptimizer } from "./middleware/asset-optimization";
import logger from "./utils/logger";

// التحقق من إعدادات البيئة
try {
  environment.validateRuntimeConfig();
} catch (error) {
  logger.error('Environment validation failed', { error });
  process.exit(1);
}

const app = express();

// تطبيق middleware الأمان
applySecurityMiddleware(app);

// تطبيق مراقبة الأداء
app.use(PerformanceMonitor.monitorPerformance());

// تطبيق تحسين الأداء
app.use(PerformanceMonitor.optimizePerformance());

// تطبيق تحسين الأصول
app.use(AssetOptimizer.optimizeAssets());

// تطبيق ضغط الاستجابات
if (environment.getPerformanceConfig().enableCompression) {
  app.use(compression({
    level: 6,
    threshold: 1024,
    filter: (req, res) => {
      if (req.headers['x-no-compression']) {
        return false;
      }
      return compression.filter(req, res);
    }
  }));
}

// تطبيق middleware للطلبات المتوقفة
app.use(gracefulShutdownHandler);

// إعدادات JSON مع حدود محسنة
const maxRequestSize = environment.isProduction() ? "5mb" : "10mb";
app.use(express.json({ 
  limit: maxRequestSize,
  strict: true
}));
app.use(express.urlencoded({ 
  extended: true,
  limit: maxRequestSize
}));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, unknown> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = `${logLine.slice(0, 79)}…`;
      }

      logger.info(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  // تطبيق معالجات الأخطاء
  app.use(notFoundHandler);
  app.use(errorHandler);

  // إعداد Vite في التطوير أو الملفات الثابتة في الإنتاج
  if (environment.isDevelopment()) {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // بدء الخادم
  const config = environment.getConfig();
  const port = config.PORT;
  
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    logger.info('Server started successfully', {
      port,
      environment: config.NODE_ENV,
      apiBaseUrl: config.API_BASE_URL,
      cacheEnabled: config.ENABLE_CACHE,
      compressionEnabled: environment.getPerformanceConfig().enableCompression
    });
  });

  // معالجة إغلاق الخادم بأمان
  const gracefulShutdown = (signal: string) => {
    logger.info(`${signal} received, shutting down gracefully`);
    
    server.close(() => {
      logger.info('Server closed successfully');
      process.exit(0);
    });

    // إجبار الإغلاق بعد 30 ثانية
    setTimeout(() => {
      logger.error('Forced shutdown after timeout');
      process.exit(1);
    }, 30000);
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
})();
