/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          orange: {
            50: '#FFF7F0',
            100: '#FFEAD5',
            200: '#FECDA6',
            300: '#FDB072',
            400: '#F7944E',
            500: '#F2994A',
            600: '#E07D2F',
            700: '#B85E1E',
            800: '#934B1C',
            900: '#7A3F1A',
          },
          teal: {
            50: '#F0FDFA',
            100: '#CCFBF1',
            200: '#99F6E4',
            300: '#5EEAD4',
            400: '#2EC4B6',
            500: '#14B8A6',
            600: '#0D9488',
            700: '#0F766E',
            800: '#115E59',
            900: '#134E4A',
          },
        },
        refind: {
          dark: '#4E5D6D',
          light: '#F7F8FC',
          accent: '#FFF2D3',
        },
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
