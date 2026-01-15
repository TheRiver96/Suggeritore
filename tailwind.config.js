/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        teatro: {
          50: '#fdf2f4',
          100: '#fce7ea',
          200: '#f9d2d9',
          300: '#f4adb9',
          400: '#ec7d93',
          500: '#e05270',
          600: '#cb3158',
          700: '#ab2448',
          800: '#8f2141',
          900: '#7a1f3c',
          950: '#440c1d',
        },
        burgundy: {
          50: '#fdf3f4',
          100: '#fbe8ea',
          200: '#f5d5d9',
          300: '#edb4bc',
          400: '#e28a97',
          500: '#d25f74',
          600: '#bc415a',
          700: '#9e3249',
          800: '#852c41',
          900: '#72293b',
          950: '#3f121d',
        }
      },
    },
  },
  plugins: [],
}
