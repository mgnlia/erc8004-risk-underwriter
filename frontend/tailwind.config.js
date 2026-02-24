/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        defi: {
          bg: '#080b14',
          card: '#0d1117',
          border: '#1a2332',
          accent: '#00d4aa',
          blue: '#3b82f6',
          red: '#ef4444',
          yellow: '#f59e0b',
          green: '#10b981',
        },
      },
    },
  },
  plugins: [],
}
