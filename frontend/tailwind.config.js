/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",  // scans your src folder
    "./app/**/*.{js,ts,jsx,tsx}",  // scans app dir if you’re using app router
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
