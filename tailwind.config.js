// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#06492c',
        secondary: '#00c931',
        // …other colors if needed…
      },
    },
  },
  plugins: [
    require('tw-animate-css'),
  ],
};
