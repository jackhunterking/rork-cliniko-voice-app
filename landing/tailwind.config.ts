import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Brand colors from the mobile app
        primary: {
          DEFAULT: '#007FA3',
          light: '#E6F4F8',
          dark: '#006080',
        },
        secondary: {
          DEFAULT: '#0B1220',
          light: '#5B667A',
        },
        accent: {
          teal: '#0D9488',
          mint: '#10B981',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          secondary: '#F8F9FB',
          tertiary: '#F1F5F9',
        },
        border: {
          DEFAULT: '#E6EAF0',
          light: '#F1F5F9',
        },
      },
      fontFamily: {
        sans: [
          'Satoshi',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
        display: [
          'Cabinet Grotesk',
          'Satoshi',
          'system-ui',
          'sans-serif',
        ],
      },
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1rem' }],
        'display-lg': ['3.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display-md': ['2.5rem', { lineHeight: '1.15', letterSpacing: '-0.02em' }],
        'display-sm': ['2rem', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        'soft': '0 2px 8px -2px rgba(11, 18, 32, 0.08), 0 4px 16px -4px rgba(11, 18, 32, 0.04)',
        'elevated': '0 4px 12px -2px rgba(11, 18, 32, 0.12), 0 8px 24px -4px rgba(11, 18, 32, 0.08)',
        'glow': '0 0 24px -4px rgba(0, 127, 163, 0.3)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
        'fade-in-down': 'fadeInDown 0.6s ease-out forwards',
        'scale-in': 'scaleIn 0.4s ease-out forwards',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInDown: {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'mesh-gradient': 'linear-gradient(135deg, #E6F4F8 0%, #F8F9FB 50%, #F1F5F9 100%)',
      },
    },
  },
  plugins: [],
};

export default config;
