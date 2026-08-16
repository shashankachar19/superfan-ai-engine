/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        body: ['Inter', 'sans-serif'],
        display: ['"Space Grotesk"', 'sans-serif'],
      },
      colors: {
        bgBase: '#000000',
        bgSubtle: '#080808',
        textMain: '#E8E8E8',
        textMuted: '#808080',
        accentBorder: '#333333'
      },
      spacing: {
        'page': '6vw',
      }
    },
  },
  plugins: [],
}
