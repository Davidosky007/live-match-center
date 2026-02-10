import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        surface: 'var(--surface)',
        'surface-2': 'var(--surface-2)',
        accent: 'var(--accent)',
        'accent-light': 'var(--accent-light)',
        'accent-fg': 'var(--accent-fg)',
        live: 'var(--live)',
        'live-bg': 'var(--live-bg)',
        border: 'var(--border)',
        muted: 'var(--text-muted)',
        'home-bar': 'var(--home-bar)',
        'away-bar': 'var(--away-bar)',
        'chat-own': 'var(--chat-own)',
        'chat-other': 'var(--chat-other)',
        'pitch-green': 'var(--pitch-green)',
        'yellow-card': 'var(--yellow-card)',
        'red-card': 'var(--red-card)',
        'goal-flash': 'var(--goal-flash)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        card: 'var(--card-shadow)',
      },
      animation: {
        'pulse-slow': 'pulse 1.5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
