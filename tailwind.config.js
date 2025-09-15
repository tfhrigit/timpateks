module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gray: {
          900: '#121212',
          800: '#1e1e1e',
          700: '#333333',
        }
      }
    },
  },
  plugins: [],
}