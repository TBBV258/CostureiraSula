/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // Enable dark mode using a class
  content: ["./*.html"],
  theme: {
    extend: {
      colors: {
        'primary-blue': '#3B82F6', // Example Blue
        'primary-lilas': '#8B5CF6', // Example Lilas
        'light-bg': '#FFFFFF',
        'dark-bg': '#1F2937',
        'light-text': '#111827',
        'dark-text': '#F9FAFB',
      },
    },
  },
  plugins: [],
}
