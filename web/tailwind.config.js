/** @type {import('tailwindcss').Config} */
const emerald = {
  50: '#effaf5', 100: '#dcf3e7', 200: '#b8e7cf', 300: '#83d4af',
  400: '#42bb88', 500: '#00a86b', 600: '#008553', 700: '#006b43',
  800: '#075438', 900: '#073b2e', 950: '#04271e'
};
const neutral = {
  50: '#f7faf8', 100: '#eef3f0', 200: '#dce6e0', 300: '#bccdc3',
  400: '#8a9f93', 500: '#63796c', 600: '#4b6154', 700: '#344a3e',
  800: '#23382d', 900: '#14291f', 950: '#091a12'
};
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: '#073b2e', brand: '#008553', emerald,
        // Compatibility for stored/dynamic class names using the former palette.
        blue: emerald, indigo: emerald, cyan: emerald, sky: emerald, violet: emerald,
        slate: neutral
      },
      boxShadow: { card: '0 2px 8px rgba(7,59,46,.05), 0 12px 32px rgba(7,59,46,.03)' }
    }
  },
  plugins: []
};
