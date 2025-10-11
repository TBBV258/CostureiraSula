/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./*.html"],
  theme: {
    extend: {
      colors: {
        'soft-beige': '#F5F5DC',
        'blush-pink': '#FEC5E5',
        'charcoal-gray': '#36454F',
      },
      fontFamily: {
        title: ['"Playfair Display"', 'serif'],
        body: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
