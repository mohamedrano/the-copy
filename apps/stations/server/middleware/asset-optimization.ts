import { Request, Response, NextFunction } from 'express';
import { environment } from '../config/environment';
import logger from '../utils/logger';

export interface AssetOptimizationOptions {
  maxImageSize?: number;
  allowedImageTypes?: string[];
  enableWebP?: boolean;
  enableCompression?: boolean;
  cacheControl?: string;
}

export class AssetOptimizer {
  private static readonly DEFAULT_OPTIONS: AssetOptimizationOptions = {
    maxImageSize: 5 * 1024 * 1024, // 5MB
    allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'],
    enableWebP: true,
    enableCompression: true,
    cacheControl: 'public, max-age=31536000' // 1 year
  };

  /**
   * Middleware لتحسين الأصول
   */
  static optimizeAssets(options: AssetOptimizationOptions = {}) {
    const config = { ...this.DEFAULT_OPTIONS, ...options };

    return (req: Request, res: Response, next: NextFunction): void => {
      // تطبيق cache headers للأصول الثابتة
      if (this.isStaticAsset(req.path)) {
        this.applyCacheHeaders(res, config);
        this.applyCompressionHeaders(res, config);
      }

      // تحسين استجابات الصور
      if (this.isImageRequest(req)) {
        this.optimizeImageResponse(req, res, config);
      }

      next();
    };
  }

  /**
   * التحقق من أن الطلب لأصل ثابت
   */
  private static isStaticAsset(path: string): boolean {
    const staticExtensions = ['.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.woff', '.woff2', '.ttf'];
    return staticExtensions.some(ext => path.endsWith(ext));
  }

  /**
   * التحقق من أن الطلب لصورة
   */
  private static isImageRequest(req: Request): boolean {
    const acceptHeader = req.get('Accept') || '';
    return acceptHeader.includes('image/') || 
           /\.(jpg|jpeg|png|gif|svg|webp)$/i.test(req.path);
  }

  /**
   * تطبيق cache headers
   */
  private static applyCacheHeaders(res: Response, config: AssetOptimizationOptions): void {
    if (config.cacheControl) {
      res.set('Cache-Control', config.cacheControl);
    }

    // إضافة ETag للأصول الثابتة
    const etag = this.generateETag(res.get('Content-Length') || '0');
    res.set('ETag', etag);

    // إضافة Last-Modified
    res.set('Last-Modified', new Date().toUTCString());
  }

  /**
   * تطبيق compression headers
   */
  private static applyCompressionHeaders(res: Response, config: AssetOptimizationOptions): void {
    if (config.enableCompression) {
      res.set('Vary', 'Accept-Encoding');
    }
  }

  /**
   * تحسين استجابة الصور
   */
  private static optimizeImageResponse(
    req: Request, 
    res: Response, 
    config: AssetOptimizationOptions
  ): void {
    const acceptHeader = req.get('Accept') || '';
    
    // دعم WebP إذا كان متاحاً
    if (config.enableWebP && acceptHeader.includes('image/webp')) {
      res.set('Content-Type', 'image/webp');
    }

    // إضافة headers للتحسين
    res.set('X-Content-Type-Options', 'nosniff');
    res.set('X-Frame-Options', 'DENY');
  }

  /**
   * توليد ETag
   */
  private static generateETag(contentLength: string): string {
    const timestamp = Date.now().toString(36);
    const length = parseInt(contentLength).toString(36);
    return `"${timestamp}-${length}"`;
  }

  /**
   * تحسين حجم الصور (مثال باستخدام sharp)
   */
  static async optimizeImage(
    inputBuffer: Buffer,
    options: {
      width?: number;
      height?: number;
      quality?: number;
      format?: 'jpeg' | 'png' | 'webp';
    } = {}
  ): Promise<Buffer> {
    try {
      // في الإنتاج، استخدم مكتبة مثل sharp
      // هذا مثال مبسط
      const sharp = await import('sharp');
      
      let pipeline = sharp(inputBuffer);
      
      if (options.width || options.height) {
        pipeline = pipeline.resize(options.width, options.height, {
          fit: 'inside',
          withoutEnlargement: true
        });
      }
      
      if (options.format === 'webp') {
        pipeline = pipeline.webp({ quality: options.quality || 80 });
      } else if (options.format === 'jpeg') {
        pipeline = pipeline.jpeg({ quality: options.quality || 80 });
      } else if (options.format === 'png') {
        pipeline = pipeline.png({ quality: options.quality || 80 });
      }
      
      return await pipeline.toBuffer();
    } catch (error) {
      logger.error('Image optimization failed', { error });
      return inputBuffer; // إرجاع الصورة الأصلية في حالة الفشل
    }
  }

