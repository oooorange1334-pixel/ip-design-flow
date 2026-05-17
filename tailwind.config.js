/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        canvas: {
          950: '#0a0a0b',
          900: '#111113',
          800: '#1a1a1f',
          700: '#242429',
          600: '#2e2e35',
        },
        accent: {
          DEFAULT: '#7c5af0',
          hover: '#6d4ee0',
          muted: '#7c5af030',
        },
        locked: '#f59e0b',
        generate: '#22d3ee',
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
}
