/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        studio: {
          950: '#090d16',
          900: '#0f172a',
          850: '#151f38',
          800: '#1e293b',
          750: '#28354d',
          700: '#334155',
          600: '#475569',
          500: '#64748b',
          400: '#94a3b8',
          300: '#cbd5e1',
          200: '#e2e8f0',
          100: '#f1f5f9',
          50: '#f8fafc',
        },
        accent: {
          foh: '#3b82f6',        // Indigo/Blue
          monitoring: '#f97316', // Orange
          backline: '#10b981',   // Emerald Green
          infra: '#f59e0b',      // Amber
          multicore: '#ec4899',  // High-contrast pink/magenta for multicore
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      }
    },
  },
  plugins: [],
}
