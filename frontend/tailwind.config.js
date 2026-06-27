/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        nearish: {
          dark: '#FD7979',
          medium: '#FDACAC',
          bg: '#FAE1DF',
          light: '#FDF0EF',
          'medium-dark': '#FDD2D1',
          glow: 'rgba(253, 121, 121, 0.3)',
        },
      },
      fontFamily: {
        sans: ['System'],
      },
    },
  },
  plugins: [],
};
