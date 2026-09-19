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
          darker: '#080F20',
          dark: '#0D1628',
          card: '#111B30',
          border: 'rgba(255, 255, 255, 0.10)',
          glass: 'rgba(255, 255, 255, 0.05)',
          glassHover: 'rgba(255, 255, 255, 0.08)',
        },
        cyanAccent: {
          400: '#22D3EE',
          500: '#12C8C8',
        },
        indigoAccent: {
          500: '#6366F1',
          600: '#4F46E5',
        },
        brand: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          500: '#12c8c8',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
        },
      },
      boxShadow: {
        'glass-glow': '0 0 25px -5px rgba(18, 200, 200, 0.25)',
        'indigo-glow': '0 0 25px -5px rgba(79, 70, 229, 0.3)',
        'card-glow': 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.15), 0 20px 40px -15px rgba(0, 0, 0, 0.7)',
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}

