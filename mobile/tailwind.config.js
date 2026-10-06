/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primaryDark: '#073B2E', primary: '#008553', primaryLight: '#00A86B',
        accent: '#00A86B', brand: '#008553', background: '#F7FAF8',
        surface: '#FFFFFF', inputBg: '#EEF3F0', border: '#DCE6E0',
        ink: '#14291F', canvas: '#F7FAF8', textPrimary: '#14291F',
        textSecondary: '#52675B', textPlaceholder: '#8A9F93',
        textMuted: '#8A9F93', iconMuted: '#075438', danger: '#DC2626',
        dangerBg: '#FCE9E9',
      },
      fontFamily: {
        regular: ['Poppins-Regular'], medium: ['Poppins-Medium'],
        semibold: ['Poppins-SemiBold'], bold: ['Poppins-Bold'],
        extrabold: ['Poppins-ExtraBold'],
      },
    },
  },
  plugins: [],
};
