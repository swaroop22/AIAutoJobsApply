import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx,mdx}',
    './components/**/*.{ts,tsx}',
    './content/**/*.{ts,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '24px',
      screens: {
        xl: '1200px',
      },
    },
    extend: {
      colors: {
        paper: 'rgb(var(--color-paper-rgb) / <alpha-value>)',
        ink: 'rgb(var(--color-ink-rgb) / <alpha-value>)',
        accent: 'var(--color-accent)',
        'accent-2': 'var(--color-accent-2)',
        line: 'var(--color-line)',
        wash: 'var(--color-wash)',
        'muted-1': 'var(--color-muted-1)',
        'muted-2': 'var(--color-muted-2)',
        body: 'var(--color-body)',
        deep: 'var(--color-deep)',
      },
      fontFamily: {
        display: ['var(--font-display)'],
        body: ['var(--font-body)'],
        mono: ['var(--font-mono)'],
      },
      borderRadius: {
        pill: 'var(--radius-pill)',
      },
      boxShadow: {
        pill: 'var(--shadow-pill)',
        card: 'var(--shadow-card)',
      },
      transitionTimingFunction: {
        'out-quint': 'var(--ease-out-quint)',
        'out-expo': 'var(--ease-out-expo)',
      },
      maxWidth: {
        content: '1200px',
      },
    },
  },
  plugins: [],
};

export default config;
