import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Backgrounds
        'bg-main': 'var(--bg-main)',
        'bg-card': 'var(--bg-card)',
        'bg-card-hover': 'var(--bg-card-hover)',

        // Primary (Azul SECOM)
        primary: {
          DEFAULT: '#00BAFF',
          light: '#05D5FF',
          dark: '#0082FF',
        },

        // Accent Blue/Cyan variants
        'accent-pink': '#05D5FF', // Map old pink to cyan
        'accent-orange': '#0082FF', // Map old orange to deep blue

        // Status
        'status-scheduled': '#0984E3',
        'status-published': '#00B894',
        'status-draft': '#636E72',
        'status-failed': '#D63031',

        // Text
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-muted': 'var(--text-muted)',

        // Border
        border: 'var(--border)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        sm: '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)',
        md: '0 4px 12px rgba(0,0,0,0.05), 0 2px 4px rgba(0,0,0,0.04)',
        lg: '0 10px 30px rgba(0,0,0,0.08)',
        'cta': '0 4px 14px rgba(0, 186, 255, 0.3)',
        'cta-hover': '0 6px 20px rgba(0, 186, 255, 0.4)',
      },
      borderRadius: {
        'card': '16px',
        'btn': '12px',
        'badge': '6px',
        'thumb': '10px',
        'input': '10px',
      },
      fontSize: {
        'page-title': ['28px', { lineHeight: '1.2', fontWeight: '700' }],
        'section-title': ['18px', { lineHeight: '1.4', fontWeight: '700' }],
        'card-number': ['36px', { lineHeight: '1.1', fontWeight: '700' }],
        'card-label': ['13px', { lineHeight: '1.4', fontWeight: '600' }],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
