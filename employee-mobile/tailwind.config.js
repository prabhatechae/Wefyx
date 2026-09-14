/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primaryDark: '#003078', primary: '#0443A4', primaryLight: '#0568DF',
        accent: '#0152F9', brand: '#0443A4', background: '#F7F9FC',
        surface: '#FFFFFF', inputBg: '#F3F6FB', border: '#E4E9F2',
        ink: '#0A0E3D', canvas: '#F7F9FC', textPrimary: '#0A0E3D',
        textSecondary: '#696D79', textPlaceholder: '#828692',
        textMuted: '#A1A4A9', iconMuted: '#123674', danger: '#DC2626',
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
