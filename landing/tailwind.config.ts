import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Satoshi', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        display: ['Cabinet Grotesk', 'Satoshi', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Brand cyan color palette based on #007fa3
        cyan: {
          50: '#ecfcff',
          100: '#cef7ff',
          200: '#a3efff',
          300: '#64e3ff',
          400: '#1ecbf5',
          500: '#007fa3',
          600: '#006b8a',
          700: '#005770',
          800: '#004759',
          900: '#003a4a',
          950: '#002430',
        },
        // Keep teal as an alias for backward compatibility
        teal: {
          50: '#ecfcff',
          100: '#cef7ff',
          200: '#a3efff',
          300: '#64e3ff',
          400: '#1ecbf5',
          500: '#007fa3',
          600: '#006b8a',
          700: '#005770',
          800: '#004759',
          900: '#003a4a',
          950: '#002430',
        },
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'float-slow 8s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'slide-up': 'slide-up 0.6s ease-out forwards',
        'slide-in-left': 'slide-in-left 0.6s ease-out forwards',
        'scale-in': 'scale-in 0.5s ease-out forwards',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        'float-slow': {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-8px) rotate(1deg)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(0, 127, 163, 0.4)' },
          '50%': { boxShadow: '0 0 0 20px rgba(0, 127, 163, 0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-left': {
          '0%': { opacity: '0', transform: 'translateX(-30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
