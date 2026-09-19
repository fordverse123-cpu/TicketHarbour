/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        harbour: {
          bg: '#050505',
          bgAlt: '#080808',
          darker: '#0D0D0D',
          dark: '#111111',
          surface: '#151515',
          card: '#171717',
          cardAlt: '#1C1C1C',
          border: 'rgba(255, 255, 255, 0.08)',
          borderHover: 'rgba(255, 255, 255, 0.12)',
          glass: 'rgba(255, 255, 255, 0.04)',
          glassHover: 'rgba(255, 255, 255, 0.08)',
        },
        cyanAccent: {
          DEFAULT: '#19D3D3',
          400: '#19D3D3',
          500: '#19D3D3',
        },
        indigoAccent: {
          DEFAULT: '#4F46E5',
          500: '#4F46E5',
          600: '#4F46E5',
        },
        textPrimary: '#FFFFFF',
        textSecondary: '#B8B8B8',
        textMuted: '#777777',
      },
      boxShadow: {
        'glass-glow': '0 0 20px rgba(25, 211, 211, 0.15)',
        'indigo-glow': '0 0 20px rgba(79, 70, 229, 0.2)',
        'card-glow': '0 10px 40px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.10)',
      },
      backdropBlur: {
        xs: '2px',
        xl: '20px',
      }
    },
  },
  plugins: [],
}

