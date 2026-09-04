/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#FDFBF7',
          100: '#F7F1E6',
          200: '#EFE1CD',
          300: '#DEC5A2',
          400: '#CA9F6D',
          500: '#B87D40', // Base Warm Copper
          600: '#9C622C',
          700: '#7B4A21',
          800: '#5A3418',
          900: '#351D0C',
        },
        espresso: {
          950: '#0E0B08',
          900: '#16120E',
          800: '#1E1914',
          700: '#2A231C',
          600: '#3E342B',
          500: '#56493D',
          400: '#7D6D5E',
          300: '#ADA092',
          200: '#D5CDC4',
          100: '#EFECE8',
          50: '#F9F8F6',
        },
        copper: {
          DEFAULT: '#C27B38',
          light: '#DE9653',
          dark: '#9A5D24',
          glow: 'rgba(194, 123, 56, 0.15)',
        },
        beige: {
          50: '#FAF8F5',
          100: '#F5EFEB',
          200: '#ECE2DB',
          300: '#DFD1C7',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'soft-sm': '0 2px 8px -2px rgba(22, 18, 14, 0.05), 0 1px 4px -1px rgba(22, 18, 14, 0.03)',
        'soft-md': '0 8px 24px -4px rgba(22, 18, 14, 0.08), 0 4px 12px -2px rgba(22, 18, 14, 0.04)',
        'soft-lg': '0 16px 36px -6px rgba(22, 18, 14, 0.12), 0 8px 16px -4px rgba(22, 18, 14, 0.06)',
        'copper-glow': '0 0 24px -2px rgba(194, 123, 56, 0.25)',
      },
    },
  },
  plugins: [],
};
