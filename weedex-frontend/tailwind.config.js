/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'weedex-green': {
          100: '#dcedc8',
          200: '#c5e1a5',
          300: '#aed581',
          400: '#9ccc65',
          500: '#8bc34a',
          600: '#7cb342',
          700: '#689f38',
          800: '#558b2f',
          900: '#33691e',
        },
        'weedex-dark-green': {
          500: '#43a047',
          600: '#388e3c',
          700: '#2e7d32',
          800: '#1b5e20',
        },
      },
    },
  },
  plugins: [],
}