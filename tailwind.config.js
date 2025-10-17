/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html','./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        'arabic': ['Amiri', 'Cairo', 'Tajawal', 'Noto Sans Arabic', 'sans-serif'],
        'amiri': ['Amiri', 'serif'],
        'cairo': ['Cairo', 'sans-serif'],
        'tajawal': ['Tajawal', 'sans-serif'],
      },
      direction: {
        'rtl': 'rtl',
        'ltr': 'ltr',
      },
      spacing: {
        'rtl': '0 1rem 0 0',
      }
    },
  },
  darkMode: 'class',
  plugins: [],
}