  /**
   * تحسين CSS
   */
  static async optimizeCSS(css: string): Promise<string> {
    try {
      // إزالة المسافات الزائدة
      let optimized = css
        .replace(/\s+/g, ' ')
        .replace(/;\s*}/g, '}')
        .replace(/{\s*/g, '{')
        .replace(/;\s*/g, ';')
        .trim();

      // إزالة التعليقات
      optimized = optimized.replace(/\/\*[\s\S]*?\*\//g, '');

      // إزالة المسافات غير الضرورية
      optimized = optimized
        .replace(/\s*{\s*/g, '{')
        .replace(/\s*}\s*/g, '}')
        .replace(/\s*;\s*/g, ';')
        .replace(/\s*,\s*/g, ',');

      return optimized;
    } catch (error) {
      logger.error('CSS optimization failed', { error });
      return css;
    }
  }

  /**
   * تحسين JavaScript
   */
  static async optimizeJavaScript(js: string): Promise<string> {
    try {
      // إزالة console.log في الإنتاج
      if (environment.isProduction()) {
        js = js.replace(/console\.(log|debug|info)\([^)]*\);?/g, '');
      }

      // إزالة المسافات الزائدة
      js = js
        .replace(/\s+/g, ' ')
        .replace(/\s*{\s*/g, '{')
        .replace(/\s*}\s*/g, '}')
        .replace(/\s*;\s*/g, ';')
        .replace(/\s*,\s*/g, ',')
        .trim();

      return js;
    } catch (error) {
      logger.error('JavaScript optimization failed', { error });
      return js;
    }
  }

  /**
   * تحسين HTML
   */
  static async optimizeHTML(html: string): Promise<string> {
    try {
      // إزالة المسافات الزائدة
      let optimized = html
        .replace(/\s+/g, ' ')
        .replace(/>\s+</g, '><')
        .trim();

      // إزالة التعليقات HTML
      optimized = optimized.replace(/<!--[\s\S]*?-->/g, '');

      // إزالة المسافات من نهايات الأسطر
      optimized = optimized.replace(/\s+$/gm, '');

      return optimized;
    } catch (error) {
      logger.error('HTML optimization failed', { error });
      return html;
    }
  }

  /**
   * تحسين JSON
   */
  static async optimizeJSON(json: unknown): Promise<string> {
    try {
      return JSON.stringify(json, null, environment.isDevelopment() ? 2 : 0);
    } catch (error) {
      logger.error('JSON optimization failed', { error });
      return JSON.stringify(json);
    }
  }

  /**
   * تحسين الأصول المتعددة
   */
  static async optimizeMultipleAssets(assets: {
    css?: string;
    js?: string;
    html?: string;
    images?: Buffer[];
  }): Promise<{
    css?: string;
    js?: string;
    html?: string;
    images?: Buffer[];
  }> {
    const optimized: Record<string, unknown> = {};

    try {
      if (assets.css) {
        optimized.css = await this.optimizeCSS(assets.css);
      }

      if (assets.js) {
        optimized.js = await this.optimizeJavaScript(assets.js);
      }

      if (assets.html) {
        optimized.html = await this.optimizeHTML(assets.html);
      }

      if (assets.images && assets.images.length > 0) {
        optimized.images = await Promise.all(
          assets.images.map(img => this.optimizeImage(img))
        );
      }

      return optimized;
    } catch (error) {
      logger.error('Assets optimization failed', { error });
      return assets;
    }
  }

  /**
   * تحليل حجم الأصول
   */
  static analyzeAssetSize(content: string | Buffer): {
    size: number;
    sizeFormatted: string;
    compressionRatio?: number;
  } {
    const size = Buffer.isBuffer(content) ? content.length : Buffer.byteLength(content, 'utf8');
    
    const formatSize = (bytes: number): string => {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return {
      size,
      sizeFormatted: formatSize(size)
    };
  }
}

