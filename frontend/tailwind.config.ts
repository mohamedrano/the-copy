import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    // Comprehensive content paths for production purging
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/hooks/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/ai/**/*.{js,ts,jsx,tsx,mdx}",
    // Include any potential component files in root src
    "./src/*.{js,ts,jsx,tsx,mdx}",
  ],
  // Production optimizations
  future: {
    hoverOnlyWhenSupported: true,
  },
  // Safelist for dynamic classes that might be missed by purging
  safelist: [
    // Dynamic color classes that might be generated programmatically
    {
      pattern:
        /^(bg|text|border)-(primary|secondary|accent|destructive|muted|card|popover|chart)-?(foreground|1|2|3|4|5)?$/,
      variants: ["hover", "focus", "active", "dark"],
    },
    // Dynamic sizing classes
    {
      pattern: /^(w|h|p|m|gap)-(0|1|2|3|4|5|6|8|10|12|16|20|24|32|48|64)$/,
    },
    // Animation classes that might be applied dynamically
    "animate-spin",
    "animate-pulse",
    "animate-bounce",
    "animate-accordion-down",
    "animate-accordion-up",
    // Icon sizing classes
    {
      pattern: /^(w|h)-(4|5|6|8|10|12|16)$/,
    },
  ],
  theme: {
    extend: {
      fontFamily: {
        // Optimized font stacks with proper fallbacks for better CLS scores
        body: ["Literata", "Georgia", "Times New Roman", "serif"],
        headline: ["Literata", "Georgia", "Times New Roman", "serif"],
        code: [
          "Source Code Pro",
          "SF Mono",
          "Monaco",
          "Cascadia Code",
          "Roboto Mono",
          "Consolas",
          "Courier New",
          "monospace",
        ],
        // Arabic font families with system fallbacks
        arabic: ["Amiri", "serif"],
        "arabic-modern": [
          "Cairo",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        "arabic-clean": [
          "Tajawal",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
