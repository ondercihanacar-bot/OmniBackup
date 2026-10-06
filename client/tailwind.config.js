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
        cyber: {
          950: '#060911',
          900: '#0a0f1d',
          850: '#0f172a',
          800: '#151f36',
          750: '#1b2845',
          700: '#233458',
          600: '#324775'
        },
        neon: {
          cyan: '#00f0ff',
          blue: '#3b82f6',
          emerald: '#10b981',
          mint: '#00ff9d',
          purple: '#a855f7',
          pink: '#ec4899',
          amber: '#f59e0b',
          rose: '#f43f5e'
        }
      },
      boxShadow: {
        'glow-cyan': '0 0 25px -4px rgba(0, 240, 255, 0.35)',
        'glow-cyan-sm': '0 0 15px -2px rgba(0, 240, 255, 0.25)',
        'glow-emerald': '0 0 25px -4px rgba(16, 185, 129, 0.35)',
        'glow-purple': '0 0 25px -4px rgba(168, 85, 247, 0.35)',
        'glow-amber': '0 0 25px -4px rgba(245, 158, 11, 0.35)',
        'glow-card': '0 10px 30px -10px rgba(0, 0, 0, 0.7)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 10s linear infinite',
      }
    },
  },
  plugins: [],
}
