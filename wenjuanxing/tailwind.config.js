/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fff4eb',
          100: '#ffe4cc',
          200: '#ffc899',
          300: '#ffa35c',
          400: '#ff8129',
          500: '#ff6a00',
          600: '#e55f00',
          700: '#c24d00',
          800: '#9a3e08',
          900: '#7c350c',
        },
        ink: {
          50: '#f6f7fb',
          100: '#eef0f6',
          700: '#3a3f4b',
          800: '#222632',
          900: '#141722',
        },
      },
      boxShadow: {
        card: '0 8px 30px rgba(20, 23, 34, 0.06)',
        pop: '0 16px 40px rgba(20, 23, 34, 0.12)',
      },
      fontFamily: {
        sans: [
          '"PingFang SC"',
          '"Hiragino Sans GB"',
          '"Microsoft YaHei"',
          'system-ui',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
}
