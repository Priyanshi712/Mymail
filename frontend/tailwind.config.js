/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        lime: {
          soft: '#D3F49A',
          action: '#A5D957',
          hover: '#93C747',
          light: '#EAF9D2',
          glow: 'rgba(211, 244, 154, 0.45)',
        },
        forest: {
          DEFAULT: '#173D2B',
          dark: '#0E261B',
          light: '#23573E',
          muted: '#2C5E43',
        },
        surface: {
          offwhite: '#F5F8F0',
          card: '#FFFFFF',
          border: '#E3E8DC',
          hover: '#EEF3E7',
        },
        ink: {
          primary: '#202820',
          secondary: '#5A695D',
          muted: '#8C9A8F',
        },
      },
      borderRadius: {
        '2xl': '1.25rem',
        '3xl': '1.75rem',
        '4xl': '2.25rem',
      },
      boxShadow: {
        'soft-card': '0 20px 45px -15px rgba(23, 61, 43, 0.08), 0 0 1px 1px rgba(23, 61, 43, 0.04)',
        'pill': '0 10px 25px -5px rgba(165, 217, 87, 0.4)',
        'pill-hover': '0 14px 28px -5px rgba(165, 217, 87, 0.55)',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
