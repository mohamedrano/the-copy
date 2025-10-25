/**
 * Font optimization service for production builds
 * Handles local font loading and optimization strategies
 */

export interface FontConfig {
  family: string;
  weights: number[];
  styles: ("normal" | "italic")[];
  display: "auto" | "block" | "swap" | "fallback" | "optional";
  preload?: boolean;
}

export const FONT_CONFIGS: Record<string, FontConfig> = {
  amiri: {
    family: "Amiri",
    weights: [400, 700],
    styles: ["normal", "italic"],
    display: "swap",
    preload: true,
  },
  cairo: {
    family: "Cairo",
    weights: [200, 300, 400, 500, 600, 700, 800, 900],
    styles: ["normal"],
    display: "swap",
    preload: true,
  },
  tajawal: {
    family: "Tajawal",
    weights: [200, 300, 400, 500, 700, 800, 900],
    styles: ["normal"],
    display: "swap",
    preload: false,
  },
  literata: {
    family: "Literata",
    weights: [400, 500, 600, 700],
    styles: ["normal", "italic"],
    display: "swap",
    preload: true,
  },
  sourceCodePro: {
    family: "Source Code Pro",
    weights: [300, 400, 500, 600, 700],
    styles: ["normal"],
    display: "swap",
    preload: false,
  },
};

/**
 * Generate font face CSS for local hosting
 */
export function generateFontFaceCSS(
  config: FontConfig,
  fontBasePath: string = "/fonts"
): string {
  const { family, weights, styles } = config;
  const fontFaces: string[] = [];

  weights.forEach((weight) => {
    styles.forEach((style) => {
      const fontFileName = `${family.toLowerCase().replace(/\s+/g, "-")}-${weight}${style === "italic" ? "-italic" : ""}`;

      fontFaces.push(`
@font-face {
  font-family: '${family}';
  font-style: ${style};
  font-weight: ${weight};
  font-display: ${config.display};
  src: url('${fontBasePath}/${fontFileName}.woff2') format('woff2'),
       url('${fontBasePath}/${fontFileName}.woff') format('woff');
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD, U+0600-06FF, U+200C-200D, U+2010-2011, U+204F, U+2E41, U+FB50-FDFF, U+FE80-FEFC;
}`);
    });
  });

  return fontFaces.join("\n");
}

/**
 * Generate preload links for critical fonts
 */
export function generatePreloadLinks(): string[] {
  return Object.entries(FONT_CONFIGS)
    .filter(([, config]) => config.preload)
    .flatMap(([key, config]) => {
      const primaryWeight = config.weights.includes(400)
        ? 400
        : config.weights[0];
      const fontFileName = `${config.family.toLowerCase().replace(/\s+/g, "-")}-${primaryWeight}`;

      return [
        `<link rel="preload" href="/fonts/${fontFileName}.woff2" as="font" type="font/woff2" crossorigin="anonymous">`,
      ];
    });
}

/**
 * Get optimized font fallbacks for better CLS scores
 */
export function getFontFallbacks(primaryFont: string): string {
  const fallbacks: Record<string, string> = {
    Amiri: "serif",
    Cairo: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    Tajawal:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    Literata: 'Georgia, "Times New Roman", serif',
    "Source Code Pro":
      '"SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace',
  };

  return fallbacks[primaryFont] || "system-ui, sans-serif";
}

/**
 * CSS custom properties for font optimization
 */
export const FONT_CSS_VARIABLES = `
  /* Optimized font loading variables */
  --font-arabic-primary: 'Amiri', ${getFontFallbacks("Amiri")};
  --font-arabic-modern: 'Cairo', ${getFontFallbacks("Cairo")};
  --font-arabic-clean: 'Tajawal', ${getFontFallbacks("Tajawal")};
  --font-body: 'Literata', ${getFontFallbacks("Literata")};
  --font-headline: 'Literata', ${getFontFallbacks("Literata")};
  --font-code: 'Source Code Pro', ${getFontFallbacks("Source Code Pro")};

  /* Font loading optimization */
  --font-loading-strategy: swap;
` as const;
