/**
 * Font Optimization Service
 * Provides utilities for optimizing font loading and performance
 */

export interface FontOptimizationOptions {
  display?: 'auto' | 'block' | 'swap' | 'fallback' | 'optional';
  preload?: boolean;
  subset?: boolean;
  weight?: number | string;
  style?: 'normal' | 'italic';
  unicodeRange?: string;
}

export interface OptimizedFontInfo {
  family: string;
  src: string;
  display: string;
  preload?: boolean;
  weight?: number | string;
  style?: string;
  unicodeRange?: string;
}

class FontOptimizer {
  private static instance: FontOptimizer;
  private loadedFonts: Set<string> = new Set();
  private fontCache: Map<string, FontFace> = new Map();

  private constructor() {
    this.setupFontLoading();
  }

  static getInstance(): FontOptimizer {
    if (!FontOptimizer.instance) {
      FontOptimizer.instance = new FontOptimizer();
    }
    return FontOptimizer.instance;
  }

  /**
   * Setup font loading optimization
   */
  private setupFontLoading(): void {
    if (typeof document === 'undefined') return;

    // Add font-display: swap to all existing @font-face rules
    this.optimizeExistingFonts();

    // Setup font loading events
    if ('fonts' in document) {
      document.fonts.addEventListener('loading', this.onFontLoading.bind(this));
      document.fonts.addEventListener('loadingdone', this.onFontLoaded.bind(this));
      document.fonts.addEventListener('loadingerror', this.onFontError.bind(this));
    }
  }

  /**
   * Optimize existing font-face rules
   */
  private optimizeExistingFonts(): void {
    if (typeof document === 'undefined') return;

    const styleSheets = Array.from(document.styleSheets);
    
    styleSheets.forEach(sheet => {
      try {
        const rules = Array.from(sheet.cssRules || []);
        rules.forEach(rule => {
          if (rule instanceof CSSFontFaceRule) {
            if (!rule.style.getPropertyValue('font-display')) {
              rule.style.setProperty('font-display', 'swap', 'important');
            }
          }
        });
      } catch (e) {
        // Cross-origin stylesheets may throw errors
        console.warn('Cannot access stylesheet:', e);
      }
    });
  }

  /**
   * Load font with optimization
   */
  async loadFont(
    family: string,
    src: string,
    options: FontOptimizationOptions = {}
  ): Promise<FontFace | null> {
    const cacheKey = `${family}-${src}-${options.weight || 'normal'}-${options.style || 'normal'}`;
    
    // Check cache first
    if (this.fontCache.has(cacheKey)) {
      return this.fontCache.get(cacheKey)!;
    }

    const {
      display = 'swap',
      weight = 'normal',
      style = 'normal',
      unicodeRange,
      preload = false
    } = options;

    try {
      // Preload font if requested
      if (preload && typeof document !== 'undefined') {
        this.preloadFont(src);
      }

      // Create FontFace object
      const fontFace = new FontFace(family, src, {
        display,
        weight: weight.toString(),
        style,
        unicodeRange
      });

      // Load the font
      const loadedFont = await fontFace.load();
      
      // Add to document
      if (typeof document !== 'undefined') {
        document.fonts.add(loadedFont);
      }

      // Cache the font
      this.fontCache.set(cacheKey, loadedFont);
      this.loadedFonts.add(family);

      return loadedFont;
    } catch (error) {
      console.warn(`Failed to load font ${family}:`, error);
      return null;
    }
  }

  /**
   * Preload font file
   */
  preloadFont(src: string, as: string = 'font', type?: string): void {
    if (typeof document === 'undefined') return;

    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = as;
    link.href = src;
    link.crossOrigin = 'anonymous';
    
    if (type) {
      link.type = type;
    }

    document.head.appendChild(link);
  }

