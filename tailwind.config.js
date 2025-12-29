export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#FF6B35',
        secondary: '#F7931E',
        cream: {
          50: '#FFFEF9',
          100: '#FFF8E6',
          200: '#FFF1CC',
          300: '#FFE9B3',
        },
        placeholder: '#9A9A9A',
        strongBlack: '#000000',
      },
      fontSize: {
        'hero': ['2.5rem', { lineHeight: '1.2', fontWeight: '700' }], // 40px
        'greeting': ['1.125rem', { lineHeight: '1.5', fontWeight: '400' }], // 18px
      },
      borderRadius: {
        'card': '1rem', // 16px
        'card-lg': '1.25rem', // 20px
      },
      boxShadow: {
        'action': '0 6px 16px rgba(0, 0, 0, 0.18)',
        'card': '0 4px 12px rgba(0, 0, 0, 0.08)',
      },
    },
  },
  plugins: [],
}
