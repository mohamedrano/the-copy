import { Request, Response, NextFunction } from 'express';
import { environment } from '../config/environment';
import logger from '../utils/logger';

type ProcessMemoryUsage = ReturnType<typeof process.memoryUsage>;

export interface PerformanceMetrics {
  method: string;
  url: string;
  statusCode: number;
  duration: number;
  memoryUsage: ProcessMemoryUsage;
  timestamp: Date;
  userAgent: string | undefined;
  ip: string | undefined;
}

export interface PerformanceStats {
  totalRequests: number;
  averageResponseTime: number;
  slowestRequest: PerformanceMetrics | null;
  fastestRequest: PerformanceMetrics | null;
  errorRate: number;
  memoryPeak: number;
  requestsPerMinute: number;
}

export class PerformanceMonitor {
  private static metrics: PerformanceMetrics[] = [];
  private static readonly MAX_METRICS_HISTORY = 1000;
  private static readonly SLOW_REQUEST_THRESHOLD = 1000; // 1 second
  private static readonly MEMORY_WARNING_THRESHOLD = 100 * 1024 * 1024; // 100MB

  /**
   * Middleware لمراقبة الأداء
   */
  static monitorPerformance() {
    return (req: Request, res: Response, next: NextFunction): void => {
      const startTime = process.hrtime.bigint();

      // تسجيل بداية الطلب
      logger.debug('Request started', {
        method: req.method,
        url: req.url,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
      });

      // مراقبة استجابة الطلب
      res.on('finish', () => {
        const endTime = process.hrtime.bigint();
        const endMemory = process.memoryUsage();

        const duration = Number(endTime - startTime) / 1000000; // تحويل إلى ميلي ثانية

        const metric: PerformanceMetrics = {
          method: req.method,
          url: req.url,
          statusCode: res.statusCode,
          duration,
          memoryUsage: endMemory,
          timestamp: new Date(),
          userAgent: req.get('User-Agent'),
          ip: req.ip,
        };

        this.recordMetric(metric);
        this.checkPerformanceThresholds(metric);
      });

      next();
    };
  }

  /**
   * تسجيل مقاييس الأداء
   */
  private static recordMetric(metric: PerformanceMetrics): void {
    this.metrics.push(metric);

    // الاحتفاظ بآخر 1000 طلب فقط
    if (this.metrics.length > this.MAX_METRICS_HISTORY) {
      this.metrics = this.metrics.slice(-this.MAX_METRICS_HISTORY);
    }

    // تسجيل الطلبات البطيئة
    if (metric.duration > this.SLOW_REQUEST_THRESHOLD) {
      logger.warn('Slow request detected', {
        method: metric.method,
        url: metric.url,
        duration: `${metric.duration.toFixed(2)}ms`,
        statusCode: metric.statusCode,
        memoryUsage: this.formatMemoryUsage(metric.memoryUsage),
      });
    }

    // تسجيل مفصل في وضع التطوير
    if (environment.isDevelopment()) {
      logger.debug('Request completed', {
        method: metric.method,
        url: metric.url,
        duration: `${metric.duration.toFixed(2)}ms`,
        statusCode: metric.statusCode,
        memoryUsed: this.formatMemoryUsage(metric.memoryUsage),
      });
    }
  }

  /**
   * فحص عتبات الأداء
   */
  private static checkPerformanceThresholds(metric: PerformanceMetrics): void {
    // تحذير من استخدام الذاكرة العالي
    if (metric.memoryUsage.heapUsed > this.MEMORY_WARNING_THRESHOLD) {
      logger.warn('High memory usage detected', {
        method: metric.method,
        url: metric.url,
        memoryUsage: this.formatMemoryUsage(metric.memoryUsage),
      });
    }

    // تحذير من الطلبات البطيئة
    if (metric.duration > this.SLOW_REQUEST_THRESHOLD) {
      logger.warn('Slow request threshold exceeded', {
        method: metric.method,
        url: metric.url,
        duration: `${metric.duration.toFixed(2)}ms`,
        threshold: `${this.SLOW_REQUEST_THRESHOLD}ms`,
      });
    }
  }

  /**
   * تنسيق استخدام الذاكرة
   */
  private static formatMemoryUsage(memory: ProcessMemoryUsage): string {
    return `Heap: ${this.formatBytes(memory.heapUsed)}/${this.formatBytes(memory.heapTotal)}, RSS: ${this.formatBytes(memory.rss)}`;
  }