  /**
   * Load Google Fonts with optimization
   */
  async loadGoogleFont(
    family: string,
    weights: (number | string)[] = [400],
    options: FontOptimizationOptions = {}
  ): Promise<FontFace[]> {
    const {
      display = 'swap',
      subset = true,
      preload = true
    } = options;

    const weightsStr = weights.join(';');
    const displayParam = `&display=${display}`;
    const subsetParam = subset ? '&subset=arabic,latin' : '';
    
    const fontUrl = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@${weightsStr}${displayParam}${subsetParam}`;

    try {
      // Preload the CSS file
      if (preload) {
        this.preloadFont(fontUrl, 'style', 'text/css');
      }

      // Fetch the CSS
      const response = await fetch(fontUrl);
      const css = await response.text();

      // Extract font URLs and load them
      const fontUrls = this.extractFontUrls(css);
      const fontPromises = fontUrls.map(url => this.loadFont(family, url, options));
      
      const loadedFonts = await Promise.all(fontPromises);
      return loadedFonts.filter(font => font !== null) as FontFace[];
    } catch (error) {
      console.warn(`Failed to load Google Font ${family}:`, error);
      return [];
    }
  }

  /**
   * Extract font URLs from CSS
   */
  private extractFontUrls(css: string): string[] {
    const urlRegex = /url\(['"]?([^'")]+)['"]?\)/g;
    const urls: string[] = [];
    let match;

    while ((match = urlRegex.exec(css)) !== null) {
      urls.push(match[1]);
    }

    return urls;
  }

  /**
   * Create optimized font CSS
   */
  createOptimizedFontCSS(
    family: string,
    src: string,
    options: FontOptimizationOptions = {}
  ): string {
    const {
      display = 'swap',
      weight = 'normal',
      style = 'normal',
      unicodeRange
    } = options;

    let css = `@font-face {
  font-family: '${family}';
  src: url('${src}');
  font-display: ${display};
  font-weight: ${weight};
  font-style: ${style};`;

    if (unicodeRange) {
      css += `\n  unicode-range: ${unicodeRange};`;
    }

    css += '\n}';
    return css;
  }

  /**
   * Get font loading status
   */
  isFontLoaded(family: string): boolean {
    return this.loadedFonts.has(family);
  }

  /**
   * Wait for font to load
   */
  async waitForFont(family: string, timeout: number = 3000): Promise<boolean> {
    if (this.isFontLoaded(family)) {
      return true;
    }

    return new Promise((resolve) => {
      const startTime = Date.now();
      
      const checkFont = () => {
        if (this.isFontLoaded(family)) {
          resolve(true);
          return;
        }

        if (Date.now() - startTime > timeout) {
          resolve(false);
          return;
        }

        requestAnimationFrame(checkFont);
      };

      checkFont();
    });
  }

  /**
   * Get font metrics for optimization
   */
  async getFontMetrics(family: string): Promise<{
    loaded: boolean;
    loadTime?: number;
    size?: number;
  }> {
    const startTime = performance.now();
    const loaded = await this.waitForFont(family);
    const loadTime = loaded ? performance.now() - startTime : undefined;

    return {
      loaded,
      loadTime,
      size: loaded ? this.estimateFontSize(family) : undefined
    };
  }

  /**
   * Estimate font file size (rough calculation)
   */
  private estimateFontSize(family: string): number {
    // This is a rough estimation - in reality, you'd need to measure actual file sizes
    const baseSize = 50000; // 50KB base
    const complexityMultiplier = family.includes('Arabic') ? 1.5 : 1;
    return Math.round(baseSize * complexityMultiplier);
  }

  /**
   * Font loading event handlers
   */
  private onFontLoading(event: FontFaceLoadEvent): void {
    console.debug('Font loading:', event.fontface.family);
  }

  private onFontLoaded(event: FontFaceLoadEvent): void {
    console.debug('Font loaded:', event.fontface.family);
  }

  private onFontError(event: FontFaceLoadEvent): void {
    console.warn('Font loading error:', event.fontface.family);
  }

  /**
   * Optimize font loading for Arabic text
   */
  async loadArabicFont(
    family: string,
    options: FontOptimizationOptions = {}
  ): Promise<FontFace[]> {
    const arabicOptions = {
      ...options,
      unicodeRange: 'U+0600-06FF, U+0750-077F, U+08A0-08FF, U+FB50-FDFF, U+FE70-FEFF',
      preload: true,
      display: 'swap' as const
    };

    return this.loadGoogleFont(family, [400, 700], arabicOptions);
  }

  /**
   * Get font optimization recommendations
   */
  getOptimizationRecommendations(): {
    useFontDisplay: boolean;
    preloadCritical: boolean;
    subsetFonts: boolean;
    useSystemFonts: boolean;
  } {
    return {
      useFontDisplay: true,
      preloadCritical: true,
      subsetFonts: true,
      useSystemFonts: false // For Arabic content, we need specific fonts
    };
  }

  /**
   * Clear font cache
   */
  clearCache(): void {
    this.fontCache.clear();
    this.loadedFonts.clear();
  }
}

// Export singleton instance
export const fontOptimizer = FontOptimizer.getInstance();

// Export convenience functions
export const loadFont = (
  family: string,
  src: string,
  options?: FontOptimizationOptions
) => fontOptimizer.loadFont(family, src, options);

export const loadGoogleFont = (
  family: string,
  weights?: (number | string)[],
  options?: FontOptimizationOptions
) => fontOptimizer.loadGoogleFont(family, weights, options);

export const preloadFont = (
  src: string,
  as?: string,
  type?: string
) => fontOptimizer.preloadFont(src, as, type);

