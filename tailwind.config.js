/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-orange': '#FF6B00',
        'brand-orange-dark': '#CC5500',
        'brand-orange-light': '#FF8C33',
      },
    },
  },
  plugins: [],
};