  private static formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  }

  /**
   * الحصول على إحصائيات الأداء
   */
  static getStats(): PerformanceStats {
    if (this.metrics.length === 0) {
      return {
        totalRequests: 0,
        averageResponseTime: 0,
        slowestRequest: null,
        fastestRequest: null,
        errorRate: 0,
        memoryPeak: 0,
        requestsPerMinute: 0,
      };
    }

    const totalRequests = this.metrics.length;
    const averageResponseTime =
      this.metrics.reduce((sum, m) => sum + m.duration, 0) / totalRequests;

    const slowestRequest = this.metrics.reduce((slowest, current) =>
      current.duration > slowest.duration ? current : slowest
    );

    const fastestRequest = this.metrics.reduce((fastest, current) =>
      current.duration < fastest.duration ? current : fastest
    );

    const errorCount = this.metrics.filter(m => m.statusCode >= 400).length;
    const errorRate = (errorCount / totalRequests) * 100;

    const memoryPeak = Math.max(...this.metrics.map(m => m.memoryUsage.heapUsed));

    // حساب الطلبات في الدقيقة
    const oneMinuteAgo = new Date(Date.now() - 60000);
    const recentRequests = this.metrics.filter(m => m.timestamp > oneMinuteAgo).length;
    const requestsPerMinute = recentRequests;

    return {
      totalRequests,
      averageResponseTime,
      slowestRequest,
      fastestRequest,
      errorRate,
      memoryPeak,
      requestsPerMinute,
    };
  }

  /**
   * تحليل الطلبات البطيئة
   */
  static getSlowRequests(threshold: number = this.SLOW_REQUEST_THRESHOLD): PerformanceMetrics[] {
    return this.metrics.filter(m => m.duration > threshold).sort((a, b) => b.duration - a.duration);
  }

  /**
   * تحليل الطلبات الأكثر تكراراً
   */
  static getFrequentRequests(): Array<{ url: string; count: number; avgDuration: number }> {
    const urlMap = new Map<string, { count: number; totalDuration: number }>();

    this.metrics.forEach(metric => {
      const existing = urlMap.get(metric.url);
      if (existing) {
        existing.count++;
        existing.totalDuration += metric.duration;
      } else {
        urlMap.set(metric.url, {
          count: 1,
          totalDuration: metric.duration,
        });
      }
    });

    return Array.from(urlMap.entries())
      .map(([url, data]) => ({
        url,
        count: data.count,
        avgDuration: data.totalDuration / data.count,
      }))
      .sort((a, b) => b.count - a.count);
  }

  /**
   * تحليل استخدام الذاكرة
   */
  static getMemoryAnalysis(): {
    current: ProcessMemoryUsage;
    peak: number;
    average: number;
    trend: 'increasing' | 'decreasing' | 'stable';
  } {
    const current = process.memoryUsage();
    const peak = Math.max(...this.metrics.map(m => m.memoryUsage.heapUsed));
    const average =
      this.metrics.reduce((sum, m) => sum + m.memoryUsage.heapUsed, 0) / this.metrics.length;

    // تحليل الاتجاه
    const recent = this.metrics.slice(-10);
    const older = this.metrics.slice(-20, -10);

    let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
    if (recent.length > 0 && older.length > 0) {
      const recentAvg = recent.reduce((sum, m) => sum + m.memoryUsage.heapUsed, 0) / recent.length;
      const olderAvg = older.reduce((sum, m) => sum + m.memoryUsage.heapUsed, 0) / older.length;

      const diff = (recentAvg - olderAvg) / olderAvg;
      if (diff > 0.1) trend = 'increasing';
      else if (diff < -0.1) trend = 'decreasing';
    }

    return {
      current,
      peak,
      average,
      trend,
    };
  }

  /**
   * إعادة تعيين المقاييس
   */
  static resetMetrics(): void {
    this.metrics = [];
    logger.info('Performance metrics reset');
  }

  /**
   * توليد تقرير الأداء
   */
  static generatePerformanceReport(): string {
    const stats = this.getStats();
    const slowRequests = this.getSlowRequests();
    const frequentRequests = this.getFrequentRequests();
    const memoryAnalysis = this.getMemoryAnalysis();

    let report = '=== Performance Report ===\n\n';

    report += `Total Requests: ${stats.totalRequests}\n`;
    report += `Average Response Time: ${stats.averageResponseTime.toFixed(2)}ms\n`;
    report += `Error Rate: ${stats.errorRate.toFixed(2)}%\n`;
    report += `Requests Per Minute: ${stats.requestsPerMinute}\n`;
    report += `Memory Peak: ${this.formatBytes(stats.memoryPeak)}\n`;
    report += `Memory Trend: ${memoryAnalysis.trend}\n\n`;

    if (slowRequests.length > 0) {
      report += '=== Slow Requests ===\n';
      slowRequests.slice(0, 5).forEach((request, index) => {
        report += `${index + 1}. ${request.method} ${request.url}\n`;
        report += `   Duration: ${request.duration.toFixed(2)}ms, Status: ${request.statusCode}\n\n`;
      });
    }

    if (frequentRequests.length > 0) {
      report += '=== Most Frequent Requests ===\n';
      frequentRequests.slice(0, 5).forEach((request, index) => {
        report += `${index + 1}. ${request.url}\n`;
        report += `   Count: ${request.count}, Avg Duration: ${request.avgDuration.toFixed(2)}ms\n\n`;
      });
    }

    return report;
  }

  /**
   * Middleware لتحسين الأداء
   */
  static optimizePerformance() {
    return (req: Request, res: Response, next: NextFunction): void => {
      // إضافة headers للتحسين
      res.set('X-Content-Type-Options', 'nosniff');
      res.set('X-Frame-Options', 'DENY');
      res.set('X-XSS-Protection', '1; mode=block');

      // تحسين التخزين المؤقت
      if (req.method === 'GET' && this.isCacheable(req.url)) {
        res.set('Cache-Control', 'public, max-age=3600');
        res.set('ETag', this.generateETag(req.url));
      }

      // ضغط الاستجابات
      if (this.shouldCompress(req)) {
        res.set('Vary', 'Accept-Encoding');
      }

      next();
    };
  }

  /**
   * التحقق من إمكانية التخزين المؤقت
   */
  private static isCacheable(url: string): boolean {
    const cacheablePaths = ['/health', '/api/stations-status'];
    return cacheablePaths.some(path => url.startsWith(path));
  }

  /**
   * التحقق من الحاجة للضغط
   */
  private static shouldCompress(req: Request): boolean {
    const acceptEncoding = req.get('Accept-Encoding') || '';
    return acceptEncoding.includes('gzip') || acceptEncoding.includes('deflate');
  }

  /**
   * توليد ETag
   */
  private static generateETag(url: string): string {
    const timestamp = Date.now().toString(36);
    const urlHash = Buffer.from(url).toString('base64').slice(0, 8);
    return `"${timestamp}-${urlHash}"`;
  }
}
