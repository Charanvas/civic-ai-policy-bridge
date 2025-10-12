/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#B76E79',
          dark: '#8B5462',
          light: '#D4949D',
        },
        dark: {
          DEFAULT: '#0F0F0F',
          lighter: '#1A1A1A',
          card: '#121212',
          border: '#2A2A2A',
        },
        accent: {
          gold: '#E8C5A5',
          rose: '#F4C7D3',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Playfair Display', 'serif'],
      },
    },
  },
  plugins: [],
}