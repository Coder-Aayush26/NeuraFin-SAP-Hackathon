/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sap: {
          blue: '#0070F2',
          light: '#E5F0FA',
          dark: '#004A99'
        }
      }
    },
  },
  plugins: [],
}
