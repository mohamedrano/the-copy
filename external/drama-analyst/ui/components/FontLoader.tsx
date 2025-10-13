import React, { useEffect, useState } from 'react';
import { fontOptimizer, FontOptimizationOptions } from '@services/fontOptimizer';

interface FontLoaderProps {
  fonts: Array<{
    family: string;
    src?: string;
    weights?: (number | string)[];
    options?: FontOptimizationOptions;
  }>;
  children: React.ReactNode;
  fallbackFonts?: string[];
  preload?: boolean;
}

export const FontLoader: React.FC<FontLoaderProps> = ({
  fonts,
  children,
  fallbackFonts = ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto'],
  preload = true
}) => {
  const [loadedFonts, setLoadedFonts] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadFonts = async () => {
      const fontPromises = fonts.map(async (font) => {
        try {
          if (font.src) {
            // Load custom font
            const loadedFont = await fontOptimizer.loadFont(
              font.family,
              font.src,
              {
                preload,
                display: 'swap',
                ...font.options
              }
            );
            return loadedFont ? font.family : null;
          } else {
            // Load Google Font
            const loadedFonts = await fontOptimizer.loadGoogleFont(
              font.family,
              font.weights || [400],
              {
                preload,
                display: 'swap',
                subset: true,
                ...font.options
              }
            );
            return loadedFonts.length > 0 ? font.family : null;
          }
        } catch (error) {
          console.warn(`Failed to load font ${font.family}:`, error);
          return null;
        }
      });

      const results = await Promise.all(fontPromises);
      const successful = results.filter(Boolean) as string[];
      
      setLoadedFonts(new Set(successful));
      setIsLoading(false);
    };

    loadFonts();
  }, [fonts, preload]);

  // Create CSS for fallback fonts
  const fontStack = fonts
    .map(font => `"${font.family}"`)
    .concat(fallbackFonts)
    .join(', ');

  return (
    <div 
      style={{ 
        fontFamily: fontStack,
        fontDisplay: 'swap'
      }}
      className={isLoading ? 'font-loading' : 'font-loaded'}
    >
      {children}
    </div>
  );
};

// Arabic font loader component
interface ArabicFontLoaderProps {
  children: React.ReactNode;
  fontFamily?: string;
  weights?: (number | string)[];
  preload?: boolean;
}

export const ArabicFontLoader: React.FC<ArabicFontLoaderProps> = ({
  children,
  fontFamily = 'Noto Sans Arabic',
  weights = [400, 700],
  preload = true
}) => {
  return (
    <FontLoader
      fonts={[{
        family: fontFamily,
        weights,
        options: {
          preload,
          display: 'swap',
          subset: true
        }
      }]}
      fallbackFonts={['Tahoma', 'Arial', 'sans-serif']}
      preload={preload}
    >
      {children}
    </FontLoader>
  );
};

// Font preloader component
interface FontPreloaderProps {
  fonts: Array<{
    family: string;
    src?: string;
    weights?: (number | string)[];
  }>;
}

export const FontPreloader: React.FC<FontPreloaderProps> = ({ fonts }) => {
  useEffect(() => {
    fonts.forEach(async (font) => {
      try {
        if (font.src) {
          fontOptimizer.preloadFont(font.src);
        } else {
          // Preload Google Font CSS
          const weightsStr = (font.weights || [400]).join(';');
          const fontUrl = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(font.family)}:wght@${weightsStr}&display=swap&subset=arabic,latin`;
          fontOptimizer.preloadFont(fontUrl, 'style', 'text/css');
        }
      } catch (error) {
        console.warn(`Failed to preload font ${font.family}:`, error);
      }
    });
  }, [fonts]);

  return null; // This component doesn't render anything
};

// Font optimization hook
export const useFontOptimization = () => {
  const [isFontLoaded, setIsFontLoaded] = useState(false);
  const [fontMetrics, setFontMetrics] = useState<{
    loaded: boolean;
    loadTime?: number;
    size?: number;
  } | null>(null);

  const loadFont = async (
    family: string,
    src?: string,
    options?: FontOptimizationOptions
  ) => {
    try {
      let loadedFont;
      
      if (src) {
        loadedFont = await fontOptimizer.loadFont(family, src, options);
      } else {
        const fonts = await fontOptimizer.loadGoogleFont(family, [400], options);
        loadedFont = fonts[0] || null;
      }

      if (loadedFont) {
        setIsFontLoaded(true);
        const metrics = await fontOptimizer.getFontMetrics(family);
        setFontMetrics(metrics);
        return loadedFont;
      }
      
      return null;
    } catch (error) {
      console.warn(`Failed to load font ${family}:`, error);
      return null;
    }
  };

  const preloadFont = (src: string, as?: string, type?: string) => {
    fontOptimizer.preloadFont(src, as, type);
  };

  const isFontReady = (family: string) => {
    return fontOptimizer.isFontLoaded(family);
  };

  return {
    isFontLoaded,
    fontMetrics,
    loadFont,
    preloadFont,
    isFontReady
  };
};

// CSS-in-JS styles for font loading states
export const fontLoadingStyles = {
  '.font-loading': {
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontDisplay: 'swap'
  },
  '.font-loaded': {
    fontDisplay: 'swap'
  }
};

